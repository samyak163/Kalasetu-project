# Diagram Creation Guide for PBL Synopsis

This document provides step-by-step instructions for creating all the diagrams needed for your PBL synopsis submission.

## Tools Recommended

**Option 1: PowerPoint (Easiest)**
- Available on most PCs
- Drag-and-drop interface
- Easy shape formatting
- Export as high-quality image

**Option 2: Draw.io (Free, Online)**
- Website: https://app.diagrams.net/
- Professional-looking diagrams
- Many templates available
- Save as PNG/JPG

**Option 3: Lucidchart (Professional)**
- Website: https://www.lucidchart.com/
- Free for students (limited)
- Great for complex diagrams

---

## Diagram 1: Module Hierarchy Diagram

### Overview
This is the most important diagram. It shows all modules of KalaSetu platform with the central platform hub and surrounding modules.

### Step-by-Step Instructions

#### Using PowerPoint:

**1. Setup**
- Create new blank slide
- Set slide size: Design → Slide Size → Custom (10" x 8")
- Background: White or very light gray (#F5F5F5)

**2. Create Central Hub**
- Insert → Shapes → Oval
- Draw large oval in center (3 inches wide, 2 inches tall)
- Fill color: Blue (#4A90E2)
- Add text: "KalaSetu\nPlatform"
- Text: White, Bold, 18pt

**3. Create Primary Modules (Around Center)**

Draw 10 ovals around the central hub, arranged in a circular pattern:

**Top Row (3 modules):**

**A. Authentication (Dark Red #C0392B)**
- Position: Top-left of center
- Text: "Authentication &\nAuthorization"
- Font: White, Bold, 12pt
- Draw line connecting to center

**B. User Management (Orange #E67E22)**
- Position: Top-center (above central hub)
- Text: "User Management"
- Draw line to center

**C. Search & Discovery (Purple #8E44AD)**
- Position: Top-right
- Text: "Search &\nDiscovery"
- Draw line to center

**Middle Row Left (2 modules):**

**D. Booking System (Green #27AE60) - ENHANCED**
- Position: Left of center
- Text: "Booking System\n✨ ENHANCED"
- Add a small yellow star emoji or icon
- Draw line to center
- Make the border slightly thicker (3pt) to show it's enhanced

**E. Payment System (Blue #3498DB) - ENHANCED**
- Position: Left-bottom
- Text: "Payment System\n✨ ENHANCED"
- Thicker border
- Draw line to center

**Middle Row Right (2 modules):**

**F. Communication (Light Blue #5DADE2)**
- Position: Right of center
- Text: "Communication"
- Draw line to center

**G. Review & Rating (Yellow #F1C40F) - ENHANCED**
- Position: Right-bottom
- Text: "Review & Rating\n✨ ENHANCED"
- Thicker border
- Draw line to center

**Bottom Row (3 modules):**

**H. Admin Panel (Pink #E91E63)**
- Position: Bottom-left
- Text: "Admin Panel"
- Draw line to center

**I. Subscription System (Light Green #7DCEA0) - NEW**
- Position: Bottom-center
- Text: "✨ Subscription\nSystem (NEW)"
- Make border dashed (Format Shape → Line → Dash type: Dash)
- Draw line to center

**J. Analytics & Insights (Teal #1ABC9C) - NEW**
- Position: Bottom-right
- Text: "✨ Analytics &\nInsights (NEW)"
- Dashed border
- Draw line to center

**4. Add Sub-modules (Smaller Ovals)**

For each primary module, add 2-4 smaller ovals showing sub-components:

**Example for Authentication:**
- Small oval 1: "Firebase Auth" (connected to Authentication oval)
- Small oval 2: "JWT Tokens"
- Small oval 3: "Bcrypt Hashing"
- Size: 1 inch wide, 0.6 inches tall
- Color: Lighter shade of parent module color
- Font: 10pt

**Example for Payment System:**
- Small oval 1: "Razorpay SDK"
- Small oval 2: "Webhook Handler"
- Small oval 3: "PDF Generator ✨ NEW"

**Continue for other modules...**

**5. Add Connecting Lines**
- All lines from modules to center should be straight
- Line weight: 2pt
- Line color: Gray (#7F8C8D)
- For NEW/ENHANCED modules: Use orange (#E67E22) line color

**6. Add Legend (Bottom-right corner)**
Create small box with:
```
Legend:
━━━ Regular Module
━━━ Enhanced Module (This Semester)
- - - New Module (This Semester)
✨ = Enhanced/New Feature
```

**7. Add Title**
- Top of diagram: "KalaSetu - Module Hierarchy Diagram"
- Font: Arial Black, 20pt, Black

**8. Export**
- File → Save As → PNG
- Resolution: 1920x1080 or higher
- Name: `module_hierarchy_diagram.png`

### Color Reference Sheet

Copy these hex codes for exact colors:

```
Central Hub:     #4A90E2 (Blue)
Authentication:  #C0392B (Dark Red)
User Mgmt:       #E67E22 (Orange)
Search:          #8E44AD (Purple)
Booking:         #27AE60 (Green)
Payment:         #3498DB (Blue)
Communication:   #5DADE2 (Light Blue)
Review:          #F1C40F (Yellow)
Admin:           #E91E63 (Pink)
Subscription:    #7DCEA0 (Light Green)
Analytics:       #1ABC9C (Teal)
Lines:           #7F8C8D (Gray)
Enhanced Lines:  #E67E22 (Orange)
```

---

## Diagram 2: Database Entity Relationship Diagram (ERD)

### Overview
Show the 13 database collections and their relationships.

### Using Draw.io:

**1. Setup**
- Go to https://app.diagrams.net/
- Create new diagram
- Choose "Blank Diagram"

**2. Create Entities (Rectangles)**

Use the "Entity" shape from the left panel (under "Entity Relation").

**Create these entities:**
1. User
2. Artisan
3. ArtisanService
4. Category
5. Booking
6. Payment
7. Review
8. Notification
9. Availability
10. CallHistory
11. OTP
12. Admin

**For each entity:**
- Add entity name at top (bold)
- Add key fields below:
  - User: _id, email, fullName, phone
  - Artisan: _id, email, fullName, skills, rating
  - Booking: _id, user, artisan, service, status
  - Payment: _id, booking, amount, status
  - etc.

**3. Add Relationships**

Draw lines connecting entities with relationship labels:

**User to Booking:**
- Line with "1" on User side, "N" on Booking side
- Label on line: "creates"

**Artisan to Booking:**
- Line with "1" on Artisan side, "N" on Booking side
- Label: "receives"

**Booking to Payment:**
- Line with "1" on both sides
- Label: "has"

**Booking to Review:**
- Line with "1" on both sides
- Label: "has"

**Artisan to ArtisanService:**
- Line with "1" on Artisan side, "N" on Service side
- Label: "offers"

**Category to ArtisanService:**
- Line with "1" on Category side, "N" on Service side
- Label: "contains"

**Artisan to Availability:**
- Line with "1" on Artisan side, "N" on Availability side
- Label: "has"

**User/Artisan to Notification:**
- Lines with "1" on User/Artisan side, "N" on Notification side
- Label: "receives"

**Booking to CallHistory:**
- Line with "1" on both sides (optional)
- Label: "may have"

**4. Add Legend**
- 1:1 = One-to-One relationship
- 1:N = One-to-Many relationship
- N:M = Many-to-Many relationship

**5. Color Coding**
- Core entities (User, Artisan, Booking): Light Blue (#E3F2FD)
- Transaction entities (Payment, Review): Light Green (#E8F5E9)
- Support entities (Notification, OTP): Light Yellow (#FFF9C4)
- Configuration (Category, Admin): Light Orange (#FFE0B2)

**6. Export**
- File → Export As → PNG
- Resolution: High quality
- Name: `database_erd.png`

---

## Diagram 3: System Architecture Diagram (Optional but Impressive)

### Overview
Shows the complete technical architecture with frontend, backend, database, and third-party services.

### Layout Structure:

```
┌─────────────────────────────────────────────┐
│          CLIENT LAYER (Browsers)            │
│  [Chrome] [Firefox] [Safari] [Mobile]       │
└─────────────────────────────────────────────┘
                    ↓ HTTPS
┌─────────────────────────────────────────────┐
│         FRONTEND LAYER (React)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ React UI │  │ Vite     │  │ Tailwind │  │
│  │ Context  │  │ Router   │  │ CSS      │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
                    ↓ REST API
┌─────────────────────────────────────────────┐
│        BACKEND LAYER (Node.js)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Express  │  │ Auth     │  │ Business │  │
│  │ Server   │  │ JWT      │  │ Logic    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
         ↓              ↓              ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  DATABASE    │ │ THIRD-PARTY  │ │  STORAGE     │
│  MongoDB     │ │  SERVICES    │ │  Cloudinary  │
│  Atlas       │ │              │ │              │
│              │ │ • Razorpay   │ │              │
│              │ │ • Stream     │ │              │
│              │ │ • Daily.co   │ │              │
│              │ │ • Algolia    │ │              │
│              │ │ • OneSignal  │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Instructions:**
1. Use rectangles for each layer
2. Use arrows to show data flow
3. Color code by layer:
   - Client: Light Gray
   - Frontend: Light Blue
   - Backend: Light Green
   - Database: Light Orange
   - Third-party: Light Purple
   - Storage: Light Pink

---

## Diagram 4: User Journey Flow (Booking Process)

### Overview
Flowchart showing the complete booking process from search to review.

### Using PowerPoint Flowchart Shapes:

**1. Start (Oval)**
- "Customer visits KalaSetu"

**2. Process Boxes (Rectangles)**
- "Search for artisan"
- "View profile & portfolio"
- "Select service"
- "Choose date & time"
- "Enter location"
- "Review booking summary"

**3. Decision Diamonds**
- "Instant booking?" → Yes/No paths
  - Yes → "Make payment"
  - No → "Request sent to artisan"

- "Payment successful?" → Yes/No
  - Yes → "Booking confirmed"
  - No → "Show error" → Back to payment

**4. Process Flow**
After booking confirmed:
- "Receive confirmation email"
- "Chat with artisan"
- "Service date arrives"
- "Service delivered"
- "Submit review"

**5. End (Oval)**
- "Booking complete"

**Colors:**
- Start/End: Light Green (#C8E6C9)
- Process: Light Blue (#BBDEFB)
- Decision: Light Yellow (#FFF9C4)
- Error: Light Red (#FFCDD2)

**Arrows:**
- Connect all shapes with arrows
- Label decision paths (Yes/No)

---

## Diagram 5: Sequence Diagram - Payment Flow (Advanced, Optional)

Shows the interaction between User, Frontend, Backend, and Razorpay during payment.

### Structure:

**Vertical Lines (Lifelines):**
1. User
2. Frontend (React)
3. Backend (Node.js)
4. Razorpay
5. Database

**Horizontal Arrows (Messages):**
1. User → Frontend: "Click Pay Now"
2. Frontend → Backend: "POST /api/payments/create-order"
3. Backend → Database: "Create Payment record"
4. Backend → Razorpay: "Create Razorpay Order"
5. Razorpay → Backend: "Return Order ID"
6. Backend → Frontend: "Return Order details"
7. Frontend → Razorpay: "Open Razorpay Checkout"
8. User → Razorpay: "Enter payment details"
9. Razorpay → Backend: "Webhook: Payment Success"
10. Backend → Database: "Update Payment status"
11. Backend → Frontend: "Payment confirmed"
12. Frontend → User: "Show success message"

**Tools:**
- Use Draw.io
- Select "UML" → "Sequence Diagram" template
- Add lifelines and messages as above

---

## Tips for Creating Professional Diagrams

### 1. Consistency
- Use same font throughout (Arial or Calibri recommended)
- Stick to chosen color scheme
- Make all similar shapes the same size

### 2. Clarity
- Don't overcrowd - leave white space
- Use labels on all connections
- Make text readable (minimum 10pt font)

### 3. Professional Touch
- Add subtle shadows to shapes (Format → Shadow → Outer shadow, 50% opacity)
- Align elements properly (use grid/alignment tools)
- Use consistent arrow styles

### 4. Color Guidelines
- Avoid pure black backgrounds (use dark gray #333333)
- Avoid pure white text on colored backgrounds (use light gray #F5F5F5)
- Test color contrast for readability
- Use pastel/light colors for fills, darker colors for borders

### 5. Export Settings
- Always export at high resolution (1920x1080 minimum)
- Use PNG format (better quality than JPG for diagrams)
- Save original editable files (.pptx, .drawio) for future edits

---

## Screenshot Guidelines for Sample Input/Output Screens

### Screenshots to Capture:

1. **Artisan Registration Page**
   - URL: http://localhost:5173/register
   - Full page screenshot
   - Show form with all fields

2. **Artisan Search Results**
   - URL: http://localhost:5173/search?q=carpenter
   - Show search bar, filters, and 4-6 artisan cards

3. **Artisan Profile Page**
   - URL: http://localhost:5173/artisan/[artisan-id]
   - Capture full page or scroll capture
   - Show profile, services, portfolio, reviews

4. **Booking Modal**
   - Open booking modal on any artisan profile
   - Show date picker and form fields

5. **Artisan Dashboard - Bookings Tab**
   - URL: http://localhost:5173/dashboard/artisan
   - Navigate to Bookings tab
   - Show booking cards

6. **Payment Page**
   - Capture the booking summary before Razorpay modal opens
   - Optionally: Razorpay payment options (after modal opens)

7. **Artisan Earnings Dashboard**
   - URL: http://localhost:5173/dashboard/artisan/earnings
   - Show charts and metrics

8. **Review Submission Form**
   - URL: After booking completion
   - Show star rating, text area, photo upload

9. **Admin Dashboard**
   - URL: http://localhost:5173/admin
   - Show metrics, charts, recent activity

### How to Take Screenshots:

**Windows:**
- Full screen: `Windows Key + Print Screen`
- Selected area: `Windows Key + Shift + S` (Snipping Tool)

**Mac:**
- Full screen: `Cmd + Shift + 3`
- Selected area: `Cmd + Shift + 4`

**Chrome Extension (Best for web pages):**
- Install "Full Page Screen Capture" extension
- Captures entire scrollable page

### Editing Screenshots:

**Tools:**
- Paint (Windows) - Basic cropping
- Paint.NET (Free, Windows) - Better editing
- GIMP (Free, Mac/Windows) - Advanced editing
- Photoshop (If available) - Professional

**Editing Steps:**
1. Crop unnecessary parts (browser chrome, taskbar)
2. Resize to reasonable dimensions (1200px width is good)
3. Add borders if needed (1px gray border looks professional)
4. Annotate with arrows or text if you want to highlight features
5. Save as PNG for best quality

---

## Checklist for Diagram Creation

### Module Hierarchy Diagram
- [ ] Central hub created and labeled
- [ ] All 10 primary modules created
- [ ] Colors match specification
- [ ] NEW/ENHANCED modules marked with ✨
- [ ] Sub-modules added
- [ ] All connecting lines drawn
- [ ] Legend added
- [ ] Title added
- [ ] Exported as high-resolution PNG

### Database ERD
- [ ] All 13 entities created
- [ ] Key fields listed in each entity
- [ ] Relationships drawn with cardinality (1:1, 1:N, N:M)
- [ ] Relationship labels added
- [ ] Color coding applied
- [ ] Legend added
- [ ] Exported as PNG

### Screenshots
- [ ] All 9 screenshots captured
- [ ] Screenshots cropped and resized
- [ ] Good quality (not blurry)
- [ ] Saved with descriptive names
- [ ] Ready to insert in Word document

---

## Inserting Diagrams into Word Document

### Method 1: Insert Picture
1. Open your synopsis Word document
2. Go to Section 3.2 (Module Hierarchy Diagram)
3. Click where you want the diagram
4. Insert → Pictures → This Device
5. Select your diagram PNG file
6. Click Insert

### Method 2: Drag and Drop
1. Open File Explorer
2. Navigate to saved diagram
3. Drag PNG file into Word document
4. Drop at desired location

### Formatting Diagrams in Word:

**After inserting:**
1. Click on image
2. Right-click → Wrap Text → "In Line with Text" (for centered placement)
3. Right-click → Size and Position
   - Set width: 6 inches (or fit to page width)
   - Maintain aspect ratio: Checked
4. Add caption below:
   - References → Insert Caption
   - Label: "Figure"
   - Position: Below selected item
   - Caption text: "Figure 3.1: Module Hierarchy Diagram"

**For best results:**
- Center-align the image
- Add 12pt spacing before and after
- Ensure caption is centered
- Use consistent image sizes throughout document

---

## Sample Module Hierarchy Diagram Layout (Text Version)

```
                [Auth]────[User Mgmt]────[Search]
                   │            │            │
                   │            │            │
                   └────────────┼────────────┘
                                │
                        [KalaSetu Platform]
                                │
                   ┌────────────┼────────────┐
                   │            │            │
           [Booking✨]───[Payment✨]───[Communication]
                   │            │            │
                   │            │            │
    [Review✨]─[Admin]─[Subscription✨]─[Analytics✨]

Legend:
✨ = Enhanced/New this semester
Sub-modules shown as smaller circles connected to parent modules
```

---

## Final Tips

1. **Start Early:** Diagrams take time - don't leave for last minute
2. **Get Feedback:** Show diagrams to team members first
3. **Keep It Simple:** Don't overcomplicate - clarity is key
4. **Save Often:** Save original files frequently
5. **Multiple Exports:** Export diagrams at different resolutions (use highest for submission)
6. **Test Print:** Print one page to check if colors and text are clear
7. **Backup:** Save diagrams in cloud (Google Drive) as backup

---

## Need Help?

If you have questions about creating any diagram:
1. Google "[diagram type] tutorial PowerPoint"
2. YouTube: "How to create [diagram type]"
3. Ask team members
4. Check university library for design resources

**Good luck with your synopsis submission!** 🎓
