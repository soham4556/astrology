import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabaseClient = null;

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

export async function verifySupabaseUser(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';

    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing bearer token',
      });
    }

    const accessToken = authorization.slice(7);
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid access token',
      });
    }

    req.user = data.user;
    return next();
  } catch (error) {
    return res.status(500).json({
      error: 'Auth validation failed',
      message: error.message,
    });
  }
}
