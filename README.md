# React Auth Starter (Express + Prisma + Supabase + Tailwind)
Folders:
- `server/` — Express API, Prisma client, auth routes.
- `client/` — React + Vite + Tailwind login UI.

## Deploy (Render + Vercel)
- Render Web Service (root: `server/`), set env: DATABASE_URL, DIRECT_URL, JWT_SECRET, COOKIE_NAME, CLIENT_ORIGIN.
- Vercel Project (root: `client/`), env: VITE_API_BASE=https://your-render-url.

## Local (optional)
server: `npm i && npm run prisma:generate && npm run dev`
client: `npm i && npm run dev`
