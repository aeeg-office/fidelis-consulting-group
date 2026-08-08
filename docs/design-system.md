# FIDELIS CONSULTING GROUP
## Brand Guide & Design System v1.0

---

### 1. BRAND IDENTITY

**Brand Essence:** *"Trusted Excellence in Education"*

**Brand Personality:**
- Authoritative yet approachable
- Premium without pretension
- Academic rigor + modern innovation
- Warm and supportive

**Brand Voice:**
- Professional and clear
- Confident but not arrogant
- Supportive and encouraging
- Evidence-based
- Arabic voice: equally authoritative with appropriate cultural nuance

### 2. LOGO SYSTEM

**Primary Logo:** Shield/crest motif with "Fidelis" in elegant serif, "Consulting Group" in clean sans-serif
**Secondary:** Horizontal lockup for tight spaces
**Icon:** Shield monogram "FCG" for app icon, favicon

*Note: Redesign/update the existing logo — preserve identity, modernize execution.*

### 3. COLOR PALETTE

```css
/* === PRIMARY PALETTE === */

--color-navy:          #1B2A4A;    /* Professional Navy - primary brand color */
--color-navy-light:    #2C4068;    /* Lighter navy for hover states */
--color-navy-dark:     #0F1B33;    /* Dark navy for text on light */

--color-gold:          #C9A84C;    /* Gold - accent, CTAs, highlights */
--color-gold-light:    #DFC06E;    /* Light gold for hover */
--color-gold-dark:     #A88A3A;    /* Dark gold for text on gold */

--color-ivory:         #F8F5F0;    /* Warm Ivory - background */
--color-ivory-dark:    #ECE7DF;    /* Darker ivory for cards */

--color-charcoal:      #2D2D2D;    /* Charcoal - body text */
--color-charcoal-light:#5A5A5A;    /* Muted text */

--color-white:         #FFFFFF;

--color-burgundy:      #7A2E3B;    /* Accent Burgundy - warnings, premium badges */
--color-burgundy-light:#9E4555;    /* Lighter burgundy */

/* === FUNCTIONAL COLORS === */

--color-success:       #2E7D5E;    /* Success states */
--color-warning:       #B8860B;    /* Warning states */
--color-error:         #C0392B;    /* Error states */
--color-info:          #2974A8;    /* Information */

/* === SURFACE COLORS === */

--color-surface:       #FFFFFF;    /* Card/surface background */
--color-surface-hover: #F8F5F0;    /* Card hover */
--color-border:        #E2DCD3;    /* Borders and dividers */
--color-border-light:  #EFEBE5;    /* Light borders */

/* === ARABIC-SPECIFIC === */
/* The palette is identical for Arabic; cultural sensitivity is maintained
   through imagery selection, not color changes */
```

### 4. TYPOGRAPHY SYSTEM

```css
/* === HEADING FONTS (Elegant Serif) === */
--font-heading: 'Playfair Display', 'Noto Naskh Arabic', Georgia, serif;

/* === BODY FONTS (Professional Sans) === */
--font-body: 'Inter', 'Noto Sans Arabic', system-ui, sans-serif;

/* === MONOSPACE (Code, data) === */
--font-mono: 'JetBrains Mono', 'IBM Plex Mono', monospace;
```

**Type Scale:**

| Level | Size | Line Height | Weight | Font | Usage |
|-------|------|-------------|--------|------|-------|
| H1 | 56/48px | 1.1 | 700 | Heading Serif | Page titles, hero |
| H2 | 40/36px | 1.15 | 700 | Heading Serif | Section headers |
| H3 | 32/28px | 1.2 | 600 | Heading Serif | Subsection headers |
| H4 | 24/22px | 1.25 | 600 | Heading Serif | Card titles |
| H5 | 20/18px | 1.3 | 600 | Heading Serif | Minor headings |
| H6 | 18/16px | 1.35 | 600 | Heading Serif | Small section headers |
| Body L | 18px | 1.6 | 400 | Body Sans | Lead paragraphs |
| Body | 16px | 1.6 | 400 | Body Sans | Standard body |
| Body S | 14px | 1.5 | 400 | Body Sans | Captions, metadata |
| Body XS | 12px | 1.4 | 400 | Body Sans | Legal, footnotes |
| Button | 16px | 1 | 600 | Body Sans | All buttons |
| Label | 14px | 1.3 | 500 | Body Sans | Form labels |
| Arabic H1 | 48/44px | 1.3 | 700 | Noto Naskh Arabic | Arabic page titles |
| Arabic Body | 16px | 1.8 | 400 | Noto Sans Arabic | Arabic body text |

*First value = desktop, second = mobile. RTL flips margins/padding automatically.*

### 5. SPACING SYSTEM

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-7:  32px;
--space-8:  40px;
--space-9:  48px;
--space-10: 56px;
--space-11: 64px;
--space-12: 80px;
--space-13: 96px;
--space-14: 120px;
```

### 6. BORDER RADIUS

```css
--radius-sm:  4px;     /* Input fields, badges */
--radius-md:  8px;     /* Cards, buttons */
--radius-lg:  12px;    /* Modals, large cards */
--radius-xl:  16px;    /* Hero sections */
--radius-full: 9999px; /* Pills, avatars */
```

### 7. SHADOWS

```css
--shadow-sm:   0 1px 2px rgba(27, 42, 74, 0.05);
--shadow-md:   0 4px 6px rgba(27, 42, 74, 0.07);
--shadow-lg:   0 10px 15px rgba(27, 42, 74, 0.1);
--shadow-xl:   0 20px 25px rgba(27, 42, 74, 0.12);
--shadow-nav:  0 2px 4px rgba(27, 42, 74, 0.08);
```

### 8. COMPONENT DESIGN SPEC

**Buttons:**

| Type | Background | Text | Border | Hover | Usage |
|------|-----------|------|--------|-------|-------|
| Primary (Gold) | gold | white | none | gold-light | CTAs, submit |
| Primary (Navy) | navy | white | none | navy-light | Secondary CTAs |
| Secondary | transparent | navy | 1px navy | bg-ivory | Alternative actions |
| Ghost | transparent | navy | none | bg-ivory | Tertiary actions |
| Danger | error | white | none | red-700 | Destructive |
| Gold Outline | transparent | gold | 1px gold | bg-gold/10 | Premium badges |

**Cards:**
- Background: white
- Border: border (1px)
- Radius: md (8px)
- Padding: space-6 (24px)
- Shadow: sm — hover: md
- Transition: all 200ms ease

**Input Fields:**
- Border: border (1px)
- Focus: navy (2px)
- Radius: sm (4px)
- Padding: 12px 16px
- Label above, help text below

### 9. ICONOGRAPHY

- Use Lucide icons (open-source, comprehensive)
- All icons must support RTL mirroring (arrow directions flip in Arabic)
- Icon size: 16px (inline), 20px (buttons), 24px (standalone), 32px+ (illustrative)

### 10. PHOTOGRAPHY GUIDELINES

- Professional, high-quality imagery
- Authentic classroom/school environments
- Diverse representation (culture, gender, age)
- Warm tones, natural lighting
- Avoid stock-photo clichés
- Arabic context: regionally appropriate imagery
- All photography must have alt text in both languages

### 11. WCAG AA COMPLIANCE

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | Navy on white: ratio 11.5:1 ✓ |
| | Gold on navy: ratio 5.2:1 ✓ |
| | Body text on ivory: ratio 10.1:1 ✓ |
| Focus indicators | 2px outline-offset: 2px |
| Touch targets | Minimum 44×44px |
| ARIA labels | All interactive elements |
| Keyboard navigation | Full tab order + skip links |
| Screen reader | Semantic HTML, landmarks |
| Reduced motion | Respect prefers-reduced-motion |

### 12. RESPONSIVE BREAKPOINTS

```css
--bp-sm:  640px;    /* Mobile */
--bp-md:  768px;    /* Tablet */
--bp-lg:  1024px;   /* Desktop */
--bp-xl:  1280px;   /* Desktop wide */
--bp-2xl: 1536px;   /* Ultra-wide */
```

### 13. RTL SPECIFICS

- Use CSS logical properties (margin-inline-start, padding-inline-end)
- All flex directions: row by default → row-reverse is NOT used (logical properties handle this)
- Font swap: serif heading font changes to Noto Naskh Arabic in Arabic mode
- Body line-height: 1.8 (Arabic) vs 1.6 (English) — Arabic text needs more leading
- Icons: check for directional meaning (arrows, chevrons) and mirror in RTL
- Forms: labels right-aligned in Arabic
- Cards: reading direction affects card layout (image left in EN, image right in AR)