/**
 * Register Page
 *
 * Server Component for new user registration.
 */

import { AuthForm } from '../login/components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-sm text-gray-600 mt-2">
            Create your account
          </p>
        </div>

        <AuthForm mode="register" />

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a
            href="/login"
            className="font-medium text-sky-500 hover:text-sky-600"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
