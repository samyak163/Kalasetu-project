# 🎯 Quick Reference - Demo Artisan Management

## Status: ✅ ALL DONE!

All 20 demo artisans are verified and showing on your website!

---

## Quick Commands

```bash
# Verify existing demo artisans
npm run verify:demos

# Clean database (keep demos only)
npm run cleanup

# Re-seed 20 verified demo artisans
npm run seed

# Clean + Re-seed
npm run cleanup && npm run seed
```

---

## Demo Login Credentials

**Any of these 20 emails** + password `Password123`:

- rajesh.patil@demo.kalasetu.com
- priya.sharma@demo.kalasetu.com
- amit.kulkarni@demo.kalasetu.com
- *(see DEMO_VERIFICATION.md for full list)*

---

## What's Auto-Verified Now

✅ **Seed Script** (`seedArtisans.js`)
- Creates all new demo artisans with `emailVerified: true`
- No manual verification needed

✅ **Verify Script** (`verifyDemoArtisans.js`)
- Updates existing demo artisans to verified
- Run anytime with `npm run verify:demos`

✅ **Your Current Database**
- All 20 demos already verified ✅
- Ready for presentation

---

## Regular (Non-Demo) Artisans

⚠️ Still require email verification:
- Verification emails sent (check spam folder)
- Link printed in backend console for testing
- See `docs/EMAIL_SETUP.md` for details

---

## For Your Presentation

**Before demo:**
```bash
npm run cleanup  # Remove test accounts
npm run seed     # Re-add 20 verified demos
```

**During demo:**
- All artisans visible immediately
- No waiting for email verification
- Can login with any demo account
- Full booking/messaging functionality

---

## Files Changed

1. `scripts/seedArtisans.js` - Auto-verify on creation
2. `scripts/verifyDemoArtisans.js` - Verify existing demos
3. `package.json` - Added `verify:demos` command
4. `README.md` - Documentation added
5. `docs/DEMO_VERIFICATION.md` - Full guide
6. `docs/EMAIL_SETUP.md` - Email troubleshooting

---

**Everything is ready! 🚀**
