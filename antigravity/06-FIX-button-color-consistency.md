# TASK: Fix Button Color Inconsistency

## Priority: HIGH (UI)

## Problem
Buttons across the app use inconsistent colors:
- Primary CTAs use #A55233 (brand color) - CORRECT
- Payment button uses blue (#3B82F6) - WRONG
- Location button uses indigo (#4F46E5) - WRONG
- Some chat buttons use blue - WRONG

## Files to Fix

### 1. PaymentButton.jsx
`kalasetu-frontend/src/components/Payment/PaymentButton.jsx`

Current (around line 75):
```jsx
className="bg-blue-600 hover:bg-blue-700 ..."
```

Change to:
```jsx
className="bg-[#A55233] hover:bg-[#8e462b] ..."
```

### 2. Header.jsx - Location Button
`kalasetu-frontend/src/components/Header.jsx`

Current (lines 179 and 311):
```jsx
className="... border-indigo-600 text-indigo-600 ... hover:bg-indigo-50 ..."
```

Change to:
```jsx
className="... border-[#A55233] text-[#A55233] ... hover:bg-orange-50 ..."
```

### 3. SearchResults.jsx - Chat Buttons
`kalasetu-frontend/src/pages/SearchResults.jsx`

Find any blue buttons and change to brand color or make them secondary (outlined).

## Color Hierarchy to Follow

```
PRIMARY ACTIONS (Book, Pay, Submit, Save):
  bg-[#A55233] text-white hover:bg-[#8e462b]

SECONDARY ACTIONS (Chat, Cancel, Edit):
  bg-white text-[#A55233] border-2 border-[#A55233] hover:bg-orange-50

TERTIARY/GHOST ACTIONS (Filters, Back):
  bg-gray-100 text-gray-700 hover:bg-gray-200

DANGER ACTIONS (Delete, Logout):
  bg-red-600 text-white hover:bg-red-700
  OR
  text-red-600 hover:bg-red-50 (for less prominent)
```

## Steps

1. Search for `bg-blue-600` in the frontend - replace with brand color or make secondary
2. Search for `bg-blue-500` - same
3. Search for `border-indigo` - replace with brand color
4. Search for `text-indigo` - replace with brand color
5. Verify each button's purpose and apply correct color hierarchy

## Specific Changes

### PaymentButton.jsx
```jsx
// Find and replace the button className
<button
  className={`
    w-full py-3 px-4 rounded-lg font-semibold
    bg-[#A55233] text-white
    hover:bg-[#8e462b]
    disabled:bg-gray-400 disabled:cursor-not-allowed
    transition-colors
    ${className}
  `}
  ...
>
```

### Header.jsx - Current Location Button (appears twice)
```jsx
<button
  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2
             border-2 border-[#A55233] text-[#A55233]
             rounded-lg hover:bg-orange-50 transition-colors text-sm"
>
  Use Current Location
</button>
```

## Testing

After changes:
1. Visit homepage - check header buttons
2. Visit search results - check all action buttons
3. Go to booking/payment flow - check payment button
4. All primary actions should be terracotta (#A55233)
5. Secondary actions should be outlined in terracotta

## Success Criteria
- All primary action buttons use #A55233
- All secondary action buttons use outlined style with #A55233
- No blue or indigo buttons remain (unless specifically for links)
- Visual consistency across the app

## Files to Search
```bash
# Run these in kalasetu-frontend to find all occurrences
grep -r "bg-blue-" src/
grep -r "border-indigo" src/
grep -r "text-indigo" src/
grep -r "bg-indigo" src/
```
