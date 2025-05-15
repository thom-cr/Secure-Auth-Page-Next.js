import { NextResponse } from 'next/server';

import { commitSession, getSession } from '@/lib/session';
import { csrf_token } from '@/lib/csrf';

export async function GET(req) {
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);
  const { token, updated } = csrf_token(session);

  const res = NextResponse.json({ userId: session.get('userId') || null, csrf: token });
  
  if (updated) {
    res.headers.set('Set-Cookie', await commitSession(session));
  }
  
  return res;
}