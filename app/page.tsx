/**
 * TaskFlow Landing Page - 2026 Minimalist Design
 *
 * Clean, focused landing with single accent color and minimal effects.
 */

import {
  HeroSection,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
