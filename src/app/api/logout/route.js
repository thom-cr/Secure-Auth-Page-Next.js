import { NextResponse } from 'next/server';

import { destroySession, getSession } from '@/lib/session';

export async function POST(req) {
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);
  const userId = session.get('userId');

  const res = NextResponse.redirect(new URL('/', req.url));

  if (userId) {
    res.headers.append('Set-Cookie', await destroySession());
  }

  return res;
}