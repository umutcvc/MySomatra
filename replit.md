# ZenWear - Neural Therapy Wearable Device

## Overview

ZenWear is a wellness wearable device that provides neural therapy through precision vibrations, motion tracking, and GPS functionality. The application consists of a marketing website showcasing the device features and a web-based dashboard for connecting and controlling the device via Web Bluetooth API. Users can track activities, manage therapy sessions, maintain wellness journals, and monitor device metrics in real-time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing with two main routes:
- `/` - Marketing homepage showcasing device features
- `/connect` - Device connection and dashboard interface

**UI Component System**: shadcn/ui (New York style variant) built on Radix UI primitives with Tailwind CSS for styling. Components follow a consistent design system with dark mode as default, using CSS variables for theming.

**State Management**: 
- TanStack Query (React Query) for server state management and API caching
- React hooks for local component state
- Custom `useBluetooth` hook encapsulating Web Bluetooth API logic

**Design Philosophy**: Premium wellness aesthetic inspired by Apple's minimalist approach combined with calming wellness app designs. Emphasizes generous whitespace, elegant simplicity, and sensory connection through visual metaphors.

### Backend Architecture

**Runtime**: Node.js with Express.js server framework using ESM modules.

**Development vs Production**:
- Development: Vite middleware integration for HMR (Hot Module Replacement)
- Production: Serves pre-built static assets from `dist/public`

**API Structure**: RESTful API endpoints under `/api` prefix:
- `/api/journal` - Journal entry CRUD operations
- `/api/tasks` - Task management
- `/api/therapy-sessions` - Therapy session tracking
- `/api/activity-logs` - Activity data storage
- `/api/device-connections` - Device connection metadata

**Data Validation**: Zod schemas defined in shared schema file, used for both runtime validation and TypeScript type inference via `drizzle-zod`.

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect, configured for Neon serverless database.

**Database Schema**:
- `users` - User authentication (username, password)
- `journal_entries` - Wellness journal entries with mood tracking
- `tasks` - Task/goal management with completion status
- `therapy_sessions` - Therapy session records (mode, intensity, duration)
- `activity_logs` - Motion sensor and activity classification data
- `device_connections` - Device pairing and connection history

**Connection**: Uses `@neondatabase/serverless` package with WebSocket support for Neon's serverless Postgres, configured via `DATABASE_URL` environment variable.

### External Dependencies

**Web Bluetooth API**: Core technology for device connectivity. Enables browser-based communication with the ZenWear hardware using custom GATT services:
- `6e400001-b5a3-f393-e0a9-e50e24dcca9e` - Main ZenWear service
- IMU data characteristics for accelerometer/gyroscope readings
- Battery level monitoring
- TX/RX characteristics for bidirectional command/data flow

**GPS Functionality**: Integrated into the device hardware, tracked via device connections and activity logs. Uses GPS data for outdoor activity mapping and location tracking.

**Third-Party Services**:
- Neon Database - Serverless PostgreSQL hosting
- Google Fonts - Inter font family for typography
- Radix UI - Accessible component primitives

**Build Tools**:
- Vite - Frontend build tool and dev server
- esbuild - Backend bundling for production
- TypeScript - Type safety across the stack
- Tailwind CSS - Utility-first styling

**Device Firmware Integration**: The attached assets contain MicroPython code for ESP32-C3 microcontroller, implementing:
- BNO08X IMU sensor library for 9-axis motion tracking
- Bluetooth PWM controller for vibration motor control
- GPS NMEA sentence parsing (MicropyGPS)
- Battery voltage monitoring via ADC
- TinyML activity classification at the edge

**Note**: While the application is structured to work with Drizzle ORM, it may not currently be using PostgreSQL specifically. The database can be provisioned later if needed.