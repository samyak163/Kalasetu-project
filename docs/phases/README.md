# KalaSetu Demo Phases

> **Purpose:** Three progressive demo phases for professor review. Each phase is a deployable milestone.
> **Strategy:** Git tags + Vercel preview deployments. Show one phase at a time.

---

## Deployment Strategy

Each phase gets a git tag. Vercel deploys each tag as a preview URL.

```
Phase 1 tag: phase-1-foundation  -->  phase-1--kalasetu.vercel.app
Phase 2 tag: phase-2-marketplace -->  phase-2--kalasetu.vercel.app
Phase 3 tag: phase-3-production  -->  phase-3--kalasetu.vercel.app
```

**How to deploy a specific phase:**
1. Complete all work for the phase
2. `git tag phase-X-name`
3. `git push origin phase-X-name`
4. Vercel auto-deploys the tag as a preview

**How to show a specific phase to mam:**
- Open the Vercel dashboard
- Navigate to the deployment for that tag
- Share the preview URL

---

## Phase Overview

| Phase | Name | Goal | Demo Story |
|-------|------|------|------------|
| **1** | Foundation & Stability | Platform works reliably, securely, with clean code | "We built a solid, secure marketplace" |
| **2** | Enhanced Marketplace | Every user journey is complete and polished | "Every feature works end-to-end" |
| **3** | Full Production Platform | Business-ready with advanced features | "Ready for real artisans and customers" |

---

## Phase Progression

```
PHASE 1: Foundation                PHASE 2: Marketplace              PHASE 3: Production
========================          ========================          ========================
Fix critical bugs                 Complete booking flow              Artisan business tools
Security hardening                Payment system completion          Customer features
Code quality cleanup              Review system enhancement          Trust & safety
UI polish on existing pages       Chat/messaging integration         Admin analytics
Basic test setup                  Customer dashboard                 SEO & marketing
Error boundaries                  Artisan dashboard                  Performance optimization
MessagesPage fix                  Video call scheduling              Full demo flow
Bookings dashboard                Notification center                Onboarding wizard
```

---

## Success Criteria Per Phase

### Phase 1: "It works reliably"
- [ ] Zero crashes on any page
- [ ] All auth flows work (artisan + customer + admin)
- [ ] No security vulnerabilities in code review
- [ ] Build passes with zero errors
- [ ] Basic test suite exists and passes

### Phase 2: "Every journey is complete"
- [ ] Artisan can: register -> profile -> services -> availability -> receive booking -> get paid
- [ ] Customer can: search -> discover -> book -> pay -> chat -> video -> review
- [ ] Admin can: manage artisans, bookings, payments, reviews, support tickets
- [ ] All notifications fire correctly

### Phase 3: "Production-ready"
- [ ] Performance: <3s page load, <500ms API responses
- [ ] SEO: proper meta tags, schema.org, sitemap
- [ ] Full artisan onboarding wizard
- [ ] Analytics dashboard for admin
- [ ] All features polished and demo-ready

---

## File Structure

```
docs/phases/
  README.md          <-- This file (overview)
  phase-1/
    GOALS.md         <-- What Phase 1 achieves
    SCOPE.md         <-- Detailed task list
    FINDINGS.md      <-- Quality gate findings (populated after review)
  phase-2/
    GOALS.md
    SCOPE.md
  phase-3/
    GOALS.md
    SCOPE.md
```

---

*Created: 2026-02-17*
