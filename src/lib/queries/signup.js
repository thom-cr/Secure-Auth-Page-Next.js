import crypto from 'node:crypto';
import { prisma } from '@/db/prisma';

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

  if (process.env.NODE_ENV === 'development') {
    console.log(`Verification code: ${code}`);
  }

  return code;
}