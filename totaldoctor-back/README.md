# TotalMedi Backend

Telemedicine platform with appointment scheduling, teleconsultation, and role-based access control (RBAC).

## Features

- User authentication with JWT
- Role-based access control (Admin, Doctor, Patient)
- Doctor registration and approval workflow
- Appointment scheduling with conflict detection
- PeerJS-based teleconsultation room management
- Prescription management
- Comprehensive audit logging

## Tech Stack

- Node.js + Express
- MySQL database
- Sequelize ORM
- JWT authentication
- Bcrypt password hashing
- Zod validation

## Project Structure

```
src/
├── config/          # Database configuration
├── models/          # Sequelize models
├── services/        # Business logic layer
├── controllers/     # Request handlers
├── routes/          # API routes
├── middlewares/     # Auth, permission, error handling
├── validators/      # Zod validation schemas
├── utils/           # Utility functions
├── database/        # Migration and seed scripts
└── index.js         # Application entry point
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=totalmedi
DB_PORT=3306

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=8h

NODE_ENV=development
PORT=3000
```

3. Create the MySQL database and run the DDL from `database/ddl.txt`

4. Seed the database with initial data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication
- `POST /auth/login` - User login (public)

### Doctors
- `POST /doctors/register` - Register as doctor (public)
- `POST /doctors/schedules` - Configure schedule (requires approval)
- `GET /doctors/appointments` - List doctor appointments

### Patients
- `POST /patients` - Create patient account (public)
- `GET /patients/appointments` - List patient appointments

### Appointments
- `POST /appointments` - Create appointment
- `POST /appointments/:id/start` - Start appointment
- `POST /appointments/:id/finish` - Finish appointment
- `POST /appointments/:id/cancel` - Cancel appointment

### Teleconsultation
- `GET /teleconsult/:appointmentId/access` - Get room access

### Prescriptions
- `POST /prescriptions/:appointmentId` - Emit prescription
- `GET /prescriptions/patient` - List patient prescriptions

### Admin
- `GET /admin/doctors/pending` - List pending doctors
- `POST /admin/doctors/:id/approve` - Approve doctor
- `POST /admin/doctors/:id/reject` - Reject doctor
- `GET /admin/appointments` - List all appointments
- `POST /admin/specialties` - Create specialty
- `PUT /admin/specialties/:id` - Update specialty

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Roles and Permissions

### Admin
- Approve/reject doctor registrations
- View all appointments
- Manage specialties

### Doctor
- Configure schedule
- View own appointments
- Start/finish appointments
- Emit prescriptions

### Patient
- Create appointments
- View own appointments
- Cancel appointments
- View prescriptions

## Database Tables

- roles
- permissions
- role_permissions
- users
- doctors
- patients
- specialties
- doctor_specialties
- doctor_schedules
- doctor_schedule_blocks
- appointments
- teleconsult_rooms
- prescriptions
- appointment_logs

## License

Private
