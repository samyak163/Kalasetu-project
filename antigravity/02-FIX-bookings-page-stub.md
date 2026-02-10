# TASK: Implement Bookings Page (Currently Stub)

## Priority: CRITICAL

## Problem
The artisan bookings page at `kalasetu-frontend/src/pages/dashboard/artisan/Bookings.jsx` only shows "Coming soon" - no actual functionality.

## File to Fix
`kalasetu-frontend/src/pages/dashboard/artisan/Bookings.jsx`

## Current Code (entire file is just this)
```jsx
export default function Bookings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  );
}
```

## What You Need to Implement

### 1. Fetch artisan's bookings from API
```jsx
// API endpoint: GET /api/bookings/artisan
// Returns: Array of bookings for the logged-in artisan
```

### 2. Display bookings with status filters
- All bookings
- Pending (needs artisan response)
- Confirmed (upcoming)
- Completed
- Cancelled

### 3. For each booking, show:
- Customer name
- Service name
- Date/time
- Price
- Status badge
- Action buttons (Accept/Reject for pending, Mark Complete for confirmed)

### 4. Actions to implement:
- Accept booking: `PATCH /api/bookings/:id` with `{ status: 'confirmed' }`
- Reject booking: `PATCH /api/bookings/:id` with `{ status: 'cancelled' }`
- Complete booking: `PATCH /api/bookings/:id` with `{ status: 'completed' }`

## Reference Implementation

Look at these files for patterns:
- `kalasetu-frontend/src/components/profile/tabs/BookingsTab.jsx` - Has similar booking display
- `kalasetu-frontend/src/lib/axios.js` - How to make API calls

## Component Structure
```jsx
import { useState, useEffect } from 'react';
import api from '../../../lib/axios';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bookings/artisan');
      setBookings(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.patch(`/api/bookings/${bookingId}`, { status: newStatus });
      fetchBookings(); // Refresh list
    } catch (err) {
      alert('Failed to update booking');
    }
  };

  // Filter bookings based on selected filter
  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  // Render loading, error, or bookings list
  // ...
}
```

## Styling
Use existing Tailwind patterns from the project:
- Card: `bg-white rounded-lg shadow-sm border border-gray-200 p-4`
- Button primary: `bg-[#A55233] text-white px-4 py-2 rounded-lg hover:bg-[#8e462b]`
- Status badges: Use colored badges like in BookingsTab.jsx

## Success Criteria
- Artisan can see all their bookings
- Can filter by status
- Can accept/reject pending bookings
- Can mark confirmed bookings as complete
- Loading and error states work

## Related Files
- `kalasetu-backend/controllers/bookingController.js` - Backend logic
- `kalasetu-backend/routes/bookingRoutes.js` - API routes
- `kalasetu-frontend/src/components/profile/tabs/BookingsTab.jsx` - Reference UI
