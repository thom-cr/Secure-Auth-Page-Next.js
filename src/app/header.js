'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => setUserId(data.userId));
  }, []);

  return (
    <header>
      <Link href="/">
        <h1 className="top-0 left-0 w-full text-4xl font-bold p-4 shadow-md z-10">
          DEMO WEBSITE
        </h1>
      </Link>
      {pathname === '/' && (
        <div className="fixed top-0 right-0 p-4">
          {userId ? (
            <form method="POST" action="/api/logout">
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/login">
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-500">
                Log in
              </button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}