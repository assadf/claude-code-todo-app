'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.';
      case 'Verification':
        return 'The verification link is invalid or has expired.';
      default:
        return 'An unknown error occurred during authentication.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900">
      <div className="w-full max-w-md space-y-8">
        <div className="card p-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-3xl font-bold text-white">
              Authentication Error
            </h2>
            <p className="mb-6 text-gray-400">
              {getErrorMessage(error ?? null)}
            </p>

            <div className="space-y-4">
              <Link
                href="/auth/signin"
                className="block w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="block w-full rounded-lg border border-gray-600 bg-dark-700 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-dark-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-dark-900">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
