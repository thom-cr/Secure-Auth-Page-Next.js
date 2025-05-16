import crypto from 'node:crypto';

const COOKIE_NAME = 'session';
const secret = process.env.COOKIE_SECRET || 'default-secret';

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export async function commitSession(session) {
  const payload = JSON.stringify(session.data);
  const encoded = encodeURIComponent(payload);
  const signature = sign(encoded, secret);
  const cookieValue = `${encoded}.${signature}`;

  return `${COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}

export async function destroySession() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}

export async function getSession(cookieHeader) {
  const raw = Object.fromEntries(
    (cookieHeader || '')
      .split(';')
      .map(c => c.trim().split('='))
      .filter(([k, v]) => k && v)
  );

  if (!raw.session) return emptySession();

  const [encoded, signature] = raw.session.split('.');

  if (!encoded || !signature || sign(encoded, secret) !== signature) {
    console.warn('Invalid session signature – possible tampering');
    return emptySession();
  }

  const data = JSON.parse(decodeURIComponent(encoded));
  return makeSession(data);
}

function emptySession() {
  return makeSession({});
}

function makeSession(data) {
  return {
    data,
    get: key => data[key],
    set: (key, value) => { data[key] = value; },
    unset: key => { delete data[key]; },
    flash: (key, value) => { data[key] = value; },
    clear: () => { for (const key in data) delete data[key]; }
  };
}

export const setup_uuid = crypto.randomUUID();