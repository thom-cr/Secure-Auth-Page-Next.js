import { accountExists } from '@/lib/queries/signup';

export async function validateEmail(email) {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address';
  }

  if (await accountExists(email)) {
    errors.email = 'An account with this email already exists';
  }

  return Object.keys(errors).length ? errors : null;
}