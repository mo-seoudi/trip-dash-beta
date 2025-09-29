import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { createUserWithPassword, verifyPasswordLogin, signToken } from '../lib/auth.js';

const router = Router();
router.use(cookieParser());

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

router.get('/me', (req, res) => {
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
