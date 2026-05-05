import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import CustomerMergeMock from 'mock-data/CustomerMerge.mock';

import { DragAndDropPayload } from './helper';

import DragAndDropList from '.';

const mockColumnData: DragAndDropPayload[] = [
  { columnId: '1', rows: CustomerMergeMock.customer1.orders },
  { columnId: '2', rows: CustomerMergeMock.customer2.orders },
];
const mockHandleColumn = jest.fn();

describe('Test <DragAndDropList />', () => {
  it('should render <DragAndDropList />', () => {
    render(
      <DragAndDropList
        columnData={mockColumnData}
        handleColumnData={mockHandleColumn}
      />
    );
    expect(screen.getByTestId('drag-and-drop-main')).toBeInTheDocument();
  });
});
