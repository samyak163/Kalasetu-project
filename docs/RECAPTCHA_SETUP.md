# 🔐 reCAPTCHA Setup Guide

## Step 1: Get reCAPTCHA Keys from Google

### 1. Go to reCAPTCHA Admin Console
Visit: https://www.google.com/recaptcha/admin/create

### 2. Fill in the Registration Form

**Label:** `Kalasetu Production`

**reCAPTCHA type:** Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
- ✅ This gives users unlimited time to complete
- ✅ No score-based blocking
- ✅ Clear checkbox interface

**Domains:** Add your domains (one per line)
```
localhost
kalasetu-frontend-eosin.vercel.app
```

**Accept reCAPTCHA Terms of Service:** ✅ Check the box

**Send alerts to owners:** ✅ Check (optional)

### 3. Click "Submit"

You'll get two keys:

```
Site Key (Public):
6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

Secret Key (Private):
6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 2: Add Keys to Environment Variables

### Backend (Render):

Go to Render Dashboard → Your Backend Service → Environment

Add these variables:

```bash
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RECAPTCHA_SECRET_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Frontend (Vercel):

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add this variable:

```bash
VITE_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** Only the **Site Key** goes to frontend (it's public). Secret Key stays on backend only!

---

## Step 3: Install reCAPTCHA Package in Frontend

We'll need to install the reCAPTCHA library:

```bash
npm install react-google-recaptcha
```

---

## Step 4: Test reCAPTCHA

### Testing on Localhost:

Google provides test keys for development:

**Test Site Key:**
```
6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Test Secret Key:**
```
6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

These will always pass validation (for testing only).

---

## Important Notes:

✅ **reCAPTCHA v2 Checkbox** = No time limit, user-friendly
✅ **Free forever** = No cost for any volume
✅ **Works worldwide** = No restrictions
✅ **Site Key** = Public, goes in frontend
✅ **Secret Key** = Private, ONLY on backend

---

## Security:

⚠️ **NEVER** commit secret keys to GitHub
⚠️ **ALWAYS** use environment variables
⚠️ Secret key should ONLY be on Render backend
