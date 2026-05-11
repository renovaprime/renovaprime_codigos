# RenovaPrime - Frontend

React admin dashboard for doctors, patients, and administrators. Built with Vite, React, TypeScript, and Tailwind CSS.

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router 7
- Tailwind CSS
- Twilio Video SDK
- Lucide React (icons)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Run

```bash
# Development server (port 5173)
npm run dev

# TypeScript check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/    # React components (ProtectedRoute, etc.)
├── contexts/      # AuthContext for global state
├── layout/        # Layout wrappers
├── pages/         # Role-based pages (admin/, beneficiario/, profissional/)
├── routes/        # React Router configuration
├── services/      # ApiClient (Fetch-based)
├── modules/       # Teleconsultation components
└── types/         # TypeScript interfaces
```

## Roles

- **Admin**: User management, doctor approvals, specialties
- **Doctor**: Appointments, schedule, prescriptions, video calls
- **Patient**: Book appointments, view prescriptions, video calls
