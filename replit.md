# Stock Valuation Analysis Tool

## Overview

A professional stock analysis web application that helps users evaluate whether stocks are undervalued, fairly valued, or overvalued. The tool performs comprehensive fundamental analysis by calculating weighted scores across multiple financial metrics including P/E ratios, profitability metrics, growth indicators, and debt levels. Users input financial data for a stock, and the application generates a detailed valuation report with an overall score (0-5 scale), verdict, recommendation, and breakdown of individual factor contributions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite as the build tool and development server.

**Routing**: Uses `wouter` for lightweight client-side routing with a simple route structure (Home page and 404 fallback).

**State Management**: Client-side calculations only - no external state management library needed. Analysis results are stored in local component state using React's `useState`. Form state is managed by `react-hook-form` with Zod schema validation.

**UI Component Library**: Shadcn UI with Radix UI primitives, styled using Tailwind CSS. Components follow the "New York" style variant with a neutral color scheme and extensive use of CSS custom properties for theming.

**Design System**: Material Design with Carbon Design influences optimized for data-heavy financial displays. Uses Inter/IBM Plex Sans for primary typography and JetBrains Mono for numerical data. Supports light and dark themes with localStorage persistence.

**Form Validation**: Zod schemas defined in `shared/schema.ts` for type-safe validation. The `stockAnalysisSchema` validates all 20+ input fields including stock price, earnings metrics, financial ratios, growth rates, and industry benchmarks.

**Calculation Logic**: All stock valuation calculations happen client-side in `client/src/pages/Home.tsx`. The algorithm computes weighted scores for seven factors (P/E vs Industry, P/BV, ROE, EPS Growth, Debt Level, Cash Flow, Dividend Yield) with predefined weights summing to 1.0. The overall score determines the verdict (Undervalued < 2.5, Fairly Valued 2.5-3.5, Overvalued > 3.5) and recommendation (Strong Buy, Buy, Hold, Avoid, Sell).

### Backend Architecture

**Server Framework**: Express.js with TypeScript in ESM module format.

**Development Setup**: Vite middleware mode for HMR during development. Production builds bundle the server separately using esbuild.

**API Strategy**: Currently no backend API routes are implemented - all calculations are client-side. The `server/routes.ts` file provides a structure for future API endpoints if needed. The storage interface exists as a placeholder but is not actively used.

**Session Management**: Infrastructure for `connect-pg-simple` session store is present in dependencies but not actively configured, suggesting potential for future user authentication features.

### Data Storage Solutions

**Database ORM**: Drizzle ORM configured for PostgreSQL with schema definitions in `shared/schema.ts`.

**Database Provider**: Neon serverless PostgreSQL (`@neondatabase/serverless` driver).

**Current Storage Status**: No database operations are currently implemented. The application performs all calculations client-side without persisting any data. The storage layer is prepared for future features like saving analyses, user accounts, or historical stock data.

**Schema Structure**: While not actively used, the schema includes TypeScript interfaces for `StockAnalysis` (input data) and `AnalysisResult` (output data with scores, ratios, comparisons, strengths, and concerns).

### External Dependencies

**UI Component Libraries**:
- Radix UI primitives (accordion, dialog, dropdown, tabs, tooltips, etc.)
- shadcn/ui component collection
- Lucide React for icons
- Embla Carousel for carousel functionality

**Styling**:
- Tailwind CSS with PostCSS
- class-variance-authority for component variants
- clsx and tailwind-merge for className utilities

**Forms & Validation**:
- react-hook-form for form state management
- Zod for schema validation
- @hookform/resolvers for integration

**Data Fetching**:
- TanStack Query (React Query) configured but not actively used since no API calls are made
- Custom `apiRequest` wrapper function available in `lib/queryClient.ts`

**Development Tools**:
- Replit-specific plugins for development banner, cartographer, and runtime error overlay
- TypeScript with strict mode enabled
- ESLint and Prettier (inferred from typical setup)

**Fonts**: Google Fonts integration for Inter, IBM Plex Sans, DM Sans, Fira Code, Geist Mono, and Architects Daughter.

**Build & Bundling**:
- Vite for frontend builds
- esbuild for server bundling
- React plugin for JSX transformation