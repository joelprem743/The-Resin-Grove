// api/orders.ts
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "joelpremtej@gmail.com";

async function sendEmail({ to, subject, text, html }) {
  try {
    console.log("[SMTP] Initializing temporary Ethereal SMTP test account for Vercel...");
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: '"The Resin Grove Studio" <no-reply@theresingrove.com>',
      to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✉️ Email sent! Preview URL: ${previewUrl}`);
    return { success: true, previewUrl };
  } catch (err) {
    console.error("Error sending email:", err);
    return { success: false, error: err.message };
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
    } else {
      console.log("[Supabase] Not configured. Order not saved to database.");
    }

    // 2. Send Email Notification
    const emailResult = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `[The Resin Grove] New Order - ${newOrder.id}`,
      text: `New order from ${shippingDetails.name}. Total: ₹${newOrder.grandTotal.toFixed(2)}`,
      html: `<h3>New Order: ${newOrder.id}</h3><p>Customer: ${shippingDetails.name}</p><p>Total: ₹${newOrder.grandTotal.toFixed(2)}</p>`
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: newOrder,
      emailSent: emailResult.success,
      previewUrl: emailResult.previewUrl || "",
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Internal server error. Could not place order." });
  }
}