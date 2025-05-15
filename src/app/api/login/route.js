import { NextResponse } from 'next/server';

import { commitSession, getSession } from '@/lib/session';
import { csrf_validation } from '@/lib/csrf';
import { login } from '@/lib/queries/login';
import { validateLogin } from '@/lib/validate/login';

export async function POST(req) {
  const formData = await req.formData();
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);

  try {
    await csrf_validation(req, formData);
  } catch (error) {
    console.error('CSRF validation error:', error);
    
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.headers.set('Set-Cookie', await commitSession(session));
    
    return res;
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
  
  const res = NextResponse.redirect(new URL('/home', req.url));
  res.headers.set('Set-Cookie', await commitSession(session));
  
  return res;
}
