# Artisan Offering System Redesign

> Date: 2026-02-18
> Status: Approved
> Approach: Evolve ArtisanService (single model with type discriminator)

## Problem Statement

KalaSetu currently treats all artisans identically. A potter selling physical pottery bowls and a plumber doing house calls use the exact same `ArtisanService` model with `price` + `durationMinutes`. There is:

- No distinction between product sellers and service providers
- No specialization depth (a tailor who does blouses vs suits looks identical)
- No product inventory, stock, variants, or shipping
- No service packages with "what's included" clarity
- No custom order workflow

Users cannot understand which artisan does what, and artisans cannot properly represent their offerings.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Product artisan flow | Hybrid: buy ready + custom orders | Real artisans do both |
| Service specialization | UC-style packages with included items | Clarity on scope and pricing |
| Search UX | Category-first with smart routing | Category type determines UI style |
| Artisan scope | Can be both product + service | Flexibility for real-world artisans |
| Profile page | Compact header + offerings-first | Action-oriented, bio in About tab |
| Categories | Tag existing with type field | Minimal disruption to existing data |
| Artisan dashboard | Guided wizard per offering type | Complex forms need step-by-step |
| Data architecture | Evolve ArtisanService (Approach A) | Migration safety, search simplicity |

## Section 1: Data Model Changes

### Category Model — add `type` field

```
Category (updated)
  + type: 'product' | 'service' | 'both'

  Mappings:
    Handicrafts        -> type: 'product'
    Home Services      -> type: 'service'
    Food & Catering    -> type: 'both'
    Clothing/Tailoring -> type: 'both'
    Wellness & Beauty  -> type: 'service'

  + suggestedProducts: [{ name, description }]   // for product/both categories
  (existing suggestedServices stays for service/both categories)
```

### ArtisanOffering Model (evolved from ArtisanService, same collection)

```
COMMON FIELDS (all types):
  artisan: ObjectId (ref Artisan)
  category: ObjectId (ref Category)
  categoryName: String (denormalized)
  offeringType: 'product' | 'service_package' | 'custom_order'
  name: String (required)
  description: String
  images: [String] (Cloudinary URLs)
  price: Number
  currency: String (default 'INR')
  isActive: Boolean
  createdAt, updatedAt

PRODUCT-SPECIFIC (offeringType = 'product'):
  stock: Number (0 = out of stock)
  variants: [{
    name: String,           // e.g., "Size", "Color"
    options: [{
      label: String,        // e.g., "Large", "Blue"
      priceAdjustment: Number,
      stock: Number
    }]
  }]
  shipping: {
    type: 'pickup' | 'delivery' | 'both',
    cost: Number,
    estimatedDays: Number
  }
  dimensions: { length, width, height, weight }
  madeToOrder: Boolean

SERVICE_PACKAGE-SPECIFIC (offeringType = 'service_package'):
  durationMinutes: Number
  includedItems: [{ text: String }]
  excludedItems: [{ text: String }]
  maxBookingsPerDay: Number
  requiresHomeVisit: Boolean
  serviceArea: String

CUSTOM_ORDER-SPECIFIC (offeringType = 'custom_order'):
  startingPrice: Number
  typicalTimeline: String
  portfolioSamples: [String]
  consultationRequired: Boolean
```

### Artisan Model — minor additions

```
  + artisanTypes: ['product_seller', 'service_provider']
  + acceptsCustomOrders: Boolean (default false)
```

### Booking Model — minor update

```
  service -> offering: ObjectId (ref ArtisanOffering)
  + offeringType: String (denormalized)
  + quantity: Number (default 1)
  + shippingAddress: { addressLine1, addressLine2, city, state, postalCode }
  + variantSelections: [{ name, option }]

  (startTime/endTime stay for service bookings)
  (for product orders: startTime = order date, endTime = estimated delivery)
```

## Section 2: Search & Browse Redesign

### Homepage — Category-First Entry

- Category cards shown prominently with type badge (Products/Services/Both)
- Trending Products section (product cards: image, name, price, artisan)
- Popular Services section (package cards: name, price, rating, book)
- Featured Artisans section (artisan mini-cards)
- Search bar with smart autocomplete

### Category Browse — Smart Routing

**category.type = 'product'** (e.g., Handicrafts):
- Sub-categories from `suggestedProducts`
- Product grid layout (Swiggy/marketplace style)
- Filters: Price range, Rating, In Stock
- Custom Orders section at bottom

**category.type = 'service'** (e.g., Home Services):
- Service types from `suggestedServices`
- Click service type -> see packages from multiple artisans
- Package list layout (Urban Company style) with included/excluded items
- Filters: Rating, Price range, Near me

**category.type = 'both'** (e.g., Clothing & Tailoring):
- Tab toggle: [Products] [Services]
- Each tab renders its respective layout

### Search Results

- Smart autocomplete with type icons (product/service/artisan)
- Results page with tabs: [Products] [Services] [Artisans]
- Default tab = whichever has most results
- Product results -> product cards
- Service results -> package cards
- Artisan results -> profile cards

## Section 3: Artisan Profile Page Redesign

### Layout

- **Compact header**: Profile photo, name, rating, location, verified badge, tagline, experience, online status, Chat/Call/Directions buttons
- **Tab bar**: [Products] [Services] [Custom] [Reviews] [About] — tabs shown/hidden based on what artisan offers
- **Default tab**: Auto-selected based on primary offering type

### Products Tab (Swiggy style)

- Sub-filter by product type
- Product card grid: image, name, price, stock status, Add to Cart / Request button
- "Made to Order" badge for non-stock items

### Services Tab (UC style)

- Package list with: name, price, included items checklist, excluded items, duration, sample images, Book Now button

### Custom Orders Tab

- Description of custom capabilities
- Starting price + typical timeline
- Portfolio gallery of past custom work
- "Request Custom Order" button -> opens chat with pre-filled template

### Product Detail Modal

- Image carousel, name, price, artisan info
- Variant selectors (size, color with price adjustments)
- Stock status, delivery options (pickup/delivery with costs)
- Quantity selector
- Add to Cart / Buy Now buttons
- Product-specific reviews

## Section 4: Artisan Dashboard

### Offering Management Tab

- Tabs: [Products (count)] [Services (count)] [Custom]
- Buttons: [+ Add Product] [+ Add Service Package] [+ Enable Custom Orders]
- Product list: image, name, price, stock status, sold count, actions
- Service list: name, price, bookings count, rating, actions
- Stock alerts for low/out-of-stock products

### Product Wizard (5 steps)

1. **Basic Info**: Template suggestions from category, name, description
2. **Images**: Upload 2-6 photos with drag-to-reorder, tips
3. **Pricing & Stock**: Base price, stock tracking or made-to-order, variant builder
4. **Delivery**: Pickup/delivery options, shipping cost, dimensions
5. **Review & Publish**: Card preview, summary, publish button

### Service Package Wizard (5 steps)

1. **Package Info**: Template suggestions, name, category
2. **What's Included**: Checklist builder, optional exclusions
3. **Pricing & Duration**: Price, duration, max bookings/day, home visit toggle
4. **Sample Work**: Upload 1-6 images
5. **Review & Publish**: Package card preview, publish button

## Section 5: API & Backend Changes

### Route Changes

```
EXISTING (backward compatible):
  GET/POST/PATCH/DELETE /api/services/*  -> add ?type= filter support

NEW:
  GET  /api/offerings/products
  GET  /api/offerings/packages
  GET  /api/offerings/custom/:artisanId
  POST /api/offerings/products
  POST /api/offerings/packages
  PATCH /api/offerings/:id/stock
  PATCH /api/offerings/:id/restock

UPDATED SEARCH:
  GET /api/search?q=...  -> returns { products, packages, artisans }
  GET /api/search/products?q=...&category=...
  GET /api/search/packages?q=...&category=...
  GET /api/search/suggestions?q=...  -> includes type in results

UPDATED CATEGORIES:
  GET /api/categories -> includes type field
  GET /api/categories/:slug -> includes suggestedProducts + suggestedServices
```

### Migration Strategy

```
Phase 1 — Schema changes (non-breaking):
  1. Add type to Category (default: 'service')
  2. Add offeringType to ArtisanService (default: 'service_package')
  3. Add new optional fields (stock, variants, shipping, includedItems)
  4. Backfill existing data
  5. Add artisanTypes to Artisan model

Phase 2 — New API endpoints:
  6. Add /api/offerings/* routes
  7. Update search controller
  8. Keep /api/services/* as aliases

Phase 3 — Frontend changes:
  9.  Homepage with category-first design
  10. Category browse pages
  11. Artisan profile page redesign
  12. Product wizard + service package wizard
  13. Product detail modal
  14. Updated search results

Phase 4 — Booking flow updates:
  15. Product order flow
  16. Service booking flow (minor updates)
  17. Custom order request flow
```

## Key Architectural Decisions

1. **Single collection** — ArtisanOffering stays in `artisanservices` MongoDB collection. Mongoose model renamed but collection stays. Existing ObjectId references keep working.

2. **Discriminator pattern** — `offeringType` field determines which sub-schema applies. Mongoose discriminators enforce type-specific validation.

3. **Backward compatibility** — Existing `/api/services/*` routes continue working. New `/api/offerings/*` routes are the preferred API.

4. **Category drives UX** — `category.type` determines frontend rendering. No AI intent detection needed.

5. **Denormalization preserved** — `categoryName` and `offeringType` denormalized where needed for query performance.
