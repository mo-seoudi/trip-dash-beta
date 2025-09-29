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

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  })
);

app.use('/api/auth', authRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Auth server running on http://localhost:${port}`));
