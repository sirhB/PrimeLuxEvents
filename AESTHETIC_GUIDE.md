# PrimeLux Events Aesthetic Guide

## Overview
This document outlines the design aesthetic and development patterns used across PrimeLux Events website. The aesthetic combines modern luxury, elegant animations, and intuitive user experience to create a premium feel that reflects the high-end nature of our luxury event rentals.

## Core Design Principles

### 1. **Luxury & Elegance**
- **Typography**: Serif fonts for headings, clean sans-serif for body text
- **Color Palette**: Gold accents (#D4AF37 equivalent), muted backgrounds, sophisticated color schemes
- **Spacing**: Generous whitespace, proper visual hierarchy
- **Quality**: High-resolution images, premium shadows, subtle gradients

### 2. **Modern & Intuitive**
- **Clean Layout**: Full-width sections, proper containers, responsive design
- **User Experience**: Clear navigation, intuitive interactions, smooth transitions
- **Accessibility**: Proper contrast, readable fonts, keyboard navigation

### 3. **Premium Animations**
- **Framer Motion**: Sophisticated animations that guide users through content
- **Performance**: Optimized animations that don't compromise speed
- **Purposeful**: Every animation serves a UX purpose (guidance, feedback, delight)

## Technical Implementation

### Hero Sections
```tsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/20 via-background to-secondary/10">
    {/* Background Pattern */}
    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
    <motion.div
        className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
    />

    {/* Content */}
    <div className="container relative z-10 px-4 md:px-6 text-center">
        {/* Category Badge */}
        <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8">
            <Icon className="h-4 w-4" />
            Category
        </motion.div>

        {/* Main Title */}
        <motion.h1 className="text-6xl md:text-8xl font-serif font-light tracking-tight text-foreground mb-6">
            Title
        </motion.h1>

        {/* Description */}
        <motion.p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed max-w-3xl mx-auto mb-12">
            Description
        </motion.p>

        {/* CTA */}
        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button>Primary Action</Button>
        </motion.div>
    </div>

    {/* Scroll Indicator */}
    <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
        >
            <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1 h-3 bg-muted-foreground/50 rounded-full mt-2"
            />
        </motion.div>
    </motion.div>
</section>
```

### Content Sections
```tsx
<section className="py-24 md:py-32 bg-background">
    <div className="container px-4 md:px-6">
        {/* Section Header */}
        <motion.div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-8">
                <Icon className="h-4 w-4" />
                Section Title
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
                Main Heading
            </h2>
            <p className="text-xl text-muted-foreground font-light">
                Section description
            </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Content items with scroll animations */}
        </div>
    </div>
</section>
```

### Card Components
```tsx
<motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay: index * 0.2 }}
    className="group relative cursor-pointer"
    onClick={onClick}
>
    <div className="relative aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-lg bg-secondary shadow-2xl">
        <Image
            src={imageSrc}
            alt={altText}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Subtle border animation */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/30 rounded-lg transition-colors duration-500" />
    </div>

    {/* Category Badge */}
    <motion.div className="absolute -top-4 -left-4 bg-gold text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg">
        Category
    </motion.div>
</motion.div>
```

### Filter Components
```tsx
<motion.section
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-secondary/30 border-y border-border/40 overflow-hidden"
>
    <div className="container mx-auto px-4 md:px-6 py-8">
        <motion.div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
                <motion.button
                    key={category}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveFilter(category)}
                    className={`px-6 py-3 rounded-full text-sm font-medium uppercase tracking-wider transition-all duration-300 ${
                        activeFilter === category
                            ? "bg-gold text-black shadow-lg shadow-gold/25"
                            : "bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background/80 border border-border/30"
                    }`}
                >
                    {category}
                </motion.button>
            ))}
        </motion.div>
    </div>
</motion.section>
```

## Animation Patterns

### Scroll-Triggered Animations
```tsx
const ref = useRef(null)
const isInView = useInView(ref, { once: true, margin: "-100px" })

<motion.div
    ref={ref}
    initial={{ opacity: 0, y: 50 }}
    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
>
    Content
</motion.div>
```

### Staggered Grid Animations
```tsx
<motion.div
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay: index * 0.2 }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
>
    {items.map((item, index) => (
        <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
        >
            Item content
        </motion.div>
    ))}
</motion.div>
```

### Hover Interactions
```tsx
<motion.div
    whileHover={{ y: -10 }}
    className="group relative"
>
    <div className="transition-transform duration-700 group-hover:scale-110">
        Content with hover scale
    </div>
</motion.div>
```

## Color Palette

### Primary Colors
- **Gold**: `#D4AF37` - Brand accent, buttons, highlights
- **Background**: Theme-aware background colors
- **Foreground**: Theme-aware text colors
- **Secondary**: Muted background variations

### Usage Guidelines
- Gold: CTAs, badges, category labels, active states
- Background variations: Section separators, subtle highlights
- Muted foreground: Secondary text, descriptions
- High contrast: Primary headings, important text

## Typography Scale

### Headings
- **Hero**: `text-6xl md:text-8xl font-serif font-light`
- **Section**: `text-4xl md:text-5xl font-serif`
- **Card**: `text-3xl md:text-4xl font-serif`
- **Small**: `text-2xl md:text-3xl font-serif`

### Body Text
- **Large**: `text-xl md:text-2xl font-light`
- **Medium**: `text-lg md:text-xl font-light`
- **Small**: `text-base font-light`

## Spacing Guidelines

### Section Spacing
- **Hero**: `py-24 md:py-32` (larger for impact)
- **Content**: `py-24 md:py-32` (standard sections)
- **Compact**: `py-16 md:py-24` (smaller sections)

### Component Spacing
- **Cards**: `gap-8` for grids, `p-8` for padding
- **Text**: `mb-6` between headings, `mb-8` for descriptions
- **Buttons**: `gap-4` for button groups, `px-8 py-3` for sizing

## Component Patterns

### Badge Pattern
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium">
    <Icon className="h-4 w-4" />
    Label
</div>
```

### Button Variations
```tsx
// Primary CTA
<Button className="group border-border/50 hover:border-gold hover:bg-gold/5 transition-all duration-300">
    <span>Action</span>
    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
</Button>

// Secondary CTA
<Button variant="outline" className="h-14 px-10 rounded-full border-border/50 hover:border-gold hover:bg-gold/5 hover:text-gold transition-all duration-300 shadow-lg hover:shadow-gold/10">
    <span>Secondary Action</span>
</Button>
```

### Card Pattern
```tsx
<div className="bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-gold/5 border border-border/40 rounded-xl p-8 transition-all duration-300">
    Card content
</div>
```

## Performance Considerations

### Animation Optimization
- Use `viewport={{ once: true }}` to prevent re-triggering
- Set appropriate margins for `useInView` to trigger at right time
- Use `layout` prop sparingly on frequently changing elements
- Prefer `transform` properties over layout-changing properties

### Image Optimization
- Use Next.js Image component with proper sizing
- Implement lazy loading for below-the-fold images
- Use appropriate aspect ratios to prevent layout shift
- Optimize image formats and compression

### Bundle Optimization
- Import only needed Framer Motion components
- Use dynamic imports for heavy components
- Implement proper code splitting for different page sections

## Accessibility Guidelines

### Motion Preferences
- Respect `prefers-reduced-motion` settings
- Provide reduced animation alternatives
- Ensure content is accessible without animations

### Color Contrast
- Maintain WCAG AA compliance for text contrast
- Use gold sparingly to ensure readability
- Provide sufficient contrast for interactive elements

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Maintain logical tab order
- Provide visible focus indicators

## Maintenance Guidelines

### Consistency Checks
- Review new components against this guide
- Ensure animations enhance rather than distract
- Test across different devices and screen sizes
- Validate color contrast and accessibility

### Updates
- Update this guide when establishing new patterns
- Document exceptions and their reasoning
- Include performance impact assessments for new animations

This aesthetic guide ensures PrimeLux Events maintains a consistent, premium, and modern user experience across all pages and components.
