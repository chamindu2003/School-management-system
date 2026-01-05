# 🎨 Modern Design System - Color & Style Guide

## Color Palette

### Primary Colors
```css
--primary-gradient: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%);
--primary-light: #6366F1;
--primary-dark: #4F46E5;
--accent: #FCD34D;
```

### Secondary Colors
```css
--cyan: #06B6D4;
--cyan-gradient: linear-gradient(135deg, #06B6D4 0%, #0891B2 100%);
--green: #10B981;
--green-gradient: linear-gradient(135deg, #10B981 0%, #059669 100%);
--red: #EF4444;
--red-gradient: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
```

### Neutral Colors
```css
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-900: #1F2937;
```

### Status Colors
```css
--success-light: #D1FAE5;
--success-main: #10B981;
--warning-light: #FEF08A;
--warning-main: #FCD34D;
--error-light: #FEE2E2;
--error-main: #EF4444;
--info-light: #DBEAFE;
--info-main: #06B6D4;
```

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
```

### Font Sizes
- **Page Heading**: 3rem (48px) - font-weight: 700
- **Section Heading**: 2.5rem (40px) - font-weight: 700
- **Card Title**: 1.6rem (25px) - font-weight: 700
- **Subsection**: 1.3rem (20px) - font-weight: 700
- **Body**: 1rem (16px) - font-weight: 500
- **Small**: 14px - font-weight: 500
- **Extra Small**: 12px - font-weight: 700

### Font Weights
- Regular: 500
- Semi-bold: 600
- Bold: 700

## Spacing

### Padding
- **Small**: 8px
- **Medium**: 12px
- **Large**: 16px
- **Extra Large**: 20px
- **XXL**: 24px
- **Component**: 2rem (32px)
- **Section**: 2rem - 3rem

### Margins
- **Small**: 8px
- **Medium**: 12px
- **Large**: 16px
- **Extra Large**: 1.5rem
- **Section**: 2rem - 3rem

## Shadows

```css
/* Subtle */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

/* Medium */
box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);

/* Large */
box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);

/* Focus Ring */
box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
```

## Border Radius

```css
--radius-small: 8px;
--radius-medium: 10px;
--radius-large: 12px;
--radius-extra-large: 16px;
```

## Animations & Transitions

### Duration
- Quick: 0.3s
- Standard: 0.5s
- Slow: 0.8s

### Easing
```css
/* Smooth easing for natural motion */
cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Transitions
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
transition: background 0.3s ease;
transition: border-color 0.3s ease;
transition: transform 0.3s ease;
```

## Component Styles

### Buttons

#### Primary Button
```css
background: linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%);
color: white;
padding: 12px 24px;
border-radius: 10px;
font-weight: 600;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
}

&:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button
```css
background: #F3F4F6;
color: #4F46E5;
border: 1.5px solid #E5E7EB;
padding: 12px 24px;
border-radius: 10px;
font-weight: 600;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  background: #E5E7EB;
  border-color: #4F46E5;
  transform: translateY(-3px);
}
```

### Form Controls

#### Input Fields
```css
padding: 12px 16px;
border: 1.5px solid #E5E7EB;
border-radius: 10px;
font-size: 14px;
color: #374151;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  border-color: #D1D5DB;
}

&:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}
```

### Cards & Panels

```css
background: white;
border: 1px solid #E5E7EB;
border-radius: 16px;
padding: 2rem;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

&:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(79, 70, 229, 0.15);
  border-color: #E0E7FF;
}
```

### Tables

#### Header
```css
background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%);
color: white;
padding: 18px 20px;
text-align: left;
font-weight: 700;
letter-spacing: 0.3px;
```

#### Row Hover
```css
&:hover {
  background: #F9FAFB;
  box-shadow: inset 0 0 8px rgba(79, 70, 229, 0.05);
}
```

#### Cell
```css
padding: 18px 20px;
color: #4B5563;
vertical-align: middle;
border-bottom: 1px solid #E5E7EB;
```

### Badges

#### Student Badge
```css
background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
color: #0C4A6E;
border: 1px solid #93C5FD;
padding: 6px 12px;
border-radius: 8px;
font-size: 12px;
font-weight: 700;
```

#### Teacher Badge
```css
background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%);
color: #6B21A8;
border: 1px solid #D8B4FE;
padding: 6px 12px;
border-radius: 8px;
font-size: 12px;
font-weight: 700;
```

#### Admin Badge
```css
background: linear-gradient(135deg, #FEF08A 0%, #FEE450 100%);
color: #78350F;
border: 1px solid #FCD34D;
padding: 6px 12px;
border-radius: 8px;
font-size: 12px;
font-weight: 700;
```

### Messages & Alerts

#### Success Message
```css
background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
border: 1.5px solid #6EE7B7;
color: #047857;
padding: 16px;
border-radius: 12px;
font-weight: 500;
box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
animation: slideIn 0.3s ease;
```

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) {
  /* Extra small devices */
}

/* Tablet */
@media (max-width: 768px) {
  /* Small devices */
}

/* Small Desktop */
@media (max-width: 1024px) {
  /* Medium devices */
}

/* Large Desktop */
@media (min-width: 1440px) {
  /* Extra large devices */
}
```

## Layout Adjustments

### Main Container
- Desktop: `margin-left: 280px` (accounts for sidebar)
- Tablet: `margin-left: 0`
- Mobile: `margin-left: 0`

### Max Width
- Global: `max-width: 1400px`
- Sidebar: `width: 280px`

## Z-Index Scale

```css
--z-sidebar: 1000;
--z-toggle: 1001;
--z-modal: 1050;
--z-tooltip: 1100;
```

## Animation Keyframes

### Slide In
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

**This design system ensures consistency and modern aesthetics across your School Management System! 🎨**
