/**
 * TaskFlow Landing Page - Vercel Design System
 *
 * Clean, focused landing with monochrome palette.
 * Includes the AppHeader for landing page navigation.
 */

import {
  HeroSection,
  NewFeaturesSection,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  CTASection,
  Footer,
} from '@/components/landing';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader variant="app" />
      <main>
        <HeroSection />
        <div className="section-divider max-w-6xl mx-auto" />
        <ProblemSection />
        <div className="section-divider max-w-6xl mx-auto" />
        <NewFeaturesSection />
        <div className="section-divider max-w-6xl mx-auto" />
        <SolutionSection />
        <FeaturesSection />
        <div className="section-divider max-w-6xl mx-auto" />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
