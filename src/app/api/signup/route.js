import { NextResponse } from 'next/server';

import { commitSession, destroySession, getSession, setup_uuid } from '@/lib/session';
import { createAccount, mailVerification } from '@/lib/queries/signup';
import { csrf_validation } from '@/lib/csrf';
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
      return NextResponse.json(
        { errors: { form: 'Session expired. Please refresh and try again.' } },
        { status: 400 }
      );
    }

    const email = formData.get('email');
    const errors = await validateEmail(email);
    
    if (errors) {
      return NextResponse.json({
        step: 'verify_email',
        errors: { form: errors.email }
      }, { status: 400 });
    } 

    const code = await mailVerification(email);
    
    session.flash('email', email);
    session.set('v_code', code);
    session.set('v_tries', 0);
    session.set('v_expire', Date.now() + 15 * 60 * 1000);
    
    const res = NextResponse.json({ step: 'verify_code' });
    res.headers.set('Set-Cookie', await commitSession(session));
    
    return res;
  }

  if (intent === 'verify_code') {
    const tries = session.get('v_tries') || 0;
    const code = session.get('v_code');
    const expires = session.get('v_expire');

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

    if (!expires || Date.now() > expires) {
      const email = session.get('email');
      
      session.set('step', 'verify_email');
      session.set('v_code', null);
      session.set('v_expire', null);
      session.set('v_tries', 0);
      session.flash('errors', { form: 'Verification code has expired' });

      const res = NextResponse.json({
        step: 'verify_email',
        email,
        errors: { form: 'Verification code has expired' }
      });
      res.headers.set('Set-Cookie', await commitSession(session));
      
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
