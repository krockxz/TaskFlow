/**
 * OAuthButtons Component
 *
 * Provides OAuth login buttons for Google and GitHub.
 * Uses shadcn/ui Button component with outline variant.
 */

'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Chrome, Github } from 'lucide-react';

type Provider = 'google' | 'github';

interface OAuthButtonsProps {
  redirectTo?: string;
}

const PROVIDERS: Record<Provider, { name: string; icon: React.ReactNode }> = {
  google: {
    name: 'Google',
    icon: <Chrome className="h-5 w-5" />,
  },
  github: {
    name: 'GitHub',
    icon: <Github className="h-5 w-5" />,
  },
};

export function OAuthButtons({ redirectTo }: OAuthButtonsProps) {
  const handleSocialLogin = async (provider: Provider) => {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback${redirectTo ? `?next=${encodeURIComponent(redirectTo)}` : ''}`,
      },
    });

    if (error) {
      console.error(`Error signing in with ${provider}:`, error);
    }
  };

  return (
    <div className="space-y-3">
      {(Object.keys(PROVIDERS) as Provider[]).map((provider) => {
        const config = PROVIDERS[provider];

        return (
          <Button
            key={provider}
            onClick={() => handleSocialLogin(provider)}
            variant="outline"
            type="button"
            className="w-full"
          >
            {config.icon}
            <span className="ml-2">Continue with {config.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
