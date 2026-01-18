# Phase 02: Frontend UI with shadcn/ui and Aceternity UI - Research

**Researched:** 2025-01-18
**Domain:** React UI Components (shadcn/ui + Aceternity UI)
**Confidence:** HIGH

## Summary

This phase focuses on building the complete frontend UI using pre-built components from shadcn/ui and Aceternity UI. The project already has shadcn CLI configured with `components.json` and the shadcn MCP server enabled in `.mcp.json`. Key findings reveal a critical React 19 compatibility issue with Framer Motion (required by Aceternity UI) that requires a specific workaround using npm overrides.

The standard approach is to use shadcn/ui for functional UI components (forms, tables, cards, buttons) and selectively add Aceternity UI components for visual polish (backgrounds, animations, effects). Both libraries are fully compatible and can be used in the same project.

**Primary recommendation:** Use shadcn MCP server for component discovery and installation, apply the React 19 + Framer Motion override for Aceternity UI components, and prioritize shadcn/ui components for core functionality before adding Aceternity UI enhancements.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | Latest | Pre-built accessible UI components | Copy-paste components, fully customizable, built on Radix UI |
| Aceternity UI | Latest | Animated/visual effect components | Stunning animations, Framer Motion powered |
| framer-motion | ^12.0.0-alpha.1 | Animation engine (Aceternity dependency) | Required for Aceternity, alpha version for React 19 |
| motion | ^12.0.0-alpha.1 | Rebranded Framer Motion | Alternative package name for same library |
| tailwind-merge | ^2.5.5+ | Merge Tailwind classes without conflicts | Required by both libraries |
| clsx | ^2.x | Conditional class names | Required utility |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/* | Various | Headless primitives | shadcn/ui dependencies, auto-installed |
| lucide-react | ^0.562.0 | Icon library | Already installed, used by shadcn |
| react-syntax-highlighter | - | Code highlighting | For Aceternity Codeblock component |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Aceternity UI | Custom Framer Motion animations | More control but significantly more development time |
| shadcn/ui Forms | React Hook Form directly | shadcn provides better integration with components |

**Installation:**
```bash
# Core shadcn CLI (already installed)
npm install -D shadcn@latest

# Aceternity UI dependencies
npm install motion clsx tailwind-merge

# Individual shadcn components via MCP or CLI
npx shadcn@latest add button card input form table dialog
```

## Architecture Patterns

### Recommended Project Structure
```
frontend/
├── components/
│   ├── ui/              # shadcn components (auto-generated)
│   ├── aceternity/      # Aceternity components (manually copied)
│   └── layout/          # Layout wrappers (header, sidebar, etc.)
├── lib/
│   ├── hooks/           # Custom React hooks
│   └── utils.ts         # cn() utility (already exists)
└── app/
    ├── dashboard/       # Dashboard page + components
    ├── tasks/           # Task pages + components
    ├── login/           # Login page + OAuth
    └── register/        # Register page
```

### Pattern 1: MCP Server Component Discovery
**What:** Use shadcn MCP server to browse and install components using natural language
**When to use:** During development when adding new UI components
**Configuration:** Already configured in `.mcp.json`:
```json
{
  "mcpServers": {
    "shadcn": {
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    }
  }
}
```
**Usage prompts:**
- "Show me all available components in the shadcn registry"
- "Add the button, card, and form components to my project"
- "Find me a data table component from shadcn registry"

### Pattern 2: React 19 + Framer Motion Override
**What:** Use npm `overrides` to force Framer Motion compatibility with React 19
**When to use:** When using Aceternity UI components with Next.js 15/16 and React 19
**Example:**
```json
{
  "dependencies": {
    "framer-motion": "^12.0.0-alpha.1"
  },
  "overrides": {
    "framer-motion": {
      "react": "19.0.0-rc-66855b96-20241106",
      "react-dom": "19.0.0-rc-66855b96-20241106"
    }
  }
}
```
**Source:** [Aceternity UI Add Utilities Documentation](https://ui.aceternity.com/docs/add-utilities)

### Pattern 3: Component Import Strategy
**What:** Import shadcn components from `@/components/ui`, Aceternity from `@/components/aceternity`
**When to use:** All component imports throughout the project
**Example:**
```typescript
// shadcn component
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Aceternity component (copy-paste, not CLI installed)
import { Spotlight } from "@/components/aceternity/spotlight"
```

### Anti-Patterns to Avoid
- **Installing Aceternity components via CLI:** Aceternity components are copy-paste only, do not use `npx shadcn add` for them
- **Mixing animation libraries:** Don't add GSAP or React Spring alongside Framer Motion
- **Skipping the React 19 override:** Framer Motion will fail without the npm override configuration

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | shadcn Form + Zod | Comprehensive validation, error handling, type safety |
| Data tables | Custom table with sorting/pagination | shadcn Data Table | Built-in sorting, filtering, pagination, accessibility |
| Dialog modals | Custom modal with overlay | shadcn Dialog | Focus trapping, keyboard navigation, accessibility |
| Dropdown menus | Custom dropdown logic | shadcn Dropdown Menu | Keyboard navigation, collision detection |
| Toast notifications | Custom toast system | shadcn Sonner | Queue management, auto-dismiss, promises |
| Animated backgrounds | Custom CSS/Canvas | Aceternity Background effects | Optimized, tested, responsive |

**Key insight:** Both shadcn/ui and Aceternity UI are built on years of refinement. Custom implementations inevitably miss edge cases around accessibility, keyboard navigation, and responsive behavior.

## Common Pitfalls

### Pitfall 1: Framer Motion React 19 Incompatibility
**What goes wrong:** Aceternity UI components fail with "type is invalid" errors or don't render
**Why it happens:** Framer Motion stable versions are not compatible with React 19
**How to avoid:** Add npm `overrides` to package.json for framer-motion with React 19 RC versions
**Warning signs:** Console errors about invalid element types, components not rendering

### Pitfall 2: Installing Aceternity Components via CLI
**What goes wrong:** Component not found or installation fails
**Why it happens:** Aceternity UI components are not in the shadcn registry
**How to avoid:** Copy-paste Aceternity components manually from their documentation
**Warning signs:** "Component not found" errors from shadcn CLI

### Pitfall 3: Missing Tailwind v4 Configuration
**What goes wrong:** Styles not applying to Aceternity components
**Why it happens:** Tailwind v4 uses different configuration (CSS-based vs config file)
**How to avoid:** Use Tailwind v3 (currently installed) or migrate to v4 configuration
**Warning signs:** Component renders but has no styling

### Pitfall 4: Dark Mode Class Mismatch
**What goes wrong:** Dark mode not toggling correctly
**Why it happens:** shadcn uses `dark:` prefix, requires proper class on html/body
**How to avoid:** Ensure dark mode is configured as `class` strategy in tailwind.config
**Warning signs:** Dark mode styles never activate

## Code Examples

Verified patterns from official sources:

### Shadcn Component Installation via CLI
```bash
# Source: https://ui.shadcn.com/docs/cli
npx shadcn@latest add button card input form table dialog select dropdown-menu
```

### Shadcn Component Usage
```typescript
// Source: https://ui.shadcn.com/docs/components
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{task.description}</p>
        <Button variant="default">Edit</Button>
      </CardContent>
    </Card>
  )
}
```

### Aceternity React 19 Override
```json
// Source: https://ui.aceternity.com/docs/add-utilities
{
  "dependencies": {
    "framer-motion": "^12.0.0-alpha.1"
  },
  "overrides": {
    "framer-motion": {
      "react": "19.0.0-rc-66855b96-20241106",
      "react-dom": "19.0.0-rc-66855b96-20241106"
    }
  }
}
```

### Aceternity Component Integration
```typescript
// Source: Aceternity UI documentation (copy-paste pattern)
// File: components/aceternity/spotlight.tsx
"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function Spotlight({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    />
  )
}
```

## Component-to-Page Mapping

### Dashboard Page
**shadcn components needed:**
- `card` - Task containers
- `table` or `data-table` - Task list
- `button` - New task, actions
- `badge` - Status indicators
- `dropdown-menu` - Row actions
- `avatar` - User avatars

**Aceternity enhancements (optional):**
- `background-beams` - Subtle animated background
- `glowing-effect` - Card hover effects

**Installation:**
```bash
npx shadcn@latest add card table button badge dropdown-menu avatar
```

### Task Creation Form
**shadcn components needed:**
- `form` - Form container with validation
- `input` - Title, description fields
- `textarea` - Description
- `select` - Status, priority dropdowns
- `label` - Field labels
- `button` - Submit, cancel

**Aceternity enhancements (optional):**
- `placeholders-and-vanish-input` - Animated input placeholders

**Installation:**
```bash
npx shadcn@latest add form input textarea select label button
```

### Task Detail View
**shadcn components needed:**
- `card` - Detail sections
- `badge` - Status, priority
- `separator` - Visual dividers
- `dialog` - Edit modals
- `toast` - Notifications (via Sonner)
- `tabs` - Detail/activity tabs

**Installation:**
```bash
npx shadcn@latest add card badge separator dialog toast tabs
```

### Notifications Panel
**shadcn components needed:**
- `popover` - Notification dropdown
- `scroll-area` - Scrollable list
- `avatar` - User icons
- `button` - Mark read, dismiss

**Installation:**
```bash
npx shadcn@latest add popover scroll-area avatar button
```

### Login/Register Pages
**shadcn components needed:**
- `card` - Form container
- `input` - Email, password
- `label` - Field labels
- `button` - Submit, OAuth buttons
- `separator` - "Or continue with" divider

**Aceternity enhancements (optional):**
- `spotlight` - Background effect
- `aurora-background` - Animated gradient background

**Installation:**
```bash
npx shadcn@latest add card input label button separator
```

### Navigation/Layout
**shadcn components needed:**
- `navigation-menu` or `menubar` - Main nav
- `dropdown-menu` - User menu
- `sheet` - Mobile sidebar
- `switch` - Theme toggle

**Aceternity enhancements (optional):**
- `floating-navbar` - Hide-on-scroll nav
- `sidebar` - Collapsible sidebar

**Installation:**
```bash
npx shadcn@latest add navigation-menu dropdown-menu sheet switch
```

## Available shadcn/ui Components (2025)

Complete list from [official documentation](https://ui.shadcn.com/docs/components):

**Forms & Inputs:**
- button, button-group
- input, input-group, input-otp
- textarea
- select, native-select
- checkbox
- radio-group
- switch
- slider
- form (with React Hook Form or TanStack Form)
- calendar, date-picker
- combobox

**Layout:**
- card
- separator
- scroll-area
- resizable
- sidebar
- sheet (drawer)
- collapsible
- tabs

**Navigation:**
- navigation-menu
- menubar
- dropdown-menu
- context-menu
- breadcrumb
- pagination
- tabs

**Overlays & Feedback:**
- dialog
- alert-dialog
- popover
- hover-card
- tooltip
- toast (via Sonner)
- alert
- progress
- skeleton
- spinner
- badge
- avatar

**Data Display:**
- table
- data-table
- carousel
- chart

**Typography:**
- typography
- kbd (keyboard key display)

**New in 2025:**
- empty
- field
- item

## Available Aceternity UI Components

Categorized for this project's needs:

**Background Effects (for dashboard, login pages):**
- spotlight, spotlight-new
- aurora-background
- background-beams, background-beams-with-collision
- background-gradient, gradient-animation
- wavy-background
- sparkles
- grid-and-dot-backgrounds

**Card Enhancements (for task cards):**
- card-spotlight
- focus-cards
- wobble-card
- glare-card
- hover-effect
- glowing-effect

**Navigation (for layout):**
- floating-navbar
- sidebar
- resizable-navbar
- tabs (animated)
- navbar-menu

**Input/Form Enhancements:**
- placeholders-and-vanish-input
- signup-form
- file-upload

**Text Effects (for headings):**
- text-generate-effect
- typewriter-effect
- flip-words
- hero-highlight

**Loaders:**
- loader
- multi-step-loader

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual component installation | MCP server natural language installation | CLI 3.0 (2025) | Faster component discovery and installation |
| React 18 only | React 19 support with npm overrides | 2025 | Enables use with latest React |
| Framer Motion only | "motion" package (rebranded) | 2025 | Package name change, same functionality |
| Tailwind v3 config | Tailwind v4 CSS-based config | 2025 | Configuration moved to CSS (optional migration) |

**Deprecated/outdated:**
- Installing shadcn components by manually copying files (use CLI or MCP instead)
- Using `framer-motion` stable versions with React 19 (must use alpha with override)

## Open Questions

1. **Tailwind v4 Migration Timeline**
   - What we know: Aceternity UI Pro templates use Tailwind v4
   - What's unclear: When to migrate from v3 (currently installed) to v4
   - Recommendation: Stay on Tailwind v3 for this phase, migrate later if needed

2. **Number of Aceternity Components to Use**
   - What we know: Aceternity offers many visual effects
   - What's unclear: How many effects enhance vs. clutter the UI
   - Recommendation: Start with shadcn only, add 1-2 Aceternity effects per page maximum

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Components Documentation](https://ui.shadcn.com/docs/components) - Complete component list
- [shadcn/ui CLI Documentation](https://ui.shadcn.com/docs/cli) - Installation and usage
- [shadcn MCP Server Documentation](https://ui.shadcn.com/docs/mcp) - MCP server configuration
- [Aceternity UI Components](https://ui.aceternity.com/components) - Complete component catalog
- [Aceternity UI Add Utilities](https://ui.aceternity.com/docs/add-utilities) - React 19 compatibility fix

### Secondary (MEDIUM confidence)
- [Shadcn UI Ecosystem Guide 2025](https://www.devkit.best/blog/mdx/shadcn-ui-ecosystem-complete-guide-2025) - New components and ecosystem
- [Aceternity UI Integration with Next.js](https://medium.com/@preetam.img/integrating-acertinity-ui-with-next-js-a-step-by-step-tutorial-93d14bce1f7f) - Integration tutorial
- [Framer Motion React 19 Issue](https://github.com/motiondivision/motion/issues/2668) - Official compatibility discussion
- [Using Next.js, Aceternity UI and Shadcn-UI Together](https://medium.com/@anandmanash321/using-nextjs-aceternity-ui-and-shadcnui-all-together-e59c1ee93091) - Integration guide

### Tertiary (LOW confidence)
- [7 Hottest Animated UI Component Libraries 2025](https://designerup.co/blog/copy-and-paste-ui-component-libraries/) - Ecosystem overview

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation verified
- Architecture: HIGH - Official patterns documented
- Pitfalls: HIGH - React 19 issue confirmed with official workaround
- Component mapping: HIGH - Based on official component lists and project requirements

**Research date:** 2025-01-18
**Valid until:** 30 days (stable libraries, minor updates expected)
