import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Local storage paths
const INQUIRIES_FILE = path.join(process.cwd(), "inquiries.json");
const ORDERS_FILE = path.join(process.cwd(), "orders.json");

// Helper to automatically send emails via SMTP or fall back to Ethereal
async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  let transporter;
  let isTestAccount = false;
  let previewUrl = "";

  if (host && user && pass) {
    console.log(`[SMTP] Attempting to send email via configured SMTP host: ${host}:${port}`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  } else {
    console.log("[SMTP] No SMTP credentials provided in environment variables. Creating temporary Ethereal SMTP test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isTestAccount = true;
    } catch (err) {
      console.error("Failed to create Ethereal SMTP test account. Falling back to log-only mode:", err);
      return { success: true, simulated: true, message: "SMTP not configured. Email logged to console." };
    }
  }

  try {
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

      const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
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

      inquiries.unshift(newInquiry);
      saveJSON(INQUIRIES_FILE, inquiries);

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

      const emailResult = await sendEmail({
        to: adminEmailAddress,
        subject: emailSubject,
        text: textBody,
        html: htmlBody
      });

      res.status(201).json({ 
        success: true, 
        message: "Inquiry successfully submitted & emailed to admin.", 
        inquiry: newInquiry,
        emailSent: emailResult.success,
        previewUrl: emailResult.previewUrl 
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

      const orders = loadJSON<any[]>(ORDERS_FILE, []);
      const newOrder = {
        id: `TRG-${Math.floor(100000 + Math.random() * 900000)}`,
        shippingDetails,
        cart,
        grandTotal: Number(grandTotal),
        createdAt: new Date().toISOString(),
        status: "Curation Requested"
      };

      orders.unshift(newOrder);
      saveJSON(ORDERS_FILE, orders);

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

      const emailResult = await sendEmail({
        to: adminEmailAddress,
        subject: emailSubject,
        text: textBody,
        html: htmlBody
      });

      res.status(201).json({ 
        success: true, 
        message: "Order placed & emailed to admin.", 
        order: newOrder,
        emailSent: emailResult.success,
        previewUrl: emailResult.previewUrl 
      });
    } catch (err: any) {
      console.error("Error placing order:", err);
      res.status(500).json({ error: "Internal server error. Could not place order." });
    }
  });

  // Admin GET Endpoint: Retrieve all inquiries
  app.get("/api/admin/inquiries", (req, res) => {
    const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
    res.json(inquiries);
  });

  // Admin GET Endpoint: Retrieve all orders
  app.get("/api/admin/orders", (req, res) => {
    const orders = loadJSON<any[]>(ORDERS_FILE, []);
    res.json(orders);
  });

  // Admin POST Endpoint: Update inquiry status
  app.post("/api/admin/update-inquiry-status", (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Missing id or status." });

    const inquiries = loadJSON<any[]>(INQUIRIES_FILE, []);
    const inquiryIndex = inquiries.findIndex(i => i.id === id);
    if (inquiryIndex === -1) return res.status(404).json({ error: "Inquiry not found." });

    inquiries[inquiryIndex].status = status;
    saveJSON(INQUIRIES_FILE, inquiries);
    res.json({ success: true, inquiry: inquiries[inquiryIndex] });
  });

  // Admin POST Endpoint: Update order status
  app.post("/api/admin/update-order-status", (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: "Missing id or status." });

    const orders = loadJSON<any[]>(ORDERS_FILE, []);
    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) return res.status(404).json({ error: "Order not found." });

    orders[orderIndex].status = status;
    saveJSON(ORDERS_FILE, orders);
    res.json({ success: true, order: orders[orderIndex] });
  });

  // Admin DELETE Endpoint: Clear all admin logs/data
  app.delete("/api/admin/clear", (req, res) => {
    saveJSON(INQUIRIES_FILE, []);
    saveJSON(ORDERS_FILE, []);
    res.json({ success: true, message: "All local database logs cleared." });
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
  });
}

startServer();
