/**
 * OAuthButtons Component
 *
 * Provides OAuth login buttons for Google and GitHub.
 * Uses shadcn/ui Button component with outline variant.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import { signInWithOAuth, type OAuthProvider } from '@/lib/auth/oauth-helpers';
import { useState } from 'react';

const PROVIDERS: Record<OAuthProvider, { name: string; icon: React.ReactNode }> = {
  github: {
    name: 'GitHub',
    icon: <Github className="h-5 w-5" />,
  },
};

interface OAuthButtonsProps {
  redirectTo?: string;
}

export function OAuthButtons({ redirectTo }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleSocialLogin = async (provider: OAuthProvider) => {
    setLoadingProvider(provider);
    const { error } = await signInWithOAuth(provider, { redirectTo });
    if (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setLoadingProvider(null);
    }
    // OAuth redirect happens automatically on success
  };

  return (
    <div className="space-y-3">
      {(Object.keys(PROVIDERS) as OAuthProvider[]).map((provider) => {
        const config = PROVIDERS[provider];
        const isLoading = loadingProvider === provider;

        return (
          <Button
            key={provider}
            onClick={() => handleSocialLogin(provider)}
            variant="outline"
            type="button"
            className="w-full gap-2"
            disabled={!!loadingProvider}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : config.icon}
            <span>Continue with {config.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
