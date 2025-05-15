import crypto from 'node:crypto';

import { prisma } from '@/db/prisma';

export async function setupAccount(first_name, last_name, password, userId) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha256')
    .toString('hex');

  return prisma.account.update({
    where: { id: userId },
    data: {
      first_name,
      last_name,
      Password: {
        create: {
          hash,
          salt,
        },
      },
    },
  });
}