---
paths: controllers/**, routes/**, models/**, middleware/**, utils/**
---
# Code Documentation Rules

## Inline Documentation
- Controllers: Brief JSDoc comment at the top describing what the controller manages
- Models: Comment non-obvious schema fields and virtual properties
- Middleware: Document the middleware signature and what it adds to `req`
- Utils: Document public functions with parameter types and return values

## File Organization
- One controller per domain (bookings, payments, reviews, etc.)
- Route files mirror controller names
- Models follow `*Model.js` naming convention (except legacy `Project.js`)
- Utils are single-purpose modules

## What NOT to Document
- Obvious CRUD operations (the function name is enough)
- Express boilerplate (route setup, middleware chaining)
- Mongoose query chains (self-documenting)

## Architecture Decision Records
When making non-obvious choices, add a comment explaining WHY:
```javascript
// We use protectAny here (not protect) because both artisans
// and customers need to access their own bookings
```
