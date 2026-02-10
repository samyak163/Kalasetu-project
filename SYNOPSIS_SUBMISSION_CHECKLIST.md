# PBL Synopsis Submission Checklist
## Quick Reference for Tomorrow's Submission

**Submission Deadline:** [ADD DATE]
**Time to Complete:** 4-6 hours (including diagram creation)

---

## Phase 1: Setup and Preparation (30 minutes)

### Files to Have Ready
- [ ] `PBL_SYNOPSIS_2025.md` (complete synopsis content) ✅ DONE
- [ ] `DIAGRAM_CREATION_GUIDE.md` (diagram instructions) ✅ DONE
- [ ] Old synopsis PDF (for logo and formatting reference)
- [ ] Module diagram example (index.jpeg)
- [ ] Microsoft Word or Google Docs installed

### Software/Tools Needed
- [ ] Microsoft PowerPoint or Draw.io (for diagrams)
- [ ] Screenshot tool (Snipping Tool / Snagit / Chrome extension)
- [ ] Microsoft Word (for final document)
- [ ] PDF converter (usually built into Word)

### Project Running Locally
- [ ] Backend running: `cd kalasetu-backend && npm run dev`
- [ ] Frontend running: `cd kalasetu-frontend && npm run dev`
- [ ] Check http://localhost:5173 loads correctly

---

## Phase 2: Create Diagrams (2-3 hours)

### Priority 1: Module Hierarchy Diagram (COMPULSORY)
**Time Estimate:** 60-90 minutes

- [ ] Open PowerPoint or Draw.io
- [ ] Follow `DIAGRAM_CREATION_GUIDE.md` Section "Diagram 1"
- [ ] Create central hub: "KalaSetu Platform"
- [ ] Add 10 primary modules with correct colors
- [ ] Mark NEW/ENHANCED modules with ✨
- [ ] Add sub-modules (smaller ovals)
- [ ] Add connecting lines
- [ ] Add legend
- [ ] Add title: "KalaSetu - Module Hierarchy Diagram"
- [ ] **Export as PNG (1920x1080 minimum)**
- [ ] Save as: `module_hierarchy_diagram.png`
- [ ] **VERIFY:** Open PNG file and check it's clear and readable

### Priority 2: Database ERD
**Time Estimate:** 45-60 minutes

- [ ] Open Draw.io or PowerPoint
- [ ] Follow `DIAGRAM_CREATION_GUIDE.md` Section "Diagram 2"
- [ ] Create 13 entity rectangles (User, Artisan, Booking, Payment, etc.)
- [ ] Add key fields to each entity
- [ ] Draw relationship lines with cardinality (1:1, 1:N, N:M)
- [ ] Add relationship labels ("creates", "has", "receives", etc.)
- [ ] Color code entities by type
- [ ] Add legend
- [ ] **Export as PNG**
- [ ] Save as: `database_erd.png`

### Optional: System Architecture Diagram
**Time Estimate:** 30 minutes

- [ ] Follow `DIAGRAM_CREATION_GUIDE.md` Section "Diagram 3"
- [ ] Show layers: Client → Frontend → Backend → Database/Services
- [ ] Export as: `system_architecture.png`

---

## Phase 3: Capture Screenshots (1-1.5 hours)

### Screenshot 1: Artisan Registration Page
- [ ] Go to http://localhost:5173/register
- [ ] Take full-page screenshot
- [ ] Save as: `screenshot_1_registration.png`

### Screenshot 2: Artisan Search Results
- [ ] Go to http://localhost:5173/search?q=carpenter (or any search)
- [ ] Show search bar, filters, artisan cards
- [ ] Save as: `screenshot_2_search_results.png`

### Screenshot 3: Artisan Profile Page
- [ ] Click on any artisan from search results
- [ ] Use scroll capture to get full page
- [ ] Save as: `screenshot_3_artisan_profile.png`

### Screenshot 4: Booking Modal
- [ ] On artisan profile, click "Book Now"
- [ ] Capture modal with form
- [ ] Save as: `screenshot_4_booking_modal.png`

### Screenshot 5: Artisan Dashboard - Bookings Tab
- [ ] Login as artisan (use demo account from CLAUDE.md)
- [ ] Email: `showcase.artisan@demo.kalasetu.com`
- [ ] Password: `Demo@1234`
- [ ] Go to Dashboard → Bookings tab
- [ ] Save as: `screenshot_5_artisan_bookings.png`

### Screenshot 6: Payment Summary
- [ ] Start a booking as customer
- [ ] Capture payment summary page (before Razorpay opens)
- [ ] Save as: `screenshot_6_payment_page.png`

### Screenshot 7: Artisan Earnings Dashboard
- [ ] As artisan, go to Earnings tab
- [ ] Capture charts and metrics
- [ ] Save as: `screenshot_7_earnings_dashboard.png`

### Screenshot 8: Review Form
- [ ] Find a completed booking
- [ ] Click "Write Review"
- [ ] Capture review form with star rating, text area
- [ ] Save as: `screenshot_8_review_form.png`

### Screenshot 9: Admin Dashboard
- [ ] Login as admin: `showcase.admin@kalasetu.com` / `SuperAdmin@123`
- [ ] Go to admin dashboard
- [ ] Capture metrics and charts
- [ ] Save as: `screenshot_9_admin_dashboard.png`

### Post-Screenshot Tasks
- [ ] All 9 screenshots captured
- [ ] Review each screenshot for clarity (not blurry)
- [ ] Crop unnecessary parts (browser UI, taskbar)
- [ ] Resize if too large (1200px width is good)

---

## Phase 4: Create Word Document (1.5-2 hours)

### Step 1: Setup Document

- [ ] Create new Word document
- [ ] Page Setup:
  - Paper: A4
  - Margins: Top 1", Bottom 1", Left 1.25", Right 1"
- [ ] Font: Times New Roman, 12pt
- [ ] Line spacing: 1.5

### Step 2: Copy Content from Markdown

**Tools to Convert Markdown → Word:**

**Option 1: Pandoc (Recommended, Fast)**
```bash
# Install pandoc if not installed
# Then run:
pandoc PBL_SYNOPSIS_2025.md -o PBL_SYNOPSIS_2025.docx

# This will create a Word document with most formatting preserved
```

**Option 2: Manual Copy-Paste**
- Open `PBL_SYNOPSIS_2025.md` in VS Code or text editor
- Copy section by section into Word
- Format headings, tables, lists manually

**Option 3: Use Online Converter**
- Go to https://www.markdowntoword.com/
- Upload `PBL_SYNOPSIS_2025.md`
- Download .docx file

### Step 3: Format Document

#### Title Page
- [ ] Add MITWPU logo (copy from old synopsis)
- [ ] Add project title (centered, 24pt, bold)
- [ ] Add subtitle: "Project-Based Learning Synopsis"
- [ ] Add team member names and roll numbers
- [ ] Add guide name
- [ ] Add department and year
- [ ] Add date

#### Table of Contents (Index)
- [ ] Verify page numbers match content
- [ ] Update if needed: References → Update Table
- [ ] Format: Two columns with dotted leaders

#### Section Formatting
- [ ] Heading 1 (Major sections): 16pt, Bold, Black
- [ ] Heading 2 (Subsections): 14pt, Bold, Black
- [ ] Heading 3 (Sub-subsections): 12pt, Bold, Black
- [ ] Body text: 12pt, Times New Roman, Justified
- [ ] Apply styles consistently throughout

#### Tables
- [ ] Format all tables with borders
- [ ] Header row: Bold, shaded background (#D9E2F3)
- [ ] Alternate row shading for long tables
- [ ] Center-align table titles
- [ ] Add "Table X.X:" prefix to titles

#### Lists
- [ ] Bullet points: Use • (not dash)
- [ ] Numbered lists: 1, 2, 3 (not 1), 2), 3))
- [ ] Sub-bullets: ◦ or –
- [ ] Consistent indentation

### Step 4: Insert Diagrams

#### Module Hierarchy Diagram (Section 3.2)
- [ ] Insert → Pictures → `module_hierarchy_diagram.png`
- [ ] Center align
- [ ] Width: 6 inches (maintain aspect ratio)
- [ ] Add caption: "Figure 3.1: KalaSetu Module Hierarchy Diagram"
- [ ] Add spacing: 12pt before and after

#### Database ERD (Section 3.4)
- [ ] Insert `database_erd.png`
- [ ] Center align
- [ ] Width: 6 inches
- [ ] Add caption: "Figure 3.2: Database Entity Relationship Diagram"

#### System Architecture (if created)
- [ ] Insert in Section 1.4 or 3.1
- [ ] Add caption: "Figure X.X: System Architecture"

### Step 5: Insert Screenshots

For each screenshot (Section 3.3):
- [ ] Insert screenshot at appropriate location
- [ ] Resize to fit page (5-6 inches width)
- [ ] Add border: Picture Format → Picture Border → Gray, 1pt
- [ ] Add caption: "Figure 3.X: [Screen Name]"
- [ ] Ensure quality is good when zoomed

**Caption Format:**
```
Figure 3.3: Artisan Registration Page
Figure 3.4: Artisan Search Results
Figure 3.5: Artisan Profile Page
... (and so on)
```

### Step 6: Final Formatting

#### Page Numbers
- [ ] Insert → Page Number → Bottom of Page → Plain Number 3
- [ ] Start page numbers from Introduction section (not title page)
- [ ] Title page and index: Roman numerals (i, ii, iii)
- [ ] Main content: Arabic numerals (1, 2, 3...)

#### Headers/Footers
- [ ] Header (optional): Project name "KalaSetu - PBL Synopsis"
- [ ] Footer: Page numbers (already added above)
- [ ] Font: 10pt, Gray

#### Section Breaks
- [ ] Insert page break before each major section
- [ ] Introduction should start on new page
- [ ] Each major heading (1., 2., 3.) starts on new page

#### Proofread
- [ ] Run spell check (Review → Spelling & Grammar)
- [ ] Check all headings are formatted consistently
- [ ] Verify all figures are referenced in text
- [ ] Check all page numbers in index are correct
- [ ] Read through for typos and grammar errors

---

## Phase 5: Generate PDF and Finalize (15-30 minutes)

### Create PDF
- [ ] File → Save As
- [ ] File type: PDF
- [ ] Options: Optimize for Standard (not Minimum size)
- [ ] Save as: `KalaSetu_PBL_Synopsis_2025.pdf`

### PDF Quality Check
- [ ] Open PDF and scroll through entire document
- [ ] Verify all images are clear (not pixelated)
- [ ] Check diagrams are readable
- [ ] Verify page numbers are correct
- [ ] Check no text is cut off at page margins

### Print Preparation (if physical submission required)
- [ ] Print one test page to check quality
- [ ] Verify colors print clearly (not too dark/light)
- [ ] Adjust printer settings if needed
- [ ] Print entire document
- [ ] Number of copies: [Check with faculty - usually 2-3 copies]

### Binding (if required)
- [ ] Spiral binding or thermal binding
- [ ] Cover page: Transparent sheet in front
- [ ] Back cover: Solid colored sheet
- [ ] Ensure pages are in order before binding

---

## Phase 6: Submission (5-10 minutes)

### Digital Submission (if applicable)
- [ ] Upload PDF to submission portal
- [ ] Verify file uploaded successfully
- [ ] Check file size is within limit (usually <50 MB)
- [ ] Take screenshot of successful submission

### Physical Submission
- [ ] Bound copies ready (check quantity required)
- [ ] Submit to faculty/department office
- [ ] Get acknowledgment receipt (if provided)
- [ ] Take photo of submitted synopsis (for records)

---

## Emergency Troubleshooting

### If Screenshots Don't Work
**Solution:** Use placeholder text temporarily
```
[Screenshot: Artisan Registration Page]
(Image shows registration form with fields for name, email, phone, password, skills, and city)
```

### If Diagrams Take Too Long
**Solution:** Simplify
- Module diagram: Show only primary modules (no sub-modules)
- ERD: Show only 5-6 main entities (User, Artisan, Booking, Payment, Review)

### If Time is Running Out
**Priority Order:**
1. ✅ Complete content (text) - Most Important
2. ✅ Module Hierarchy Diagram (compulsory)
3. ✅ Screenshots (at least 4-5 key screens)
4. ⚠️ Database ERD (can use simplified version)
5. ❌ Other diagrams (skip if necessary)

---

## Time Management Strategy

### Morning Session (9 AM - 1 PM) - 4 hours
- **9:00 - 10:30:** Create Module Hierarchy Diagram (90 min)
- **10:30 - 11:15:** Create Database ERD (45 min)
- **11:15 - 12:30:** Capture all 9 screenshots (75 min)
- **12:30 - 1:00:** Review diagrams and screenshots, make edits

**Lunch Break** (1 PM - 2 PM)

### Afternoon Session (2 PM - 6 PM) - 4 hours
- **2:00 - 2:30:** Convert markdown to Word / Setup document (30 min)
- **2:30 - 4:00:** Format content, tables, headings (90 min)
- **4:00 - 5:00:** Insert diagrams and screenshots (60 min)
- **5:00 - 5:30:** Final proofreading and fixes (30 min)
- **5:30 - 6:00:** Generate PDF, print, finalize (30 min)

**Total Time: 8 hours** (with buffer for breaks and unexpected issues)

---

## Quick Reference: What's Already Done

✅ **Complete synopsis content** (`PBL_SYNOPSIS_2025.md`)
✅ **Diagram creation guide** (`DIAGRAM_CREATION_GUIDE.md`)
✅ **All sections written** (Introduction, Proposed System, Analysis & Design)
✅ **Database schemas documented** (all 13 models)
✅ **Technology descriptions** (complete stack)

**What You Need to Do:**
1. Create visual diagrams (from text specifications)
2. Capture screenshots (app must be running)
3. Format in Word document
4. Insert visuals
5. Generate PDF

---

## Quality Checklist (Final Review)

### Content Quality
- [ ] All sections 1-3.4 present
- [ ] No placeholder text remaining
- [ ] All technical terms spelled correctly
- [ ] Consistent terminology throughout
- [ ] No "TODO" or "[Add here]" markers

### Visual Quality
- [ ] All diagrams clear and readable
- [ ] Screenshots not blurry or pixelated
- [ ] Consistent image sizes
- [ ] All figures have captions
- [ ] Professional appearance

### Formatting Quality
- [ ] Consistent heading styles
- [ ] Proper page breaks
- [ ] Page numbers correct
- [ ] Tables properly formatted
- [ ] No orphan headings (heading at bottom of page)

### Document Structure
- [ ] Title page complete with logo
- [ ] Index with correct page numbers
- [ ] All sections in order
- [ ] Conclusion present (if required)
- [ ] Bibliography/References (if required)

---

## Contact Information (For Help)

**Team Members:**
- [Add names and contact numbers]

**Guide:**
- [Professor name and email]

**Technical Issues:**
- IT Department
- Classmates for software help

---

## Post-Submission

### Backup
- [ ] Save final PDF to Google Drive / OneDrive
- [ ] Save Word document (.docx) to cloud
- [ ] Save all diagrams (original .pptx or .drawio files)
- [ ] Keep copy on USB drive

### Feedback
- [ ] Note any questions faculty asks during submission
- [ ] Document any suggestions for final report
- [ ] Keep synopsis for reference during final project report

---

## Good Luck! 🎓

**Remember:**
- Start early in the morning
- Take breaks every 90 minutes
- Ask team members for help if stuck
- Quality > Perfection (don't spend 2 hours on one diagram)
- Submit on time > Submit perfect

**You've got this!** The hard part (content writing) is already done. Now it's just formatting and visuals.

---

## Quick Command Reference

### Start Backend
```bash
cd kalasetu-backend
npm run dev
```

### Start Frontend
```bash
cd kalasetu-frontend
npm run dev
```

### Convert Markdown to Word (if using Pandoc)
```bash
pandoc PBL_SYNOPSIS_2025.md -o synopsis.docx
```

### Demo Account Credentials
**Artisan:**
- Email: showcase.artisan@demo.kalasetu.com
- Password: Demo@1234

**User:**
- Email: showcase.user@kalasetu.com
- Password: Demo@1234

**Admin:**
- Email: showcase.admin@kalasetu.com
- Password: SuperAdmin@123

---

## Final Checklist Before Submission

- [ ] PDF generated and opens correctly
- [ ] File size reasonable (<50 MB)
- [ ] All pages present (count matches expected)
- [ ] Images visible and clear
- [ ] Printed copies ready (if required)
- [ ] Submission portal/location confirmed
- [ ] Submitted on time ✅

**DONE!** 🎉
