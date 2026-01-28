/**
 * CTA Section - 2026 Minimalist
 *
 * Clean conversion section with single CTA.
 */

'use client';

import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { CommandSnippet } from './';

export function CTASection() {
  return (
    <section className="py-20 px-6 bg-[#0d1117]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-[#f0f6fc] mb-4"
        >
          Ready to coordinate across timezones?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg text-[#8b949e] mb-8 max-w-2xl mx-auto"
        >
          Self-hosted and open source. Take control of your team's workflow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-semibold transition-colors"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <CommandSnippet command="npm install taskflow" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-sm text-[#484f58]"
        >
          No credit card required · Free forever for small teams
        </motion.p>
      </div>
    </section>
  );
}
