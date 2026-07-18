// api/orders.ts
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "joelpremtej@gmail.com";

// SMTP Configuration
async function sendEmail({ to, subject, html }) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  let transporter;

  // 1. If real SMTP credentials are provided in Vercel Env Vars, use them
  if (host && user && pass) {
    console.log(`[SMTP] Initializing configured SMTP host: ${host}:${port}`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // 2. Fallback to Ethereal test account for development
    console.log("[SMTP] No SMTP credentials provided. Using Ethereal test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    } catch (err) {
      console.error("Failed to create Ethereal account:", err);
      return { success: false, previewUrl: "" };
    }
  }

  try {
    const info = await transporter.sendMail({
      from: `"The Resin Grove Studio" <${user || 'no-reply@theresingrove.com'}>`,
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || "";
    console.log(`✉️ Email sent! Preview URL: ${previewUrl}`);
    return { success: true, previewUrl };
  } catch (err) {
    console.error("Error sending email via SMTP:", err);
    return { success: false, previewUrl: "" };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    // 1. Save to Supabase
    if (supabase) {
      const { error } = await supabase.from("orders").upsert({
        id: newOrder.id,
        shipping_details: newOrder.shippingDetails,
        cart: newOrder.cart,
        grand_total: newOrder.grandTotal,
        created_at: newOrder.createdAt,
        status: newOrder.status,
        order_time: newOrder.orderTime,
      });

      if (error) throw new Error(error.message);

      if (newOrder.cart && newOrder.cart.length > 0) {
        const itemsToInsert = newOrder.cart.map((item) => ({
          order_id: newOrder.id,
          product_id: (item.product?.id || item.product_id || "").toString(),
          quantity: item.quantity,
          selected_wood: item.selectedWood || null,
          selected_resin_color: item.selectedResinColor || null,
          selected_deco: item.selectedDeco || [],
          personalization_text: item.personalizationText || null,
          custom_image_url: item.customPhotoUrl || null,
        }));

        await supabase.from("order_items").delete().eq("order_id", newOrder.id);
        await supabase.from("order_items").insert(itemsToInsert);
      }
    }

    // 2. Build Luxury Email HTML
    let itemsHtml = "";
    cart.forEach((item) => {
      itemsHtml += `
        <div style="padding: 12px; border-bottom: 1px solid #EAEAEA;">
          <h4 style="margin: 0 0 4px 0; font-family: sans-serif; color: #1A1A1A;">${item.product.name} (x${item.quantity})</h4>
          <p style="margin: 0; font-size: 11px; color: #C9A76A; font-weight: bold; text-transform: uppercase;">${item.product.category || 'Item'}</p>
          <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 12px; font-weight: bold; color: #1A1A1A;">Price: ₹${(item.product.price * item.quantity).toFixed(2)}</p>
      `;

      // Add custom configurations if they exist
      if (item.selectedWood || item.selectedResinColor || item.selectedDeco || item.personalizationText) {
        itemsHtml += `<div style="margin-top: 8px; padding: 8px; background: #FAF8F5; border: 1px solid #E6D7B8; border-radius: 2px; font-size: 11px; color: #5A5A5A;">`;
        if (item.selectedWood) itemsHtml += `<div>• Wood Type: <strong>${item.selectedWood}</strong></div>`;
        if (item.selectedResinColor) itemsHtml += `<div>• Resin Color: <strong>${item.selectedResinColor}</strong></div>`;
        if (item.selectedDeco && item.selectedDeco.length > 0) itemsHtml += `<div>• Inclusions: <strong>${item.selectedDeco.join(", ")}</strong></div>`;
        if (item.personalizationText) itemsHtml += `<div style="font-family: sans-serif; margin-top: 4px; color: #C9A76A;">• Engraving: <em>"${item.personalizationText}"</em></div>`;
        itemsHtml += `</div>`;
      }

      // Add the Custom Photo to the email if it exists
      if (item.customPhotoUrl) {
        itemsHtml += `
          <div style="margin-top: 8px; padding: 8px; background: #FAF8F5; border: 1px solid #E6D7B8; border-radius: 2px; font-size: 11px; color: #5A5A5A;">
            <div style="margin-bottom: 4px;">• <strong>Customer Uploaded Photo:</strong></div>
            <a href="${item.customPhotoUrl}" target="_blank" style="display: inline-block;">
              <img src="${item.customPhotoUrl}" alt="Custom Upload" style="width: 120px; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #D9CBB3;" />
            </a>
          </div>
        `;
      }
      itemsHtml += `</div>`;
    });

    const emailHtml = `
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

    // 3. Send Email Notification via SMTP
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[The Resin Grove] New Order - ${newOrder.id}`,
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Internal server error. Could not place order." });
  }
}