# TASK: Fix View Profile Modal - Double Click to Close

## Priority: MEDIUM

## Problem
When clicking on the user profile and then clicking "View Profile", a modal/tab opens that requires **two clicks** to close instead of one. This is a poor user experience.

## Current Behavior
1. User clicks on their profile avatar/dropdown
2. User clicks "View Profile"
3. A modal or component opens
4. User tries to close it with one click - **doesn't work**
5. User must click again to actually close it

## Expected Behavior
- Modal/profile view should close with a single click on the close button or overlay
- Should follow standard modal UX patterns

## Files Likely Involved
- Profile dropdown component (contains "View Profile" link)
- Profile modal/view component
- Possibly a modal component or overlay handler

## Investigation Needed
1. Find where the "View Profile" link/button is located
2. Find the modal/component that opens when clicked
3. Check the close button handler
4. Check if there's event propagation issues (e.g., `stopPropagation` missing)
5. Check if there are multiple overlapping click handlers
6. Look for z-index or pointer-events CSS issues

## Possible Root Causes
- Event bubbling not being stopped properly
- Multiple click handlers stacked on the close button
- Close button requires two different state updates
- Modal state management issue (needs two renders to close)
- CSS pointer-events issue

## Success Criteria
- [ ] Modal opens when "View Profile" is clicked
- [ ] Modal closes with a **single click** on close button
- [ ] Modal closes with a **single click** on overlay (if applicable)
- [ ] No console errors
- [ ] Behavior is consistent across all user types (user, artisan, admin)

## Test Instructions
1. Login as any user type
2. Click on profile dropdown
3. Click "View Profile"
4. Try to close the modal with:
   - Close button (X)
   - Overlay click (if applicable)
   - ESC key (if applicable)
5. Verify it closes with one interaction

## Related Issues
- May be related to the modal component implementation
- Could affect other modals in the application
