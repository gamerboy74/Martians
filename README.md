# Tournament Admin Platform

A comprehensive tournament management system built with React, TypeScript, and Supabase.

## Features

- Tournament Management
- Team Registration
- Match Scheduling
- Real-time Updates
- Admin Dashboard
- User Role Management
- Responsive Design

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Zustand (State Management)
- React Router
- Lucide Icons

## Prerequisites

- Node.js 18+ 
- npm 9+
- Supabase Account

## Getting Started

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with your Supabase credentials
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/     # React components
├── context/       # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions and configurations
├── pages/         # Page components
├── services/      # API services
├── stores/        # Zustand stores
└── types/         # TypeScript types
```

## Database Schema

The application uses the following main tables:

- `tournaments` - Tournament information
- `registrations` - Team registrations
- `matches` - Match schedules and results
- `user_roles` - User role management

## Authentication

The application uses Supabase Authentication with email/password login. User roles are managed through the `user_roles` table.

## Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your hosting provider

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Development Guidelines

1. Follow TypeScript best practices
2. Use Tailwind CSS for styling
3. Implement proper error handling
4. Add logging for debugging
5. Follow React best practices and hooks rules
6. Use Zustand for state management
7. Implement proper form validation with Zod

## Testing

Run tests with:
```bash
npm run test
```

## License

MIT License