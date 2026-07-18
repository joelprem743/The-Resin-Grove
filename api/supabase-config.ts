// api/supabase-config.ts
export default async function handler(req: any, res: any) {
    const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || null;
    const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || null;
    
    return res.status(200).json({
      initialized: !!(url && key),
      supabaseUrl: url,
      supabaseAnonKey: key,
    });
  }