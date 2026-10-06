---
name: ComProva
description: Zero-bottleneck technical recruitment validation.
colors:
  primary: "#1a73e8"
  primary-hover: "#1b66c9"
  primary-bg: "#e8f0fe"
  success: "#137333"
  success-bg: "#e6f4ea"
  warning: "#fbbc04"
  error: "#d93025"
  neutral-bg: "#ffffff"
  neutral-surface: "#f8f9fa"
  neutral-surface-hover: "#f1f3f4"
  text-primary: "#202124"
  text-secondary: "#5f6368"
  border-subtle: "#dadce0"
typography:
  body:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Roboto, system-ui, sans-serif"
    fontWeight: 500
rounded:
  sm: "4px"
  md: "8px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  input-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 14px"
  status-chip:
    backgroundColor: "{colors.success-bg}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: ComProva

## Overview

**Creative North Star: "Modern Material"**

A clean, familiar, and highly accessible interface inspired by Google's Workspace. It prioritizes extreme legibility, standardized outlined inputs, and clear primary actions over stylistic flourishes. It effortlessly accommodates dense data structures and interactive AI tools.

**Key Characteristics:**
- Pure white backgrounds and highly legible sans-serif typography.
- Standardized Material Blue (#1a73e8) for primary actions, active states, and AI accents.
- Highly structured data tables and modal flows.
- Subtle, rounded geometries (4px to 8px radius) that feel safe and predictable.

## Colors

### Primary
- **Material Blue** (#1a73e8): Used for primary buttons, active tabs, floating action buttons, and input focus rings.
- **Faint Blue** (#e8f0fe): Background color for active selections and AI notification areas.

### Semantic
- **Success Green** (#137333): Passed states and active statuses. 
- **Warning Yellow** (#fbbc04): Pending reviews and mid-tier match scores.
- **Error Red** (#d93025): Failed states and validation errors.

### Neutral
- **Primary Text** (#202124): High-contrast dark gray for readability.
- **Secondary Text** (#5f6368): Muted gray for labels, table headers, and helper text.
- **Subtle Border** (#dadce0): Outlines for inputs, cards, tables, and dividers.
- **Surface Gray** (#f8f9fa): Backgrounds for table headers and secondary panels.
- **Pure White** (#ffffff): Main surface backgrounds.

## Typography

**Display Font:** System Sans-Serif (Roboto preferred)
**Body Font:** System Sans-Serif (Roboto preferred)

**Character:** Neutral, objective, and highly legible.

### Hierarchy
- **Body** (400): Standard reading text and input values.
- **Label** (500): Form labels, button text.
- **Micro** (uppercase, tracking-wider): Used for data table column headers.

### Named Rules
**The Legibility Rule.** Text must always prioritize contrast. Secondary text uses a specific mid-gray (#5f6368) that remains accessible on white backgrounds.

## Layout

Surfaces use a centered, constrained max-width column, except for Dashboards which utilize a wide max-w-6xl container to accommodate dense data tables.

## Elevation & Depth

True to modern Google flows, main containers rely on a subtle 1px border (#dadce0) rather than heavy drop shadows. Shadows are reserved exclusively for floating elements.

### Named Rules
**The Flat Border Rule.** Major containers are separated from the background using a 1px solid subtle border rather than elevation shadows. 
**The Z-Index Shadow Rule.** Drop shadows are used only for modals and Floating Action Buttons (FABs) to lift them off the flat page.

## Shapes

Corners are gently rounded. Inputs and buttons use a 4px radius, while larger structural containers (modals, tables, chat windows) use an 8px radius.

## Components

### Buttons & FABs
- **Primary Button:** Material Blue background, pure white text, 4px radius.
- **Floating Action Button (FAB):** Circular (full radius), heavily shadowed, placed bottom right. Material Blue at rest, turning Red when the chat is active (to close).

### Inputs / Fields
- **Style:** Outlined box with a 1px subtle border (#dadce0) and a 4px radius.
- **Focus:** The border becomes 2px thick Material Blue (#1a73e8).

### Data Tables
- **Header:** Gray background (#f8f9fa), uppercase micro text for labels.
- **Rows:** White background, changing to Gray (#f8f9fa) on hover. Separated by 1px borders.

### AI Chat Assistant
- **Header:** Solid Material Blue with white text.
- **Messages:** User bubbles are solid Blue with right alignment. AI bubbles are outlined White with left alignment.

## Do's and Don'ts

### Do:
- **Do** use standard outlined text fields.
- **Do** use semantic colors (Green, Yellow, Red) strictly for states and scores.

### Don't:
- **Don't** use heavy drop shadows on structural containers.
- **Don't** use monospaced fonts for primary labels.
