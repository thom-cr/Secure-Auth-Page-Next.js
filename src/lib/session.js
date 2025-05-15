import crypto from 'node:crypto';

const COOKIE_NAME = 'session';
const secret = process.env.COOKIE_SECRET || 'default-secret';

export async function getSession(cookieHeader) {
  const raw = Object.fromEntries(
    (cookieHeader || '')
      .split(';')
      .map(c => c.trim().split('='))
      .filter(([k, v]) => k && v)
  );

  const data = raw.session ? JSON.parse(decodeURIComponent(raw.session)) : {};

  return {
    data,
    get: (key) => data[key],
    set: (key, value) => { data[key] = value; },
    unset: (key) => { delete data[key]; },
    flash: (key, value) => { data[key] = value; },
    clear: () => {
      for (const key in data) {
        delete data[key];
      }
    }
  };
}

export async function commitSession(session) {
  const cookieValue = encodeURIComponent(JSON.stringify(session.data));
  
  return `${COOKIE_NAME}=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}

export async function destroySession() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${
    process.env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}

export const setup_uuid = crypto.randomUUID();