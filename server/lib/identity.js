import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

const {
  OIDC_ISSUER_URL,
  OIDC_JWKS_URI,
  OIDC_AUDIENCE,
  OIDC_EMAIL_CLAIM = 'email',
  OIDC_NAME_CLAIM = 'name',
} = process.env;

const jwksUri = OIDC_JWKS_URI || (OIDC_ISSUER_URL ? `${OIDC_ISSUER_URL}/.well-known/jwks.json` : null);

let jwksClient = null;
if (jwksUri) {
  jwksClient = jwksRsa({
    jwksUri,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  });
}

export async function verifyOIDCToken(token) {
  if (!OIDC_ISSUER_URL || !jwksClient) throw new Error('OIDC_ISSUER_URL / JWKS not configured');
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.header?.kid) throw new Error('Invalid token: missing kid');
  const key = await jwksClient.getSigningKey(decoded.header.kid);
  const publicKey = key.getPublicKey();

  const options = { issuer: OIDC_ISSUER_URL, algorithms: ['RS256', 'RS512'] };
  if (OIDC_AUDIENCE) options.audience = OIDC_AUDIENCE;

  const claims = jwt.verify(token, publicKey, options);
  return claims;
}

export function claimsToProfile(claims) {
  const email = getClaim(claims, OIDC_EMAIL_CLAIM) || claims.preferred_username || claims.upn || null;
  const name = getClaim(claims, OIDC_NAME_CLAIM) || [claims.given_name, claims.family_name].filter(Boolean).join(' ') || email || 'User';
  return { email, name, claims };
}

function getClaim(obj, path) {
  if (!obj || !path) return null;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    cur = cur?.[p];
    if (cur == null) return null;
  }
  return cur;
}
