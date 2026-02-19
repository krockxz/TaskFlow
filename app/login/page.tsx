/**
 * Login Page
 *
 * Server Component for user authentication.
 * Features split-screen layout with animated background and form.
 */

import { AuthForm } from './components/AuthForm';
import { AuthLayout } from './components/AuthLayout';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const redirect = await searchParams;

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your credentials to access your account"
      alternateLink={{
        href: '/register',
        text: "Don't have an account?",
        linkText: 'Sign up',
      }}
    >
      <AuthForm mode="login" redirectTo={redirect.redirect} />
    </AuthLayout>
  );
}
