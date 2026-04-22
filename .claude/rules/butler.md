---
paths: "kalasetu-frontend/src/**"
---
# Marketplace UX Principles

KalaSetu connects traditional artisans with customers. The platform must feel trustworthy, accessible, and professional.

## Design Principles

| Do This | Not This |
|---------|----------|
| Clear artisan profile with trust signals | Cluttered profile with every field visible |
| Simple booking flow (3 steps max) | Multi-step wizard with unnecessary fields |
| Meaningful error messages for users | Raw error codes or technical jargon |
| Loading states that show progress | Blank screens or infinite spinners |
| Mobile-first responsive layouts | Desktop-only designs |

## Enforcement Rules
1. **Booking flow is sacred.** Browse → Book → Pay must be friction-free.
2. **Trust indicators visible.** Verification badges, ratings, review counts always visible on artisan cards.
3. **Dual user awareness.** Every user-facing feature must consider both artisan and customer perspectives.
4. **Search is king.** Algolia search must be prominent and fast. Faceted filtering always accessible.
5. **Payment confidence.** Razorpay checkout must feel secure. Show booking details during payment.
6. **Communication pathways clear.** Chat and video call options visible after booking.
