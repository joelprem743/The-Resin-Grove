import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    await supabase.from("order_items").delete().neq("order_id", "");
    await supabase.from("orders").delete().neq("id", "");
    await supabase.from("inquiries").delete().neq("id", "");
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear database" });
  }
}