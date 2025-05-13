export function validateLogin(email, password) {
  const errors = {};
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!email.includes('@')) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return Object.keys(errors).length ? errors : null;
}