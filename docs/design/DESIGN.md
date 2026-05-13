---
name: Kinetic Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#414754'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#727786'
  outline-variant: '#c1c6d7'
  surface-tint: '#0059c5'
  primary: '#0058c3'
  on-primary: '#ffffff'
  primary-container: '#0070f3'
  on-primary-container: '#ffffff'
  inverse-primary: '#aec6ff'
  secondary: '#435d94'
  on-secondary: '#ffffff'
  secondary-container: '#a6c1fe'
  on-secondary-container: '#334e83'
  tertiary: '#a23d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ca4e00'
  on-tertiary-container: '#fffeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004397'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#aec6ff'
  on-secondary-fixed: '#001a43'
  on-secondary-fixed-variant: '#2a467b'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
  surface-subtle: '#FAFAFA'
  border-muted: '#EAEAEA'
  text-secondary: '#666666'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  code:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is engineered for high-performance SaaS environments, emphasizing clarity, technical precision, and rapid information processing. The brand personality is authoritative yet unobtrusive—acting as a silent partner in the user's workflow. 

The aesthetic follows a **Minimalist-Corporate** fusion. It leverages heavy whitespace, razor-sharp alignment, and a "function-over-form" philosophy. Visual interest is generated through purposeful motion and a singular, vibrant accent color, rather than decorative elements. The goal is to evoke a sense of reliability and modern sophistication, making the interface feel like a premium professional tool.

## Colors

The color palette is anchored by a high-energy primary blue, reserved strictly for calls to action and critical interactive states. 

- **Primary:** An electric blue that signifies "action" and "priority."
- **Neutrals:** A monochromatic range dominated by pure blacks and whites. The use of #FAFAFA for secondary surfaces prevents visual fatigue common with stark white layouts.
- **Contrast:** High contrast ratios are maintained for text to ensure readability, while borders remain low-contrast (#EAEAEA) to keep the layout feeling open and airy.

## Typography

This design system utilizes **Geist** exclusively to maintain a cohesive, technical aesthetic. Geist’s geometric structure and optimized spacing make it ideal for data-rich interfaces.

The type scale is built on a tight ratio to ensure hierarchy is clear without excessive size jumps. Large headlines use tight letter-spacing and heavy weights to create a sense of impact, while body text maintains standard tracking for optimal legibility. All labels use a medium weight and slight tracking to differentiate them from body content.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. A strict 8px spatial system governs all padding, margins, and component heights, ensuring mathematical harmony across the UI.

- **Desktop:** 12 columns with 24px gutters. Content is centered within a 1200px max-width container.
- **Mobile:** Single column flow with 16px side margins.
- **Rhythm:** Use large vertical spacing (64px+) between major sections to emphasize the minimalist aesthetic and improve focus.

## Elevation & Depth

Depth in this design system is primarily conveyed through **low-contrast outlines** and **tonal layering**. We avoid heavy, traditional shadows in favor of a flatter, more modern "technical" look.

- **Layer 0 (Background):** #FAFAFA.
- **Layer 1 (Cards/Containers):** #FFFFFF with a 1px border (#EAEAEA).
- **Interactive Depth:** On hover, elements may gain a very subtle, diffused ambient shadow (0px 4px 12px rgba(0,0,0,0.05)) to indicate "lift" without breaking the clean aesthetic.
- **Focus States:** High-contrast focus rings using the primary color (#0070F3) are mandatory for accessibility and to reinforce the brand identity.

## Shapes

The shape language is **Soft (0.25rem)**. This subtle rounding strikes a balance between the friendliness of consumer apps and the professional rigor of developer tools. 

- **Small Components:** Buttons, inputs, and chips use a 4px (0.25rem) radius.
- **Large Components:** Cards and modals use an 8px (0.5rem) radius.
- **Consistency:** Rounding is never varied based on content; it remains a constant architectural feature to ground the UI.

## Components

### Buttons
- **Primary:** Solid #0070F3 background, white text, no border. Transitions to a slightly darker blue on hover.
- **Secondary:** Transparent background, 1px #EAEAEA border, #000000 text.
- **Tertiary/Ghost:** No background or border. Text-only with primary color hover state.

### Input Fields
- White background with a 1px #EAEAEA border. 
- Placeholder text in #A1A1A1.
- Focus state: Border changes to #0070F3 with a subtle 2px outer glow.

### Cards
- White background (#FFFFFF), 1px border (#EAEAEA), and 8px corner radius.
- Padding should be generous (typically 24px or 32px) to maintain the minimalist feel.

### Chips/Tags
- Small, uppercase labels with a #FAFAFA background and #666666 text.
- Rounded at 4px.

### Lists
- Clean lines with 1px horizontal dividers. 
- High vertical padding (16px+) per row to ensure touch-targets are accessible and information is readable.