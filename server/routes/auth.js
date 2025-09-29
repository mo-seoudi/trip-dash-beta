// server/routes/auth.js
import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { createUserWithPassword, verifyPasswordLogin, signToken } from '../lib/auth.js';
import { upsertUserFromSupabase } from '../lib/auth.js';
import { verifySupabaseJWT } from '../lib/supabase.js';

const router = Router();
router.use(cookieParser());

// Helper to read Authorization: Bearer <token>
function readBearer(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// --- Existing email+password endpoints stay unchanged ---
router.post('/register', /* ...as you have now... */);
router.post('/login',    /* ...as you have now... */);
router.post('/logout',   /* ...as you have now... */);

// --- Me endpoint: accept Supabase Bearer OR your cookie JWT ---
router.get('/me', async (req, res) => {
  // 1) Supabase Bearer path
  const bearer = readBearer(req);
  if (bearer) {
    try {
      const payload = await verifySupabaseJWT(bearer);
      const user = await upsertUserFromSupabase(payload);
      return res.json({ user });
    } catch (e) {
      return res.status(401).json({ error: 'invalid bearer token' });
    }
  }

  // 2) Fallback to your cookie JWT (works with your current flow)
  const token = req.cookies[req.app.get('cookieName')];
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const payload = req.app.get('jwtVerify')(token);
    return res.json({ user: { id: payload.sub, email: payload.email, role: payload.role } });
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
});

export default router;
