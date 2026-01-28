/**
 * TaskFlow Landing Page - 2026 Minimalist Design
 *
 * Clean, focused landing with single accent color and minimal effects.
 */

import {
  Navigation,
  HeroSection,
  ProblemSection,
  SolutionSection,
  FeaturesSection,
  StatsSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navigation />

      <main>
        <HeroSection />
        <StatsSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
