import { prisma } from '@/db/prisma';

export async function fullName(userId) {
  try {
    const user = await prisma.account.findUnique({
      where: { id: userId },
      select: { first_name: true, last_name: true },
    });

    if (!user || !user.first_name || !user.last_name) {
      return '';
    }

    return `${user.first_name} ${user.last_name}`;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('FULL NAME FUNCTION ERROR:', err);
    }
    return '';
  }
}