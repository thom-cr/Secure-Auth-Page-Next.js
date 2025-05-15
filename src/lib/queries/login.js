import crypto from 'node:crypto';

import { prisma } from '@/db/prisma';

export async function login(email, password) {
  try {
    const user = await prisma.account.findUnique({
      where: { email },
      include: { Password: true },
    });

    if (!user || !user.Password) return false;

    const hash = crypto
      .pbkdf2Sync(password, user.Password.salt, 1000, 64, 'sha256')
      .toString('hex');

    return hash === user.Password.hash ? user.id : false;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('LOGIN ERROR:', err);
    }
    
    return false;
  }
}