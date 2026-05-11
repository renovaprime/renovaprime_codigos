# RenovaPrime - Backend

REST API for the telemedicine platform. Handles authentication, appointments, doctor scheduling, video consultations, and payment processing.

## Tech Stack

- Node.js + Express
- MySQL + Sequelize ORM
- JWT Authentication
- AWS S3 (file uploads)
- Twilio Video (teleconsultation)
- Asaas (payments)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env`):
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=your_password
DB_NAME=totaldoctor
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your_bucket
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_API_KEY_SID=your_twilio_key
TWILIO_API_KEY_SECRET=your_twilio_secret
ASAAS_API_KEY=your_asaas_key
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3
```

3. Run database migrations:
```bash
npm run migrate
```

4. Seed initial data (roles, specialties, test users):
```bash
npm run seed
```

## Run

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000/api/v1`

## Project Structure

```
src/
├── config/        # Database and S3 configuration
├── models/        # Sequelize models
├── services/      # Business logic
├── controllers/   # Route handlers
├── routes/        # Express routes
├── middlewares/   # Auth, permissions, error handling
├── validators/    # Zod validation schemas
├── utils/         # JWT, response helpers
└── modules/       # Teleconsultation (Twilio)
```
