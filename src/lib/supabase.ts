// src/lib/supabase.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
let supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export let isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create real Supabase client if configured, otherwise null
export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Dynamic initialization helper for environments where build-time variables are empty
export function initializeSupabase(url: string, key: string): SupabaseClient | null {
  if (url && key) {
    supabaseUrl = url;
    supabaseAnonKey = key;
    supabase = createClient(url, key);
    isSupabaseConfigured = true;
    console.log("[Supabase Client] Dynamically initialized at runtime:", url);
    return supabase;
  }
  return null;
}

/**
 * SQL SCHEMA FOR YOUR SUPABASE SQL EDITOR:
 * 
 * -- 1. Enable UUID extension if not present
 * create extension if not exists "uuid-ossp";
 * 
 * -- 2. Create the cart_items table
 * create table public.cart_items (
 *     id uuid default uuid_generate_v4() primary key,
 *     user_id uuid references auth.users(id) on delete cascade not null,
 *     product_id varchar(255) not null,
 *     quantity integer not null default 1,
 *     selected_wood varchar(255),
 *     selected_resin_color varchar(255),
 *     selected_deco text[],
 *     personalization_text text,
 *     created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 3. Setup Row Level Security (RLS)
 * alter table public.cart_items enable row level security;
 * 
 * create policy "Users can view their own cart items" 
 *     on public.cart_items for select 
 *     using (auth.uid() = user_id);
 * 
 * create policy "Users can insert their own cart items" 
 *     on public.cart_items for insert 
 *     with check (auth.uid() = user_id);
 * 
 * create policy "Users can update their own cart items" 
 *     on public.cart_items for update 
 *     using (auth.uid() = user_id);
 * 
 * create policy "Users can delete their own cart items" 
 *     on public.cart_items for delete 
 *     using (auth.uid() = user_id);
 */


/**
 * SQL SCHEMA FOR YOUR SUPABASE SQL EDITOR:
 * 
 * -- 1. Create the cart_items table
 * create table public.cart_items (
 *     id uuid default uuid_generate_v4() primary key,
 *     user_id uuid references auth.users(id) on delete cascade not null,
 *     product_id varchar(255) not null,
 *     quantity integer not null default 1,
 *     created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- 2. Create the wishlist_items table
 * create table public.wishlist_items (
 *     id uuid default uuid_generate_v4() primary key,
 *     user_id uuid references auth.users(id) on delete cascade not null,
 *     product_id varchar(255) not null,
 *     created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- (Don't forget to enable RLS and add policies for both tables as shown in Step 1)
 */

// Sync cart helper: Saves standard items to Supabase
export async function syncCartToSupabase(userId: string, items: any[]): Promise<boolean> {
  if (!supabase) return false;

  try {
    // Only sync standard products (ignore custom builder items)
    const standardItems = items.filter(item => !item.selectedWood && !item.selectedResinColor);

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId);

    if (deleteError) return false;

    if (standardItems.length === 0) return true;

    const dbItems = standardItems.map(item => ({
      user_id: userId,
      product_id: item.product.id.toString(),
      quantity: item.quantity,
    }));

    const { error: insertError } = await supabase
      .from("cart_items")
      .insert(dbItems);

    return !insertError;
  } catch (err) {
    console.error("Supabase cart sync exception:", err);
    return false;
  }
}

// Load cart helper
export async function loadCartFromSupabase(userId: string): Promise<any[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId);

    if (error) return null;
    return data;
  } catch (err) {
    console.error("Supabase load cart exception:", err);
    return null;
  }
}

// ==========================================
// WISHLIST HELPERS
// ==========================================

// Sync wishlist helper
export async function syncWishlistToSupabase(userId: string, items: any[]): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error: deleteError } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", userId);

    if (deleteError) return false;

    if (items.length === 0) return true;

    const dbItems = items.map(item => ({
      user_id: userId,
      product_id: item.id.toString(),
    }));

    const { error: insertError } = await supabase
      .from("wishlist_items")
      .insert(dbItems);

    return !insertError;
  } catch (err) {
    console.error("Supabase wishlist sync exception:", err);
    return false;
  }
}

// Load wishlist helper
export async function loadWishlistFromSupabase(userId: string): Promise<any[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("user_id", userId);

    if (error) return null;
    return data;
  } catch (err) {
    console.error("Supabase load wishlist exception:", err);
    return null;
  }
}

export interface SupabaseCartItem {
  product_id: string;
  quantity: number;
  selected_wood?: string | null;
  selected_resin_color?: string | null;
  selected_deco?: string[] | null;
  personalization_text?: string | null;
}

// Sync cart helper: Saves the current client state to Supabase
// export async function syncCartToSupabase(userId: string, items: any[]): Promise<boolean> {
//   if (!supabase) return false;

//   try {
//     // 1. Delete existing cart items to prevent duplicates and keep client state authoritative
//     const { error: deleteError } = await supabase
//       .from("cart_items")
//       .delete()
//       .eq("user_id", userId);

//     if (deleteError) {
//       console.error("Error clearing old cart in Supabase:", deleteError);
//       return false;
//     }

//     if (items.length === 0) return true;

//     // 2. Map local cart items to Supabase schema
//     const dbItems = items.map(item => ({
//       user_id: userId,
//       product_id: item.product.id.toString(),
//       quantity: item.quantity,
//       selected_wood: item.selectedWood || null,
//       selected_resin_color: item.selectedResinColor || null,
//       selected_deco: item.selectedDeco || [],
//       personalization_text: item.personalizationText || null
//     }));

//     // 3. Insert items
//     const { error: insertError } = await supabase
//       .from("cart_items")
//       .insert(dbItems);

//     if (insertError) {
//       console.error("Error saving new cart items in Supabase:", insertError);
//       return false;
//     }

//     return true;
//   } catch (err) {
//     console.error("Supabase sync exception:", err);
//     return false;
//   }
// }

// // Load cart helper: Retrieves cart items from Supabase
// export async function loadCartFromSupabase(userId: string): Promise<any[] | null> {
//   if (!supabase) return null;

//   try {
//     const { data, error } = await supabase
//       .from("cart_items")
//       .select("*")
//       .eq("user_id", userId);

//     if (error) {
//       console.error("Error fetching cart from Supabase:", error);
//       return null;
//     }

//     return data;
//   } catch (err) {
//     console.error("Supabase load cart exception:", err);
//     return null;
//   }
// }
