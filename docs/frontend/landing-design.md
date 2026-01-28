# TaskFlow Landing Page Design System

## Overview
Clean, minimal landing page for TaskFlow - an async team coordination hub. Focus on clarity and conversion over decoration.

## Typography

### Font Stack
```tsx
// Inter for body, Geist for headings (system fonts)
font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif
```

### Usage Rules
- **Headings**: `text-balance` for better line breaking
- **Body/Paragraphs**: `text-pretty` for improved readability
- **Data/Numbers**: `tabular-nums` for alignment
- **NO `tracking-*`** (letter-spacing modifications) unless explicitly requested

### Scale
| Element | Size | Weight |
|---------|------|--------|
| H1 (Hero) | text-5xl md:text-7xl | font-bold |
| H2 (Section) | text-3xl md:text-4xl | font-bold |
| H3 (Card) | text-xl | font-semibold |
| Body | text-base | font-normal |
| Small | text-sm | font-normal |

## Color Palette

### Primary
- **Sky Blue**: `sky-500` (hover: `sky-600`)
- **Slate Dark**: `slate-950` (background)
- **Slate Light**: `slate-50` (light mode background)

### Semantic
| Purpose | Color |
|---------|-------|
| Text Primary | `slate-950` / `white` |
| Text Secondary | `slate-600` / `slate-400` |
| Text Muted | `slate-500` / `slate-500` |
| Border | `slate-200` / `white/10` |
| Background | `white` / `slate-950` |
| Background Muted | `slate-50` / `white/5` |

### Accent (ONE per view)
- Primary action: `sky-500`
- Hover states: `sky-600`

**NO purple gradients, NO multicolor gradients, NO glow effects as primary affordances**

## Spacing

### Container
- Max width: `max-w-7xl` (1280px)
- Section padding: `py-24 px-6`
- Card padding: `p-8`

### Scale
| Token | Value | Use |
|-------|-------|-----|
| gap-2 | 0.5rem | Tight elements |
| gap-4 | 1rem | Default spacing |
| gap-6 | 1.5rem | Section elements |
| gap-8 | 2rem | Large spacing |

## Z-Index Scale (Fixed)

| Layer | Value | Component |
|-------|-------|-----------|
| Base | 0 | Page content |
| Sticky | 10 | Navigation |
| Dropdown | 50 | Popovers |
| Modal | 100 | Dialogs |
| Toast | 200 | Notifications |

## Animation

### Rules
- **ONLY animate compositor props**: `transform`, `opacity`
- **NEVER animate layout props**: `width`, `height`, `top`, `left`, `margin`, `padding`
- **NEVER animate large blur()** or `backdrop-filter` surfaces
- **Max 200ms** for interaction feedback
- **Use `ease-out`** for entrance animations

### Durations
| Purpose | Duration | Easing |
|---------|----------|--------|
| Micro-interaction | 150ms | ease-out |
| Entrance | 300ms | ease-out |
| Exit | 200ms | ease-in |

### Entrance (using motion/react)
```tsx
import { motion } from 'motion/react'

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

<motion.div
  initial="hidden"
  animate="visible"
  variants={variants}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
```

## Components

### Button (Primary)
```tsx
className="inline-flex items-center justify-center gap-2
  px-6 py-3 bg-sky-500 text-white rounded-lg font-medium
  hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-sky-500 focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  transition-colors duration-150"
```

### Button (Secondary)
```tsx
className="inline-flex items-center justify-center gap-2
  px-6 py-3 bg-white text-slate-900 rounded-lg font-medium
  border border-slate-200 hover:bg-slate-50
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-slate-500 focus-visible:ring-offset-2
  transition-colors duration-150"
```

### Button (Ghost)
```tsx
className="inline-flex items-center justify-center gap-2
  px-6 py-3 text-slate-700 hover:text-slate-900 rounded-lg font-medium
  hover:bg-slate-100
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-slate-500 focus-visible:ring-offset-2
  transition-colors duration-150"
```

### Card
```tsx
className="rounded-xl border border-slate-200 bg-white
  shadow-sm hover:shadow-md
  transition-shadow duration-200"
```

### Badge
```tsx
className="inline-flex items-center gap-1.5 px-3 py-1
  rounded-full text-xs font-medium bg-sky-100 text-sky-700"
```

## Layout Patterns

### Section Structure
```tsx
<section className="py-24 px-6">
  <div className="max-w-7xl mx-auto">
    {/* Content */}
  </div>
</section>
```

### Two Column
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <div>{/* Left content */}</div>
  <div>{/* Right content */}</div>
</div>
```

### Three Column Features
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {/* Feature cards */}
</div>
```

## Information Architecture

### Page Flow
1. **Hero** - Value proposition + primary CTA
2. **Problem** - Pain points we solve
3. **Solution** - How TaskFlow helps
4. **Features** - Key capabilities (showcase)
5. **Social Proof** - Trust indicators
6. **CTA** - Final conversion push

### Hero Pattern
- Badge (optional)
- H1: Clear value prop
- Subheading: Supporting context
- CTAs: Primary + Secondary
- Visual: Product preview or abstract

## Accessibility

### Required
- `aria-label` on icon-only buttons
- `focus-visible:` styles on all interactive elements
- Sufficient color contrast (WCAG AA minimum)
- Semantic HTML (nav, main, section, footer)

### Keyboard Navigation
- All interactive elements focusable
- Logical tab order
- Visible focus indicators

## Responsive Breakpoints

| Breakpoint | Width | Use |
|------------|-------|-----|
| base | < 640px | Mobile first |
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |

### Mobile Considerations
- Use `h-dvh` instead of `h-screen` for mobile browsers
- Respect `safe-area-inset` for fixed elements
- Touch targets minimum 44x44px

## Copy Guidelines

### Tone
- Clear, direct, confident
- Avoid jargon and buzzwords
- Focus on benefits, not features
- Use active voice

### Headings
- H1: Clear value proposition (4-6 words)
- H2: Section theme (2-4 words)
- H3: Feature names (1-3 words)

### Calls to Action
- Start with verb: "Get started", "Sign up", "Try free"
- Be specific about what happens next
- Avoid generic "Submit" or "Click here"

## Anti-Patterns (DO NOT DO)

- ❌ Gradient backgrounds (unless explicitly requested)
- ❌ Purple/multicolor gradients
- ❌ Glow effects as primary affordances
- ❌ `h-screen` - use `h-dvh`
- ❌ `tracking-*` (letter-spacing)
- ❌ Animated large blur surfaces
- ❌ Animating layout properties
- ❌ Custom easing curves
- ❌ Animation duration > 200ms for interactions
