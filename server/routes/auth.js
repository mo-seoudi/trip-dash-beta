import { Router } from 'express';
import cookieParser from 'cookie-parser';
import {
  createUserWithPassword,
  verifyPasswordLogin,
  signToken,
  upsertUserFromClaims,
} from '../lib/auth.js';
import { verifyOIDCToken, claimsToProfile } from '../lib/identity.js';

const router = Router();
router.use(cookieParser());

const MODE = (process.env.AUTH_MODE || 'oidc').toLowerCase();

function readBearer(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

router.get('/me', async (req, res) => {
  const bearer = readBearer(req);
  if ((MODE === 'oidc' || MODE === 'hybrid') && bearer) {
    try {
      const claims = await verifyOIDCToken(bearer);
      const profile = claimsToProfile(claims);
      const user = await upsertUserFromClaims(profile);
      return res.json({ user });
    } catch (e) {
      return res.status(401).json({ error: 'invalid bearer token' });
    }
  }

  if (MODE === 'local' || MODE === 'hybrid') {
    const token = req.cookies[req.app.get('cookieName')];
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    try {
      const payload = req.app.get('jwtVerify')(token);
      return res.json({ user: { id: payload.sub, email: payload.email, role: payload.role } });
    } catch {
      return res.status(401).json({ error: 'invalid token' });
    }
  }

  return res.status(401).json({ error: 'missing bearer' });
});

if (MODE === 'local' || MODE === 'hybrid') {
  router.post('/register', async (req, res) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
      const user = await createUserWithPassword({ email, name, password });
      return res.status(201).json({ message: 'registered', user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password are required' });
      const user = await verifyPasswordLogin({ email, password });
      if (!user) return res.status(401).json({ error: 'invalid credentials' });

      const token = signToken({ sub: String(user.id), email: user.email, role: user.role }, req.app.get('jwtSecret'));
      res.cookie(req.app.get('cookieName'), token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      return res.json({ message: 'logged in', user });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });

  router.post('/logout', (req, res) => {
    res.clearCookie(req.app.get('cookieName'), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
    return res.json({ message: 'logged out' });
  });
}

export default router;
