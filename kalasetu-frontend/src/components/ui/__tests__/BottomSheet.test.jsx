import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import BottomSheet from '../BottomSheet.jsx';

afterEach(() => {
  cleanup();
});

describe('BottomSheet', () => {
  it('does not throw when Escape is pressed while closing is disabled', () => {
    render(
      <BottomSheet open title="Payment Pending">
        <div>Checkout content</div>
      </BottomSheet>
    );

    expect(() => fireEvent.keyDown(document, { key: 'Escape' })).not.toThrow();
    expect(screen.getByText('Checkout content')).toBeInTheDocument();
  });

  it('disables the close button when no onClose handler is provided', () => {
    render(
      <BottomSheet open title="Payment Pending">
        <div>Checkout content</div>
      </BottomSheet>
    );

    expect(screen.getByRole('button', { name: /close/i })).toBeDisabled();
  });
});
