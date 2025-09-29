// server/lib/supabase.js
import { createRemoteJWKSet, jwtVerify } from 'jose';

const supabaseUrl = process.env.SUPABASE_URL; // e.g. https://abc123.supabase.co
if (!supabaseUrl) {
  console.warn('SUPABASE_URL not set — Supabase Auth verification will fail.');
}

// JWKS hosted by Supabase (public)
const JWKS = supabaseUrl
  ? createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`))
  : null;

export async function verifySupabaseJWT(token) {
  if (!JWKS) throw new Error('Missing SUPABASE_URL');
  // issuer is like https://<project>.supabase.co/auth/v1
  const issuer = `${supabaseUrl}/auth/v1`;
  const { payload } = await jwtVerify(token, JWKS, {
    issuer, // audience is usually 'authenticated', but not required to pass
  });
  return payload; // contains sub (uuid), email, user_metadata, etc.
}
