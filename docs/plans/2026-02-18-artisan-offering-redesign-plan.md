# Artisan Offering System Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform KalaSetu's flat service model into a polymorphic offering system with products, service packages, and custom orders — enabling Urban Company-style service booking and Swiggy-style product browsing.

**Architecture:** Evolve the existing `ArtisanService` model (same MongoDB collection `artisanservices`) by adding an `offeringType` discriminator field with type-specific optional fields. Categories gain a `type` field that drives smart UI routing. Frontend gets new pages for category-based browsing and artisan profile tabs.

**Tech Stack:** MongoDB/Mongoose (ES modules), Express.js, React 18 (JSX, no TypeScript), Tailwind CSS, Cloudinary (images), Vite

**Design Doc:** `docs/plans/2026-02-18-artisan-offering-redesign-design.md`

**Note:** This project has no backend test suite (V2 priority). Steps reference manual verification via `npm run dev` and API testing. When backend tests are added, these become test locations.

---

## Phase 1: Schema Changes (Non-Breaking)

All changes in Phase 1 are additive — existing API behavior stays identical. New fields have defaults that match current behavior.

---

### Task 1: Add `type` and `suggestedProducts` to Category model

**Files:**
- Modify: `kalasetu-backend/models/categoryModel.js`

**Step 1: Add type field and suggestedProducts to schema**

In `kalasetu-backend/models/categoryModel.js`, add after the `suggestedServices` field (line 40):

```javascript
// categoryModel.js — updated schema fields
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  image: { type: String, default: '' },
  // Determines frontend UX routing: product grid vs service packages vs both
  type: { type: String, enum: ['product', 'service', 'both'], default: 'service' },
  suggestedServices: { type: [serviceTemplateSchema], default: [] },
  suggestedProducts: { type: [serviceTemplateSchema], default: [] }, // reuse same sub-schema
  active: { type: Boolean, default: true },
}, { timestamps: true });
```

**Step 2: Verify server starts without errors**

Run: `cd kalasetu-backend && npm run dev`
Expected: Server starts normally. Existing categories load with `type: 'service'` default.

**Step 3: Commit**

```bash
git add kalasetu-backend/models/categoryModel.js
git commit -m "feat(models): add type and suggestedProducts to Category schema"
```

---

### Task 2: Evolve ArtisanService model with offeringType and product fields

**Files:**
- Modify: `kalasetu-backend/models/artisanServiceModel.js`

**Step 1: Add offeringType discriminator and all type-specific fields**

Replace the entire schema definition in `kalasetu-backend/models/artisanServiceModel.js`:

```javascript
import mongoose from 'mongoose';

/** Sub-schema for product variants (e.g., Size: Small/Medium/Large) */
const variantOptionSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  priceAdjustment: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
}, { _id: false });

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // e.g., "Size", "Color"
  options: { type: [variantOptionSchema], default: [] },
}, { _id: false });

/** Sub-schema for service package included/excluded items */
const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
}, { _id: false });

const artisanServiceSchema = new mongoose.Schema({
  // --- COMMON FIELDS (all offering types) ---
  artisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  categoryName: { type: String, required: true, trim: true },
  offeringType: {
    type: String,
    enum: ['product', 'service_package', 'custom_order'],
    default: 'service_package', // backward compat: existing docs become service_package
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  images: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },

  // --- PRODUCT-SPECIFIC FIELDS ---
  stock: { type: Number, default: undefined }, // undefined = not a product / made-to-order
  variants: { type: [variantSchema], default: undefined },
  shipping: {
    type: new mongoose.Schema({
      type: { type: String, enum: ['pickup', 'delivery', 'both'], default: 'both' },
      cost: { type: Number, default: 0 },
      estimatedDays: { type: Number, default: 3 },
    }, { _id: false }),
    default: undefined,
  },
  dimensions: {
    type: new mongoose.Schema({
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    }, { _id: false }),
    default: undefined,
  },
  madeToOrder: { type: Boolean, default: undefined },

  // --- SERVICE PACKAGE-SPECIFIC FIELDS ---
  durationMinutes: { type: Number, default: 60 },
  includedItems: { type: [checklistItemSchema], default: undefined },
  excludedItems: { type: [checklistItemSchema], default: undefined },
  maxBookingsPerDay: { type: Number, default: undefined },
  requiresHomeVisit: { type: Boolean, default: undefined },
  serviceArea: { type: String, default: undefined },

  // --- CUSTOM ORDER-SPECIFIC FIELDS ---
  startingPrice: { type: Number, default: undefined },
  typicalTimeline: { type: String, default: undefined },
  portfolioSamples: { type: [String], default: undefined },
  consultationRequired: { type: Boolean, default: undefined },
}, { timestamps: true });

artisanServiceSchema.index({ name: 'text', description: 'text', categoryName: 'text' });
artisanServiceSchema.index({ categoryName: 1, name: 1 });
artisanServiceSchema.index({ offeringType: 1, isActive: 1 }); // new: filter by type

const ArtisanService = mongoose.model('ArtisanService', artisanServiceSchema);
export default ArtisanService;
```

**Step 2: Verify server starts and existing services still load**

Run: `cd kalasetu-backend && npm run dev`
Then test: `curl http://localhost:5000/api/services`
Expected: Existing services returned with `offeringType: 'service_package'` (default).

**Step 3: Commit**

```bash
git add kalasetu-backend/models/artisanServiceModel.js
git commit -m "feat(models): evolve ArtisanService with offeringType discriminator and type-specific fields"
```

---

### Task 3: Add artisanTypes field to Artisan model

**Files:**
- Modify: `kalasetu-backend/models/artisanModel.js`

**Step 1: Add artisanTypes and acceptsCustomOrders fields**

In `kalasetu-backend/models/artisanModel.js`, add after the `craft` field (line 64):

```javascript
    craft: { type: String, default: '' },
    // What this artisan offers — drives profile layout and search filtering
    artisanTypes: {
      type: [{ type: String, enum: ['product_seller', 'service_provider'] }],
      default: ['service_provider'],
    },
    acceptsCustomOrders: { type: Boolean, default: false },
```

**Step 2: Verify server starts**

Run: `cd kalasetu-backend && npm run dev`
Expected: Server starts. Existing artisans have `artisanTypes: ['service_provider']` default.

**Step 3: Commit**

```bash
git add kalasetu-backend/models/artisanModel.js
git commit -m "feat(models): add artisanTypes and acceptsCustomOrders to Artisan schema"
```

---

### Task 4: Update Booking model for product orders

**Files:**
- Modify: `kalasetu-backend/models/bookingModel.js`

**Step 1: Add product-order fields to booking schema**

In `kalasetu-backend/models/bookingModel.js`, add after the `service` field (line 46):

```javascript
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'ArtisanService', index: true },
  // Offering type for quick filtering (product order vs service booking)
  offeringType: { type: String, enum: ['product', 'service_package', 'custom_order'], default: 'service_package' },
  // Product order fields
  quantity: { type: Number, default: 1 },
  variantSelections: {
    type: [new mongoose.Schema({
      name: { type: String, required: true },  // e.g., "Size"
      option: { type: String, required: true }, // e.g., "Large"
    }, { _id: false })],
    default: undefined,
  },
  shippingAddress: {
    type: new mongoose.Schema({
      addressLine1: { type: String, default: '' },
      addressLine2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
    }, { _id: false }),
    default: undefined,
  },
```

**Step 2: Verify server starts and existing bookings unaffected**

Run: `cd kalasetu-backend && npm run dev`
Expected: Server starts. Existing bookings have `offeringType: 'service_package'` default, `quantity: 1`.

**Step 3: Commit**

```bash
git add kalasetu-backend/models/bookingModel.js
git commit -m "feat(models): add product order fields to Booking schema"
```

---

### Task 5: Update seed script with category types and sample products

**Files:**
- Modify: `kalasetu-backend/scripts/seedCoreData.js`

**Step 1: Add type to CATEGORIES and create sample product offerings**

Update the `CATEGORIES` array to include `type` and optional `suggestedProducts`:

```javascript
const CATEGORIES = [
  {
    name: 'Handicrafts',
    slug: 'handicrafts',
    type: 'product',
    suggestedServices: [
      { name: 'Pottery' },
      { name: 'Wood Carving' },
      { name: 'Jewelry Making' },
      { name: 'Bamboo Craft' },
      { name: 'Glass Art' },
    ],
    suggestedProducts: [
      { name: 'Terracotta Vase' },
      { name: 'Wooden Sculpture' },
      { name: 'Handmade Necklace' },
      { name: 'Bamboo Basket' },
      { name: 'Glass Ornament' },
    ],
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    type: 'service',
    suggestedServices: [
      { name: 'Plumber' },
      { name: 'Electrician' },
      { name: 'Carpenter' },
      { name: 'Painter' },
      { name: 'House Cleaning' },
    ],
    suggestedProducts: [],
  },
  {
    name: 'Food & Catering',
    slug: 'food-catering',
    type: 'both',
    suggestedServices: [
      { name: 'Home Chef' },
      { name: 'Tiffin Service' },
      { name: 'Baker' },
      { name: 'Caterer' },
      { name: 'Snack Stall' },
    ],
    suggestedProducts: [
      { name: 'Homemade Pickle' },
      { name: 'Sweet Box' },
      { name: 'Spice Mix' },
    ],
  },
  {
    name: 'Clothing & Tailoring',
    slug: 'clothing-tailoring',
    type: 'both',
    suggestedServices: [
      { name: 'Tailor' },
      { name: 'Embroidery' },
      { name: 'Boutique Designer' },
      { name: 'Alterations' },
      { name: 'Block Printing' },
    ],
    suggestedProducts: [
      { name: 'Handloom Saree' },
      { name: 'Embroidered Kurta' },
      { name: 'Block Print Dupatta' },
    ],
  },
  {
    name: 'Wellness & Beauty',
    slug: 'wellness-beauty',
    type: 'service',
    suggestedServices: [
      { name: 'Beautician' },
      { name: 'Makeup Artist' },
      { name: 'Mehendi Artist' },
      { name: 'Hair Stylist' },
      { name: 'Massage Therapist' },
    ],
    suggestedProducts: [],
  },
];
```

Also update `seedCategories()` to include the new fields:

```javascript
async function seedCategories() {
  const docs = await Category.insertMany(
    CATEGORIES.map((c) => ({
      name: c.name,
      slug: c.slug,
      type: c.type || 'service',
      image: '',
      suggestedServices: c.suggestedServices,
      suggestedProducts: c.suggestedProducts || [],
      active: true,
    }))
  );
  await Category.create({
    name: 'Extra Services',
    slug: 'extra-services',
    type: 'service',
    image: '',
    suggestedServices: EXTRA_SERVICES.map((name) => ({ name })),
    suggestedProducts: [],
    active: false,
  });
  console.log(`Inserted categories: ${docs.length} + extra services`);
  return docs;
}
```

Update `seedArtisansAndServices()` to set `offeringType` and `artisanTypes`:

```javascript
async function seedArtisansAndServices(categories) {
  let createdServices = 0;
  let idx = 0;
  for (const cat of categories) {
    for (const s of cat.suggestedServices) {
      const profile = generateArtisanProfile(s.name, cat.name, idx++);
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(profile.password, salt);

      // Determine artisan types based on category type
      const artisanTypes = [];
      if (cat.type === 'product' || cat.type === 'both') artisanTypes.push('product_seller');
      if (cat.type === 'service' || cat.type === 'both') artisanTypes.push('service_provider');
      if (artisanTypes.length === 0) artisanTypes.push('service_provider');

      const artisan = await Artisan.create({
        ...profile,
        password: hashed,
        artisanTypes,
      });
      await ArtisanService.create({
        artisan: artisan._id,
        category: cat._id,
        categoryName: cat.name,
        offeringType: 'service_package',
        name: s.name,
        description: profile.bio,
        price: 0,
        durationMinutes: 60,
        images: CATEGORY_IMAGES[cat.name]?.gallery || [],
        isActive: true,
      });
      createdServices++;
    }
  }
  console.log(`Created artisans and services: ${createdServices}`);
}
```

**Step 2: Verify seed script works (dry run against local DB)**

Run: `cd kalasetu-backend && node scripts/seedCoreData.js`
Expected: Seeding completes without errors. Categories have `type` field.

**Step 3: Commit**

```bash
git add kalasetu-backend/scripts/seedCoreData.js
git commit -m "feat(seed): add category types, suggestedProducts, and artisanTypes to seed data"
```

---

### Task 6: Write data migration script to backfill existing documents

**Files:**
- Create: `kalasetu-backend/scripts/migrateOfferings.js`

**Step 1: Write the migration script**

```javascript
/**
 * Migration script: Backfill offeringType on ArtisanService and type on Category.
 * Safe to run multiple times (idempotent).
 *
 * Usage: node scripts/migrateOfferings.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const CATEGORY_TYPE_MAP = {
  'Handicrafts': 'product',
  'Home Services': 'service',
  'Food & Catering': 'both',
  'Clothing & Tailoring': 'both',
  'Wellness & Beauty': 'service',
  'Extra Services': 'service',
};

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGO_URI missing');
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // 1. Backfill Category.type
  const catCol = db.collection('categories');
  for (const [name, type] of Object.entries(CATEGORY_TYPE_MAP)) {
    const result = await catCol.updateMany(
      { name, type: { $exists: false } },
      { $set: { type } }
    );
    if (result.modifiedCount > 0) {
      console.log(`  Category "${name}" -> type: "${type}" (${result.modifiedCount} updated)`);
    }
  }
  // Set default for any category without type
  const defaultResult = await catCol.updateMany(
    { type: { $exists: false } },
    { $set: { type: 'service' } }
  );
  if (defaultResult.modifiedCount > 0) {
    console.log(`  Default type set for ${defaultResult.modifiedCount} categories`);
  }
  console.log('Category types backfilled');

  // 2. Backfill ArtisanService.offeringType
  const svcCol = db.collection('artisanservices');
  const svcResult = await svcCol.updateMany(
    { offeringType: { $exists: false } },
    { $set: { offeringType: 'service_package' } }
  );
  console.log(`ArtisanService offeringType backfilled: ${svcResult.modifiedCount} documents`);

  // 3. Backfill Artisan.artisanTypes
  const artCol = db.collection('artisans');
  const artResult = await artCol.updateMany(
    { artisanTypes: { $exists: false } },
    { $set: { artisanTypes: ['service_provider'], acceptsCustomOrders: false } }
  );
  console.log(`Artisan artisanTypes backfilled: ${artResult.modifiedCount} documents`);

  // 4. Backfill Booking.offeringType
  const bookCol = db.collection('bookings');
  const bookResult = await bookCol.updateMany(
    { offeringType: { $exists: false } },
    { $set: { offeringType: 'service_package', quantity: 1 } }
  );
  console.log(`Booking offeringType backfilled: ${bookResult.modifiedCount} documents`);

  console.log('Migration complete');
  await mongoose.connection.close();
}

run().catch((e) => {
  console.error('Migration failed:', e);
  process.exit(1);
});
```

**Step 2: Add npm script for migration**

In `kalasetu-backend/package.json`, add to `"scripts"`:

```json
"migrate:offerings": "node scripts/migrateOfferings.js"
```

**Step 3: Commit**

```bash
git add kalasetu-backend/scripts/migrateOfferings.js kalasetu-backend/package.json
git commit -m "feat(migration): add backfill script for offering types and category types"
```

---

## Phase 2: New API Endpoints

Build the new `/api/offerings/*` routes alongside existing `/api/services/*`.

---

### Task 7: Create offering routes file and mount in server.js

**Files:**
- Create: `kalasetu-backend/routes/offeringRoutes.js`
- Modify: `kalasetu-backend/server.js` (add mount at ~line 227)

**Step 1: Create the routes file**

```javascript
/**
 * @file offeringRoutes.js — Polymorphic offering routes (products, packages, custom orders)
 *
 * New API layer for the offering system. Existing /api/services/* stays as alias.
 */
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listProducts,
  listPackages,
  getCustomOrderInfo,
  createProduct,
  createPackage,
  createCustomOrder,
  updateStock,
  restockProduct,
} from '../controllers/offeringController.js';

const router = Router();

// Public read endpoints
router.get('/products', listProducts);
router.get('/packages', listPackages);
router.get('/custom/:artisanPublicId', getCustomOrderInfo);

// Protected artisan write endpoints
router.post('/products', protect, createProduct);
router.post('/packages', protect, createPackage);
router.post('/custom', protect, createCustomOrder);
router.patch('/:id/stock', protect, updateStock);
router.patch('/:id/restock', protect, restockProduct);

export default router;
```

**Step 2: Mount in server.js**

In `kalasetu-backend/server.js`, add after the services mount (line 227):

```javascript
app.use('/api/services', serviceRoutes);
// New offering routes (products, service packages, custom orders)
import offeringRoutes from './routes/offeringRoutes.js';
app.use('/api/offerings', offeringRoutes);
```

Note: The import should be at the top of server.js with the other route imports. Add it near the other route imports.

**Step 3: Commit (will fail until controller exists — create controller in next task)**

Hold commit until Task 8.

---

### Task 8: Create offering controller with product and package CRUD

**Files:**
- Create: `kalasetu-backend/controllers/offeringController.js`

**Step 1: Write the offering controller**

```javascript
/**
 * @file offeringController.js — Product, Service Package, and Custom Order CRUD
 *
 * Operates on the same ArtisanService collection via offeringType discriminator.
 * Products have stock/variants/shipping. Packages have includedItems/duration.
 */
import asyncHandler from '../utils/asyncHandler.js';
import ArtisanService from '../models/artisanServiceModel.js';
import Category from '../models/categoryModel.js';
import Artisan from '../models/artisanModel.js';

// --- PUBLIC READ ---

export const listProducts = asyncHandler(async (req, res) => {
  const { category, q, limit = 20, page = 1 } = req.query;
  const filter = { offeringType: 'product', isActive: true };
  if (category) filter.categoryName = category;
  if (q) filter.$text = { $search: q };

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ArtisanService.find(filter)
      .populate('artisan', 'fullName publicId profileImageUrl averageRating location.city isVerified')
      .sort({ createdAt: -1 })
      .limit(Math.min(100, parseInt(limit)))
      .skip(skip)
      .lean(),
    ArtisanService.countDocuments(filter),
  ]);

  res.json({ success: true, data: docs, total, page: parseInt(page) });
});

export const listPackages = asyncHandler(async (req, res) => {
  const { category, serviceName, q, limit = 20, page = 1 } = req.query;
  const filter = { offeringType: 'service_package', isActive: true };
  if (category) filter.categoryName = category;
  if (serviceName) filter.name = serviceName;
  if (q) filter.$text = { $search: q };

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ArtisanService.find(filter)
      .populate('artisan', 'fullName publicId profileImageUrl averageRating location.city isVerified')
      .sort({ createdAt: -1 })
      .limit(Math.min(100, parseInt(limit)))
      .skip(skip)
      .lean(),
    ArtisanService.countDocuments(filter),
  ]);

  res.json({ success: true, data: docs, total, page: parseInt(page) });
});

export const getCustomOrderInfo = asyncHandler(async (req, res) => {
  const { artisanPublicId } = req.params;
  const artisan = await Artisan.findOne({ publicId: artisanPublicId }).select('_id acceptsCustomOrders');
  if (!artisan) return res.status(404).json({ success: false, message: 'Artisan not found' });

  const customOfferings = await ArtisanService.find({
    artisan: artisan._id,
    offeringType: 'custom_order',
    isActive: true,
  }).lean();

  res.json({
    success: true,
    data: {
      acceptsCustomOrders: artisan.acceptsCustomOrders,
      offerings: customOfferings,
    },
  });
});

// --- PROTECTED ARTISAN WRITE ---

export const createProduct = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  if (!artisanId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const {
    categoryId, name, description, price, images = [],
    stock, variants, shipping, dimensions, madeToOrder,
  } = req.body || {};

  if (!categoryId || !name || price === undefined) {
    return res.status(400).json({ success: false, message: 'categoryId, name, and price are required' });
  }

  const category = await Category.findById(categoryId).lean();
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const doc = await ArtisanService.create({
    artisan: artisanId,
    category: category._id,
    categoryName: category.name,
    offeringType: 'product',
    name,
    description: description || '',
    price,
    images,
    stock: madeToOrder ? undefined : (stock || 0),
    variants: variants || undefined,
    shipping: shipping || { type: 'both', cost: 0, estimatedDays: 3 },
    dimensions: dimensions || undefined,
    madeToOrder: madeToOrder || false,
  });

  // Ensure artisan has product_seller type
  await Artisan.updateOne(
    { _id: artisanId },
    { $addToSet: { artisanTypes: 'product_seller' } }
  );

  res.status(201).json({ success: true, data: doc });
});

export const createPackage = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  if (!artisanId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const {
    categoryId, name, description, price, images = [],
    durationMinutes = 60, includedItems = [], excludedItems = [],
    maxBookingsPerDay, requiresHomeVisit, serviceArea,
  } = req.body || {};

  if (!categoryId || !name) {
    return res.status(400).json({ success: false, message: 'categoryId and name are required' });
  }

  const category = await Category.findById(categoryId).lean();
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const doc = await ArtisanService.create({
    artisan: artisanId,
    category: category._id,
    categoryName: category.name,
    offeringType: 'service_package',
    name,
    description: description || '',
    price: price || 0,
    images,
    durationMinutes,
    includedItems: includedItems.length > 0 ? includedItems : undefined,
    excludedItems: excludedItems.length > 0 ? excludedItems : undefined,
    maxBookingsPerDay: maxBookingsPerDay || undefined,
    requiresHomeVisit: requiresHomeVisit || undefined,
    serviceArea: serviceArea || undefined,
  });

  // Ensure artisan has service_provider type
  await Artisan.updateOne(
    { _id: artisanId },
    { $addToSet: { artisanTypes: 'service_provider' } }
  );

  res.status(201).json({ success: true, data: doc });
});

export const createCustomOrder = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  if (!artisanId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const {
    categoryId, name, description, images = [],
    startingPrice, typicalTimeline, portfolioSamples = [], consultationRequired,
  } = req.body || {};

  if (!categoryId || !name) {
    return res.status(400).json({ success: false, message: 'categoryId and name are required' });
  }

  const category = await Category.findById(categoryId).lean();
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const doc = await ArtisanService.create({
    artisan: artisanId,
    category: category._id,
    categoryName: category.name,
    offeringType: 'custom_order',
    name,
    description: description || '',
    price: startingPrice || 0,
    images,
    startingPrice: startingPrice || 0,
    typicalTimeline: typicalTimeline || '',
    portfolioSamples,
    consultationRequired: consultationRequired ?? true,
  });

  // Mark artisan as accepting custom orders
  await Artisan.updateOne(
    { _id: artisanId },
    { $set: { acceptsCustomOrders: true } }
  );

  res.status(201).json({ success: true, data: doc });
});

export const updateStock = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const { stock, variantStocks } = req.body || {};

  const doc = await ArtisanService.findById(id);
  if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });
  if (String(doc.artisan) !== String(artisanId)) return res.status(403).json({ success: false, message: 'Forbidden' });
  if (doc.offeringType !== 'product') return res.status(400).json({ success: false, message: 'Not a product' });

  if (stock !== undefined) doc.stock = stock;
  if (variantStocks && doc.variants) {
    for (const vs of variantStocks) {
      const variant = doc.variants.find(v => v.name === vs.name);
      if (variant) {
        const option = variant.options.find(o => o.label === vs.option);
        if (option) option.stock = vs.stock;
      }
    }
  }

  await doc.save();
  res.json({ success: true, data: doc });
});

export const restockProduct = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const { addStock } = req.body || {};

  const doc = await ArtisanService.findById(id);
  if (!doc) return res.status(404).json({ success: false, message: 'Product not found' });
  if (String(doc.artisan) !== String(artisanId)) return res.status(403).json({ success: false, message: 'Forbidden' });
  if (doc.offeringType !== 'product') return res.status(400).json({ success: false, message: 'Not a product' });

  doc.stock = (doc.stock || 0) + (addStock || 0);
  await doc.save();
  res.json({ success: true, data: doc });
});
```

**Step 2: Verify server starts and test endpoints**

Run: `cd kalasetu-backend && npm run dev`
Test with curl:
- `curl http://localhost:5000/api/offerings/products` → `{ success: true, data: [], total: 0 }`
- `curl http://localhost:5000/api/offerings/packages` → `{ success: true, data: [...], total: 25 }`

Expected: Products returns empty (none created yet). Packages returns existing services that defaulted to `service_package`.

**Step 3: Commit**

```bash
git add kalasetu-backend/routes/offeringRoutes.js kalasetu-backend/controllers/offeringController.js kalasetu-backend/server.js
git commit -m "feat(api): add /api/offerings routes with product, package, and custom order CRUD"
```

---

### Task 9: Update existing service controller for type filtering

**Files:**
- Modify: `kalasetu-backend/controllers/artisanServiceController.js`

**Step 1: Add offeringType filter to listServices and handle in createService**

In `listServices` (line 26), add type filter:

```javascript
export const listServices = asyncHandler(async (req, res) => {
  const { category, q, artisan, type, limit = 20, page = 1 } = req.query;
  const filter = { isActive: true };
  if (category) filter.categoryName = category;
  if (artisan) filter.artisan = artisan;
  if (type) filter.offeringType = type;
  if (q) filter.$text = { $search: q };
  const docs = await ArtisanService.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(100, parseInt(limit)))
    .skip((Math.max(1, parseInt(page)) - 1) * parseInt(limit))
    .lean();
  res.json({ success: true, data: docs });
});
```

In `createService` (line 40), add offeringType support:

```javascript
export const createService = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  if (!artisanId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const {
    categoryId, name, description, price = 0, durationMinutes = 60,
    images = [], offeringType = 'service_package',
    // Product fields
    stock, variants, shipping, dimensions, madeToOrder,
    // Package fields
    includedItems, excludedItems, maxBookingsPerDay, requiresHomeVisit, serviceArea,
    // Custom order fields
    startingPrice, typicalTimeline, portfolioSamples, consultationRequired,
  } = req.body || {};
  if (!categoryId || !name) return res.status(400).json({ success: false, message: 'categoryId and name are required' });
  const category = await Category.findById(categoryId).lean();
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const docData = {
    artisan: artisanId,
    category: category._id,
    categoryName: category.name,
    offeringType,
    name,
    description: description || '',
    price,
    durationMinutes,
    images,
  };

  // Conditionally add type-specific fields
  if (offeringType === 'product') {
    Object.assign(docData, {
      stock: madeToOrder ? undefined : (stock || 0),
      variants: variants || undefined,
      shipping: shipping || undefined,
      dimensions: dimensions || undefined,
      madeToOrder: madeToOrder || false,
    });
  }
  if (offeringType === 'service_package') {
    Object.assign(docData, {
      includedItems: includedItems || undefined,
      excludedItems: excludedItems || undefined,
      maxBookingsPerDay: maxBookingsPerDay || undefined,
      requiresHomeVisit: requiresHomeVisit || undefined,
      serviceArea: serviceArea || undefined,
    });
  }
  if (offeringType === 'custom_order') {
    Object.assign(docData, {
      startingPrice: startingPrice || undefined,
      typicalTimeline: typicalTimeline || undefined,
      portfolioSamples: portfolioSamples || undefined,
      consultationRequired: consultationRequired ?? true,
    });
  }

  const doc = await ArtisanService.create(docData);
  res.status(201).json({ success: true, data: doc });
});
```

In `updateService` (line 60), add new fields to allowed updates:

```javascript
export const updateService = asyncHandler(async (req, res) => {
  const artisanId = req.user?._id || req.user?.id;
  const { id } = req.params;
  const doc = await ArtisanService.findById(id);
  if (!doc) return res.status(404).json({ success: false, message: 'Service not found' });
  if (String(doc.artisan) !== String(artisanId)) return res.status(403).json({ success: false, message: 'Forbidden' });

  const allowedFields = [
    'name', 'description', 'price', 'durationMinutes', 'images', 'isActive',
    // Product fields
    'stock', 'variants', 'shipping', 'dimensions', 'madeToOrder',
    // Package fields
    'includedItems', 'excludedItems', 'maxBookingsPerDay', 'requiresHomeVisit', 'serviceArea',
    // Custom order fields
    'startingPrice', 'typicalTimeline', 'portfolioSamples', 'consultationRequired',
  ];

  const updates = {};
  allowedFields.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  Object.assign(doc, updates);
  await doc.save();
  res.json({ success: true, data: doc });
});
```

**Step 2: Verify existing service listing still works with type filter**

Run: `cd kalasetu-backend && npm run dev`
Test: `curl "http://localhost:5000/api/services?type=service_package"` → existing services
Test: `curl "http://localhost:5000/api/services?type=product"` → empty

**Step 3: Commit**

```bash
git add kalasetu-backend/controllers/artisanServiceController.js
git commit -m "feat(api): add offeringType filtering to existing service endpoints"
```

---

### Task 10: Update search controller for offering types

**Files:**
- Modify: `kalasetu-backend/controllers/searchController.js`

**Step 1: Add type-aware search endpoints**

Add new exported functions to the search controller. Add these at the end of the file, before any final export:

```javascript
/** Search products only */
export const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, inStock, limit = 20, page = 1 } = req.query;
  const filter = { offeringType: 'product', isActive: true };

  if (category) filter.categoryName = category;
  if (q) filter.$text = { $search: q };
  if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
  if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
  if (inStock === 'true') filter.$or = [{ stock: { $gt: 0 } }, { madeToOrder: true }];

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ArtisanService.find(filter)
      .populate('artisan', 'fullName publicId profileImageUrl averageRating location.city isVerified')
      .sort({ createdAt: -1 })
      .limit(Math.min(100, parseInt(limit)))
      .skip(skip)
      .lean(),
    ArtisanService.countDocuments(filter),
  ]);

  res.json({ success: true, data: docs, total, page: parseInt(page) });
});

/** Search service packages only */
export const searchPackages = asyncHandler(async (req, res) => {
  const { q, category, serviceName, limit = 20, page = 1 } = req.query;
  const filter = { offeringType: 'service_package', isActive: true };

  if (category) filter.categoryName = category;
  if (serviceName) filter.name = serviceName;
  if (q) filter.$text = { $search: q };

  const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
  const [docs, total] = await Promise.all([
    ArtisanService.find(filter)
      .populate('artisan', 'fullName publicId profileImageUrl averageRating location.city isVerified')
      .sort({ createdAt: -1 })
      .limit(Math.min(100, parseInt(limit)))
      .skip(skip)
      .lean(),
    ArtisanService.countDocuments(filter),
  ]);

  res.json({ success: true, data: docs, total, page: parseInt(page) });
});
```

Ensure `ArtisanService` is imported at the top of searchController.js (it likely already is from the `performSearch` function).

**Step 2: Add new routes to search routes**

In `kalasetu-backend/routes/searchRoutes.js`, add before the catch-all `GET /`:

```javascript
import { searchProducts, searchPackages } from '../controllers/searchController.js';

// Type-specific search routes
router.get('/products', searchProducts);
router.get('/packages', searchPackages);
```

**Step 3: Update getSearchSuggestions to include offering type hints**

In the existing `getSearchSuggestions` function, modify the service suggestions to include the `offeringType`:

Where services are queried, add `.select('name offeringType categoryName')` to include the type in suggestions.

**Step 4: Verify**

Run: `cd kalasetu-backend && npm run dev`
Test: `curl "http://localhost:5000/api/search/products?q=pottery"` → products search
Test: `curl "http://localhost:5000/api/search/packages?q=plumber"` → package search

**Step 5: Commit**

```bash
git add kalasetu-backend/controllers/searchController.js kalasetu-backend/routes/searchRoutes.js
git commit -m "feat(api): add /api/search/products and /api/search/packages endpoints"
```

---

### Task 11: Update category controller to expose type and suggestedProducts

**Files:**
- Modify: `kalasetu-backend/controllers/categoryController.js`

**Step 1: Update getCategories to include type field**

The `getCategories` function already returns all category fields via `.lean()`, so the new `type` and `suggestedProducts` fields will automatically be included after the schema change. No code change needed here.

Add a new endpoint for getting category details with type:

```javascript
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const cat = await Category.findOne({ slug, active: true }).lean();
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: cat });
});
```

**Step 2: Add route for getCategoryBySlug**

In `kalasetu-backend/routes/categoryRoutes.js`, add:

```javascript
import { getCategoryBySlug } from '../controllers/categoryController.js';

router.get('/slug/:slug', getCategoryBySlug);
```

**Step 3: Commit**

```bash
git add kalasetu-backend/controllers/categoryController.js kalasetu-backend/routes/categoryRoutes.js
git commit -m "feat(api): add category-by-slug endpoint exposing type and suggestedProducts"
```

---

## Phase 3: Frontend Changes

New and redesigned pages/components. Each task is a self-contained UI component.

---

### Task 12: Create category browse page with smart routing

**Files:**
- Create: `kalasetu-frontend/src/pages/CategoryBrowsePage.jsx`
- Create: `kalasetu-frontend/src/components/browse/ProductGrid.jsx`
- Create: `kalasetu-frontend/src/components/browse/PackageList.jsx`
- Modify: `kalasetu-frontend/src/App.jsx` (add route)

**Step 1: Create CategoryBrowsePage**

This page fetches the category by slug, checks `category.type`, and renders either ProductGrid, PackageList, or both with tabs.

Key structure:
```jsx
// CategoryBrowsePage.jsx
// - Fetch category via GET /api/categories/slug/:slug
// - If type === 'product': render ProductGrid
// - If type === 'service': render PackageList
// - If type === 'both': render tab toggle [Products | Services]
// - Sub-category filter from suggestedProducts / suggestedServices
// - ProductGrid: GET /api/offerings/products?category=X
// - PackageList: GET /api/offerings/packages?category=X
```

**Step 2: Create ProductGrid component**

Product card grid (Swiggy style):
- Image (Cloudinary optimized), name, price, artisan name, rating
- "Buy" / "Made to Order" badge
- Stock indicator
- Links to artisan profile

**Step 3: Create PackageList component**

Service package list (UC style):
- Package name, price, artisan name + rating
- Included items checklist (green checks)
- Excluded items (red X)
- Duration badge
- "Book Now" button

**Step 4: Add route in App.jsx**

```jsx
// In App.jsx, add route:
<Route path="/category/:slug" element={<CategoryBrowsePage />} />
```

**Step 5: Verify and commit**

Run: `cd kalasetu-frontend && npm run dev`
Navigate to `/category/handicrafts` → should render product grid
Navigate to `/category/home-services` → should render package list

```bash
git add kalasetu-frontend/src/pages/CategoryBrowsePage.jsx kalasetu-frontend/src/components/browse/ProductGrid.jsx kalasetu-frontend/src/components/browse/PackageList.jsx kalasetu-frontend/src/App.jsx
git commit -m "feat(ui): add category browse page with smart product/service routing"
```

---

### Task 13: Redesign homepage with category-first layout

**Files:**
- Modify: `kalasetu-frontend/src/pages/HomePage.jsx`
- Modify: `kalasetu-frontend/src/components/Categories.jsx`
- Create: `kalasetu-frontend/src/components/home/TrendingProducts.jsx`
- Create: `kalasetu-frontend/src/components/home/PopularPackages.jsx`

**Step 1: Update Categories component**

- Fetch from `/api/categories` (already does this)
- Show type badge on each card (product/service/both)
- Link to `/category/:slug` instead of `/search?category=X`

**Step 2: Create TrendingProducts component**

- Fetch `GET /api/offerings/products?limit=8`
- Horizontal scroll of product cards
- Each card: image, name, price, artisan mini-info

**Step 3: Create PopularPackages component**

- Fetch `GET /api/offerings/packages?limit=8`
- Horizontal scroll of package cards
- Each card: name, price, included items (first 3), artisan, Book Now

**Step 4: Update HomePage layout**

```jsx
// HomePage.jsx — new layout order:
// 1. HeroSearch (existing)
// 2. Categories (updated — links to /category/:slug)
// 3. TrendingProducts (new — product carousel)
// 4. PopularPackages (new — package carousel)
// 5. FeaturedArtisans (existing)
// 6. NearbyArtisans (existing)
// 7. HowItWorks (existing)
```

**Step 5: Commit**

```bash
git add kalasetu-frontend/src/pages/HomePage.jsx kalasetu-frontend/src/components/Categories.jsx kalasetu-frontend/src/components/home/TrendingProducts.jsx kalasetu-frontend/src/components/home/PopularPackages.jsx
git commit -m "feat(ui): redesign homepage with category-first layout, trending products, popular packages"
```

---

### Task 14: Redesign artisan profile page with offering tabs

**Files:**
- Modify: `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx`
- Create: `kalasetu-frontend/src/components/artisan/ProductsTab.jsx`
- Create: `kalasetu-frontend/src/components/artisan/PackagesTab.jsx`
- Create: `kalasetu-frontend/src/components/artisan/CustomOrdersTab.jsx`
- Create: `kalasetu-frontend/src/components/artisan/ProductDetailModal.jsx`

**Step 1: Redesign ArtisanProfilePage**

- Compact header: photo, name, rating, location, verified, tagline, experience, Chat/Call buttons
- Tab bar: [Products] [Services] [Custom] [Reviews] [About]
- Tabs shown/hidden based on artisan's actual offerings
- Default tab = first tab with content
- Fetch offerings: `GET /api/services/artisan/:publicId`
- Group offerings by `offeringType` for tabs

**Step 2: Create ProductsTab**

- Grid of product cards from artisan's offerings where `offeringType === 'product'`
- Sub-filter by category if multiple categories
- Click opens ProductDetailModal

**Step 3: Create PackagesTab**

- List of service packages from artisan's offerings where `offeringType === 'service_package'`
- Each package: name, price, included/excluded items, duration, Book Now button

**Step 4: Create CustomOrdersTab**

- Shows custom order offerings where `offeringType === 'custom_order'`
- Starting price, typical timeline, portfolio gallery
- "Request Custom Order" button → opens chat with pre-filled message

**Step 5: Create ProductDetailModal**

- Image carousel
- Name, price, artisan info
- Variant selectors (size, color) with price adjustments
- Stock status, delivery options
- Quantity selector
- Add to Cart / Buy Now buttons

**Step 6: Commit**

```bash
git add kalasetu-frontend/src/pages/ArtisanProfilePage.jsx kalasetu-frontend/src/components/artisan/
git commit -m "feat(ui): redesign artisan profile with offering tabs — products, packages, custom orders"
```

---

### Task 15: Create product wizard for artisan dashboard

**Files:**
- Create: `kalasetu-frontend/src/components/profile/wizards/ProductWizard.jsx`
- Create: `kalasetu-frontend/src/components/profile/wizards/WizardStep.jsx`

**Step 1: Create WizardStep base component**

- Step indicator (Step N of M)
- Title, content slot
- Back / Next buttons
- Validates before advancing

**Step 2: Create ProductWizard (5 steps)**

```
Step 1: BasicInfoStep — category picker, template suggestions, name, description
Step 2: ImagesStep — upload 2-6 images (Cloudinary), drag to reorder, first = thumbnail
Step 3: PricingStep — base price, stock or made-to-order toggle, variant builder
Step 4: DeliveryStep — pickup/delivery/both, shipping cost, estimated days, dimensions
Step 5: ReviewStep — preview card, summary of all fields, Publish button
```

- Submit calls `POST /api/offerings/products`
- On success: close wizard, refresh offerings list, show toast

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/profile/wizards/
git commit -m "feat(ui): add 5-step product wizard for artisan dashboard"
```

---

### Task 16: Create service package wizard for artisan dashboard

**Files:**
- Create: `kalasetu-frontend/src/components/profile/wizards/PackageWizard.jsx`

**Step 1: Create PackageWizard (5 steps)**

```
Step 1: PackageInfoStep — category picker, template suggestions, package name
Step 2: IncludedItemsStep — checklist builder with add/remove, optional excluded items
Step 3: PricingDurationStep — price, duration (minutes/hours/days), max bookings/day, home visit toggle
Step 4: SampleWorkStep — upload 1-6 images of past work for this service
Step 5: ReviewStep — preview package card, summary, Publish button
```

- Submit calls `POST /api/offerings/packages`
- On success: close wizard, refresh offerings list, show toast

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/profile/wizards/PackageWizard.jsx
git commit -m "feat(ui): add 5-step service package wizard for artisan dashboard"
```

---

### Task 17: Redesign ServicesTab in artisan dashboard

**Files:**
- Modify: `kalasetu-frontend/src/components/profile/tabs/ServicesTab.jsx`

**Step 1: Redesign the tab**

- Rename to "My Offerings" or keep "Services" tab name
- Add buttons: [+ Add Product] [+ Add Service Package] [+ Enable Custom Orders]
- Sub-tabs: [Products (count)] [Services (count)] [Custom Orders]
- Product list: image, name, price, stock status, sold count, Edit/Archive/Delete actions
- Service list: name, price, bookings count, rating, included items preview, Edit/Pause/Delete
- Custom orders list: description, starting price, timeline, Edit/Disable
- "Add Product" opens ProductWizard
- "Add Service Package" opens PackageWizard
- Old "Add Service" modal stays as fallback for existing flow

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/profile/tabs/ServicesTab.jsx
git commit -m "feat(ui): redesign ServicesTab with offering type sub-tabs and wizard launchers"
```

---

### Task 18: Update search results page for offering types

**Files:**
- Modify: `kalasetu-frontend/src/pages/SearchResults.jsx`
- Create: `kalasetu-frontend/src/components/search/ProductCard.jsx`
- Create: `kalasetu-frontend/src/components/search/PackageCard.jsx`

**Step 1: Create ProductCard component**

- Image, name, price, artisan name + rating, stock badge
- "Buy" / "Made to Order" label
- Links to artisan profile

**Step 2: Create PackageCard component**

- Package name, price, artisan name + rating
- First 3 included items as green check items
- Duration badge
- "Book Now" button

**Step 3: Update SearchResults page**

- Add tabs: [All] [Products] [Services] [Artisans]
- Fetch products via `/api/search/products`
- Fetch packages via `/api/search/packages`
- Existing artisan search stays
- Default tab = most results
- "All" tab shows mixed results with section headers

**Step 4: Update SearchBar suggestions**

- Add type icon to suggestions (product icon / service icon / artisan icon)
- Show offering type in subtitle

**Step 5: Commit**

```bash
git add kalasetu-frontend/src/pages/SearchResults.jsx kalasetu-frontend/src/components/search/ProductCard.jsx kalasetu-frontend/src/components/search/PackageCard.jsx kalasetu-frontend/src/components/SearchBar.jsx
git commit -m "feat(ui): update search results with product/service/artisan tabs and new card types"
```

---

## Phase 4: Booking Flow Updates

---

### Task 19: Update booking controller for product orders

**Files:**
- Modify: `kalasetu-backend/controllers/bookingController.js`

**Step 1: Update createBooking to handle product orders**

The existing `createBooking` function (line 49) needs to branch on offering type:

- If `offeringType === 'product'`: validate stock, accept quantity/variants/shippingAddress, skip time overlap check, set start=now end=estimated delivery
- If `offeringType === 'service_package'`: existing flow (time slot, overlap detection)
- If `offeringType === 'custom_order'`: create booking with status 'pending', no time slot required

For product orders, decrement stock after successful booking creation.

Key changes to Zod validation schema:
```javascript
const createBookingSchema = z.object({
  artisanId: z.string(),
  serviceId: z.string().optional(),       // renamed from serviceId
  offeringId: z.string().optional(),      // new: alias for serviceId
  offeringType: z.enum(['product', 'service_package', 'custom_order']).optional(),
  start: z.string().datetime().optional(), // optional for products
  end: z.string().datetime().optional(),   // optional for products
  notes: z.string().optional(),
  // Product-specific
  quantity: z.number().int().positive().optional(),
  variantSelections: z.array(z.object({
    name: z.string(),
    option: z.string(),
  })).optional(),
  shippingAddress: z.object({
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
  }).optional(),
});
```

**Step 2: Add stock decrement logic for product orders**

After successful product booking creation:
```javascript
if (offering.offeringType === 'product' && !offering.madeToOrder) {
  await ArtisanService.updateOne(
    { _id: offering._id },
    { $inc: { stock: -quantity } }
  );
}
```

**Step 3: Verify**

Run: `cd kalasetu-backend && npm run dev`
Test product order flow via curl with POST to `/api/bookings`

**Step 4: Commit**

```bash
git add kalasetu-backend/controllers/bookingController.js
git commit -m "feat(api): update booking creation to handle product orders with stock management"
```

---

### Task 20: Create product order flow on frontend

**Files:**
- Create: `kalasetu-frontend/src/components/booking/ProductOrderModal.jsx`
- Modify: `kalasetu-frontend/src/components/artisan/ProductDetailModal.jsx`

**Step 1: Create ProductOrderModal**

- Triggered from "Buy Now" in ProductDetailModal
- Shows: product summary, selected variants, quantity, price calculation
- Shipping address form (if delivery selected)
- Pickup option (if available)
- Total with shipping
- "Place Order" button → POST /api/bookings with offeringType: 'product'
- Success: show confirmation, redirect to order tracking

**Step 2: Wire up ProductDetailModal**

- "Add to Cart" → (future cart system, for now same as Buy Now)
- "Buy Now" → opens ProductOrderModal

**Step 3: Commit**

```bash
git add kalasetu-frontend/src/components/booking/ProductOrderModal.jsx kalasetu-frontend/src/components/artisan/ProductDetailModal.jsx
git commit -m "feat(ui): add product order flow with shipping address and variant selection"
```

---

### Task 21: Update service booking modal for packages

**Files:**
- Modify or create: `kalasetu-frontend/src/components/booking/BookPackageModal.jsx`

**Step 1: Create/update booking modal for service packages**

- Show package details: name, price, included items, duration
- Date/time picker (existing flow)
- Notes field (existing)
- "Book Now" → POST /api/bookings with offeringType: 'service_package'
- Show confirmation with booking details

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/booking/BookPackageModal.jsx
git commit -m "feat(ui): add package booking modal showing included items and duration"
```

---

### Task 22: Add custom order request flow

**Files:**
- Create: `kalasetu-frontend/src/components/booking/CustomOrderRequestModal.jsx`

**Step 1: Create modal**

- Shows artisan's custom order info (description, starting price, timeline)
- Pre-filled message template: "Hi, I'd like to request a custom order for..."
- Customer fills in: what they want, budget range, timeline preference
- "Send Request" → opens chat with pre-filled message (uses existing Stream Chat)
- Optionally creates a booking with status 'pending' and offeringType: 'custom_order'

**Step 2: Commit**

```bash
git add kalasetu-frontend/src/components/booking/CustomOrderRequestModal.jsx
git commit -m "feat(ui): add custom order request modal with chat integration"
```

---

## Final Verification

### Task 23: End-to-end verification and cleanup

**Step 1: Verify all API endpoints respond correctly**

```bash
# Products
curl http://localhost:5000/api/offerings/products
curl http://localhost:5000/api/offerings/packages
curl "http://localhost:5000/api/search/products?q=pottery"
curl "http://localhost:5000/api/search/packages?q=plumber"
curl http://localhost:5000/api/categories

# Existing endpoints still work
curl http://localhost:5000/api/services
curl "http://localhost:5000/api/services?type=service_package"
curl http://localhost:5000/api/artisans/featured
```

**Step 2: Verify frontend pages**

- Homepage: category cards link to `/category/:slug`, trending products + popular packages sections
- Category browse: `/category/handicrafts` → product grid, `/category/home-services` → package list
- Artisan profile: tabs for Products/Services/Custom/Reviews/About
- Search: `/search?q=pottery` → tabs for Products/Services/Artisans
- Artisan dashboard: Add Product wizard, Add Service Package wizard

**Step 3: Verify both user types work**

- Log in as artisan → create product, create package, enable custom orders
- Log in as user → browse products, book a package, request custom order
- Verify existing service bookings still work

**Step 4: Run frontend lint**

```bash
cd kalasetu-frontend && npm run lint
```

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete artisan offering system redesign — products, packages, custom orders"
```

---

## File Summary

### New Files (11)
| File | Purpose |
|------|---------|
| `kalasetu-backend/controllers/offeringController.js` | Product/package/custom CRUD |
| `kalasetu-backend/routes/offeringRoutes.js` | Offering API routes |
| `kalasetu-backend/scripts/migrateOfferings.js` | Data migration script |
| `kalasetu-frontend/src/pages/CategoryBrowsePage.jsx` | Smart category browsing |
| `kalasetu-frontend/src/components/browse/ProductGrid.jsx` | Product grid (Swiggy style) |
| `kalasetu-frontend/src/components/browse/PackageList.jsx` | Package list (UC style) |
| `kalasetu-frontend/src/components/artisan/ProductsTab.jsx` | Profile products tab |
| `kalasetu-frontend/src/components/artisan/PackagesTab.jsx` | Profile packages tab |
| `kalasetu-frontend/src/components/artisan/CustomOrdersTab.jsx` | Profile custom orders tab |
| `kalasetu-frontend/src/components/artisan/ProductDetailModal.jsx` | Product detail + variants |
| `kalasetu-frontend/src/components/profile/wizards/ProductWizard.jsx` | 5-step product creation |
| `kalasetu-frontend/src/components/profile/wizards/PackageWizard.jsx` | 5-step package creation |
| `kalasetu-frontend/src/components/profile/wizards/WizardStep.jsx` | Wizard step base component |
| `kalasetu-frontend/src/components/search/ProductCard.jsx` | Product search result card |
| `kalasetu-frontend/src/components/search/PackageCard.jsx` | Package search result card |
| `kalasetu-frontend/src/components/booking/ProductOrderModal.jsx` | Product order flow |
| `kalasetu-frontend/src/components/booking/BookPackageModal.jsx` | Package booking flow |
| `kalasetu-frontend/src/components/booking/CustomOrderRequestModal.jsx` | Custom order request |
| `kalasetu-frontend/src/components/home/TrendingProducts.jsx` | Homepage product carousel |
| `kalasetu-frontend/src/components/home/PopularPackages.jsx` | Homepage package carousel |

### Modified Files (12)
| File | Changes |
|------|---------|
| `kalasetu-backend/models/categoryModel.js` | + type, suggestedProducts |
| `kalasetu-backend/models/artisanServiceModel.js` | + offeringType, product/package/custom fields |
| `kalasetu-backend/models/artisanModel.js` | + artisanTypes, acceptsCustomOrders |
| `kalasetu-backend/models/bookingModel.js` | + offeringType, quantity, variants, shipping |
| `kalasetu-backend/controllers/artisanServiceController.js` | + type filtering, new fields |
| `kalasetu-backend/controllers/searchController.js` | + searchProducts, searchPackages |
| `kalasetu-backend/controllers/categoryController.js` | + getCategoryBySlug |
| `kalasetu-backend/routes/searchRoutes.js` | + /products, /packages routes |
| `kalasetu-backend/routes/categoryRoutes.js` | + /slug/:slug route |
| `kalasetu-backend/server.js` | + mount /api/offerings |
| `kalasetu-backend/scripts/seedCoreData.js` | + category types, artisanTypes |
| `kalasetu-frontend/src/App.jsx` | + /category/:slug route |
| `kalasetu-frontend/src/pages/HomePage.jsx` | + TrendingProducts, PopularPackages |
| `kalasetu-frontend/src/pages/ArtisanProfilePage.jsx` | Redesigned with offering tabs |
| `kalasetu-frontend/src/pages/SearchResults.jsx` | + type tabs, ProductCard, PackageCard |
| `kalasetu-frontend/src/components/Categories.jsx` | + type badges, /category links |
| `kalasetu-frontend/src/components/SearchBar.jsx` | + type hints in suggestions |
| `kalasetu-frontend/src/components/profile/tabs/ServicesTab.jsx` | Redesigned with sub-tabs + wizards |
| `kalasetu-backend/controllers/bookingController.js` | + product order handling |
| `kalasetu-backend/package.json` | + migrate:offerings script |
