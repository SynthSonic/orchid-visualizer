# Orchid Visualizer Design System

This document outlines the basic design system for the Orchid Visualizer project.

## Keyboard Design

The Orchid device illustration was redrawn in code from scratch to intentionally differentiate it from the official Telepathic Instruments design, emphasizing that this is a community project and not affiliated with their brand.

## Primary Colors

Gold | <img src="https://via.placeholder.com/15/AD792A/AD792A.png" width="15" height="15"> #AD792A is the visualizer's primary color, chosen for yellow's association with development and tooling— helping to signal the app's role as a third-party utility.

| Color | Preview | Hex Code | Usage |
|-------|---------|----------|-------|
| Black | <img src="https://via.placeholder.com/15/000000/000000.png" width="15" height="15"> | #000000 | Background, keys, bass line |
| White | <img src="https://via.placeholder.com/15/FFFFFF/FFFFFF.png" width="15" height="15"> | #FFFFFF | Outlines, text, indicators |
| Medium Gray | <img src="https://via.placeholder.com/15/888888/888888.png" width="15" height="15"> | #888888 | Labels |
| Dark Gray | <img src="https://via.placeholder.com/15/555555/555555.png" width="15" height="15"> | #555555 | Inactive stroke |
| Darker Gray | <img src="https://via.placeholder.com/15/222222/222222.png" width="15" height="15"> | #222222 | Navigation background |
| Gold | <img src="https://via.placeholder.com/15/AD792A/AD792A.png" width="15" height="15"> | #AD792A | Default color; Navigation |
| Tan/Beige | <img src="https://via.placeholder.com/15/A88B5E/A88B5E.png" width="15" height="15"> | #A88B5E | Keyboard top section |
| Rich Brown | <img src="https://via.placeholder.com/15/8B5522/8B5522.png" width="15" height="15"> | #8B5522 | Chord button highlight, Key highlight base color (ranges in opacity 60-100%) |

## Typography

The Orchid Visualizer uses three primary font families:

- **Geist Sans**: Primary sans-serif font for body text and general UI
- **Geist Mono**: Monospace font for navigation, code, and technical labels
- **Instrument Serif**: Serif font for keyboard display headers

### Font Styles

| Style Name | Font Family | Weight | Size | Letter Spacing | Usage |
|------------|------------|--------|------|----------------|-------|
| Body 1 | Geist Sans | Regular (400) | 16px | -3% | Standard paragraph text |
| Body 1 Emphasized | Geist Sans | Medium (500) | 16px | -3% | Emphasized paragraph text |
| Body 2 | Geist Sans | Regular (400) | 14px | -3% | Secondary text, default app font |
| Body 2 Emphasized | Geist Sans | Medium (500) | 14px | -3% | Emphasized secondary text |
| Heading 1 | Instrument Serif | Regular (400) | 32px | -3% | Large serif font |
| Title 1 | Geist Sans | Medium (500) | 20px | -3% | Paragraph title style |
| Keyboard H1 | Instrument Serif | Regular (400) | 44px | -3% | Large serif font used in keyboard UI |
| Keyboard Labels | Geist Mono | Medium (500) | 16px | -3% | Chord buttons, keys, ui labels |
| Navigation | Geist Mono | Medium (500) | 17px | -3% | Navigation links |
| Footer Body | Geist Sans | Regular (400) | 14px | -3% | Footer text |
| Footer Button | Geist Mono | Medium (500) | 12px | -3% | Footer button text |

### Implementation

Typography is implemented using Tailwind CSS utility classes:

```typescript
// Example usage
<div className="text-body-1">Regular paragraph text</div>
<div className="text-body-1-emphasized">Emphasized paragraph text</div>
<div className="text-body-2">Default app text</div>
```

