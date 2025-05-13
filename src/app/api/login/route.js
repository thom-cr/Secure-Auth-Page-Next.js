import { NextResponse } from 'next/server';
import { getSession, commitSession } from '@/lib/session';
import { csrf_validation } from '@/lib/csrf';
import { validateLogin } from '@/lib/validate/login';
import { login } from '@/lib/queries/login';

export async function POST(req) {
  const formData = await req.formData();
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);

  try {
    await csrf_validation(req, formData);
  } catch (error) {
    console.error('CSRF validation error:', error);
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.headers.set('Set-Cookie', await commitSession(session));
    return response;
  }

  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const errors = validateLogin(email, password);

  if (errors) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const userId = await login(email, password);

  if (!userId) {
    return NextResponse.json({ errors: { message: 'Invalid email or password' } }, { status: 400 });
  }

  session.set('userId', userId);
  const response = NextResponse.redirect(new URL('/home', req.url));
  response.headers.set('Set-Cookie', await commitSession(session));
  return response;
}
