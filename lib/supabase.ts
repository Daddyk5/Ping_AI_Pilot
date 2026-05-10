import { createClient } from "@supabase/supabase-js";
import type { PingHistoryRecord } from "@/types";

type Database = {
  public: {
    Tables: {
      ping_history: {
        Row: Required<PingHistoryRecord>;
        Insert: PingHistoryRecord;
        Update: Partial<PingHistoryRecord>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

let cachedAdminClient: SupabaseAdminClient | null = null;

export function getSupabaseAdmin() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  cachedAdminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedAdminClient;
}
