import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Local storage paths — ONLY used as a fallback when Supabase is not configured
// (e.g. local development without env vars set). When Supabase IS configured,
// it is the single source of truth: all reads and writes go through it.
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

// Helper to safely load JSON file (fallback storage only)
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

// Helper to safely save JSON file (fallback storage only)
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

function mapOrderRow(item: any) {
  return {
    id: item.id,
    shippingDetails: item.shipping_details,
    cart: item.cart,
    grandTotal: Number(item.grand_total),
    createdAt: item.created_at,
    status: item.status,
    orderTime: item.order_time,
  };
}

function mapInquiryRow(item: any) {
  return {
    id: item.id,
    name: item.name,
    email: item.email,
    projectType: item.project_type,
    budget: item.budget,
    description: item.description,
    deliveryDate: item.delivery_date,
    createdAt: item.created_at,
    status: item.status,
    configuration: item.configuration,
  };
}

// ---------------------------------------------------------------------------
// WRITE HELPERS
// Supabase is the single source of truth when configured. Local JSON is only
// ever used as a fallback when Supabase is not configured at all.
// ---------------------------------------------------------------------------

async function saveOrder(order: any) {
  if (!supabase) {
    const orders = loadJSON<any[]>(ORDERS_FILE, []);
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex > -1) orders[existingIndex] = order;
    else orders.unshift(order);
    saveJSON(ORDERS_FILE, orders);
    return { success: true, localOnly: true };
  }

  try {
    const { error } = await supabase.from("orders").upsert({
      id: order.id,
      shipping_details: order.shippingDetails,
      cart: order.cart,
      grand_total: order.grandTotal,
      created_at: order.createdAt,
      status: order.status,
      order_time: order.orderTime || new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    if (error) {
      console.error(`[Supabase] Failed to save order ${order.id}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Successfully saved order ${order.id}.`);

    if (order.cart && order.cart.length > 0) {
      const itemsToInsert = order.cart.map((item: any) => ({
        order_id: order.id,
        product_id: (item.product?.id || item.product_id || "").toString(),
        quantity: item.quantity,
        selected_wood: item.selectedWood || null,
        selected_resin_color: item.selectedResinColor || null,
        selected_deco: item.selectedDeco || [],
        personalization_text: item.personalizationText || null,
      }));

      await supabase.from("order_items").delete().eq("order_id", order.id);
      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsError) {
        console.error(`[Supabase] Failed to save order_items for order ${order.id}:`, itemsError.message);
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error(`[Supabase] Exception saving order ${order.id}:`, err);
    return { success: false, error: err.message || String(err) };
  }
}

async function saveInquiry(inquiry: any) {
  if (!supabase) {
    const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
    const existingIndex = inquiries.findIndex((i) => i.id === inquiry.id);
    if (existingIndex > -1) inquiries[existingIndex] = inquiry;
    else inquiries.unshift(inquiry);
    saveJSON(INQUIRIES_FILE, inquiries);
    return { success: true, localOnly: true };
  }

  try {
    const { error } = await supabase.from("inquiries").upsert({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      project_type: inquiry.projectType,
      budget: inquiry.budget,
      description: inquiry.description,
      delivery_date: inquiry.deliveryDate,
      created_at: inquiry.createdAt,
      status: inquiry.status,
      configuration: inquiry.configuration,
    });

    if (error) {
      console.error(`[Supabase] Failed to save inquiry ${inquiry.id}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Successfully saved inquiry ${inquiry.id}.`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Supabase] Exception saving inquiry ${inquiry.id}:`, err);
    return { success: false, error: err.message || String(err) };
  }
}

// ---------------------------------------------------------------------------
// READ HELPERS
// Fetch exclusively from Supabase when configured — no merging with local
// JSON, no back-syncing. Local JSON is read only when Supabase isn't set up.
// ---------------------------------------------------------------------------

async function getAllOrders() {
  if (!supabase) {
    return loadJSON<any[]>(ORDERS_FILE, []).filter((o) => o.id !== "rls-probe-do-not-delete");
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch orders:", error.message);
    throw new Error(error.message);
  }

  return (data || [])
    .filter((item: any) => item.id !== "rls-probe-do-not-delete")
    .map(mapOrderRow);
}

async function getAllInquiries() {
  if (!supabase) {
    return loadJSON<any[]>(INQUIRIES_FILE, []).filter((i) => i.id !== "rls-probe-do-not-delete");
  }

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Failed to fetch inquiries:", error.message);
    throw new Error(error.message);
  }

  return (data || [])
    .filter((item: any) => item.id !== "rls-probe-do-not-delete")
    .map(mapInquiryRow);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Public GET Endpoint: Retrieve public Supabase configuration for dynamic client initialization
  app.get("/api/supabase-config", (req, res) => {
    res.json({
      initialized: !!(supabaseUrl && supabaseAnonKey),
      supabaseUrl: supabaseUrl || null,
      supabaseAnonKey: supabaseAnonKey || null,
    });
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
        configuration: configuration || null,
      };

      const saveResult = await saveInquiry(newInquiry);

      if (!saveResult.success) {
        // Supabase is the source of truth — if the write failed, tell the caller honestly
        // instead of pretending it succeeded.
        return res.status(502).json({
          error: "Failed to save inquiry to the database.",
          details: saveResult.error,
        });
      }

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

      sendEmail({ to: adminEmailAddress, subject: emailSubject, text: textBody, html: htmlBody })
        .then((emailResult) => {
          console.log(`[SMTP Background] Inquiry email sent successfully. Preview: ${emailResult.previewUrl || "N/A"}`);
        })
        .catch((err) => {
          console.error("[SMTP Background] Failed to send inquiry email:", err);
        });

      res.status(201).json({
        success: true,
        message: "Inquiry successfully submitted.",
        inquiry: newInquiry,
        emailSent: true,
        previewUrl: "",
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
        orderTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "Curation Requested",
      };

      const saveResult = await saveOrder(newOrder);

      if (!saveResult.success) {
        return res.status(502).json({
          error: "Failed to save order to the database.",
          details: saveResult.error,
        });
      }

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

      sendEmail({ to: adminEmailAddress, subject: emailSubject, text: textBody, html: htmlBody })
        .then((emailResult) => {
          console.log(`[SMTP Background] Order email sent successfully. Preview: ${emailResult.previewUrl || "N/A"}`);
        })
        .catch((err) => {
          console.error("[SMTP Background] Failed to send order email:", err);
        });

      res.status(201).json({
        success: true,
        message: "Order placed successfully.",
        order: newOrder,
        emailSent: true,
        previewUrl: "",
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
        orderItemsTableOk: false,
        error: "Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured.",
      });
    }

    let ordersTableOk = false;
    let inquiriesTableOk = false;
    let orderItemsTableOk = false;
    let errorOrders = null;
    let errorInquiries = null;
    let errorOrderItems = null;
    let tempOrderCreated = false;

    try {
      const { error: rlsError } = await supabase.from("orders").upsert({
        id: "rls-probe-do-not-delete",
        shipping_details: {},
        cart: [],
        grand_total: 0,
        status: "probe",
      });
      if (rlsError) {
        ordersTableOk = false;
        errorOrders =
          rlsError.code === "42501"
            ? "Row Level Security (RLS) is active but blocking writes. Please run the SQL Setup script to define permissive public access policies."
            : rlsError.message;
      } else {
        ordersTableOk = true;
        tempOrderCreated = true;
      }
    } catch (err: any) {
      errorOrders = err.message || String(err);
    }

    try {
      const { error: rlsError } = await supabase.from("inquiries").upsert({
        id: "rls-probe-do-not-delete",
        name: "probe",
        email: "probe@example.com",
        status: "probe",
      });
      if (rlsError) {
        inquiriesTableOk = false;
        errorInquiries =
          rlsError.code === "42501"
            ? "Row Level Security (RLS) is active but blocking writes. Please run the SQL Setup script to define permissive public access policies."
            : rlsError.message;
      } else {
        inquiriesTableOk = true;
        await supabase.from("inquiries").delete().eq("id", "rls-probe-do-not-delete");
      }
    } catch (err: any) {
      errorInquiries = err.message || String(err);
    }

    if (tempOrderCreated) {
      try {
        const { error: rlsError } = await supabase.from("order_items").insert({
          order_id: "rls-probe-do-not-delete",
          product_id: "rls-probe-item",
          quantity: 0,
        });
        if (rlsError) {
          orderItemsTableOk = false;
          errorOrderItems =
            rlsError.code === "42501"
              ? "Row Level Security (RLS) is active but blocking writes. Please run the SQL Setup script to define permissive public access policies."
              : rlsError.message;
        } else {
          orderItemsTableOk = true;
          await supabase.from("order_items").delete().eq("order_id", "rls-probe-do-not-delete");
        }
      } catch (err: any) {
        errorOrderItems = err.message || String(err);
      }

      try {
        await supabase.from("orders").delete().eq("id", "rls-probe-do-not-delete");
      } catch (err) {
        console.error("[Supabase Status] Failed to clean up probe order:", err);
      }
    } else {
      errorOrderItems = "Cannot verify order_items because parent orders table probe failed or was blocked.";
    }

    res.json({
      initialized: true,
      url: supabaseUrl,
      ordersTableOk,
      inquiriesTableOk,
      orderItemsTableOk,
      errorOrders,
      errorInquiries,
      errorOrderItems,
    });
  });

  // Admin GET Endpoint: Retrieve all inquiries (Supabase-only when configured)
  app.get("/api/admin/inquiries", async (req, res) => {
    try {
      const inquiries = await getAllInquiries();
      res.json(inquiries);
    } catch (err: any) {
      res.status(502).json({ error: "Failed to fetch inquiries from the database.", details: err.message });
    }
  });

  // Admin GET Endpoint: Retrieve all orders (Supabase-only when configured)
  app.get("/api/admin/orders", async (req, res) => {
    try {
      const orders = await getAllOrders();
      res.json(orders);
    } catch (err: any) {
      res.status(502).json({ error: "Failed to fetch orders from the database.", details: err.message });
    }
  });

  // User GET Endpoint: Retrieve personalized orders for a specific collector's email
  app.get("/api/user/orders", async (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Missing user email parameter." });
    }
    const lowercaseEmail = email.toLowerCase().trim();

    try {
      const allOrders = await getAllOrders();
      const userOrders = allOrders.filter(
        (o: any) => (o.shippingDetails?.email || "").toLowerCase().trim() === lowercaseEmail
      );
      res.json(userOrders);
    } catch (err: any) {
      res.status(502).json({ error: "Failed to fetch orders from the database.", details: err.message });
    }
  });

  // Admin POST Endpoint: Update inquiry status
  app.post("/api/admin/update-inquiry-status", async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Missing id or status." });

    if (!supabase) {
      const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
      const idx = inquiries.findIndex((i) => i.id === id);
      if (idx === -1) return res.status(404).json({ error: "Inquiry not found." });
      inquiries[idx].status = status;
      saveJSON(INQUIRIES_FILE, inquiries);
      return res.json({ success: true, inquiry: inquiries[idx] });
    }

    const { data, error } = await supabase.from("inquiries").update({ status }).eq("id", id).select().maybeSingle();
    if (error) {
      return res.status(502).json({ error: "Failed to update inquiry status.", details: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "Inquiry not found." });
    }
    res.json({ success: true, inquiry: mapInquiryRow(data) });
  });

  // Admin POST Endpoint: Update order status
  app.post("/api/admin/update-order-status", async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Missing id or status." });

    if (!supabase) {
      const orders = loadJSON<any[]>(ORDERS_FILE, []);
      const idx = orders.findIndex((o) => o.id === id);
      if (idx === -1) return res.status(404).json({ error: "Order not found." });
      orders[idx].status = status;
      saveJSON(ORDERS_FILE, orders);
      return res.json({ success: true, order: orders[idx] });
    }

    const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().maybeSingle();
    if (error) {
      return res.status(502).json({ error: "Failed to update order status.", details: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json({ success: true, order: mapOrderRow(data) });
  });

  // Admin DELETE Endpoint: Clear all admin logs/data
  app.delete("/api/admin/clear", async (req, res) => {
    if (!supabase) {
      saveJSON(INQUIRIES_FILE, []);
      saveJSON(ORDERS_FILE, []);
      return res.json({ success: true, message: "All local database logs cleared." });
    }

    try {
      const { error: ordItemsError } = await supabase.from("order_items").delete().neq("order_id", "");
      const { error: ordError } = await supabase.from("orders").delete().neq("id", "");
      const { error: inqError } = await supabase.from("inquiries").delete().neq("id", "");

      if (ordError || inqError || ordItemsError) {
        return res.status(502).json({
          success: false,
          error: "Failed to fully clear Supabase tables.",
          details: { ordError: ordError?.message, inqError: inqError?.message, ordItemsError: ordItemsError?.message },
        });
      }
      res.json({ success: true, message: "All Supabase database logs cleared." });
    } catch (err: any) {
      res.status(502).json({ success: false, error: err.message || String(err) });
    }
  });

  // Admin Single Record Delete Endpoint
  app.post("/api/admin/delete-item", async (req, res) => {
    try {
      const { id, type } = req.body;
      if (!id || !type) {
        return res.status(400).json({ error: "Missing required parameters (id, type) to delete." });
      }

      if (type === "order") {
        if (!supabase) {
          const orders = loadJSON<any[]>(ORDERS_FILE, []);
          saveJSON(ORDERS_FILE, orders.filter((o) => o.id !== id));
        } else {
          await supabase.from("order_items").delete().eq("order_id", id);
          const { error } = await supabase.from("orders").delete().eq("id", id);
          if (error) {
            return res.status(502).json({ error: "Failed to delete order.", details: error.message });
          }
        }
      } else if (type === "inquiry") {
        if (!supabase) {
          const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
          saveJSON(INQUIRIES_FILE, inquiries.filter((i) => i.id !== id));
        } else {
          const { error } = await supabase.from("inquiries").delete().eq("id", id);
          if (error) {
            return res.status(502).json({ error: "Failed to delete inquiry.", details: error.message });
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
          ignored: ["**/inquiries.json", "**/orders.json", "**/*.json"],
        },
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
    console.log(supabase ? "[Storage] Supabase is the active source of truth." : "[Storage] Running in local JSON fallback mode.");
  });
}
console.log("### RUNNING UPDATED SERVER v2 — Supabase-only writes ###");
startServer();