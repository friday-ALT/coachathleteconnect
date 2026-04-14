# Crystal Clear Pools - Design Guidelines

## Design Approach

**Selected Framework:** Reference-Based Approach inspired by Airbnb's trust-building design + Stripe's clean professionalism, adapted for local service business.

**Rationale:** Pool service requires establishing immediate credibility with homeowners making significant maintenance decisions. Visual appeal of pristine pools combined with straightforward service information creates trust while showcasing expertise.

## Color Palette

**Primary Palette:**
- Primary Blue: #0EA5E9 (Sky blue - clean, professional water association)
- Aqua Accent: #06B6D4 (Cyan - vibrant, refreshing)
- Deep Navy: #0F172A (Trust, professionalism for text/headers)
- Success Green: #10B981 (Confirmation states)

**Neutrals:**
- Background: #FFFFFF
- Light Gray: #F1F5F9 (Section alternation)
- Mid Gray: #64748B (Secondary text)
- Border: #E2E8F0

**Gradient Overlays:**
- Hero overlay: linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(14,165,233,0.5) 100%)

## Typography

**Fonts:** Inter (primary) via Google Fonts + Poppins (headings)

**Scale:**
- Hero Headline: text-5xl md:text-6xl font-bold (Poppins)
- Section Headers: text-3xl md:text-4xl font-bold (Poppins)
- Service Titles: text-xl font-semibold (Poppins)
- Body Text: text-base md:text-lg (Inter)
- Small Text: text-sm (Inter)

## Layout System

**Spacing Units:** 4, 8, 12, 16, 24, 32 (Tailwind scale)

**Section Structure:**
- Hero: min-h-screen with image background
- Content Sections: py-16 md:py-24
- Container: max-w-7xl mx-auto px-6 md:px-12

**Grid Patterns:**
- Services: 2x2 grid (md:grid-cols-2 lg:grid-cols-4)
- About: 2-column split (text left, stats/image right)
- Contact: 2-column (form left, info card right on lg:)

## Component Library

### Hero Section
- Full viewport height with background pool image
- Centered content with gradient overlay
- Company logo (top-left, white version)
- Headline: "Crystal Clear Pools" + tagline "Raleigh's Trusted Pool Experts Since 2010"
- Subheading: "Professional Pool Care for Sparkling Results Year-Round"
- Dual CTA buttons: "Get Free Quote" (primary, blurred bg-white/20 backdrop-blur-md) + "Our Services" (secondary, blurred bg-transparent border-white/40)
- Trust indicator below CTAs: "⭐ 4.9/5 Stars • 500+ Happy Customers • Licensed & Insured"

### About Us Section
**Layout:** Light gray background (bg-slate-50)
- Left column: Heading + 3 paragraphs about company story, expertise, commitment to Raleigh community
- Right column: Stats grid (2x2):
  - "15+ Years Experience"
  - "500+ Pools Serviced"
  - "Licensed & Insured"
  - "Same-Day Emergency Service"
- Each stat: Large number (text-4xl font-bold text-primary) + label below

### Services Section
**Layout:** White background, 4-column grid (mobile stacks)
- Each service card: White bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition
- Icon at top (64x64, aqua background circle)
- Service name: text-xl font-bold mb-4
- 2-3 bullet points of what's included (text-sm)
- "Learn More" link (text-primary font-semibold)

**Services:**
1. Pool Cleaning (vacuum icon)
2. Maintenance & Chemicals (flask icon)
3. Repairs & Equipment (wrench icon)
4. Seasonal Services (calendar icon)

### Contact Section
**Layout:** Gradient background (bg-gradient-to-br from-sky-50 to-cyan-50)
- Section header: "Ready for a Sparkling Pool?"
- Left: Contact form card (white bg, shadow-xl, p-8)
  - Fields: Name, Email, Phone, Service Interest (dropdown), Message (textarea)
  - Submit button: Full width, primary color
- Right: Info card (white bg, shadow-xl, p-8)
  - Business hours
  - Phone: (919) 555-POOL (clickable tel: link)
  - Email: info@crystalclearpools.com
  - Address: Raleigh, NC 27601
  - Google Maps embed placeholder

### Footer
**Layout:** Navy background (bg-slate-900 text-white)
- 3-column grid: Company info, Quick links, Connect
- Newsletter signup form
- Copyright + "Serving Raleigh, Cary, Durham & Wake County"
- Social icons (Facebook, Instagram)

## Images

**Hero Image:**
- Large, high-quality pool background (pristine blue water, modern pool setting)
- Suggested: Crystal clear pool with lounge chairs, sunny day, professional photography
- Dimensions: 1920x1080 minimum, optimized WebP format
- Position: bg-center bg-cover with fixed attachment

**About Section (Optional Enhancement):**
- Team photo or service van image (400x300)
- Positioned in right column above stats grid

**Service Icons:**
- Use Heroicons via CDN (outline style, stroke-2)
- Rendered in SVG format at 64x64 within colored background circles

## Accessibility

- Minimum 44x44px touch targets for all buttons
- WCAG AA contrast ratios (navy text on white = 12.6:1)
- Form labels visible above fields
- Focus states: ring-2 ring-primary ring-offset-2
- Alt text for all images
- Semantic HTML5 sections

## Key Interactions

- Smooth scroll behavior for navigation links
- Form validation with inline error messages (text-red-600)
- Hover states: Service cards lift with shadow increase
- Hero buttons: No hover interaction (shadcn defaults handle this)
- Mobile: Hamburger menu for navigation, stack all grids to single column

**Trust Elements Throughout:**
- BBB accreditation badge in footer
- License number in contact section
- Customer reviews snippet in About section
- Before/after image comparison (add to Services section)

This design balances professional credibility with approachable local service charm, using water-inspired colors and clean layouts to reflect the company's promise of crystal clear results.