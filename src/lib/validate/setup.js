export async function validatePassword(password, password_check) {
  const errors = {};

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (password !== password_check) {
    errors.password_check = "Passwords don't match";
  }

  return Object.keys(errors).length ? errors : null;
}