/**
 * Login Page
 *
 * Server Component for user authentication.
 */

import { AuthForm } from './components/AuthForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const redirect = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-sm text-gray-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <AuthForm mode="login" redirectTo={redirect.redirect} />

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a
            href="/register"
            className="font-medium text-sky-500 hover:text-sky-600"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
