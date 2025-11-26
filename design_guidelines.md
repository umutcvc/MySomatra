# Wellness Wearable Device - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from Apple's product pages (minimalist, premium feel) combined with wellness app aesthetics (Calm, Headspace) to create a soothing yet sophisticated interface. The design should evoke tranquility while showcasing cutting-edge technology.

## Core Design Principles

1. **Spacious Calm**: Generous whitespace to reduce cognitive load and promote relaxation
2. **Elegant Simplicity**: Clean lines, minimal ornamentation, focus on the product
3. **Sensory Connection**: Visual metaphors for touch, movement, and wellness
4. **Trust Through Clarity**: Clear communication of technical capabilities without overwhelming users

---

## Typography System

**Primary Font**: Inter or SF Pro Display (Google Fonts: Inter)
- Hero Headline: 600 weight, 3.5-4.5rem (56-72px), tight line-height (1.1)
- Section Headings: 600 weight, 2-2.5rem (32-40px)
- Feature Titles: 500 weight, 1.25-1.5rem (20-24px)
- Body Text: 400 weight, 1rem (16px), line-height 1.6
- Small Text/Labels: 400 weight, 0.875rem (14px)

**Secondary Font** (optional accent): Nunito for softer, friendlier UI elements

---

## Layout & Spacing

**Spacing Scale**: Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 to p-8
- Section vertical spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Element gaps: gap-4 to gap-8
- Container max-width: max-w-7xl with px-6 horizontal padding

**Grid System**: 
- Features: 3-column grid (lg:grid-cols-3, md:grid-cols-2, grid-cols-1)
- Specs: 4-column grid for technical details
- Asymmetric layouts for visual interest in feature sections

---

## Product Introduction Page Structure

### Hero Section (100vh)
**Layout**: Full-viewport immersive experience
- Large hero image: High-quality lifestyle photo of person wearing the device during peaceful activity (yoga, nature walk, meditation). Image should be serene, natural lighting, soft focus on background with device prominent on wrist
- Image treatment: Subtle gradient overlay for text legibility
- Center-aligned content overlay with blurred background button
- Hero headline + short tagline (max 2 lines)
- Primary CTA: "Connect Your Device" button (large, prominent, blurred glass-morphism background)
- Scroll indicator at bottom

### Device Showcase Section
**3D Product Visualization Area**
- Large product image/render of the wearable from multiple angles
- Clean white/minimal background
- Subtle floating animation or rotating view capability
- Compact specs callout cards floating around device (GPS icon, battery %, USB-C icon)

### Key Features Section (2-column alternating layout)
**Four Feature Blocks** - Each with:
- Large icon (heroicons: motion sensor = arrow-path-rounded-square, vibration = signal, GPS = map-pin, battery = battery-100)
- Feature title
- 2-3 sentence description
- Supporting illustration or micro-interaction visual
- Alternating image-left/text-right, text-left/image-right layout

### Technical Specifications Grid
**4-column grid** (stacks to 2-col on tablet, 1-col on mobile)
- Motion Sensors card
- Vibration Feedback card  
- GPS Tracking card
- Power & Charging card (battery life + USB-C)
Each card with icon, spec title, detailed description

### How It Works Section
**3-step process visualization**
- Step numbers (large, prominent)
- Title + description for each step
- Connecting line/path between steps
- Icons: 1) Wear device, 2) Connect via Bluetooth, 3) Experience wellness

### Call-to-Action Section
**Final conversion section** with:
- "Ready to begin your wellness journey?" headline
- Large "Connect Device" button
- Supporting text: "Compatible with any modern browser on PC or mobile"
- Trust indicators: Bluetooth icon, browser compatibility icons

---

## Device Connection Page Structure

### Connection Interface
**Centered card layout** (max-w-2xl)
- Page title: "Connect Your Wellness Device"
- Step-by-step connection UI:
  1. Device search section with "Scan for Devices" button
  2. Available devices list (card-based, shows device name/ID)
  3. Connection status indicator (animated pulse during connection)
  4. Success state with device info card

### Device Dashboard (Post-Connection)
**Split layout**: 
- Left sidebar (1/3 width): Device status panel
  - Battery level with visual indicator
  - Connection strength
  - Last sync time
  - Device name/ID
  
- Main area (2/3 width): Settings & Controls
  - Vibration intensity slider
  - Sensor configuration toggles
  - GPS tracking enable/disable
  - Disconnect button (subtle, secondary style)

### Real-Time Status Indicators
- Animated connection pulse (subtle breathing effect)
- Battery percentage with icon that fills/depletes
- Signal strength bars
- Status badges (Connected/Disconnected/Syncing)

---

## Component Library

### Buttons
**Primary CTA**: Large (px-8 py-4), rounded-2xl, font-medium, with blur effect when over images
**Secondary**: Outlined variant, same size, more subtle
**Tertiary**: Text-only with icon, for less critical actions

### Cards
**Feature Cards**: Rounded-xl, p-8, subtle elevation, hover lift effect (minimal)
**Device Cards**: Rounded-lg, p-6, border treatment, clickable states
**Status Cards**: Rounded-lg, p-4, compact, icon + text layout

### Icons
**Library**: Heroicons (outline style for consistency with wellness aesthetic)
**Usage**: 
- Feature sections: h-12 w-12 to h-16 w-16
- UI elements: h-6 w-6
- Status indicators: h-5 w-5

### Forms & Inputs
**Sliders**: Custom styled range inputs with smooth handle, track visualization
**Toggles**: Large, accessible switch components
**Buttons**: Consistent border-radius (rounded-xl to rounded-2xl)

### Navigation
**Minimal header** (if needed):
- Logo/product name left
- "Connect Device" CTA right
- Sticky on scroll
- Backdrop blur when scrolled

---

## Images Section

**Hero Image**: 
- Large lifestyle photograph (1920x1080 minimum)
- Person wearing device in serene setting (meditation pose, nature, peaceful moment)
- Soft, natural lighting with shallow depth of field
- Device clearly visible on wrist
- Calming environment (morning light, minimalist room, nature)

**Feature Section Images**:
- Device close-up shots showing sensors, vibration motor detail
- In-use scenarios (running with GPS, relaxation session)
- Charging station with USB-C cable
- Macro shots of device materials/craftsmanship

**Product Showcase Image**:
- Isolated product render on clean background
- Multiple angle views for 3D effect
- High resolution, professional lighting

---

## Animation Strategy

**Minimal & Purposeful**:
- Hero: Subtle fade-in on load, gentle device float
- Scroll reveal: Feature cards fade up as they enter viewport (staggered)
- Connection page: Pulsing animation during device search
- Micro-interactions: Button hover states, toggle switches

**Avoid**: Excessive parallax, distracting scroll effects, auto-playing carousels

---

## Responsive Behavior

**Mobile-First Approach**:
- Hero: Stack content, reduce headline size, full-width CTA
- Feature grid: Single column with full-width images
- Connection page: Full-width card, stacked layout for dashboard
- Touch-optimized controls (minimum 44px tap targets)

**Desktop Enhancements**:
- Multi-column layouts engage
- Larger imagery, more breathing room
- Sidebar navigation on connection dashboard