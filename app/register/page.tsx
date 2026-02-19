/**
 * Register Page
 *
 * Server Component for new user registration.
 * Features split-screen layout with animated background and form.
 */

import { AuthForm } from '../login/components/AuthForm';
import { AuthLayout } from '../login/components/AuthLayout';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      description="Get started with TaskFlow in seconds"
      alternateLink={{
        href: '/login',
        text: 'Already have an account?',
        linkText: 'Sign in',
      }}
    >
      <AuthForm mode="register" />
    </AuthLayout>
  );
}
