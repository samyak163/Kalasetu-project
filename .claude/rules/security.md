---
paths: controllers/**, middleware/**, routes/**, utils/razorpay.js, utils/email.js, config/**
---
SECURITY CRITICAL CODE. Web API handling real payments and user data.

AUTH SECURITY:
- JWT in HTTP-only cookies (ks_auth for users/artisans, admin_token for admins)
- Always verify auth middleware is correct for the route (protect/userProtect/protectAny/protectAdmin)
- Never expose password hashes, JWT secrets, or internal tokens in responses
- Rate limiting on auth endpoints (login, register, OTP, password reset)

PAYMENT SECURITY:
- Razorpay webhook signatures MUST be verified before processing
- Payment amounts MUST match booking amounts
- Refund requests MUST validate ownership and payment status
- Never log payment details, card info, or Razorpay secrets

DATA SECURITY:
- Validate all user input with Zod before processing
- MongoDB queries must not allow operator injection ($gt, $ne, $where)
- Cloudinary upload signatures prevent unauthorized uploads
- Never trust client-side data for authorization decisions
- API keys and secrets ONLY in environment variables, never in code or logs
