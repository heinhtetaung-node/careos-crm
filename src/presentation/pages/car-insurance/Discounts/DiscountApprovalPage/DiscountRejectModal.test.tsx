// eslint-disable @typescript-eslint/no-non-null-assertion
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import DiscountRejectModal from './DiscountRejectModal';

const mockCloseModal = jest.fn();
const mockHandleReject = jest.fn();
const isOpen = true;

describe('Test DiscountReject Modal', () => {
  it('should approve with message and close', async () => {
    render(
      <DiscountRejectModal
        isModalOpen={isOpen}
        onModalClose={mockCloseModal}
        handleReject={mockHandleReject}
      />
    );

    const messageInput = screen.getByTestId('reject-modal-message');
    const submitBtn = screen.getByTestId('reject-modal-submit');
    await userEvent.type(messageInput, 'test');
    await userEvent.click(submitBtn);
    expect(mockHandleReject).toHaveBeenCalled();
  });
  it('should close on clicking close icon', async () => {
    render(
      <DiscountRejectModal
        isModalOpen={isOpen}
        onModalClose={mockCloseModal}
        handleReject={mockHandleReject}
      />
    );

    const closeBtn = screen.getByTestId('close-button');
    await userEvent.click(closeBtn);
    expect(mockCloseModal).toHaveBeenCalled();
  });
});
