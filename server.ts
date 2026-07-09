import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Local storage paths
const INQUIRIES_FILE = path.join(process.cwd(), "inquiries.json");
const ORDERS_FILE = path.join(process.cwd(), "orders.json");

// Cache the transporter so we only create it once during the server lifecycle
let cachedTransporter: nodemailer.Transporter | null = null;
let cachedIsTestAccount = false;
let initializingTransporterPromise: Promise<any> | null = null;

async function getTransporter() {
  if (cachedTransporter) {
    return { transporter: cachedTransporter, isTestAccount: cachedIsTestAccount };
  }

  if (initializingTransporterPromise) {
    return initializingTransporterPromise;
  }

  initializingTransporterPromise = (async () => {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      console.log(`[SMTP] Initializing configured SMTP host: ${host}:${port}`);
      cachedTransporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      cachedIsTestAccount = false;
    } else {
      console.log("[SMTP] No SMTP credentials provided in environment variables. Initializing temporary Ethereal SMTP test account...");
      try {
        const testAccount = await nodemailer.createTestAccount();
        cachedTransporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        cachedIsTestAccount = true;
        console.log(`[SMTP] Temporary Ethereal test account created successfully: ${testAccount.user}`);
      } catch (err) {
        console.error("Failed to create Ethereal SMTP test account. Falling back to log-only mode:", err);
        cachedTransporter = null;
      }
    }
    return { transporter: cachedTransporter, isTestAccount: cachedIsTestAccount };
  })();

  return initializingTransporterPromise;
}

// Helper to automatically send emails via SMTP or fall back to Ethereal
async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  const { transporter, isTestAccount } = await getTransporter();
  let previewUrl = "";

  if (!transporter) {
    console.log(`[SMTP Log-Only] Would send email to ${to}:\nSubject: ${subject}\nText: ${text}`);
    return { success: true, simulated: true, message: "SMTP not configured. Email logged to console." };
  }

  try {
    const user = process.env.SMTP_USER;
    const fromName = "The Resin Grove Studio";
    const fromEmail = user || "no-reply@theresingrove.com";
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    console.log(`✉️  Email successfully sent automatically to ${to}! Message ID: ${info.messageId}`);
    if (isTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info) || "";
      console.log(`🔗 Ethereal Test Email Preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl, isTestAccount };
  } catch (err: any) {
    console.error("Error sending email via nodemailer:", err);
    return { success: false, error: err.message };
  }
}


// Helper to safely load JSON file
function loadJSON<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error loading file ${filePath}:`, err);
  }
  return defaultValue;
}

// Helper to safely save JSON file
function saveJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error saving file ${filePath}:`, err);
  }
}

// Supabase Client Initialization
let supabase: any = null;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "" && supabaseAnonKey !== "") {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log(`[Supabase] Client initialized successfully at: ${supabaseUrl}`);
  } catch (err) {
    console.error("[Supabase] Failed to initialize Supabase client:", err);
  }
} else {
  console.log("[Supabase] Credentials not set in environment variables. Running in local JSON storage mode.");
}

// Supabase and local storage unified save helpers
async function saveOrder(order: any) {
  // Always save locally first (as a robust, reliable backup source)
  const orders = loadJSON<any[]>(ORDERS_FILE, []);
  const existingIndex = orders.findIndex(o => o.id === order.id);
  if (existingIndex > -1) {
    orders[existingIndex] = order;
  } else {
    orders.unshift(order);
  }
  saveJSON(ORDERS_FILE, orders);

  if (supabase) {
    try {
      console.log(`[Supabase] Syncing order ${order.id} to Supabase...`);
      const { error } = await supabase
        .from("orders")
        .upsert({
          id: order.id,
          shipping_details: order.shippingDetails,
          cart: order.cart,
          grand_total: order.grandTotal,
          created_at: order.createdAt,
          status: order.status,
          order_time: order.orderTime || new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        });
      
      if (error) {
        console.log(`[Supabase Status] Order ${order.id} is pending table configuration:`, error.message);
        console.log("[Supabase Instruction] To resolve this, run the provided SQL setup script in your Supabase SQL Editor.");
        return { success: false, error: error.message };
      } else {
        console.log(`[Supabase] Successfully synced order ${order.id} to Supabase database.`);
        return { success: true };
      }
    } catch (err: any) {
      console.log(`[Supabase Status] Exception during order ${order.id} sync:`, err);
      return { success: false, error: err.message || String(err) };
    }
  }
  return { success: true, localOnly: true };
}

async function saveInquiry(inquiry: any) {
  // Always save locally first
  const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
  const existingIndex = inquiries.findIndex(i => i.id === inquiry.id);
  if (existingIndex > -1) {
    inquiries[existingIndex] = inquiry;
  } else {
    inquiries.unshift(inquiry);
  }
  saveJSON(INQUIRIES_FILE, inquiries);

  if (supabase) {
    try {
      console.log(`[Supabase] Syncing inquiry ${inquiry.id} to Supabase...`);
      const { error } = await supabase
        .from("inquiries")
        .upsert({
          id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          project_type: inquiry.projectType,
          budget: inquiry.budget,
          description: inquiry.description,
          delivery_date: inquiry.deliveryDate,
          created_at: inquiry.createdAt,
          status: inquiry.status,
          configuration: inquiry.configuration
        });
      
      if (error) {
        console.log(`[Supabase Status] Inquiry ${inquiry.id} is pending table configuration:`, error.message);
        console.log("[Supabase Instruction] To resolve this, run the provided SQL setup script in your Supabase SQL Editor.");
        return { success: false, error: error.message };
      } else {
        console.log(`[Supabase] Successfully synced inquiry ${inquiry.id} to Supabase database.`);
        return { success: true };
      }
    } catch (err: any) {
      console.log(`[Supabase Status] Exception during inquiry ${inquiry.id} sync:`, err);
      return { success: false, error: err.message || String(err) };
    }
  }
  return { success: true, localOnly: true };
}

// Background sync function on startup to copy existing local JSON files to Supabase
async function syncLocalDataToSupabase() {
  if (!supabase) return { success: false, error: "Supabase client is not configured." };
  console.log("[Supabase] Starting authoritative sync of local inquiries and orders to Supabase...");
  try {
    const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
    let syncedInquiriesCount = 0;
    let inquiriesError = null;
    for (const inq of inquiries) {
      const syncRes = await saveInquiry(inq);
      if (syncRes.success) {
        syncedInquiriesCount++;
      } else {
        inquiriesError = syncRes.error;
        console.log(`[Supabase Status] Failed to sync inquiry ${inq.id}: ${syncRes.error}`);
        break;
      }
    }

    const orders = loadJSON<any[]>(ORDERS_FILE, []);
    let syncedOrdersCount = 0;
    let ordersError = null;
    for (const ord of orders) {
      const syncRes = await saveOrder(ord);
      if (syncRes.success) {
        syncedOrdersCount++;
      } else {
        ordersError = syncRes.error;
        console.log(`[Supabase Status] Failed to sync order ${ord.id}: ${syncRes.error}`);
        break;
      }
    }
    
    if (syncedInquiriesCount > 0 || syncedOrdersCount > 0) {
      console.log(`[Supabase] Sync complete. Processed ${syncedInquiriesCount} inquiries and ${syncedOrdersCount} orders to Supabase.`);
    } else {
      console.log("[Supabase] Sync check completed. No records to sync.");
    }

    return {
      success: true,
      syncedInquiries: syncedInquiriesCount,
      syncedOrders: syncedOrdersCount,
      inquiriesError,
      ordersError
    };
  } catch (err: any) {
    console.log("[Supabase Status] Sync completed with exception status:", err);
    return { success: false, error: err.message || String(err) };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON body parser for incoming data
  app.use(express.json({ limit: "10mb" }));

  // API Routes (defined before Vite middleware)
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Submit a Custom Design Inquiry (from CustomOrders.tsx or CustomBuilder.tsx)
  app.post("/api/inquiries", async (req, res) => {
    try {
      const { name, email, projectType, budget, description, deliveryDate, configuration } = req.body;
      
      if (!name || !email || !description) {
        return res.status(400).json({ error: "Missing required contact details or description." });
      }

      const newInquiry = {
        id: `INQ-${Math.floor(100000 + Math.random() * 900000)}`,
        name,
        email,
        projectType: projectType || "Bespoke Workshop Design",
        budget: budget || "Customized Spec",
        description,
        deliveryDate: deliveryDate || "Flexible",
        createdAt: new Date().toISOString(),
        status: "Pending Review",
        configuration: configuration || null // holds wood type, resin color, inclusions etc if sent from CustomBuilder
      };

      const syncResult = await saveInquiry(newInquiry);

      // AUTOMATICALLY SEND EMAIL TO ADMIN
      const adminEmailAddress = process.env.ADMIN_EMAIL || "admin@theresingrove.com";
      const emailSubject = `[The Resin Grove] New Custom Design Inquiry - ${newInquiry.id}`;

      let configHtml = "";
      let configText = "";
      if (configuration) {
        configText = `Custom Artisan Config:
- Base Product: ${configuration.baseProduct || "N/A"}
- Wood Slab: ${configuration.woodSlab || "N/A"}
- Resin Color: ${configuration.resinColor || "N/A"}
- Inclusions: ${configuration.inclusions?.join(", ") || "None"}
- Engraving: "${configuration.engraving || "None"}"
- Total Est: ₹${configuration.price?.toFixed(2)}`;

        configHtml = `
          <h3 style="color: #1A1A1A; font-family: sans-serif; border-bottom: 1px solid #D9CBB3; padding-bottom: 8px; margin-top: 16px;">Custom Artisan Configuration</h3>
          <div style="font-size: 12px; padding: 12px; background: #FAF8F5; border: 1px solid #E6D7B8; border-radius: 2px;">
            <div>• Base Product: <strong>${configuration.baseProduct || "N/A"}</strong></div>
            <div>• Wood Slab: <strong>${configuration.woodSlab || "N/A"}</strong></div>
            <div>• Resin Color: <strong>${configuration.resinColor || "N/A"}</strong></div>
            <div>• Inclusions: <strong>${configuration.inclusions?.join(", ") || "None"}</strong></div>
            <div>• Engraving: <em>"${configuration.engraving || "None"}"</em></div>
            <div style="font-size: 14px; font-weight: bold; margin-top: 8px; color: #C9A76A;">Est. Price: ₹${configuration.price?.toFixed(2)}</div>
          </div>
        `;
      }

      const textBody = `Dear Resin Grove Admin Team,

A new bespoke custom design inquiry has been submitted! Please find the details below:

CUSTOMER CONTACT DETAILS:
--------------------------
Name: ${name}
Email: ${email}

INQUIRY DETAILS:
----------------
Inquiry ID: ${newInquiry.id}
Project Type: ${newInquiry.projectType}
Budget Range: ₹${newInquiry.budget}
Estimated Delivery Timeline: ${newInquiry.deliveryDate}

Description / Vision:
"${description}"

${configText}

Please contact the customer back to discuss their bespoke piece!

Best regards,
The Resin Grove Automation`;

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #D9CBB3; background: #FAF8F5; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #1A1A1A; padding: 24px; text-align: center; border-bottom: 2px solid #C9A76A;">
            <h1 style="color: #FFFFFF; font-family: sans-serif; margin: 0; font-weight: normal; font-size: 24px; letter-spacing: 1px;">The Resin Grove</h1>
            <p style="color: #C9A76A; font-size: 11px; text-transform: uppercase; margin: 6px 0 0 0; letter-spacing: 2px; font-weight: bold;">New Custom Design Inquiry</p>
          </div>
          
          <div style="padding: 24px; background: #FFFFFF;">
            <h3 style="color: #1A1A1A; font-family: sans-serif; border-bottom: 1px solid #D9CBB3; padding-bottom: 8px; margin-top: 0;">Customer Information</h3>
            <table style="width: 100%; font-size: 12px; color: #333333; margin-bottom: 24px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; font-weight: bold; width: 120px; color: #5A5A5A;">Name:</td>
                <td style="padding: 4px 0; color: #1A1A1A; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #5A5A5A;">Email:</td>
                <td style="padding: 4px 0; color: #1A1A1A; font-weight: 600;"><a href="mailto:${email}" style="color: #C9A76A; text-decoration: none;">${email}</a></td>
              </tr>
            </table>

            <h3 style="color: #1A1A1A; font-family: sans-serif; border-bottom: 1px solid #D9CBB3; padding-bottom: 8px; margin-top: 0;">Inquiry Details</h3>
            <table style="width: 100%; font-size: 12px; color: #333333; margin-bottom: 24px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; font-weight: bold; width: 160px; color: #5A5A5A;">Inquiry ID:</td>
                <td style="padding: 4px 0; font-family: monospace; font-weight: bold; color: #1A1A1A;">${newInquiry.id}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #5A5A5A;">Project Type:</td>
                <td style="padding: 4px 0; color: #1A1A1A; font-weight: 600;">${newInquiry.projectType}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #5A5A5A;">Budget Range:</td>
                <td style="padding: 4px 0; color: #C9A76A; font-weight: bold;">₹${newInquiry.budget}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #5A5A5A;">Delivery Timeline:</td>
                <td style="padding: 4px 0; color: #1A1A1A;">${newInquiry.deliveryDate}</td>
              </tr>
            </table>

            <h3 style="color: #1A1A1A; font-family: sans-serif; border-bottom: 1px solid #D9CBB3; padding-bottom: 8px; margin-top: 0;">Vision & Design Request</h3>
            <p style="font-size: 12px; color: #5A5A5A; line-height: 1.6; background: #FAF8F5; padding: 12px; border: 1px solid #EAEAEA; border-radius: 2px; font-style: italic;">
              "${description}"
            </p>

            ${configHtml}
          </div>
          
          <div style="background: #1A1A1A; color: #888888; padding: 16px; text-align: center; font-size: 10px;">
            <p style="margin: 0 0 4px 0; color: #C9A76A;">The Resin Grove Automated System</p>
            <p style="margin: 0;">This email was automatically generated and sent upon customer confirmation.</p>
          </div>
        </div>
      `;

      // Send email asynchronously in the background so it doesn't block client response
      sendEmail({
        to: adminEmailAddress,
        subject: emailSubject,
        text: textBody,
        html: htmlBody
      }).then((emailResult) => {
        console.log(`[SMTP Background] Inquiry email sent successfully. Preview: ${emailResult.previewUrl || "N/A"}`);
      }).catch((err) => {
        console.error("[SMTP Background] Failed to send inquiry email:", err);
      });

      res.status(201).json({ 
        success: true, 
        message: "Inquiry successfully submitted.", 
        inquiry: newInquiry,
        emailSent: true,
        previewUrl: "",
        supabaseSync: syncResult
      });
    } catch (err: any) {
      console.error("Error handling inquiry:", err);
      res.status(500).json({ error: "Internal server error. Could not process inquiry." });
    }
  });

  // Submit a Custom Checkout Order (from CartDrawer.tsx)
  app.post("/api/orders", async (req, res) => {
    try {
      const { shippingDetails, cart, grandTotal } = req.body;

      if (!shippingDetails || !shippingDetails.name || !shippingDetails.email || !cart || cart.length === 0) {
        return res.status(400).json({ error: "Missing shipping details or order items." });
      }

      const newOrder = {
        id: `TRG-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingDetails,
        cart,
        grandTotal: Number(grandTotal),
        createdAt: new Date().toISOString(),
        orderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "Curation Requested"
      };

      const syncResult = await saveOrder(newOrder);

      // AUTOMATICALLY SEND EMAIL TO ADMIN
      const adminEmailAddress = process.env.ADMIN_EMAIL || "orders@theresingrove.com";
      const emailSubject = `[The Resin Grove] New Order & Custom Curation - ${newOrder.id}`;

      let itemsText = "";
      let itemsHtml = "";
      cart.forEach((item: any, idx: number) => {
        itemsText += `${idx + 1}. ${item.product.name} (x${item.quantity}) - ₹${(item.product.price * item.quantity).toFixed(2)}\n`;
        itemsHtml += `
          <div style="padding: 12px; border-bottom: 1px solid #EAEAEA;">
            <h4 style="margin: 0 0 4px 0; font-family: sans-serif; color: #1A1A1A;">${item.product.name} (x${item.quantity})</h4>
            <p style="margin: 0; font-size: 11px; color: #C9A76A; font-weight: bold; text-transform: uppercase;">${item.product.category}</p>
            <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 12px; font-weight: bold; color: #1A1A1A;">Price: ₹${(item.product.price * item.quantity).toFixed(2)}</p>
        `;
        if (item.selectedWood || item.selectedResinColor || item.selectedDeco || item.personalizationText) {
          itemsText += `   Customizations:\n`;
          itemsHtml += `<div style="margin-top: 8px; padding: 8px; background: #FAF8F5; border: 1px solid #E6D7B8; border-radius: 2px; font-size: 11px; color: #5A5A5A;">`;
          if (item.selectedWood) {
            itemsText += `     • Wood Type: ${item.selectedWood}\n`;
            itemsHtml += `<div>• Wood Type: <strong>${item.selectedWood}</strong></div>`;
          }
          if (item.selectedResinColor) {
            itemsText += `     • Resin Color: ${item.selectedResinColor}\n`;
            itemsHtml += `<div>• Resin Color: <strong>${item.selectedResinColor}</strong></div>`;
          }
          if (item.selectedDeco && item.selectedDeco.length > 0) {
            itemsText += `     • Inclusions: ${item.selectedDeco.join(", ")}\n`;
            itemsHtml += `<div>• Inclusions: <strong>${item.selectedDeco.join(", ")}</strong></div>`;
          }
          if (item.personalizationText) {
            itemsText += `     • Engraving: "${item.personalizationText}"\n`;
            itemsHtml += `<div style="font-family: sans-serif; margin-top: 4px; color: #C9A76A;">• Engraving: <em>"${item.personalizationText}"</em></div>`;
          }
          itemsHtml += `</div>`;
        }
        itemsText += `\n`;
        itemsHtml += `</div>`;
      });

      const textBody = `Dear Resin Grove Admin Team,

A new order & custom curation has been placed automatically! Please find the details below:

CUSTOMER CONTACT DETAILS:
--------------------------
Name: ${shippingDetails.name}
Email: ${shippingDetails.email}
Phone: ${shippingDetails.phone}
Shipping Address: ${shippingDetails.address}, Zip: ${shippingDetails.zip}

ORDER DETAILS:
--------------
Order Number: ${newOrder.id}
Total Order Value: ₹${newOrder.grandTotal.toFixed(2)}

ITEMS ORDERED:
--------------
${itemsText}
Please contact the customer back to coordinate payment (UPI/Bank Transfer/Invoice) and confirm curation.

Best regards,
The Resin Grove Automation`;

      const htmlBody = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #D9CBB3; background: #FAF8F5; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background: #1A1A1A; padding: 24px; text-align: center; border-bottom: 2px solid #C9A76A;">
            <h1 style="color: #FFFFFF; font-family: sans-serif; margin: 0; font-weight: normal; font-size: 24px; letter-spacing: 1px;">The Resin Grove</h1>
            <p style="color: #C9A76A; font-size: 11px; text-transform: uppercase; margin: 6px 0 0 0; letter-spacing: 2px; font-weight: bold;">New Order Notification</p>
          </div>
          
          <div style="padding: 24px; background: #FFFFFF;">
            <h3 style="color: #1A1A1A; font-family: sans-serif; border-bottom: 1px solid #D9CBB3; padding-bottom: 8px; margin-top: 0;">Customer Information</h3>
            <table style="width: 100%; font-size: 12px; color: #333333; margin-bottom: 24px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; font-weight: bold; width: 120px; color: #5A5A5A;">Name:</td>
                <td style="padding: 4px 0; color: #1A1A1A; font-weight: 600;">${shippingDetails.name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #5A5A5A;">Email:</td>
                <td style="padding: 4px 0; color: #1A1A1A; font-weight: 600;"><a href="mailto:${shippingDetails.email}" style="color: #C9A76A; text-decoration: none;">${shippingDetails.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #5A5A5A;">Phone:</td>
                <td style="padding: 4px 0; color: #1A1A1A; font-weight: 600;">${shippingDetails.phone}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: bold; color: #5A5A5A;">Shipping Address:</td>
                <td style="padding: 4px 0; color: #1A1A1A;">${shippingDetails.address}, ZIP: ${shippingDetails.zip}</td>
              </tr>
            </table>

            <h3 style="color: #1A1A1A; font-family: sans-serif; border-bottom: 1px solid #D9CBB3; padding-bottom: 8px; margin-top: 0;">Order Summary</h3>
            <div style="font-size: 12px; padding: 12px; background: #FAF8F5; border: 1px solid #EAEAEA; margin-bottom: 24px; border-radius: 2px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #5A5A5A;">Order ID:</span>
                <span style="font-weight: bold; font-family: monospace; color: #1A1A1A;">${newOrder.id}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: #5A5A5A;">Date:</span>
                <span style="color: #1A1A1A;">${new Date().toLocaleDateString()}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 1px dashed #D9CBB3; padding-top: 8px; margin-top: 8px;">
                <span style="color: #1A1A1A;">Total Order Value:</span>
                <span style="color: #C9A76A;">₹${newOrder.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <h3 style="color: #1A1A1A; font-family: sans-serif; border-bottom: 1px solid #D9CBB3; padding-bottom: 8px; margin-top: 0;">Curation Items</h3>
            <div style="border: 1px solid #EAEAEA; border-radius: 2px;">
              ${itemsHtml}
            </div>
          </div>
          
          <div style="background: #1A1A1A; color: #888888; padding: 16px; text-align: center; font-size: 10px;">
            <p style="margin: 0 0 4px 0; color: #C9A76A;">The Resin Grove Automated System</p>
            <p style="margin: 0;">This email was automatically generated and sent upon customer confirmation.</p>
          </div>
        </div>
      `;

      // Send email asynchronously in the background so it doesn't block client response
      sendEmail({
        to: adminEmailAddress,
        subject: emailSubject,
        text: textBody,
        html: htmlBody
      }).then((emailResult) => {
        console.log(`[SMTP Background] Order email sent successfully. Preview: ${emailResult.previewUrl || "N/A"}`);
      }).catch((err) => {
        console.error("[SMTP Background] Failed to send order email:", err);
      });

      res.status(201).json({ 
        success: true, 
        message: "Order placed successfully.", 
        order: newOrder,
        emailSent: true,
        previewUrl: "",
        supabaseSync: syncResult
      });
    } catch (err: any) {
      console.error("Error placing order:", err);
      res.status(500).json({ error: "Internal server error. Could not place order." });
    }
  });

  // Admin GET Endpoint: Supabase connection and table status
  app.get("/api/admin/supabase-status", async (req, res) => {
    if (!supabase) {
      return res.json({
        initialized: false,
        url: null,
        ordersTableOk: false,
        inquiriesTableOk: false,
        error: "Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured."
      });
    }

    let ordersTableOk = false;
    let inquiriesTableOk = false;
    let errorOrders = null;
    let errorInquiries = null;

    try {
      const { error: rlsError } = await supabase.from("orders").upsert({
        id: "rls-probe-do-not-delete",
        shipping_details: {},
        cart: [],
        grand_total: 0,
        status: "probe"
      });
      if (rlsError) {
        if (rlsError.code === "42501") {
          ordersTableOk = false;
          errorOrders = "Row Level Security (RLS) is active but blocking writes. Please run the SQL Setup script to define permissive public access policies.";
        } else {
          ordersTableOk = false;
          errorOrders = rlsError.message;
        }
      } else {
        ordersTableOk = true;
        await supabase.from("orders").delete().eq("id", "rls-probe-do-not-delete");
      }
    } catch (err: any) {
      errorOrders = err.message || String(err);
    }

    try {
      const { error: rlsError } = await supabase.from("inquiries").upsert({
        id: "rls-probe-do-not-delete",
        name: "probe",
        email: "probe@example.com",
        status: "probe"
      });
      if (rlsError) {
        if (rlsError.code === "42501") {
          inquiriesTableOk = false;
          errorInquiries = "Row Level Security (RLS) is active but blocking writes. Please run the SQL Setup script to define permissive public access policies.";
        } else {
          inquiriesTableOk = false;
          errorInquiries = rlsError.message;
        }
      } else {
        inquiriesTableOk = true;
        await supabase.from("inquiries").delete().eq("id", "rls-probe-do-not-delete");
      }
    } catch (err: any) {
      errorInquiries = err.message || String(err);
    }

    res.json({
      initialized: true,
      url: supabaseUrl,
      ordersTableOk,
      inquiriesTableOk,
      errorOrders,
      errorInquiries
    });
  });

  // Admin POST Endpoint: Force sync of local data to Supabase on demand
  app.post("/api/admin/sync-now", async (req, res) => {
    if (!supabase) {
      return res.status(400).json({
        success: false,
        error: "Supabase integration is not configured."
      });
    }

    const result = await syncLocalDataToSupabase();
    res.json(result);
  });

  // Admin GET Endpoint: Retrieve all inquiries
  app.get("/api/admin/inquiries", async (req, res) => {
    const localInquiries = loadJSON<any[]>(INQUIRIES_FILE, []).filter(i => i.id !== "rls-probe-do-not-delete");
    let inquiries = [...localInquiries];

    if (supabase) {
      // Trigger sync in the background asynchronously so it doesn't block the API response
      syncLocalDataToSupabase().catch(err => console.error("[Supabase Background Sync Error]", err));
      
      try {
        console.log("[Supabase] Fetching inquiries from Supabase...");
        const { data, error } = await supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!error && data) {
          const supabaseInqs = data
            .filter((item: any) => item.id !== "rls-probe-do-not-delete")
            .map((item: any) => ({
              id: item.id,
              name: item.name,
              email: item.email,
              projectType: item.project_type,
              budget: item.budget,
              description: item.description,
              deliveryDate: item.delivery_date,
              createdAt: item.created_at,
              status: item.status,
              configuration: item.configuration
            }));

          // Merge: use Supabase records as primary, but keep any local records not yet synced
          const merged = [...supabaseInqs];
          for (const localInq of localInquiries) {
            if (!merged.some(i => i.id === localInq.id)) {
              merged.push(localInq);
            }
          }

          // Back-sync missing or updated inquiries to local inquiries.json
          const allLocalInqs = loadJSON<any[]>(INQUIRIES_FILE, []);
          let localInqsUpdated = false;
          for (const spInq of supabaseInqs) {
            const idx = allLocalInqs.findIndex(i => i.id === spInq.id);
            if (idx === -1) {
              allLocalInqs.push(spInq);
              localInqsUpdated = true;
            } else if (allLocalInqs[idx].status !== spInq.status) {
              allLocalInqs[idx].status = spInq.status;
              localInqsUpdated = true;
            }
          }
          if (localInqsUpdated) {
            saveJSON(INQUIRIES_FILE, allLocalInqs);
            console.log(`[Supabase Sync] Back-synced missing or updated inquiries to local JSON.`);
          }

          // Sort by creation date descending
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          inquiries = merged;
          console.log(`[Supabase] Loaded and merged ${inquiries.length} inquiries.`);
        } else {
          console.log("[Supabase Status] Fetching inquiries from Supabase is pending table setup:", error?.message);
        }
      } catch (err) {
        console.log("[Supabase Status] Error fetching inquiries:", err);
      }
    }

    res.json(inquiries);
  });

  // Admin GET Endpoint: Retrieve all orders
  app.get("/api/admin/orders", async (req, res) => {
    const localOrders = loadJSON<any[]>(ORDERS_FILE, []).filter(o => o.id !== "rls-probe-do-not-delete");
    let orders = [...localOrders];

    if (supabase) {
      // Trigger sync in the background asynchronously so it doesn't block the API response
      syncLocalDataToSupabase().catch(err => console.error("[Supabase Background Sync Error]", err));

      try {
        console.log("[Supabase] Fetching orders from Supabase...");
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!error && data) {
          const supabaseOrders = data
            .filter((item: any) => item.id !== "rls-probe-do-not-delete")
            .map((item: any) => ({
              id: item.id,
              shippingDetails: item.shipping_details,
              cart: item.cart,
              grandTotal: Number(item.grand_total),
              createdAt: item.created_at,
              status: item.status,
              orderTime: item.order_time
            }));

          // Merge: use Supabase records as primary, but keep any local records not yet synced
          const merged = [...supabaseOrders];
          for (const localOrd of localOrders) {
            if (!merged.some(o => o.id === localOrd.id)) {
              merged.push(localOrd);
            }
          }

          // Back-sync missing or updated orders to local orders.json
          const allLocalOrders = loadJSON<any[]>(ORDERS_FILE, []);
          let localOrdersUpdated = false;
          for (const spOrd of supabaseOrders) {
            const idx = allLocalOrders.findIndex(o => o.id === spOrd.id);
            if (idx === -1) {
              allLocalOrders.push(spOrd);
              localOrdersUpdated = true;
            } else if (allLocalOrders[idx].status !== spOrd.status) {
              allLocalOrders[idx].status = spOrd.status;
              localOrdersUpdated = true;
            }
          }
          if (localOrdersUpdated) {
            saveJSON(ORDERS_FILE, allLocalOrders);
            console.log(`[Supabase Sync] Back-synced missing or updated orders to local JSON.`);
          }

          // Sort by creation date descending
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          orders = merged;
          console.log(`[Supabase] Loaded and merged ${orders.length} orders.`);
        } else {
          console.log("[Supabase Status] Fetching orders from Supabase is pending table setup:", error?.message);
        }
      } catch (err) {
        console.log("[Supabase Status] Error fetching orders:", err);
      }
    }

    res.json(orders);
  });

  // User GET Endpoint: Retrieve personalized orders for a specific collector's email
  app.get("/api/user/orders", async (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Missing user email parameter." });
    }

    const lowercaseEmail = email.toLowerCase().trim();
    const localOrders = loadJSON<any[]>(ORDERS_FILE, []).filter(o => o.id !== "rls-probe-do-not-delete");
    const userLocalOrders = localOrders.filter(o => o.shippingDetails?.email?.toLowerCase().trim() === lowercaseEmail);
    let orders = [...userLocalOrders];

    if (supabase) {
      try {
        console.log(`[Supabase] Fetching orders for user ${lowercaseEmail} from Supabase...`);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (!error && data) {
          const supabaseOrders = data
            .filter((item: any) => {
              if (item.id === "rls-probe-do-not-delete") return false;
              const ordEmail = item.shipping_details?.email || "";
              return ordEmail.toLowerCase().trim() === lowercaseEmail;
            })
            .map((item: any) => ({
              id: item.id,
              shippingDetails: item.shipping_details,
              cart: item.cart,
              grandTotal: Number(item.grand_total),
              createdAt: item.created_at,
              status: item.status,
              orderTime: item.order_time
            }));

          // Merge: use Supabase records as primary, but keep any local records not yet synced
          const merged = [...supabaseOrders];
          for (const localOrd of userLocalOrders) {
            if (!merged.some(o => o.id === localOrd.id)) {
              merged.push(localOrd);
            }
          }

          // Back-sync missing or updated user orders to local orders.json
          const allLocalOrders = loadJSON<any[]>(ORDERS_FILE, []);
          let localOrdersUpdated = false;
          for (const spOrd of supabaseOrders) {
            const idx = allLocalOrders.findIndex(o => o.id === spOrd.id);
            if (idx === -1) {
              allLocalOrders.push(spOrd);
              localOrdersUpdated = true;
            } else if (allLocalOrders[idx].status !== spOrd.status) {
              allLocalOrders[idx].status = spOrd.status;
              localOrdersUpdated = true;
            }
          }
          if (localOrdersUpdated) {
            saveJSON(ORDERS_FILE, allLocalOrders);
            console.log(`[Supabase Sync] Back-synced missing user orders during query.`);
          }

          // Sort by creation date descending
          merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          orders = merged;
          console.log(`[Supabase] Loaded and merged ${orders.length} personalized orders for ${lowercaseEmail}.`);
        } else {
          console.log("[Supabase Status] Fetching user orders from Supabase pending table setup:", error?.message);
        }
      } catch (err) {
        console.log("[Supabase Status] Error fetching user orders:", err);
      }
    }

    res.json(orders);
  });

  // Admin POST Endpoint: Update inquiry status
  app.post("/api/admin/update-inquiry-status", async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Missing id or status." });

    const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
    let inquiryIndex = inquiries.findIndex(i => i.id === id);

    // If inquiry is not found locally but we have Supabase, let's fetch it from Supabase first
    if (inquiryIndex === -1 && supabase) {
      try {
        console.log(`[Supabase] Fetching missing inquiry ${id} from Supabase before update...`);
        const { data, error } = await supabase
          .from("inquiries")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        if (!error && data) {
          const spInq = {
            id: data.id,
            name: data.name,
            email: data.email,
            projectType: data.project_type,
            budget: data.budget,
            description: data.description,
            deliveryDate: data.delivery_date,
            createdAt: data.created_at,
            status: data.status,
            configuration: data.configuration
          };
          inquiries.push(spInq);
          saveJSON(INQUIRIES_FILE, inquiries);
          inquiryIndex = inquiries.length - 1;
          console.log(`[Supabase Sync] Pulled missing inquiry ${id} into local file for update.`);
        }
      } catch (err) {
        console.error(`[Supabase Sync Error] Could not fetch missing inquiry before update:`, err);
      }
    }

    if (inquiryIndex === -1 && !supabase) return res.status(404).json({ error: "Inquiry not found." });

    let updatedInquiry: any = null;
    if (inquiryIndex > -1) {
      inquiries[inquiryIndex].status = status;
      saveJSON(INQUIRIES_FILE, inquiries);
      updatedInquiry = inquiries[inquiryIndex];
    } else {
      updatedInquiry = { id, status };
    }

    if (supabase) {
      try {
        if (inquiryIndex > -1) {
          console.log(`[Supabase] Authoritatively upserting full details and status for inquiry ${id} to ${status}...`);
          const { error } = await supabase
            .from("inquiries")
            .upsert({
              id: updatedInquiry.id,
              name: updatedInquiry.name,
              email: updatedInquiry.email,
              project_type: updatedInquiry.projectType,
              budget: updatedInquiry.budget,
              description: updatedInquiry.description,
              delivery_date: updatedInquiry.deliveryDate,
              created_at: updatedInquiry.createdAt || new Date().toISOString(),
              status: updatedInquiry.status,
              configuration: updatedInquiry.configuration
            });
          if (error) {
            console.log(`[Supabase Status] Failed to upsert inquiry ${id} (pending table setup):`, error.message);
          } else {
            console.log(`[Supabase] Successfully upserted inquiry ${id} with status ${status}.`);
          }
        } else {
          console.log(`[Supabase] Row is not in local JSON. Performing status-only update for inquiry ${id} to ${status}...`);
          const { error } = await supabase
            .from("inquiries")
            .update({ status })
            .eq("id", id);
          if (error) {
            console.log(`[Supabase Status] Failed to update inquiry ${id} status (pending table setup):`, error.message);
          } else {
            console.log(`[Supabase] Successfully updated status for inquiry ${id}.`);
          }
        }
      } catch (err: any) {
        console.log(`[Supabase Status] Exception during inquiry ${id} update/upsert:`, err.message || err);
      }
    }

    res.json({ success: true, inquiry: updatedInquiry });
  });

  // Admin POST Endpoint: Update order status
  app.post("/api/admin/update-order-status", async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Missing id or status." });

    const orders = loadJSON<any[]>(ORDERS_FILE, []);
    let orderIndex = orders.findIndex(o => o.id === id);

    // If order is not found locally but we have Supabase, let's fetch it from Supabase first
    if (orderIndex === -1 && supabase) {
      try {
        console.log(`[Supabase] Fetching missing order ${id} from Supabase before update...`);
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        
        if (!error && data) {
          const spOrd = {
            id: data.id,
            shippingDetails: data.shipping_details,
            cart: data.cart,
            grandTotal: Number(data.grand_total),
            createdAt: data.created_at,
            status: data.status,
            orderTime: data.order_time
          };
          orders.push(spOrd);
          saveJSON(ORDERS_FILE, orders);
          orderIndex = orders.length - 1;
          console.log(`[Supabase Sync] Pulled missing order ${id} into local file for update.`);
        }
      } catch (err) {
        console.error(`[Supabase Sync Error] Could not fetch missing order before update:`, err);
      }
    }

    if (orderIndex === -1 && !supabase) return res.status(404).json({ error: "Order not found." });

    let updatedOrder: any = null;
    if (orderIndex > -1) {
      orders[orderIndex].status = status;
      saveJSON(ORDERS_FILE, orders);
      updatedOrder = orders[orderIndex];
    } else {
      updatedOrder = { id, status };
    }

    if (supabase) {
      try {
        if (orderIndex > -1) {
          console.log(`[Supabase] Authoritatively upserting full details and status for order ${id} to ${status}...`);
          const { error } = await supabase
            .from("orders")
            .upsert({
              id: updatedOrder.id,
              shipping_details: updatedOrder.shippingDetails || null,
              cart: updatedOrder.cart || null,
              grand_total: updatedOrder.grandTotal || null,
              created_at: updatedOrder.createdAt || new Date().toISOString(),
              status: updatedOrder.status,
              order_time: updatedOrder.orderTime || new Date(updatedOrder.createdAt || new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });
          if (error) {
            console.log(`[Supabase Status] Failed to upsert order ${id} (pending table setup):`, error.message);
          } else {
            console.log(`[Supabase] Successfully upserted order ${id} with status ${status}.`);
          }
        } else {
          console.log(`[Supabase] Row is not in local JSON. Performing status-only update for order ${id} to ${status}...`);
          const { error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", id);
          if (error) {
            console.log(`[Supabase Status] Failed to update order ${id} status (pending table setup):`, error.message);
          } else {
            console.log(`[Supabase] Successfully updated status for order ${id}.`);
          }
        }
      } catch (err: any) {
        console.log(`[Supabase Status] Exception during order ${id} update/upsert:`, err.message || err);
      }
    }

    res.json({ success: true, order: updatedOrder });
  });

  // Admin DELETE Endpoint: Clear all admin logs/data
  app.delete("/api/admin/clear", async (req, res) => {
    saveJSON(INQUIRIES_FILE, []);
    saveJSON(ORDERS_FILE, []);

    if (supabase) {
      try {
        console.log("[Supabase] Clearing tables 'orders' and 'inquiries' in Supabase...");
        const { error: ordError } = await supabase.from("orders").delete().neq("id", "");
        const { error: inqError } = await supabase.from("inquiries").delete().neq("id", "");
        
        if (ordError || inqError) {
          console.log("[Supabase Status] Failed to clear tables (pending table setup):", ordError?.message, inqError?.message);
        } else {
          console.log("[Supabase] Successfully cleared all data in Supabase tables.");
        }
      } catch (err) {
        console.log("[Supabase Status] Exception clearing tables:", err);
      }
    }

    res.json({ success: true, message: "All local and Supabase database logs cleared." });
  });

  // Admin Single Record Delete Endpoint
  app.post("/api/admin/delete-item", async (req, res) => {
    try {
      const { id, type } = req.body;
      if (!id || !type) {
        return res.status(400).json({ error: "Missing required parameters (id, type) to delete." });
      }

      console.log(`[Admin API] Request received to delete ${type} with ID: ${id}`);

      if (type === "order") {
        const orders = loadJSON<any[]>(ORDERS_FILE, []);
        const filtered = orders.filter(o => o.id !== id);
        saveJSON(ORDERS_FILE, filtered);

        if (supabase) {
          try {
            console.log(`[Supabase] Row delete request for order ${id}...`);
            const { error } = await supabase.from("orders").delete().eq("id", id);
            if (error) {
              console.warn(`[Supabase Status] Error during row deletion for order ${id}:`, error.message);
            } else {
              console.log(`[Supabase] Successfully deleted row for order ${id}.`);
            }
          } catch (err) {
            console.error(`[Supabase Status Exception] on deleting order ${id}:`, err);
          }
        }
      } else if (type === "inquiry") {
        const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
        const filtered = inquiries.filter(i => i.id !== id);
        saveJSON(INQUIRIES_FILE, filtered);

        if (supabase) {
          try {
            console.log(`[Supabase] Row delete request for inquiry ${id}...`);
            const { error } = await supabase.from("inquiries").delete().eq("id", id);
            if (error) {
              console.warn(`[Supabase Status] Error during row deletion for inquiry ${id}:`, error.message);
            } else {
              console.log(`[Supabase] Successfully deleted row for inquiry ${id}.`);
            }
          } catch (err) {
            console.error(`[Supabase Status Exception] on deleting inquiry ${id}:`, err);
          }
        }
      } else {
        return res.status(400).json({ error: "Invalid record type. Must be 'order' or 'inquiry'." });
      }

      res.json({ success: true, message: `Successfully deleted ${type} record ${id}.` });
    } catch (err: any) {
      console.error("[Admin API] Failed to delete record:", err);
      res.status(500).json({ error: err.message || "Failed to delete item from server." });
    }
  });

  // Vite middleware for development (using SPA routing fallback)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        watch: {
          ignored: [
            "**/inquiries.json",
            "**/orders.json",
            "**/*.json"
          ]
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Resin Grove Full-Stack Server running on port ${PORT}`);
    // Start background local data check & synchronization
    syncLocalDataToSupabase();
  });
}

startServer();
