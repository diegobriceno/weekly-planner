# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 meal planner application bootstrapped with `create-next-app`. It uses the App Router architecture, TypeScript, React 19, and Tailwind CSS v4.

## Development Commands

### Running the Development Server
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Building for Production
```bash
npm build
```

### Starting Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Architecture

### Component Architecture Pattern

**Container and Presentational Components**: This project follows the separation between container and presentational components:

- **Presentational Components**: Focus on how things look
  - Only receive data via props
  - Are mostly stateless (or contain only UI state)
  - Are highly reusable
  - Example: Buttons, Cards, Lists, Forms

- **Container Components**: Focus on how things work
  - Handle business logic, state management, and side effects
  - Fetch data and manage application state
  - Pass data and callbacks to presentational components
  - Example: Data fetchers, state managers, route handlers

### Service Layer Architecture

**Service-Based Architecture**: Business logic is decoupled from components using a service layer:

- **Services** (`services/` directory): Encapsulate business logic and external interactions
  - API calls and data fetching
  - Business rules and calculations
  - Data transformations and validation
  - Integration with external systems
  - Should be framework-agnostic and reusable
  - Export pure functions or class-based services

- **Separation of Concerns**:
  - Components handle UI and user interactions
  - Containers orchestrate data flow
  - Services contain all business logic
  - This enables easier testing, maintenance, and reusability

### Next.js App Router Structure
- **`app/`**: Main application directory using Next.js App Router
  - `layout.tsx`: Root layout with Geist fonts configuration and global metadata
  - `page.tsx`: Home page component
  - `globals.css`: Global Tailwind CSS styles

### TypeScript Configuration
- Path alias `@/*` maps to the root directory
- Strict mode enabled
- Target: ES2017
- JSX mode: `react-jsx` (React 19)

### Styling
- Tailwind CSS v4 with PostCSS
- Custom fonts: Geist Sans and Geist Mono loaded via `next/font/google`
- Dark mode support enabled

### ESLint Configuration
- Uses Next.js ESLint presets (core-web-vitals and TypeScript)
- Configured in `eslint.config.mjs` using flat config format
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Key Dependencies

- **Next.js 16.1.4**: React framework with App Router
- **React 19.2.3**: Latest React with improved hooks and Server Components
- **TypeScript 5**: Static typing
- **Tailwind CSS 4**: Utility-first CSS framework
- **ESLint 9**: Linting with Next.js configs
