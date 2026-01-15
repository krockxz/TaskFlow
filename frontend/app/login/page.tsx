/**
 * Login Page
 *
 * Server Component for user authentication.
 */

import { AuthForm } from './components/AuthForm';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-sm text-gray-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <AuthForm mode="login" redirectTo={searchParams.redirect} />

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/register"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
