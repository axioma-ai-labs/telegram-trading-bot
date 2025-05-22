import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/config';

// Regular client with anon key for normal operations
const supabase = createClient(config.supabase.url, config.supabase.key);

// Service client with service role key for private key operations
const supabaseService = createClient(config.supabase.url, config.supabase.serviceKey);

export { supabase, supabaseService };
