/**
 * Register Page
 *
 * Server Component for new user registration.
 * Uses shadcn/ui Card component for layout.
 */

import { AuthForm } from '../login/components/AuthForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">TaskFlow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create your account
          </p>
        </CardHeader>

        <CardContent>
          <AuthForm mode="register" />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
