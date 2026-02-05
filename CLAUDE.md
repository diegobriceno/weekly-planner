# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 weekly planner application bootstrapped with `create-next-app`. It uses the App Router architecture, TypeScript, React 19, and Tailwind CSS v4.

## Development Commands

### Running the Development Server
```bash
npm run dev
```
The app will be available at http://localhost:3000

### Building for Production
```bash
npm run build
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
  - Examples: `EventCard`, `CalendarGrid`, `WeeklyView`, `CalendarHeader`

- **Container Components**: Focus on how things work
  - Handle business logic, state management, and side effects
  - Fetch data and manage application state
  - Pass data and callbacks to presentational components
  - Example: `MonthlyPlanner` (main container orchestrating the calendar)

### Service Layer Architecture

**Service-Based Architecture**: Business logic is decoupled from components using a service layer:

- **Services** (`services/` directory): Encapsulate business logic and external interactions
  - `services/events/api.ts`: API calls for event CRUD operations
  - `services/events/operations.ts`: Pure functions for event state transformations
  - `services/events/recurring.ts`: Recurring event expansion and merging logic
  - `services/calendar/`: Date/time utilities and calendar calculations
  - `services/dragDrop/`: Drag-and-drop validation and time calculations
  - Should be framework-agnostic and reusable
  - Export pure functions or class-based services

- **Separation of Concerns**:
  - Components handle UI and user interactions
  - Containers orchestrate data flow
  - Services contain all business logic
  - This enables easier testing, maintenance, and reusability

### Event System Architecture

**Two-Tier Event System**: Events are stored and managed in two distinct categories:

- **One-off Events** (`StoredEvents.byDate`):
  - Stored as `MonthEvents` (map of date strings to Event arrays)
  - Each event has a unique ID, date, name, category, and optional start/end times
  - Can be moved via drag-and-drop to different dates/times

- **Recurring Events** (`StoredEvents.recurring`):
  - Stored separately as `RecurringEvent[]` with recurrence rules
  - Two recurrence types: `day_of_month` (e.g., 15th of every month) and `day_of_week` (e.g., every Monday)
  - Expanded dynamically into instances for visible dates using `expandRecurringEventsForDates()`
  - Instances have `seriesId` pointing to the parent recurring event
  - Instances cannot be moved individually; edits/deletes affect the entire series

**Event Data Flow**:
1. Data stored in `data/events.json` via `lib/eventStorage.ts`
2. API routes (`app/api/events/`) handle CRUD operations
3. `MonthlyPlanner` fetches via `services/events/api.ts`
4. Recurring events expanded for current view (month or week)
5. One-off and expanded recurring events merged via `mergeEvents()`
6. Events filtered by disabled categories before rendering

### Drag-and-Drop System

**Drag-and-Drop Architecture**:
- Only one-off events can be dragged (recurring instances are immutable)
- Monthly view: Events can be moved to different dates
- Weekly view: Events can be moved to different dates AND times
- Time-based drops preserve event duration and validate against 10 PM limit
- Validation logic in `services/dragDrop/helpers.ts`
- Optimistic UI updates with API persistence

### Next.js App Router Structure
- **`app/`**: Main application directory using Next.js App Router
  - `layout.tsx`: Root layout with Geist fonts configuration and global metadata
  - `page.tsx`: Home page that renders `MonthlyPlanner`
  - `api/events/route.ts`: GET (all events) and POST (create event) endpoints
  - `api/events/[id]/route.ts`: PUT (update) and DELETE endpoints
  - `globals.css`: Global Tailwind CSS styles

### Data Storage
- Events persisted to `data/events.json` in the project root
- `lib/eventStorage.ts` handles file I/O with backwards compatibility
- Supports migration from old `MonthEvents` format to new `StoredEvents` format

### TypeScript Configuration
- Path alias `@/*` maps to the root directory
- Strict mode enabled
- Target: ES2017
- JSX mode: `react-jsx` (React 19)

### Styling
- Tailwind CSS v4 with PostCSS
- Custom fonts: Geist Sans and Geist Mono loaded via `next/font/google`
- Dark mode support enabled
- Category-based color coding (blue for work, green for projects, etc.)

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
- **lucide-react**: Icon library for UI components
- **framer-motion**: Animation library for smooth UI transitions and interactions
