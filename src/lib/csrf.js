import { randomBytes } from 'node:crypto';
import { getSession } from './session';

export function csrf_token(session) {
  const existing = session.get('csrf');
  if (existing) {
    return { token: existing, updated: false };
  }

  const token = randomBytes(16).toString('hex');
  session.set('csrf', token);
  return { token, updated: true };
}

export async function csrf_validation(request, formData) {
  const cookie = request.headers.get('cookie');
  const session = await getSession(cookie);
  const token = session.get('csrf');
  const submitted = formData.get('csrf');
  
  if (!token || token !== submitted) {
    throw new Error('Invalid CSRF token');
  }
}
