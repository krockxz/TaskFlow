/**
 * AuthForm Component
 *
 * Handles both login and registration forms with client-side interactivity.
 * Features:
 * - Shake animation on error
 * - Smooth focus transitions
 * - Password strength indicator (register mode)
 * - Loading spinner during submission
 * - OAuth social login buttons
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { OAuthButtons } from './OAuthButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
  redirectTo?: string;
}

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export function AuthForm({ mode, redirectTo }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  // Password strength calculation
  const passwordStrength = useMemo((): PasswordStrength => {
    if (password.length === 0) return 'weak';

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score === 3) return 'fair';
    if (score === 4) return 'good';
    return 'strong';
  }, [password]);

  const strengthConfig = {
    weak: { color: 'bg-destructive', width: '25%', label: 'Weak' },
    fair: { color: 'bg-orange-500', width: '50%', label: 'Fair' },
    good: { color: 'bg-yellow-500', width: '75%', label: 'Good' },
    strong: { color: 'bg-green-500', width: '100%', label: 'Strong' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match for registration
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      setShakeTrigger((prev) => prev + 1);
      return;
    }

    setIsLoading(true);

    try {
      const endpoint =
        mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Redirect to dashboard or specified redirect URL
      router.push(redirectTo || '/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setShakeTrigger((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OAuth Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <OAuthButtons redirectTo={redirectTo} />
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>
      </motion.div>

      {/* Email/Password Form */}
      <motion.form
        key={shakeTrigger}
        onSubmit={handleSubmit}
        className="space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              className="transition-all duration-200 focus:ring-2 focus:ring-ring/50"
            />
            <AnimatePresence>
              {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              placeholder="••••••••"
              disabled={isLoading}
              className="transition-all duration-200 focus:ring-2 focus:ring-ring/50 pr-10"
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </motion.button>
          </div>

          {/* Password Strength Indicator */}
          {mode === 'register' && password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: strengthConfig[passwordStrength].width,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`h-full ${strengthConfig[passwordStrength].color}`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {strengthConfig[passwordStrength].label}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Confirm Password Field (Register Only) */}
        {mode === 'register' && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isLoading}
                className="transition-all duration-200 focus:ring-2 focus:ring-ring/50"
              />
              <AnimatePresence>
                {confirmPassword && confirmPassword === password && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </motion.span>
              ) : (
                <motion.span
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Terms (Register Only) */}
        {mode === 'register' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-xs text-center text-muted-foreground"
          >
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </motion.p>
        )}
      </motion.form>
    </div>
  );
}
