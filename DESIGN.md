---
name: ComProva
description: Recrutamento técnico sem gargalos.
colors:
  primary: "#1a73e8"
  primary-hover: "#1b66c9"
  neutral-text: "#202124"
  neutral-text-secondary: "#5f6368"
  neutral-border: "#dadce0"
  neutral-border-hover: "#80868b"
  error-main: "#d93025"
  error-bg: "#fce8e6"
  error-border: "#fad2cf"
  error-text: "#c5221f"
  surface-hover: "#f8f9fa"
  surface-selection: "#e8f0fe"
  white: "#ffffff"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontWeight: 500
rounded:
  sm: "4px"
spacing:
  xs: "2px"
  sm: "6px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

# Design System: ComProva

## Overview

**Creative North Star: "The Professional Validator"**

ComProva's visual language is clean, utilitarian, and heavily inspired by Google's Material Design. It prioritizes high legibility, trust, and frictionless task completion. The density is moderate to spacious, ensuring cognitive load remains low during complex recruitment processes. There are no superfluous decorations; every visual choice serves a functional purpose.

**Key Characteristics:**
- Utilitarian and direct
- Trustworthy and professional
- High contrast for readability
- Restrained use of color

## Colors

The palette is highly restrained, leaning heavily on crisp whites and structured grays, using a sharp primary blue exclusively for interaction and emphasis.

### Primary
- **Validator Blue** (#1a73e8): The single interactive accent. Used for primary actions, active focus states, and primary branding.
- **Deep Validator Blue** (#1b66c9): Used exclusively for hover states on primary actions.

### Neutral
- **Text Primary** (#202124): High-contrast dark gray for primary reading text.
- **Text Secondary** (#5f6368): Muted gray for labels, hints, and secondary information.
- **Border Default** (#dadce0): Soft gray for resting input borders and dividers.
- **Border Hover** (#80868b): Darker gray for interactive borders on hover.
- **Surface Hover** (#f8f9fa): Extremely subtle gray background for resting row or button hovers.

### Semantic / Feedback
- **Error Main** (#d93025): Used for validation error text and input borders.
- **Error Banner Text** (#c5221f): Used for high-priority global error messages.
- **Error Banner Background** (#fce8e6): Used as the container background for global errors.
- **Error Banner Border** (#fad2cf): Subtle border for the error container.

### Named Rules
**The One Voice Rule.** The primary blue (#1a73e8) is the only color that should draw the eye. It is never used as a background for large sections (outside of the branded auth panel) and is reserved strictly for actions and active states.

## Typography

**Display Font:** System Sans (ui-sans-serif, system-ui)
**Body Font:** System Sans (ui-sans-serif, system-ui)
**Label Font:** System Sans (ui-sans-serif, system-ui)

**Character:** Completely neutral, relying on the operating system's native sans-serif to guarantee maximum familiarity and readability on any device.

### Hierarchy
- **Display** (Regular, 32px-36px, tight leading): Used for page titles and major marketing headings.
- **Body** (Regular, 14px, normal leading): The workhorse for all inputs and paragraphs.
- **Label** (Medium, 12px, tight leading): Used for form field labels and metadata.

### Named Rules
**The System First Rule.** Do not load web fonts. The system relies entirely on native sans-serif fonts to maximize performance and preserve a utilitarian feel.

## Layout

The spatial model relies on distinct, generous grouping. Forms use a strict 24px (space-y-6) vertical rhythm between field blocks. The grid responds cleanly from 1 column on mobile to 2 columns on desktop for grouped inputs (like Name/Last Name or CNPJ/Phone).

## Elevation & Depth

Planos limpos sem sombras por padrão (Flat-by-default).

### Named Rules
**The Interaction Shadow Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (e.g., subtle shadows on primary buttons when hovered) to avoid visual noise.

## Shapes

Shapes are utilitarian and precise. All interactive elements (buttons, inputs) share a strict, subtle 4px border radius. 

## Components

Utilitarian, with slightly rounded corners (4px) and subtle transitions, conveying firmness and security.

### Buttons
- **Shape:** Soft square (4px)
- **Primary:** Validator Blue background, white text, 10px vertical and 24px horizontal padding.
- **Hover / Focus:** Transitions to Deep Validator Blue with a subtle drop shadow (`shadow-sm`).
- **Disabled:** Drops opacity to 70% and enforces a `not-allowed` cursor.

### Inputs / Fields
- **Style:** Transparent background, 1px Border Default (#dadce0), 4px radius.
- **Focus:** 2px visual focus ring using Validator Blue (#1a73e8).
- **Error:** Border changes to Error Main (#d93025) and focus ring adapts to the same red.

## Do's and Don'ts

### Do:
- **Do** align form inputs perfectly to the grid, ensuring labels are directly tied to their inputs.
- **Do** reserve space for error messages (using absolute positioning or min-heights) to prevent layout shifts during validation.

### Don't:
- **Don't** use shadows on static cards or form containers.
- **Don't** use nested cards. Keep the background clean and white.
