// api/user/orders.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Helper to format the database rows for the frontend
function mapOrderRow(item: any) {
  return {
    id: item.id,
    shippingDetails: item.shipping_details,
    cart: item.cart ?? [],
    grandTotal: Number(item.grand_total ?? 0),
    createdAt: item.created_at,
    status: item.status,
    orderTime: item.order_time,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // The frontend will send the user's email as a query parameter: /api/user/orders?email=...
  const { email } = req.query;
  
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: "Missing user email parameter." });
  }

  if (!supabase) {
    return res.status(500).json({ error: "Supabase not configured on the server." });
  }

  try {
    // Fetch all orders (you can optimize this later with Supabase JSONB filtering)
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const lowercaseEmail = email.toLowerCase().trim();
    
    // Filter the orders so the user only sees THEIR orders
    const userOrders = (data || [])
      .filter((item) => {
        const orderEmail = item.shipping_details?.email || "";
        return orderEmail.toLowerCase().trim() === lowercaseEmail;
      })
      .map(mapOrderRow);

    return res.status(200).json(userOrders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    return res.status(500).json({ error: "Internal server error. Could not fetch orders." });
  }
}