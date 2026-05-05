import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import Warning from './Warning';

const toggleModal = jest.fn();
const handleConfirm = jest.fn();

describe('Test <Warning/> ', () => {
  it('render when closed at first and then opened', () => {
    const { rerender } = render(
      <Warning toggleModal={toggleModal} handleConfirm={handleConfirm} />
    );
    rerender(
      <Warning isOpen toggleModal={toggleModal} handleConfirm={handleConfirm} />
    );
    expect(screen.getByTestId('warning-modal')).toBeInTheDocument();
  });
  it('handle close to close modal', async () => {
    render(
      <Warning isOpen toggleModal={toggleModal} handleConfirm={handleConfirm} />
    );
    const button = screen.getByTestId('close-button');
    userEvent.click(button);
    await waitFor(() => {
      expect(toggleModal).toHaveBeenCalled();
    });
  });
  it('handle confirm to close to close modal', async () => {
    render(
      <Warning isOpen toggleModal={toggleModal} handleConfirm={handleConfirm} />
    );
    const button = screen.getByTestId('shipment-warning-confirm-btn');
    userEvent.click(button);
    await waitFor(() => {
      expect(toggleModal).toHaveBeenCalled();
    });
  });
});
