# Stock Valuation Analysis Tool - Design Guidelines

## Design Approach
**System Selected:** Material Design with Carbon Design influences for data-heavy enterprise application
**Justification:** Financial analysis tools require clarity, data density, and professional credibility. Material Design provides strong visual hierarchy for metrics, while Carbon Design patterns excel at tabular data and dashboard layouts.

## Core Design Principles
1. **Data First:** Information density over white space - users need comprehensive metrics at a glance
2. **Scannable Hierarchy:** Clear visual separation between input, calculation, and results sections
3. **Professional Authority:** Clean, trustworthy interface that instills confidence in financial decisions

## Typography System
- **Primary Font:** Inter or IBM Plex Sans via Google Fonts
- **Headings:** Font weight 600-700, sizes: text-2xl (section headers), text-xl (subsections), text-lg (card headers)
- **Body Text:** Font weight 400, text-base for descriptions, text-sm for labels
- **Data/Numbers:** Font weight 500-600, tabular-nums class for aligned numerical columns
- **Monospace:** JetBrains Mono for ticker symbols and precise data values

## Layout & Spacing System
**Spacing Primitives:** Use Tailwind units of 3, 4, 6, 8, 12 for consistency
- Component padding: p-6
- Section gaps: gap-6 to gap-8
- Card spacing: p-4 to p-6
- Form field spacing: space-y-4
- Dashboard grid gaps: gap-6

**Container Structure:**
- Main container: max-w-7xl mx-auto px-4
- Two-column layout for input/results: grid grid-cols-1 lg:grid-cols-2 gap-8
- Dashboard metrics: grid grid-cols-2 md:grid-cols-4 gap-4

## Component Library

### Navigation & Header
- Top navigation bar with tool title, saved analyses dropdown, and help icon
- Sticky header (sticky top-0) with subtle shadow on scroll
- Height: h-16, horizontal padding: px-6

### Input Form Section
- **Layout:** Single column form with clear field grouping
- **Field Groups:** Border-wrapped sections for "Price & Earnings," "Financials," "Market Ratios," "Growth Metrics"
- **Labels:** text-sm font-medium, positioned above inputs
- **Inputs:** Full-width text fields with number validation, h-10, px-3, rounded border
- **Industry Benchmark Fields:** Separate accordion/collapsible section
- **Action Button:** Full-width "Analyze Stock" button at bottom, h-12, rounded

### Metrics Dashboard
- **Score Card (Primary):** Large prominent card displaying overall score (0-5 scale)
  - Score display: text-6xl font-bold
  - Verdict text: text-xl (Undervalued/Fairly Valued/Overvalued)
  - Recommendation badge: "Strong Buy" / "Hold" / "Avoid"
  
- **Quick Metrics Grid:** 4-column grid (2 columns on mobile) showing:
  - P/E Ratio with industry comparison
  - ROE percentage
  - EPS Growth
  - Debt Level indicator
  - Each metric card: min-h-24, displays value + mini trend indicator

### Ratio Comparison Table
- **Structure:** Striped table with fixed headers
- **Columns:** Ratio Name | Your Stock | Industry Avg | Difference | Status
- **Row Height:** h-12 for data rows
- **Status Indicators:** Icons/badges showing above/below/at benchmark
- **Sortable:** Click headers to sort by any column

### Detailed Breakdown Section
- **Tab Interface:** Switch between "Quantitative Analysis" and "Qualitative Factors"
- **Quantitative Tab:**
  - Weighted scoring breakdown table showing each factor's score (0-5), weight %, contribution
  - Visual progress bars for each factor score
  - Row spacing: space-y-3
  
- **Qualitative Tab:**
  - Checklist grid: 2 columns of evaluation factors
  - Each item: checkbox + label + notes field
  - Categories: Management, Market Position, Innovation, Economic Context

### Charts & Visualizations
- **Horizontal Bar Charts:** For ratio comparisons (your stock vs industry)
- **Radial/Spider Chart:** Multi-factor score visualization
- **Simple Line Charts:** If historical data is added later
- **Chart Container:** Aspect ratio 2:1 or 16:9, padding p-4

### Results Summary Card
- **Position:** Sticky sidebar on desktop (lg:sticky lg:top-20)
- **Content:**
  - Overall verdict with prominent visual treatment
  - Key strengths (bullet list, 3-5 items)
  - Key concerns (bullet list, 3-5 items)
  - Next action recommendation

## Interaction Patterns
- **Form Validation:** Inline error messages below fields, appearing on blur
- **Real-time Calculation:** Results update as user completes form sections
- **Hover States:** Subtle elevation on metric cards
- **Loading States:** Skeleton screens for calculation phase
- **Empty States:** Placeholder content with "Enter stock data to begin analysis" when no data

## Data Density Strategy
- **Above the Fold:** Score card + 4 key metrics visible immediately
- **Scrollable Sections:** Detailed tables and breakdowns below
- **Collapsible Advanced Metrics:** Accordion for less critical ratios
- **Compact Mode Toggle:** Optional condensed view for experienced users

## Accessibility
- All form inputs have associated labels with proper ARIA attributes
- Color-coded results must also include text/icon indicators
- Tables include proper thead/tbody structure with scope attributes
- Keyboard navigation for all interactive elements
- Focus indicators visible on all interactive components

## Icons
**Library:** Heroicons (via CDN)
- Use outline style for navigation and secondary actions
- Use solid style for status indicators and primary actions
- Standard icon sizes: w-5 h-5 for inline icons, w-6 h-6 for standalone icons

## Animations
**Minimal & Purposeful Only:**
- Smooth transitions on tab switches (transition-all duration-200)
- Fade-in for calculation results (opacity transition)
- NO scroll animations, parallax, or decorative motion

## Images
**No hero images required.** This is a data analysis tool - lead directly with functionality. Consider adding:
- Small illustrative icons for empty states
- Optional company logo upload field in input form (displayed in results header)
- Favicon representing stock/chart theme