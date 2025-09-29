// server/server.js
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

app.set('jwtSecret', process.env.JWT_SECRET || 'devsecret');
app.set('cookieName', process.env.COOKIE_NAME || 'token');
app.set('jwtVerify', (t) => jwt.verify(t, app.get('jwtSecret')));

// NEW: accept multiple origins + preview subdomains
const originList = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow curl/postman
      if (originList.includes(origin)) return cb(null, true);

      // allow Vercel previews for this project: trip-dash-beta-*.vercel.app
      try {
        const u = new URL(origin);
        const host = u.hostname; // e.g. trip-dash-beta-xxxxx-mohammed-seoudis-projects.vercel.app
        if (host.endsWith('vercel.app') && host.startsWith('trip-dash-beta-')) {
          return cb(null, true);
        }
      } catch {}

      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);
app.get('/api/health', (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Auth server running on http://localhost:${port}`));
