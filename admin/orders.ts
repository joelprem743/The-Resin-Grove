import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!supabase) return res.status(500).json({ error: "Database not configured" });

  try {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    const orders = (data || []).filter((item) => item.id !== "rls-probe-do-not-delete").map((item) => ({
      id: item.id,
      shippingDetails: item.shipping_details,
      cart: item.cart,
      grandTotal: Number(item.grand_total),
      createdAt: item.created_at,
      status: item.status,
      orderTime: item.order_time,
    }));

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}