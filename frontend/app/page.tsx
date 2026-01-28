/**
 * Landing Page Component
 *
 * Public homepage for TaskFlow - async team coordination hub
 * Features hero section, features showcase, how it works, and footer
 */

'use client';

import Link from 'next/link';
import { ArrowRight, Check, Bell, BarChart3, Filter, Users, Globe, Zap, Github } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">TaskFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20 hover:border-white/40"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      >
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-sky-500/10 to-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <span className="text-sm text-slate-300">Now with realtime collaboration</span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            <span className="block tracking-tight">Coordinate work</span>
            <span className="block bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              across timezones
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The async team coordination hub. Track task handoffs, get real-time notifications,
            and keep your global team in sync — no matter where they are.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group relative px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 text-white font-semibold text-lg rounded-xl border border-white/20 hover:bg-white/5 transition-all hover:scale-105"
            >
              View Demo
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">500+ teams</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm">50+ countries</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need for
              <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                {" "}async teams
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features that keep your distributed team aligned and productive.
            </p>
          </div>

          {/* Bento Grid Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all group">
              <div className="h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bell className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Real-time Notifications</h3>
                <p className="text-slate-400 mb-6 flex-grow">
                  Never miss a task handoff. Get instant notifications when tasks are assigned, status changes,
                  or when someone @mentions you. Works across all timezones.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-sky-400 flex-shrink-0" />
                    <span>Push notifications for all task events</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-sky-400 flex-shrink-0" />
                    <span>@mention teammates for quick collaboration</span>
                  </li>
                  <li className="flex items-center gap-3 text-slate-300">
                    <Check className="w-5 h-5 text-sky-400 flex-shrink-0" />
                    <span>Unread count badge on bell icon</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Filter className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Filtering</h3>
              <p className="text-slate-400">
                Filter by status, priority, assignee, date range. Create shareable filtered views with unique URLs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Presence Indicators</h3>
              <p className="text-slate-400">
                See who's viewing each task in real-time. Know when teammates are online and working on the same task.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Team Analytics</h3>
              <p className="text-slate-400">
                Visual insights into team workload, task distribution, and completion rates. Make data-driven decisions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all group">
              <div className="h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Bulk Operations</h3>
                  <p className="text-slate-400">
                    Select multiple tasks and update status, reassign, or delete in one action. Save hours of manual work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-xl text-slate-400">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign up & invite team',
                description: 'Create your workspace and invite team members with a magic link. Email or Google OAuth — your choice.',
              },
              {
                step: '02',
                title: 'Create & assign tasks',
                description: 'Add tasks with priorities, due dates, and assignees. Set up recurring tasks for routine work.',
              },
              {
                step: '03',
                title: 'Track in real-time',
                description: 'Watch tasks flow through your team. Get notified on handoffs. Never drop the ball again.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold text-white/5 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative z-10 pt-8">
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GitHub/Community Section */}
      <section className="py-24 px-6 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Open Source & Self-Hosted
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              TaskFlow is open source. Deploy it yourself, or try our hosted version.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/kunal/TaskFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:scale-105 transition-all hover:shadow-2xl hover:shadow-white/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 9.805-.026 15.51-6.488 15.791H4c1.443 0 2.817-.406 3.965-1.108.274-.55.536-.954.868-1.374.954-.355.24-.707.654-1.017-.965.321-.64.643-1.082 1.065-1.525 1.525-.244.244-.48.383-.718.718-.718 1.471 0 2.582 1.106 3.032 2.53.45.536.776.98 1.432.98 2.272 0 .364 0 .716.108 1.065.293.35.55.648.992.1.31 1.457 2.11l2.69 2.69c.876.876 2.294.876 3.117 0 .822-.406 1.592-.982 1.592-2.11V10c0-1.836-1.457-3.393-3.244-3.393-.512 0-.994-.382-1.957-1.07-2.715-.242-.757-.382-1.609-.382-2.529 0-.822.406-1.592.982-1.592 2.11 0 1.836 1.457 3.393 3.244 3.393.512 0 .994.382 1.957 1.07 2.715.242.757.382 1.609.382 2.529 0 .822-.406 1.592-.982 1.592-2.11V12c0-4.97-4.03-9-9-9-9s9 4.03 9 9c0 2.176.588 4.194 1.535 5.711l2.964 2.964c.876.876 2.294.876 3.117 0 .822-.406 1.592-.982 1.592-2.11z"/>
                </svg>
                Star on GitHub
              </a>
              <Link
                href="/dashboard"
                className="px-8 py-4 text-white font-semibold text-lg rounded-xl border border-white/20 hover:bg-white/5 transition-all hover:scale-105"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 rounded-3xl p-12 border border-white/10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to coordinate across timezones?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Self-hosted and open source. Take control of your team's workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold text-lg hover:scale-105 transition-all hover:shadow-2xl hover:shadow-white/20"
              >
                Get started free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://github.com/kunal/TaskFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal for open source */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-400">
              TaskFlow — Open source under MIT License
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/kunal/TaskFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
