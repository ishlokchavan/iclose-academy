# CloseHQ Design Pack
> Paste this into any new project prompt to replicate the iClose design language.

---

## Colors

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#1d1d1f` | Primary text, dark surfaces, dark hero bg |
| `ink-800` | `#2c2c2e` | Secondary dark surface |
| `ink-700` | `#3a3a3c` | Tertiary dark surface |
| `graphite-dark` | `#424245` | Strong secondary text |
| `graphite` | `#6e6e73` | Secondary / muted text |
| `graphite-light` | `#86868b` | Placeholder, captions |
| `hairline` | `#d2d2d7` | Borders, dividers |
| `bone-300` | `#e8e8ed` | Subtle borders |
| `mist` | `#f5f5f7` | Section alternate background |
| `fog` | `#fbfbfd` | Page background |
| `paper` | `#ffffff` | Card surface |
| `accent` | `#0071e3` | CTAs, links, interactive elements |
| `accent-hover` | `#0077ed` | Hover state |
| `accent-dark` | `#0058a3` | Pressed / dark variant |

**Note:** The original luxury gold `#C8A862` from the README was remapped to ink shades in the final build. If you want the warm gold version, use `#C8A862` (light), `#D9BD7E` (lighter), `#9C8245` (dark) as the accent instead of blue.

---

## Typography

### Font Stack
| Role | Font | Fallback |
|---|---|---|
| `font-display` | Fraunces (Google Fonts) | SF Pro Display, -apple-system, serif |
| `font-sans` | Inter (Google Fonts) | SF Pro Text, -apple-system, sans-serif |
| `font-mono` | JetBrains Mono (Google Fonts) | SF Mono, ui-monospace, monospace |

### Usage
- **Display / headlines** → Fraunces, italic, light weight (300), optical-size enabled
- **Body / UI / forms** → Inter / SF Pro Text
- **Eyebrows, KPIs, data labels, stats** → JetBrains Mono, uppercase, wide tracking

### Letter Spacing
| Token | Value | Use |
|---|---|---|
| `tightest` | `-0.04em` | Large display headlines |
| `tighter` | `-0.022em` | Section headings |
| `tight` | `-0.015em` | Subheadings |
| `widest` | `+0.18em` | Eyebrow labels (mono, uppercase) |

---

## Effects

### Box Shadows
```
card:        0 1px 2px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)
card-hover:  0 2px 4px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.08)
elevated:    0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)
```

### Border Radius
| Token | Value | Use |
|---|---|---|
| default | `8px` | Inputs, badges |
| `lg` | `12px` | Cards |
| `apple` | `18px` | Feature cards, modals |
| `pill` | `9999px` | Buttons, tags |

### Motion
- **Primary easing:** `cubic-bezier(0.22, 1, 0.36, 1)` — used universally ("luxury hardware feel")
- **fade-up:** opacity 0→1 + translateY 20px→0, duration 0.9s, primary easing
- **fade-in:** opacity 0→1, duration 1s, ease-out
- **marquee:** translateX 0%→-50%, duration 40s, linear, infinite
- All animations are `whileInView`-triggered (Framer Motion) — nothing animates offscreen

---

## Tech Stack

```
next@15          App Router, Edge runtime API routes
react@18+        with TypeScript
tailwindcss@3    design tokens via tailwind.config.ts
framer-motion    animations (whileInView, layout)
lucide-react     icons (optimizePackageImports)
react-hook-form  forms + honeypot
zod              schema validation
next/font        Fraunces + Inter + JetBrains Mono (CSS vars, display:swap)
next/image       AVIF/WebP, priority on hero only, lazy elsewhere
next/script      GA4 + Meta Pixel (afterInteractive)
```

---

## Tailwind Config (drop-in)

```ts
colors: {
  ink: {
    DEFAULT: '#1d1d1f',
    900: '#1d1d1f',
    800: '#2c2c2e',
    700: '#3a3a3c',
  },
  graphite: {
    DEFAULT: '#6e6e73',
    light: '#86868b',
    dark: '#424245',
  },
  hairline: '#d2d2d7',
  mist: '#f5f5f7',
  fog: '#fbfbfd',
  paper: '#ffffff',
  accent: {
    DEFAULT: '#0071e3',
    hover: '#0077ed',
    dark: '#0058a3',
  },
},
fontFamily: {
  display: ['var(--font-display)', 'SF Pro Display', '-apple-system', 'system-ui', 'sans-serif'],
  sans:    ['var(--font-sans)',    'SF Pro Text',    '-apple-system', 'system-ui', 'sans-serif'],
  mono:    ['var(--font-mono)',    'SF Mono',        'ui-monospace',  'monospace'],
},
letterSpacing: {
  tightest: '-0.04em',
  tighter:  '-0.022em',
  tight:    '-0.015em',
  widest:   '0.18em',
},
borderRadius: {
  apple: '18px',
},
boxShadow: {
  card:         '0 1px 2px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)',
  'card-hover': '0 2px 4px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.08)',
  elevated:     '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)',
},
animation: {
  'fade-up': 'fade-up 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
  'fade-in': 'fade-in 1s ease-out forwards',
  marquee:   'marquee 40s linear infinite',
},
keyframes: {
  'fade-up': {
    '0%':   { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'fade-in': {
    '0%':   { opacity: '0' },
    '100%': { opacity: '1' },
  },
  marquee: {
    '0%':   { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' },
  },
},
```

---

## Design Principles

- **Apple-inspired luxury** — clean whites, deep ink blacks, hairline borders, generous space
- **No color noise** — accent blue appears only on interactive elements (CTAs, links). Everything else is ink/graphite/neutral
- **Serif for emotion, sans for function, mono for data** — never mix roles
- **Tight headlines, wide eyebrows** — negative tracking on large text; positive tracking on small uppercase labels
- **Shadows are atmospheric, not decorative** — barely visible at rest, more present on hover
- **All motion is purposeful** — one entrance animation per section, no looping decorations except the marquee trust rail
