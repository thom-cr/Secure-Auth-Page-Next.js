import crypto from 'node:crypto';
import { prisma } from '@/db/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function accountExists(email) {
  const account = await prisma.account.findUnique({
    where: { email },
    select: { id: true },
  });

  return Boolean(account);
}

export async function createAccount(email) {
  return prisma.account.create({
    data: {
      first_name: '',
      last_name: '',
      email,
    },
  });
}

export async function mailVerification(email) {
  const buff = crypto.randomBytes(3);
  const code = parseInt(buff.toString('hex'), 16).toString().padStart(6, '0').substring(0, 6);

  /*if (process.env.NODE_ENV === 'development') {
    console.log(`Verification code: ${code}`);
  }*/
  
  try {
      await resend.emails.send({
        from: 'Authentication Demo <onboarding@resend.dev>',
        to: email,
        subject: 'Your verification code',
        text: `Your verification code is: ${code}`,
      });
    } catch (err) {
      console.error('Email failed:', err);
  }

  return code;
}