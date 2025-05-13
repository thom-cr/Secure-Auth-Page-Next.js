import { NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/session';

export async function POST(req) {
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);
  const userId = session.get('userId');

  const response = NextResponse.redirect(new URL('/', req.url));

  if (userId) {
    response.headers.append('Set-Cookie', await destroySession());
  }

  return response;
}