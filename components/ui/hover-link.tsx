"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface HoverLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode
  showArrow?: boolean
}

export function HoverLink({ children, href, showArrow = true, className, ...props }: HoverLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-1 text-sm transition-colors",
        className
      )}
      {...props}
    >
      <span className="relative z-10 group-hover:text-foreground transition-colors">
        {children}
      </span>
      {showArrow && (
        <motion.span
          className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
          initial={false}
          animate={{ opacity: 0, x: -4 }}
          whileHover={{ opacity: 1, x: 0 }}
        >
          →
        </motion.span>
      )}
      <motion.span
        className="absolute bottom-0 left-0 h-px bg-current opacity-0 group-hover:opacity-20"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.2 }}
      />
    </a>
  )
}
