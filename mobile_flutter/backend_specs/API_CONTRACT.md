# Backend API Contract (serverless)

This file describes the minimal HTTP contract the mobile app expects. The app ships with a mock implementation; replace with a serverless backend later.

POST /payments/create-intent

- Request: { serviceId, depositAmount (cents), appointmentDraft }
- Response: { clientSecret, appointmentId }

POST /payments/webhook

- Stripe webhook events. Server should verify signature, update appointment status (confirmed/canceled).

POST /notify/sms

- Request: { to, message }
- Response: { ok: true }

POST /notify/email

- Request: { to, subject, html }
- Response: { ok: true }

GET /services

- Response: [ {id,name,price?,time,requiresDeposit?,depositAmount?} ]

POST /admin/services

- Auth: admin-only
- Request: { action: 'create'|'update'|'delete', service }
- Response: { ok: true }

POST /admin/auth/login

- Request: { email }
- Response: { sessionToken }
