import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ error: "Missing id or status" });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "Server missing Supabase credentials." });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data, error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase Update Error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Inquiry not found or blocked by RLS." });
    }

    return res.status(200).json({ success: true, data: data[0] });
  } catch (err) {
    console.error("API Exception:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}