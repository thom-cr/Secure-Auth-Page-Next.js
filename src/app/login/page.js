'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [csrf, setCsrf] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/session')
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';

        if (!res.ok) {
          console.error('/api/session failed:', res.status);
          return;
        }

        if (!contentType.includes('application/json')) {
          console.error('/api/session did not return JSON:', contentType);
          return;
        }

        const data = await res.json();
        if (data.csrf) setCsrf(data.csrf);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    const formData = new FormData(e.target);
    formData.set('intent', 'login');

    const res = await fetch('/api/login', {
      method: 'POST',
      body: formData,
    });

    if (res.redirected) {
      router.push(res.url);
      return;
    }

    const data = await res.json();

    if (data.errors?.message) {
      setGlobalError(data.errors.message);
    } else {
      setErrors(data.errors || {});
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center pb-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-white">
          Log in
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="csrf" value={csrf} />

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address{' '}
                {errors.email && <span className="text-red-600 font-bold">{errors.email}</span>}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password{' '}
                {errors.password && <span className="text-red-600 font-bold">{errors.password}</span>}
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>

              {globalError && (
                <div className="text-red-600 font-bold text-center mt-3">{globalError}</div>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none"
              >
                Sign in
              </button>
            </div>

            <div className="flex justify-between text-sm mt-4">
              <span className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-gray-500 hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        </div>

        <div className="fixed left-0 p-4">
          <Link href="/">
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">
              Back
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
