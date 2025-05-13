'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const [csrf, setCsrf] = useState('');
  const [errors, setErrors] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => setCsrf(data.csrf));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const res = await fetch('/api/setup', {
      method: 'POST',
      body: formData,
    });

    if (res.redirected) {
      router.push(res.url);
    } else {
      const data = await res.json();
      setErrors(data.errors || {});
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold text-white">Setup</h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="csrf" value={csrf} />

            <div>
              <label className="block text-sm font-medium text-gray-900">
                First Name
              </label>
              <input
                name="first_name"
                type="text"
                required
                className="form-input block w-full rounded-md border py-1.5 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Last Name
              </label>
              <input
                name="last_name"
                type="text"
                required
                className="form-input block w-full rounded-md border py-1.5 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Password{' '}
                {errors.password && (
                  <span className="text-red-500 font-bold">{errors.password}</span>
                )}
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="form-input block w-full rounded-md border py-1.5 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900">
                Password Check{' '}
                {errors.password_check && (
                  <span className="text-red-500 font-bold">{errors.password_check}</span>
                )}
              </label>
              <input
                name="password_check"
                type="password"
                required
                className="form-input block w-full rounded-md border py-1.5 text-gray-900"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-black px-3 py-1.5 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Setup Account
            </button>
          </form>

          <div className="mt-4">
            <Link href="/">
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">Back</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}