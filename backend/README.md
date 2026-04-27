# Medical Office Backend

TypeScript Express API for the medical office frontend.

## Setup

Import `medical_office_schema.sql`, then create `backend/.env` from `.env.example` and fill in your database credentials.

```bash
npm install
npm run dev
```

Default backend port: `3001`.

## API Routes

```txt
GET  /api/health

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

PUT  /api/doctors/:doctorId/profile
PUT  /api/doctors/:doctorId/password

GET    /api/doctors/:doctorId/patients
POST   /api/doctors/:doctorId/patients
PUT    /api/doctors/:doctorId/patients/:patientId
DELETE /api/doctors/:doctorId/patients/:patientId

GET    /api/doctors/:doctorId/services
POST   /api/doctors/:doctorId/services
PUT    /api/doctors/:doctorId/services/:serviceId
DELETE /api/doctors/:doctorId/services/:serviceId

GET    /api/doctors/:doctorId/appointments
GET    /api/doctors/:doctorId/appointments?date=2026-04-27
POST   /api/doctors/:doctorId/appointments
PUT    /api/doctors/:doctorId/appointments/:appointmentId
DELETE /api/doctors/:doctorId/appointments/:appointmentId
```

Patients do not register or log in. Doctors add and manage patients, services, and appointments.

All `/api/doctors/:doctorId/...` routes require this header:

```txt
Authorization: Bearer <token-from-login-or-register>
```

## Seed Login

If you import `medical_office_schema.sql`, it creates the `medical_office_v2` database and this seed doctor:

```txt
email: anna.ivanova@example.com
password: test1234
```

Passwords are stored as plain text for now so the API is easier to test. This should be replaced with password hashing before real use.
