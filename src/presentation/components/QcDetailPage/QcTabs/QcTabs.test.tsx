import React from 'react';

import {
  providerProps,
  renderWithContext,
  screen,
} from '__tests__/rtl-test-utils';
import { mockOrderDetail } from 'mock-data/OrderDetail.mock';

import QcTabs from './index';

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock('data/slices/qcSlice/selector', () => ({
  useGetQcDetail: jest.fn().mockReturnValue({
    orderDetail: mockOrderDetail,
    countdown: {},
  }),
}));

test('Render QC nav tabs', async () => {
  renderWithContext(
    <div>
      <QcTabs />
    </div>,
    {
      providerProps,
    }
  );
  expect(screen.getByTestId('qc')).toBeInTheDocument();
});

test('Render QC nav tabs with no countdown in context', async () => {
  renderWithContext(
    <div>
      <QcTabs />
    </div>,
    {
      providerProps: {
        value: {
          state: {
            ...providerProps.value.state,
            countdown: {},
          },
          dispatch: () => null,
        },
      },
    }
  );
  expect(screen.getByTestId('qc')).toBeInTheDocument();
});
