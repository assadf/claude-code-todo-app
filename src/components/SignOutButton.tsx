'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut({
        callbackUrl: '/auth/signin',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white"></div>
      ) : (
        <>
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </>
      )}
    </button>
  );
}
