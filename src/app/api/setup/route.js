import { getSession, commitSession } from '@/lib/session';
import { csrf_validation } from '@/lib/csrf';
import { setupAccount } from '@/lib/queries/setup';
import { validatePassword } from '@/lib/validate/setup';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const formData = await req.formData();
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);

  try {
    await csrf_validation(req, formData);
  } catch (e) {
    const res = NextResponse.redirect(new URL('/', req.url));
    res.headers.set('Set-Cookie', await commitSession(session));
    return res;
  }

  const userId = session.get('userId');
  const first_name = formData.get('first_name');
  const last_name = formData.get('last_name');
  const password = formData.get('password');
  const password_check = formData.get('password_check');

  const errors = await validatePassword(password, password_check);
  if (errors) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  await setupAccount(first_name, last_name, password, userId);

  const res = NextResponse.redirect(new URL('/home', req.url));
  res.headers.set('Set-Cookie', await commitSession(session));
  return res;
}
