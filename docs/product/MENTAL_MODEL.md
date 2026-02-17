# KalaSetu Mental Model

## What Is KalaSetu?

KalaSetu is a two-sided marketplace that connects traditional Indian artisans -- potters, weavers, painters, woodcarvers, embroiderers, and other craftspeople -- with customers who want to discover and book their services. The name combines "Kala" (art) and "Setu" (bridge): a bridge between traditional art and the modern digital world.

The core problem it solves: skilled artisans often lack digital presence and modern tools to reach customers beyond their local area. KalaSetu gives them a platform to showcase their craft, manage bookings, communicate with clients, and receive payments -- all in one place.

## The Two-Sided Marketplace

There are two distinct participant types on the platform:

| Side       | Who They Are                        | What They Do                                      |
|------------|-------------------------------------|---------------------------------------------------|
| **Artisan**  | Traditional craftspeople and artists | Create profiles, list services, manage bookings, get paid |
| **Customer** | Individuals seeking artisan services | Discover artisans, book services, pay, leave reviews       |

The **platform** sits in the middle, handling authentication, payments, communication, search, and trust (via reviews and verified profiles).

## Core Flow

```
ARTISAN SIDE                         PLATFORM                          CUSTOMER SIDE
============                         ========                          =============

Register                                                               Register
   |                                                                      |
Create Profile                                                         Browse / Search
(bio, location,                    +------------------+                (Algolia-powered
 craft category)                   |                  |                 discovery)
   |                               |    KalaSetu      |                   |
Add Services                       |                  |                View Artisan
(pricing, desc,                    |  - Auth (JWT)    |                Profiles
 images)                           |  - Search        |                   |
   |                               |    (Algolia)     |                Book a Service
Set Availability                   |  - Payments      |                (select service,
(calendar,                         |    (Razorpay)    |                 pick date/time)
 time slots)                       |  - Chat          |                   |
   |                               |    (Stream)      |                Pay
   |                               |  - Video Calls   |                (Razorpay)
   |                               |    (Daily.co)    |                   |
   v                               |  - Notifications |                   v
Receive Booking  <--- booking ---  |    (OneSignal)   |  --- booking ---> Booking
Notification       request flows   |  - Reviews       |    request       Confirmed
   |               through the     |  - Analytics     |    flows            |
Accept/Manage      platform        |    (PostHog)     |    through       Communicate
Bookings                           |  - Admin Panel   |    the platform  (chat, video)
   |                               |                  |                   |
Get Paid                           +------------------+                Leave Review
(Razorpay                                                             (rating + text)
 settlement)                                                              |
   |                                                                   Discover More
Build Portfolio                                                        Artisans
(showcase past                                                            :
 work, collect                                                         (repeat)
 reviews)
   :
(repeat)
```

## Key Mental Model: Digital Presence for Traditional Craft

The central idea is straightforward:

```
Traditional Artisan                    KalaSetu                      Digital Presence
+---------------------+            +------------+            +------------------------+
| - Skilled in craft  |            |            |            | - Searchable profile   |
| - Local reputation  |  -------> |  Platform  |  -------> | - Online portfolio     |
| - No online reach   |            |            |            | - Booking system       |
| - No booking system |            +------------+            | - Payment processing   |
| - Cash-only payments|                                      | - Customer reviews     |
+---------------------+                                      | - Chat & video calls   |
                                                             +------------------------+
```

An artisan who previously relied on word-of-mouth and walk-in customers now has:

1. **Discoverability** -- Customers can find them through search by craft type, location, or name.
2. **Professional presence** -- A profile with portfolio images, service listings, and verified reviews.
3. **Structured bookings** -- Availability management with date/time slots instead of informal scheduling.
4. **Secure payments** -- Digital payment processing through Razorpay instead of cash-only transactions.
5. **Direct communication** -- Real-time chat and video calls with potential and existing customers.
6. **Reputation building** -- A review system that builds trust and attracts new customers over time.

## Data Flow Summary

```
Artisan registers --> creates profile --> adds services --> sets availability
                                                                |
                                                                v
Customer searches --> finds artisan --> views profile --> books service
                                                                |
                                                                v
                                              Payment processed (Razorpay)
                                                                |
                                                                v
                                              Booking confirmed --> notifications sent
                                                                |
                                                  +-------------+-------------+
                                                  |                           |
                                                  v                           v
                                          Artisan fulfills             Customer and artisan
                                          the service                  communicate (chat/video)
                                                  |
                                                  v
                                          Customer leaves review --> artisan portfolio grows
```

## Technical Boundaries

For reference, here is how the mental model maps to the technical stack:

| Concept              | Implementation                                      |
|----------------------|-----------------------------------------------------|
| Artisan auth         | `/api/auth/*` routes, `protect` middleware, JWT in `ks_auth` cookie |
| Customer auth        | `/api/users/*` routes, `userProtect` middleware, JWT in `ks_auth` cookie |
| Either-type auth     | `protectAny` middleware, sets `req.accountType`     |
| Profile & services   | `/api/artisan` (authenticated), `/api/artisans` (public) |
| Search & discovery   | Algolia InstantSearch (frontend), synced from MongoDB |
| Bookings             | `/api/bookings` routes                              |
| Payments             | `/api/payments` routes, Razorpay integration        |
| Reviews              | `/api/reviews` routes                               |
| Chat                 | `/api/chat` routes, Stream Chat SDK                 |
| Video calls          | `/api/video` and `/api/calls` routes, Daily.co SDK  |
| Push notifications   | OneSignal integration                               |
| Admin management     | `/api/admin` routes, separate `admin_token` cookie  |
| Background jobs      | QStash                                              |
| Caching              | Upstash Redis                                       |
| Analytics            | PostHog, Sentry, LogRocket                          |
