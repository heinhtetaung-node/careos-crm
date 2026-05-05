import OrderData from '@alphafounders/mock-data/json/orderData.json';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen } from '__tests__/rtl-test-utils';

import HistoryTable from '.';

const mockOrderId = '986a8bb1-e1af-432b-933b-a70c965a347f';

describe('Testing Discount Approval Page', () => {
  beforeEach(async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/orders/${mockOrderId}/resourceHistory`,
        () => HttpResponse.json(OrderData.orderHistory)
      )
    );
  });

  it('should render HistoryTable', () => {
    render(<HistoryTable id={mockOrderId} />);
    expect(screen.getByTestId('test-history-table')).toBeInTheDocument();
  });
});
