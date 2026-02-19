/**
 * TaskFlow Landing Page - Vercel Design System
 *
 * Clean, focused landing with monochrome palette.
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
        <div className="section-divider max-w-6xl mx-auto" />
        <ProblemSection />
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
