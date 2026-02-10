# TASK: Fix PaymentButton Color

## Priority: MEDIUM (Quick Fix)

## Problem
PaymentButton uses blue color instead of brand color, breaking visual consistency.

## File to Fix
`kalasetu-frontend/src/components/Payment/PaymentButton.jsx`

## Current Code (around line 72-95)

```jsx
<button
  onClick={handlePayment}
  disabled={loading || disabled}
  className={`
    w-full py-3 px-4 rounded-lg font-semibold
    bg-blue-600 text-white          // WRONG - should be brand color
    hover:bg-blue-700               // WRONG
    disabled:bg-gray-400 disabled:cursor-not-allowed
    transition-colors
    ${className}
  `}
>
```

## Fix

Replace with brand color:

```jsx
<button
  onClick={handlePayment}
  disabled={loading || disabled}
  className={`
    w-full py-3 px-4 rounded-lg font-semibold
    bg-[#A55233] text-white
    hover:bg-[#8e462b]
    disabled:bg-gray-400 disabled:cursor-not-allowed
    transition-colors
    ${className}
  `}
>
```

**OR if you've done Task 07 (Tailwind design tokens):**

```jsx
<button
  onClick={handlePayment}
  disabled={loading || disabled}
  className={`
    w-full py-3 px-4 rounded-lg font-semibold
    bg-brand-500 text-white
    hover:bg-brand-600
    disabled:bg-gray-400 disabled:cursor-not-allowed
    transition-colors
    ${className}
  `}
>
```

**OR if you've done Task 08 (Button component):**

Replace the entire custom button with:
```jsx
import { Button } from '../ui';

// In the render:
<Button
  onClick={handlePayment}
  disabled={disabled}
  loading={loading}
  fullWidth
  size="lg"
>
  {children || `Pay ₹${amount}`}
</Button>
```

## Complete Fixed File

```jsx
import { useState } from 'react';
import { useRazorpay } from '../../lib/razorpay';

export default function PaymentButton({
  amount,
  recipientId,
  bookingId,
  purpose = 'booking',
  onSuccess,
  onError,
  disabled = false,
  className = '',
  children
}) {
  const [loading, setLoading] = useState(false);
  const { createOrder, verifyPayment } = useRazorpay();

  const handlePayment = async () => {
    if (loading || disabled) return;

    setLoading(true);
    try {
      // Create order
      const order = await createOrder({
        amount,
        recipientId,
        bookingId,
        purpose
      });

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        handler: async (response) => {
          try {
            await verifyPayment(response);
            onSuccess?.(response);
          } catch (err) {
            console.error('Payment verification failed:', err);
            onError?.(err);
          }
        },
        prefill: {
          // Could add user details here
        },
        theme: {
          color: '#A55233'  // Brand color in Razorpay modal too!
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment initiation failed:', err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading || disabled}
      className={`
        w-full py-3 px-4 rounded-lg font-semibold
        bg-[#A55233] text-white
        hover:bg-[#8e462b]
        focus:outline-none focus:ring-2 focus:ring-[#A55233] focus:ring-offset-2
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing...
        </span>
      ) : (
        children || `Pay ₹${amount}`
      )}
    </button>
  );
}
```

## Also Update Razorpay Theme

Note in the code above, also update the Razorpay modal theme:
```javascript
theme: {
  color: '#A55233'  // Brand color shows in Razorpay checkout
}
```

## Steps

1. Open `PaymentButton.jsx`
2. Find the button className
3. Replace `bg-blue-600` with `bg-[#A55233]`
4. Replace `hover:bg-blue-700` with `hover:bg-[#8e462b]`
5. Update Razorpay theme color
6. Test payment flow

## Success Criteria
- Payment button shows terracotta/brand color
- Hover state works
- Razorpay modal shows brand color
- Payment flow still works
