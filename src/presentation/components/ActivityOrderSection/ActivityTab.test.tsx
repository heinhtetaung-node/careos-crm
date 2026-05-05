import userEvent from '@testing-library/user-event';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { fireEvent, render, screen } from '__tests__/rtl-test-utils';
import { mockOrderCommentsGff } from 'mock-data/OrderComment.mock';

import ActivityTab from './ActivityTab';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useParams: jest.fn().mockReturnValue({ orderId: '123' }),
}));

const useLocationSpy = useLocation as jest.Mock;
useLocationSpy.mockImplementation(() => ({
  pathname:
    '/orders/7e9216af-1e3f-42ea-a5b9-17d1d53926a8/policies/L9874405-2/printing-and-shipping',
  search: '',
  state: undefined,
  hash: '',
}));

jest.mock('data/slices/orderCommentSlice', () => ({
  ...jest.requireActual('data/slices/orderCommentSlice'),
  useLazyGetOrderCommentsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: mockOrderCommentsGff,
    },
  ]),
}));

describe('<ActivityTab Component/> comment module flag on', () => {
  it('will be mounted correctly', () => {
    const { container } = render(<ActivityTab />);
    expect(
      container.querySelector('.order-activity-container')
    ).toBeInTheDocument();
  });

  it('will mount children', () => {
    const { container } = render(<ActivityTab />);
    expect(
      container.querySelector('.order-activity-container')?.children.length
    ).toEqual(2); // activity tab now show both history log and document section
  });

  it('will mount new comment section if feature flag on', () => {
    render(<ActivityTab />);
    expect(screen.getByText('order.comment')).toBeInTheDocument();
  });

  it('will render shipment document section if feature flag on', () => {
    render(<ActivityTab />);
    expect(screen.getByTestId('shipment-document-section')).toBeInTheDocument();
  });

  it('Should active comment tab', async () => {
    useLocationSpy.mockImplementation(() => ({
      pathname: '/orders/149e9bce-c2a1-4be8-b4c5-71565ce8fd25',
    }));
    const { container } = render(<ActivityTab />);

    const commentTab = screen.getByText('order.comment')
      .parentElement as HTMLButtonElement;
    await userEvent.click(commentTab);

    const scrollableContainer = container.querySelector(
      '.infinite-scroll-component'
    ) as HTMLElement;
    fireEvent.scroll(scrollableContainer, {
      target: { scrollY: 500 },
    });
  });
});

describe('<ActivityTab/> render different tab according to different pathname', () => {
  it('should render <ShipmentDocumentSection/> when path include "printing-and-shipping"', () => {
    useLocationSpy.mockImplementation(() => ({
      pathname: '/orders/123/policies/L9874405-2/printing-and-shipping',
    }));
    render(<ActivityTab />);
    expect(screen.getByTestId('shipment-document-section')).toBeInTheDocument();
  });

  it('should render both <ShipmentDocumentSection/> and customer <DocumentSection/> when path include "approval"', async () => {
    useLocationSpy.mockImplementation(() => ({
      pathname: '/orders/123/policies/L9874405-2/approval',
    }));
    render(<ActivityTab />);
    const policyDocTab = screen.getByText('documentSection.policyDocuments');

    expect(screen.getByTestId('document-section')).toBeInTheDocument();
    await userEvent.click(policyDocTab);

    expect(screen.getByTestId('shipment-document-section')).toBeInTheDocument();
  });

  it('should render <ScriptSection/> when path include "orders/qc"', async () => {
    useLocationSpy.mockImplementation(() => ({
      pathname: '/orders/qc/123',
    }));
    render(<ActivityTab />);
    const scriptTab = screen.getByText('lead.script');
    await userEvent.click(scriptTab);

    expect(screen.getByTestId('script-section')).toBeInTheDocument();
  });
});

describe('should <ActivityTab/> render <CommunicationHistory/> render', () => {
  test('show <CommunicationHistory/> button ', () => {
    render(<ActivityTab />);
    expect(screen.getByText('lead.communication')).toBeInTheDocument();
  });
});
