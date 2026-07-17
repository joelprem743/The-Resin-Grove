// api/orders.ts
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || "joelpremtej@gmail.com";

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

    // 2. Build Email HTML
    let itemsHtml = "";
    cart.forEach((item) => {
      itemsHtml += `<div style="padding: 10px; border: 1px solid #eee; margin-bottom: 10px;">
        <strong>${item.product.name} (x${item.quantity})</strong> - ₹${(item.product.price * item.quantity).toFixed(2)}<br>
        ${item.selectedWood ? `Wood: ${item.selectedWood}<br>` : ""}
        ${item.selectedResinColor ? `Resin: ${item.selectedResinColor}<br>` : ""}
        ${item.customPhotoUrl ? `<br><img src="${item.customPhotoUrl}" style="width:100px; height:100px; object-fit:cover; border-radius:4px;" />` : ""}
      </div>`;
    });

    const emailHtml = `
      <h2>New Order: ${newOrder.id}</h2>
      <p><strong>Customer:</strong> ${shippingDetails.name}</p>
      <p><strong>Email:</strong> ${shippingDetails.email}</p>
      <p><strong>Phone:</strong> ${shippingDetails.phone}</p>
      <p><strong>Address:</strong> ${shippingDetails.address}, ${shippingDetails.zip}</p>
      <hr>
      <h3>Items:</h3>
      ${itemsHtml}
      <hr>
      <h3>Total: ₹${newOrder.grandTotal.toFixed(2)}</h3>
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