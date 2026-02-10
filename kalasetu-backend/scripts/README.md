# Test Account Scripts

Essential scripts for creating test accounts for development and testing.

## Available Scripts

### `createTestUser.js`
Create/reset the test user account.
```bash
node scripts/createTestUser.js
```
- **Email:** `user@test.com`
- **Password:** `Test@123456`
- **Login:** `/user/login`

### `createTestArtisan.js`
Create/reset the test artisan account.
```bash
node scripts/createTestArtisan.js
```
- **Email:** `artisan@test.com`
- **Password:** `Test@123456`
- **Login:** `/artisan/login`

### `resetTestAdmin.js`
Create/reset the admin account.
```bash
node scripts/resetTestAdmin.js
```
- **Email:** `admin@kalasetu.com`
- **Password:** `Admin@123456`
- **Login:** `/admin/login`

### `checkArtisanStatus.js`
Debug utility to check artisan account status.
```bash
node scripts/checkArtisanStatus.js
```

## Quick Reset All Accounts
```bash
node scripts/createTestUser.js && node scripts/createTestArtisan.js && node scripts/resetTestAdmin.js
```
