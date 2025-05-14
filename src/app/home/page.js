'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/home')
      .then((res) => {
        if (res.redirected) {
          window.location.href = res.url;
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data?.userId) {
          setUserId(data.userId);
          setName(data.name);
        }
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return null;
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-start h-screen">
      <div className="fixed top-0 right-0 p-4">
        <form method="POST" action="/api/logout">
          <button className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-500">
            Log out
          </button>
        </form>
      </div>
      <h1 className="text-black text-4xl font-bold mt-8 text-center">
        Welcome Home,<br /> {name}
      </h1>
      <p className="text-black text-2xl font-semibold mt-4 text-center">
        ID: {userId}
      </p>
    </div>
  );
}
