# Testing Patterns

**Analysis Date:** 2026-02-12

## Test Framework

**Status:** No test infrastructure configured

**Runner:**
- Not detected - no Jest, Vitest, Mocha, or other test runner in either frontend or backend `package.json`
- Backend `package.json` has no `"test"` script
- Frontend ESLint runs in CI (`.github/workflows/ci.yml`) but lint errors marked `continue-on-error: true`

**Assertion Library:**
- Not detected - no assert, Jest matchers, or Chai installed

**Run Commands:**
```bash
# Frontend
npm run lint              # Check ESLint violations (frontend only)

# Backend
npm run dev              # Development with nodemon
npm start                # Production server

# No testing commands available - tests not configured
```

## Test File Organization

**Current State:**
- No test files found in `src/` directories of frontend or backend
- Test dependencies not installed in either project
- Codebase uses no `.test.js`, `.spec.js`, `.test.jsx`, `.spec.jsx` files

**Where Tests Would Go (if implemented):**
- Frontend: `src/**/__tests__/` or co-located `ComponentName.test.jsx` next to `ComponentName.jsx`
- Backend: `tests/` or `__tests__/` directory with structure mirroring `controllers/`, `middleware/`, `utils/`

**Naming Convention (if implemented):**
- Frontend: `ComponentName.test.jsx` for component tests, `hookName.test.js` for hook tests
- Backend: `controllerName.test.js`, `utilName.test.js`, `middlewareName.test.js`

## Test Structure (Not Currently Used)

**Where This Would Go:**
- Frontend unit tests would use React Testing Library patterns
- Backend unit tests would use async/await with mocked dependencies

**Current Code Patterns That Show How Tests Would Be Written:**

**Example pattern for async controller test (if written):**
```javascript
// Based on actual controller pattern in authController.js
const testRegister = async () => {
  // Setup: Mock Artisan model with findOne and create
  const mockArtisan = { _id: 'id123', email: 'test@example.com' };

  // Call: register({ fullName, email, password }, res)
  // Verify: res.status(201) called, token set in cookie
  // Verify: indexArtisan() called (non-blocking)
};
```

**Example pattern for component test (if written):**
```javascript
// Based on actual component pattern in Header.jsx
const testHeaderAuthLinks = () => {
  // Setup: Render Header with AuthContext { user: null }
  // Verify: Sign In and Sign Up links render

  // Rerender with AuthContext { user: {...} }
  // Verify: Profile dropdown renders instead
};
```

## Mocking

**If Tests Were Implemented:**

**Framework:** Would use Jest or Vitest built-in mocking:
```javascript
// Mock Mongoose model
jest.mock('../models/artisanModel.js');

// Mock axios
jest.mock('axios');

// Mock environment
process.env.JWT_SECRET = 'test-secret';
```

**Patterns (based on controller structure):**
```javascript
// Mock async database calls
Artisan.findOne.mockResolvedValueOnce(null);  // For "not found" case
Artisan.findOne.mockResolvedValueOnce(mockData);  // For "exists" case

// Mock bcrypt
bcrypt.genSalt.mockResolvedValueOnce('salt123');
bcrypt.hash.mockResolvedValueOnce('hashed');
```

**What to Mock:**
- Database models (Mongoose): `Artisan.findOne()`, `User.create()`, `Booking.findByIdAndUpdate()`
- External services: Cloudinary, Algolia, SendGrid (email), Firebase Admin, Stream Chat, Daily.co
- HTTP requests: `axios` calls to external APIs
- Cryptographic functions: `bcrypt.hash()`, `crypto.randomBytes()`, `jwt.sign()`
- Environment-dependent services: Sentry, PostHog, OneSignal

**What NOT to Mock:**
- Core utilities like `escapeRegex()`, `calculateDistance()` - test actual logic
- Express/Koa middleware in isolation (test via supertest request layer)
- Zod validation schemas - test actual schema behavior
- Response status code setting (test via HTTP layer, not mock)

## Fixtures and Factories

**Not Currently Used**

**If Implemented, Would Look Like:**

```javascript
// Mock data in test setup
const mockArtisan = {
  _id: 'artisan_123',
  fullName: 'Test Artisan',
  email: 'test@example.com',
  isVerified: false,
  createdAt: new Date('2024-01-01')
};

const mockUser = {
  _id: 'user_456',
  fullName: 'Test User',
  email: 'user@example.com',
  verified: true
};

// Reusable test data factory
const createMockBooking = (overrides = {}) => ({
  _id: 'booking_789',
  artisan: 'artisan_123',
  user: 'user_456',
  status: 'confirmed',
  amount: 5000,
  ...overrides
});
```

**Would Live In:**
- `tests/fixtures/` or `tests/__fixtures__/`
- `__tests__/mocks/` for complex factories

## Coverage

**Requirements:**
- Not enforced - no test infrastructure to track coverage
- Would be configured via Jest config if tests existed: `collectCoverage: true`, `coverageThreshold: { global: { lines: 80 } }`

**View Coverage (if configured):**
```bash
npm test -- --coverage
# Would generate coverage/ directory with HTML report
```

## Test Types

**Unit Tests (If Implemented):**
- Controller endpoints: Verify request validation, database calls, response format
- Utility functions: `calculateDistance()`, `escapeRegex()`, `signJwt()`
- Validation schemas: Zod schema behavior for valid/invalid inputs
- Hooks: React hook state and effect behavior via @testing-library/react-hooks
- Middleware: Auth validation, error handling in isolation

**Integration Tests (If Implemented):**
- Full API request flows: POST /api/auth/register → database check → token generation
- Multi-step workflows: Register → Send Email → Verify Email
- Database interactions: Model methods with real schema validation
- External service calls: Algolia indexing, Cloudinary uploads (via mocked client)

**E2E Tests:**
- Not used - no Playwright, Cypress, or Puppeteer configured
- Manual testing documented in CLAUDE.md demo accounts:
  - Artisan: `showcase.artisan@demo.kalasetu.com` / `Demo@1234`
  - User: `showcase.user@kalasetu.com` / `Demo@1234`
  - Admin: `showcase.admin@kalasetu.com` / `SuperAdmin@123`

## Common Patterns (If Tests Were Written)

**Async Testing Pattern:**
```javascript
// Based on async controllers throughout codebase
describe('getDashboardStats', () => {
  it('should return dashboard stats', async () => {
    // Mocks set up
    const req = { query: { period: '7days' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Call async function
    await getDashboardStats(req, res);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: expect.objectContaining({ overview: expect.any(Object) })
    }));
  });
});
```

**Error Testing Pattern:**
```javascript
// Based on error handling in authController.js
describe('register', () => {
  it('should return 400 for duplicate email', async () => {
    Artisan.findOne.mockResolvedValueOnce({ _id: 'existing' }); // Email exists

    const req = { body: { email: 'test@example.com', password: 'pwd123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('already registered') })
    );
  });
});
```

**Middleware Testing Pattern:**
```javascript
// Based on authMiddleware.js
describe('protect middleware', () => {
  it('should set req.user for valid token', async () => {
    const req = { cookies: { ks_auth: 'valid.jwt.token' } };
    const res = {};
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: 'user_123' });
    Artisan.findById.mockResolvedValueOnce(mockArtisan);

    await protect(req, res, next);

    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
});
```

**React Component Testing Pattern:**
```javascript
// Based on Header.jsx component structure
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

describe('Header', () => {
  it('should render Sign In link when user is logged out', () => {
    const mockAuthContext = { auth: { user: null }, logout: jest.fn() };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
```

## Current Test Status

**Backend:**
- No unit or integration tests
- Controllers use explicit try-catch error handling (testable with mocks)
- Database-heavy operations (suitable for integration testing with test database)
- Async patterns consistent and mockable

**Frontend:**
- No component unit tests
- Uses React Context and hooks (testable with React Testing Library)
- Event handlers and async functions (testable with Jest)
- ESLint runs in CI to catch syntax/unused variable issues

**CI/CD:**
- GitHub Actions workflow in `.github/workflows/ci.yml`
- Frontend: Runs ESLint with `continue-on-error: true` (failures don't block)
- Backend: No linting or testing in CI
- Deployment: Manual (no automated deployment script)

## Known Testing Gaps

**Critical Areas Not Tested:**
- Authentication flows (register, login, token refresh)
- Payment processing (Razorpay integration)
- Real-time chat (Stream Chat integration)
- Video calls (Daily.co integration)
- Email sending and OTP verification
- Database operations on actual models
- Zod validation schema enforcement
- Admin dashboard analytics and aggregations

**Risk:**
- Bugs in auth can allow unauthorized access
- Payment failures silent (no integration tests)
- Database migrations untested
- Edge cases in date/time calculations not verified

**Recommendation:**
- Priority 1: Add auth integration tests
- Priority 2: Add controller unit tests with mocked models
- Priority 3: Add React component snapshot/behavior tests

---

*Testing analysis: 2026-02-12*
