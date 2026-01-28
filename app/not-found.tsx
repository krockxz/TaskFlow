/**
 * Not Found Page
 *
 * Displayed when a route is not found.
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600">Page not found</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block btn btn-primary"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
