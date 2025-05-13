import { getSession } from '@/lib/session';
import { fullName } from '@/lib/queries/home';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);

  const userId = session.get('userId');
  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const name = await fullName(userId);
  return NextResponse.json({ userId, name });
}
