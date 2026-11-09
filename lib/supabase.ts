import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Chưa cấu hình Supabase thì app vẫn chạy, chỉ lưu tiến độ trên máy.
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
