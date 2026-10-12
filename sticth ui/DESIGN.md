---
name: Corporate / Modern
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#003120'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a32'
  on-tertiary-container: '#4ac08f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system delivers a clean enterprise corporate light theme tailored for high-stakes business environments. The personality is authoritative, reliable, and exceptionally precise. 

The aesthetic is anchored in a modern corporate style that balances dense information density with pristine breathing room. The UI evokes absolute trust, transparency, and operational efficiency through immaculate alignments, crisp typographic hierarchy, and purposeful color usage.

## Colors

The palette is engineered for enterprise clarity, utilizing deep navy for foundational authority and vibrant blue for interactive guidance. Backgrounds remain pristine white (#FFFFFF) and light slate (#F8FAFC) to minimize eye strain during extended operational workflows. 

Functional states are clearly demarcated using emerald for success and compliance badges, and amber for warnings. Slate borders (#CBD5E1) provide structural integrity without visual heaviness.

## Typography

The typography pairs the geometric warmth of Plus Jakarta Sans for headlines with the utilitarian precision of Inter for body copy and data tables. This combination ensures high legibility across dense dashboards, reports, and administrative controls.

Ensure headline styles maintain tight tracking for an executive feel, while data-heavy numeric columns strictly utilize tabular lining figures.

## Layout & Spacing

The layout relies on a robust 12-column fluid grid system designed for expansive enterprise displays, with responsive reflow down to compact tablet viewports. Margins scale dynamically to frame dense data panels effectively.

Component spacing adheres strictly to an 8pt baseline grid. Maintain consistent padding inside containers to ensure visual scannability of complex forms and analytics widgets.

## Elevation & Depth

Depth is communicated through subtle, highly-diffused ambient shadows that lift interactive components slightly above the canvas without creating visual distraction. 

Tonal layering is preferred for major structural zones, using light slate surface containers against pristine white backgrounds. Borders are kept to a clean slate tone (#CBD5E1) to define boundaries crisply.

## Shapes

A soft shape language is employed to balance enterprise seriousness with modern accessibility. UI elements feature a baseline 0.25rem corner radius, scaling up to 0.5rem for cards and large containers. 

Strictly avoid pill-shaped buttons or overly aggressive radii to maintain a disciplined, professional corporate posture.

## Components

### Buttons
Primary buttons utilize the deep navy fill with white text, transitioning to vibrant blue on hover. Secondary actions feature transparent backgrounds with slate borders and dark text. Ensure clear focus states with high-contrast ring offsets.

### Chips & Badges
Badges are compact and feature soft tonal backgrounds matching their semantic intent—emerald for compliance/success, amber for warnings, and slate for neutral statuses. Label text must always match the semantic color family.

### Data Tables
Tables are the cornerstone of this system. Utilize alternating row tints or clean horizontal slate dividers. Right-align numeric data, left-align text, and pin header rows during vertical scrolling. Include inline pagination and dense sorting controls.

### Input Fields
Inputs feature a clean white background, slate borders, and subtle inset shadows on focus. Floating or top-aligned labels are mandatory for clarity in complex multi-step enterprise forms.

### Checkboxes & Radio Buttons
Rendered with precise square and circular geometries using the primary deep navy brand color for selected states. Always pair with clear, scannable label text.

### Cards
Surrounded by subtle slate borders and resting on pristine white surfaces, cards serve as container units for metrics, charts, and record summaries. Padding must adhere strictly to the defined spacing scale.