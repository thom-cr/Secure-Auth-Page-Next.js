'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [csrf, setCsrf] = useState('');
  const [step, setStep] = useState('verify_email');
  const [formError, setFormError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/session')
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) return;
        const data = await res.json();
        if (data.csrf) setCsrf(data.csrf);
      })
      .catch((err) => console.error('CSRF fetch failed:', err));
  }, []);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const formData = new FormData(e.target);
    formData.set('intent', 'verify_email');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 302 || res.status === 303) {
        const location = res.headers.get('Location');
        if (location) {
          router.push(location);
          return;
        }
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.error('Response not JSON:', await res.text());
        return;
      }

      const data = await res.json();

      if (data.errors?.form) {
        setFormError(data.errors.form);
        return;
      }

      if (data.email) {
        setEmail(data.email);
      }

      if (data.errors?.form) {
        setFormError(data.errors.form);
      } else if (data.step === 'verify_code') {
        setStep('verify_code');
      }
    } catch (err) {
      console.error('Email step error:', err);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setCodeError('');
    setFormError('');

    const formData = new FormData(e.target);
    formData.set('intent', 'verify_code');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        body: formData,
      });

      if (res.status === 302 || res.status === 303) {
        const location = res.headers.get('Location');
        if (location) {
          router.push(location);
          return;
        }
      }

      const data = await res.json();

      if (data.step === 'verify_email') {
        setStep('verify_email');
        setFormError(data.errors?.form || '');
        return;
      }

      if (data.errors?.code) {
        setCodeError(data.errors.code);
      }
    } catch (err) {
      console.error('Code step error:', err);
    }
  };

  const handleInputJump = (e) => {
    if (e.target.value.length === 1) {
      const next = e.target.nextElementSibling;
      if (next?.tagName === 'INPUT') next.focus();
    }
  };

  return (
    <div className="bg-white flex min-h-full flex-1 flex-col pt-8 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-2xl font-bold text-black">Sign Up</h2>
      </div>

      <div className="bg-white mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 border border-2 border-black">
          {step === 'verify_email' ? (
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <input type="hidden" name="csrf" value={csrf} />
              <div>
                <label className="block text-sm font-medium text-gray-900">
                  Email address{' '}
                  {formError && (
                    <span className="text-red-600 font-bold">{formError}</span>
                  )}
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input block w-full rounded-md border py-1.5 text-gray-900"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-black text-white py-2 px-4 hover:bg-gray-700"
              >
                Send mail
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleCodeSubmit}>
              <input type="hidden" name="csrf" value={csrf} />
              <div className="flex space-x-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    name={`digit${i + 1}`}
                    type="text"
                    maxLength={1}
                    required
                    onInput={handleInputJump}
                    className="w-12 h-12 text-center text-black text-xl border border-gray-900 rounded"
                  />
                ))}
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-black text-white py-2 px-4 hover:bg-gray-700"
              >
                Verify
              </button>
              {codeError && (
                <p className="text-red-600 mt-4 font-bold text-center">{codeError}</p>
              )}
            </form>
          )}

          <div className="mt-6">
            <Link href="/">
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-600">
                Back
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}