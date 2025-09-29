// server/routes/auth.js
import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { verifySupabaseJWT } from '../lib/supabase.js';
import { upsertUserFromSupabase } from '../lib/auth.js';

const router = Router();
router.use(cookieParser());

// GET /api/auth/me  — verify Supabase Bearer token, return user
router.get('/me', async (req, res) => {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'missing bearer' });

  try {
    const payload = await verifySupabaseJWT(m[1]);
    const user = await upsertUserFromSupabase(payload);
    return res.json({ user });
  } catch (e) {
    return res.status(401).json({ error: 'invalid bearer token' });
  }
});

export default router;

