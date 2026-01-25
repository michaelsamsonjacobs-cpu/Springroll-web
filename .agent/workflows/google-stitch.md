---
description: Generate UI designs from text prompts or wireframes using Google's AI design tool
---

# Google Stitch UI Design Workflow

Generate mobile and web UI designs using AI, then export to Figma or HTML/CSS code.

## Overview

[Stitch](https://stitch.withgoogle.com/) is Google Labs' AI-powered UI design tool powered by Gemini 2.5. It transforms text prompts or uploaded wireframes into polished, editable UI designs.

---

## Step 1: Access Stitch

1. Go to [stitch.withgoogle.com](https://stitch.withgoogle.com/)
2. Sign in with your Google account
3. Choose platform: **Web** or **Mobile**

---

## Step 2: Choose Design Mode

| Mode | Model | Generations/Month | Best For |
|------|-------|-------------------|----------|
| **Standard** | Gemini 2.5 Flash | 350 | Quick iterations, text prompts |
| **Experimental** | Gemini 2.5 Pro | 50 | Wireframe/sketch to UI |

---

## Step 3: Write Effective Prompts

### ❌ Bad Prompt
```
Make a food app
```

### ✅ Good Prompt
```
Create a mobile webpage for a vegan food delivery service.
Include:
- Hero section with discount banner
- Bottom navigation bar
- Horizontal scroll for "Trending Meals"
- Light green and white color scheme
- Rounded card components
- Search bar at top
```

### Prompt Best Practices

- **Define screen type**: Homepage, login, dashboard, settings
- **List UI components**: Cards, buttons, nav bars, charts, forms
- **Specify layout**: Grid, stacked, scrollable, centered
- **Describe style**: Dark theme, rounded corners, glassmorphism
- **Include brand colors**: "Use #4A90E2 as primary color"

---

## Step 4: Use Experimental Mode (Wireframe to UI)

1. Switch to **Experimental** mode
2. Upload your wireframe (sketch, screenshot, or rough drawing)
3. Add guiding prompt:

```
Generate a mobile crypto dashboard UI based on the uploaded wireframe.
Use a dark theme with:
- Rounded cards
- Portfolio chart section
- News feed area
- Bottom navigation
- Subtle gradient backgrounds
```

> [!TIP]
> Cleaner wireframes = better results. Messy sketches may be misinterpreted.

---

## Step 5: Iterate and Refine

Use the chat interface to make specific changes:

```
Make the buttons rounded with 12px border radius
```

```
Change the header to use a gradient from #667eea to #764ba2
```

```
Add a floating action button in the bottom right corner
```

```
Replace the hero image with a 3D illustration style
```

**Refinement Strategy:**
1. Start with high-level concept
2. Refine screen by screen
3. Make 1-2 specific adjustments per prompt
4. Reference specific elements: "primary button on sign-up form"

---

## Step 6: Export Your Design

### Export to Figma (Standard Mode only)
1. Click **Copy to Figma**
2. Open Figma and paste (Cmd/Ctrl + V)
3. Edit, refine, and add to your design system

### Export HTML/CSS Code
1. Click **Export Code**
2. Download the generated HTML/CSS
3. Use as starting point for development

> [!NOTE]
> Exported code is static HTML/CSS - no JavaScript logic or interactivity.

---

## Workflow Integration

### For New Projects
1. **Ideate in Stitch** → Generate 5-10 variations quickly
2. **Export to Figma** → Refine and create design system
3. **Export HTML/CSS** → Use as reference for implementation
4. **Build in code** → Implement with React/Vue/etc.

### For Existing Projects
1. **Screenshot current UI** → Upload to Experimental mode
2. **Prompt for redesign** → "Modernize this dashboard with glassmorphism"
3. **Export and compare** → A/B test designs with team

---

## Example Prompts by Screen Type

### Landing Page
```
Create a SaaS landing page for an AI writing assistant.
Include hero with headline, subheadline, and CTA button.
Add features section with 3 icon cards.
Include testimonials carousel and pricing table.
Use dark mode with purple accent colors.
```

### Dashboard
```
Design a project management dashboard.
Include:
- Sidebar navigation with icons
- Top bar with search and user avatar
- Grid of project cards with progress bars
- Quick stats row with revenue, tasks, team size
- Recent activity feed
Use professional blue and gray palette.
```

### Mobile App
```
Design a fitness tracking mobile app home screen.
Include:
- Circular progress ring for daily goal
- Horizontal scroll of workout categories
- Today's schedule with time blocks
- Bottom navigation: Home, Workouts, Stats, Profile
Use energetic orange and dark background.
```

### Settings Page
```
Create a settings page for a web application.
Include:
- Profile section with avatar upload
- Toggle switches for notifications
- Dropdown for language selection
- Danger zone with delete account button
- Save changes button
Clean minimal style with clear section dividers.
```

---

## Limitations

| Limitation | Workaround |
|------------|------------|
| Static designs only | Add interactivity in Figma or code |
| Figma export only in Standard mode | Use HTML export in Experimental |
| Prompt-sensitive output | Be specific and iterate |
| Monthly generation limits | Use Standard for iterations, Experimental for polish |

---

## Tips for Best Results

1. **Be specific** — Vague prompts = generic designs
2. **Use UI vocabulary** — "card layout", "floating action button", "bottom sheet"
3. **Reference popular apps** — "In the style of Spotify's Now Playing screen"
4. **Specify spacing** — "generous whitespace", "compact layout"
5. **Include micro-interactions** — "hover state on buttons", "active tab indicator"
