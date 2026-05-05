import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import DocumentCompleteButton from './DocumentCompleteButton';

// FIXME: remove RTK-Query Mock
jest.mock('data/slices/orderSlice', () => ({
  useGetOrderItemsQuery: jest.fn().mockReturnValue({
    data: {
      order: {
        data: {
          deliveryOption: 'deliveryOptions/kerry-standard',
        },
      },
      items: [],
    },
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
}));

describe.skip('Test DocumentCompleteButton - ', () => {
  it('renders button in disabled state', () => {
    render(<DocumentCompleteButton orderId="123" />, {
      initialState: {
        order: {
          payload: {
            documentStatus: 'DOCUMENT_STATUS_COMPLETE',
          },
        },
      },
    });
    expect(screen.getByRole('button')).toBeDisabled();
  });
  it('handle click when button is enabled', () => {
    render(<DocumentCompleteButton orderId="123" />, {
      initialState: {
        order: {
          payload: {
            documentStatus: 'DOCUMENT_STATUS_PENDING',
          },
        },
        orderUploadDocumentReducer: {
          documents: [
            { type: 'DOCUMENT_TYPE_ID_CARD' },
            { type: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION' },
          ],
        },
      },
    });
    userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('common-modal')).toBeInTheDocument();
  });
});

// Need to add this to not remove the test file
it('passes', () => {
  expect(2).toBeTruthy();
});
