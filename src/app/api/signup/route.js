import { NextResponse } from 'next/server';
import { getSession, commitSession, destroySession, setup_uuid } from '@/lib/session';
import { csrf_validation } from '@/lib/csrf';
import { createAccount, mailVerification } from '@/lib/queries/signup';
import { validateEmail } from '@/lib/validate/signup';

export async function POST(req) {
  const formData = await req.formData();
  const intent = formData.get('intent');
  const cookie = req.headers.get('cookie');
  const session = await getSession(cookie);

  if (intent === 'verify_email') {
    try {
      await csrf_validation(req, formData);
    } catch (e) {
      const res = NextResponse.redirect(new URL('/', req.url));
      res.headers.set('Set-Cookie', await commitSession(session));
      return res;
    }

    const email = formData.get('email');
    const errors = await validateEmail(email);
    if (errors) return NextResponse.json({ errors });

    const code = await mailVerification(email);
    session.flash('email', email);
    session.set('v_code', code);
    session.set('v_tries', 0);

    const res = NextResponse.json({ step: 'verify_code' });
    res.headers.set('Set-Cookie', await commitSession(session));
    return res;
  }

  if (intent === 'verify_code') {
    const tries = session.get('v_tries') || 0;
    const code = session.get('v_code');
    const input = [
      formData.get('digit1'),
      formData.get('digit2'),
      formData.get('digit3'),
      formData.get('digit4'),
      formData.get('digit5'),
      formData.get('digit6'),
    ].join('');

    try {
      await csrf_validation(req, formData);
    } catch (e) {
      const res = NextResponse.redirect(new URL('/', req.url));
      res.headers.set('Set-Cookie', await destroySession());
      return res;
    }

    if (tries >= 3) {
      session.clear();
      const res = NextResponse.redirect(new URL('/', req.url));
      res.headers.set('Set-Cookie', await destroySession());
      return res;
    }

    if (input === code) {
      const email = session.get('email');
      session.clear();
      session.flash('setup', setup_uuid);
      const user = await createAccount(email);
      session.set('userId', user.id);

      const res = NextResponse.redirect(new URL('/setup', req.url));
      res.headers.set('Set-Cookie', await commitSession(session));
      return res;
    } else {
      session.set('v_tries', tries + 1);
      const res = NextResponse.json({ step: 'verify_code', errors: { code: 'Invalid verification code' } });
      res.headers.set('Set-Cookie', await commitSession(session));
      return res;
    }
  }

  return NextResponse.json({ error: 'Invalid intent' }, { status: 400 });
}
