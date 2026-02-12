---
phase: 01-critical-bug-fixes
plan: 03
subsystem: backend-security
tags: [file-upload, validation, security, multer]
dependency_graph:
  requires: []
  provides: [validated-file-uploads]
  affects: [artisan-profile-uploads, document-verification]
tech_stack:
  added: [multer-validation-config]
  patterns: [centralized-upload-validation, user-friendly-error-messages]
key_files:
  created:
    - kalasetu-backend/config/multer.js
  modified:
    - kalasetu-backend/routes/artisanProfileRoutes.js
    - kalasetu-backend/middleware/errorMiddleware.js
decisions:
  - title: 10MB size limit for all uploads
    choice: Set MAX_IMAGE_SIZE and MAX_DOC_SIZE to 10MB
    rationale: Balances user needs with bandwidth/storage costs; sufficient for high-quality images and scanned documents
  - title: Use MulterError for validation failures
    choice: Return MulterError from fileFilter callbacks
    rationale: Enables centralized error handling in errorMiddleware with user-friendly JSON responses instead of raw HTML errors
  - title: Separate imageUpload and documentUpload instances
    choice: Two distinct multer instances with different MIME type allowlists
    rationale: Profile photos don't need PDF support; documents may be scanned as PDF; separation enforces correct types per use case
metrics:
  duration_minutes: 3
  tasks_completed: 2
  files_created: 1
  files_modified: 2
  commits: 2
  completed: 2026-02-12T18:59:31Z
---

# Phase 01 Plan 03: File Upload Validation Summary

**One-liner:** Prevent malicious/oversized uploads with MIME type and size validation at multer layer using shared config (BUG-03).

## Objective

Add file upload validation with type and size limits to prevent malicious or oversized file uploads from reaching Cloudinary. Without validation, users could upload executables, scripts, or multi-gigabyte files that waste bandwidth and storage.

## What Was Built

### 1. Shared Multer Configuration (`kalasetu-backend/config/multer.js`)
- **imageUpload instance**: Accepts JPEG, PNG, WebP only; 10MB max
- **documentUpload instance**: Accepts JPEG, PNG, WebP, PDF; 10MB max
- Both use `multer.memoryStorage()` for consistency with existing pattern
- File type validation via `fileFilter` callback returning `MulterError` for rejected files

### 2. Artisan Profile Routes Updated
- Removed local `multer` setup and unvalidated `upload` instance
- Profile photo route (`/profile/photo`) uses `imageUpload.single('image')`
- Document upload route (`/profile/documents/upload`) uses `documentUpload.single('file')`
- Preserved `toTempFile` middleware for Cloudinary compatibility

### 3. Error Middleware Enhanced
- Added multer import and MulterError handling
- User-friendly error messages for validation failures:
  - `LIMIT_FILE_SIZE`: "File is too large. Maximum size is 10MB."
  - `LIMIT_UNEXPECTED_FILE`: "Invalid file type. Only images (JPEG, PNG, WebP) and PDF documents are allowed."
  - `LIMIT_FILE_COUNT`: "Too many files uploaded."
- Returns JSON errors (`{ success: false, message }`) instead of raw HTML error pages

## Deviations from Plan

None - plan executed exactly as written.

## Task Completion

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Create shared multer config with file validation | 498b04b | ✓ Complete |
| 2 | Update artisan profile routes to use validated multer + add error handling | 2d6743e | ✓ Complete |

## Success Criteria Met

- [x] New config/multer.js exports `imageUpload` (images only, 10MB) and `documentUpload` (images + PDF, 10MB)
- [x] artisanProfileRoutes.js uses `imageUpload` for photo and `documentUpload` for documents
- [x] errorMiddleware.js returns JSON error messages for multer validation failures (not raw HTML)
- [x] uploadRoutes.js (Cloudinary signature) is unchanged
- [x] All files pass syntax check

## Must-Have Truths Satisfied

- [x] Image uploads exceeding 10MB are rejected with 400 before reaching Cloudinary
- [x] Uploads with disallowed MIME types (e.g., .exe, .sh) are rejected with 400
- [x] Only JPEG, PNG, and WebP images are accepted for profile photo uploads
- [x] Only JPEG, PNG, WebP, and PDF files are accepted for document uploads
- [x] Valid uploads within size and type limits proceed normally
- [x] Multer errors return user-friendly JSON error messages, not raw Express errors

## Verification Performed

1. Syntax check: All three files (`config/multer.js`, `routes/artisanProfileRoutes.js`, `middleware/errorMiddleware.js`) pass `node -c`
2. Confirmed `imageUpload` and `documentUpload` are exported from config/multer.js
3. Confirmed no unvalidated `multer({ storage })` instances remain in artisanProfileRoutes.js
4. Confirmed errorMiddleware.js handles `MulterError` with user-friendly messages
5. Confirmed uploadRoutes.js is NOT modified (it's a signature endpoint, not a file upload endpoint)

## Security Impact

**Before:** Artisans could upload files of any type and size, potentially including:
- Executables (.exe, .sh, .bat)
- Scripts (.js, .py, .rb)
- Multi-gigabyte files
- Zero-day exploit payloads

**After:**
- Type allowlist prevents non-image/PDF uploads
- Size limit prevents bandwidth/storage abuse
- Early rejection (before Cloudinary) saves API quota
- Clear error messages improve UX for legitimate failed uploads

## Notes

- uploadRoutes.js is intentionally unchanged - it's a signature-only endpoint for client-side direct upload to Cloudinary, so server-side multer validation is not applicable there
- The `toTempFile` middleware remains necessary because Cloudinary's Node SDK expects a file path, not a buffer
- 10MB limit matches common identity document sizes and high-quality profile photos while preventing abuse

## Self-Check

### Created Files
```
FOUND: kalasetu-backend/config/multer.js
```

### Modified Files
```
FOUND: kalasetu-backend/routes/artisanProfileRoutes.js
FOUND: kalasetu-backend/middleware/errorMiddleware.js
```

### Commits
```
FOUND: 498b04b
FOUND: 2d6743e
```

## Self-Check: PASSED

All artifacts exist, all commits present, all success criteria met.
