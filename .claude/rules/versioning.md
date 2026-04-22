# Versioning & Shipping Philosophy

**V1 is production. V2 is future scope.**

## Version Scope
| Version | What It Contains | Status |
|---------|-----------------|--------|
| **V1** | Full marketplace: auth, profiles, bookings, payments, chat, video, reviews, admin panel | Production (current) |
| **V2** | Testing, commissions, disputes, TypeScript, i18n, mobile app | Future (not started) |

## V2 Priorities (Ordered)
1. Backend test suite — Foundation for everything else
2. Commission system — Revenue model
3. Dispute resolution — Trust at scale
4. TypeScript migration — Code quality
5. Multi-language — Market reach
6. Mobile app — User accessibility

## Key Principles
- V1 is complete and deployed. Don't break it.
- V2 features should not be mixed into V1 code without explicit decision.
- Every change to V1 must maintain backward compatibility with existing data.
- Test suite (V2 priority #1) can start alongside V1 maintenance.

## What KalaSetu Is NOT
- Not a general-purpose e-commerce platform (artisan services only)
- Not a social network (communication is booking-centric)
- Not a freelancing platform (focused on traditional Indian artisans)
