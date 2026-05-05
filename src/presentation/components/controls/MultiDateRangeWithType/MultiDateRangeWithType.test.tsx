import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import MultiDateRangeWithType from '.';

const initialProps = {
  onChange: jest.fn(),
  name: 'date',
  value: {
    startDate: { range: { startDate: '', endDate: '' } },
    endDate: { range: { endDate: '', startDate: '' } },
  },
  options: [],
  hasExpand: true,
  disableDay: undefined,
} as any;

var mockLocationData: jest.Mock;
jest.mock('react-router-dom', () => {
  mockLocationData = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useLocation: mockLocationData.mockReturnValue({
      pathname: '/leads/all',
      search: '',
      state: undefined,
      hash: '',
    }),
  };
});

describe('<MultiDateRangeWithType Component/>', () => {
  it('check MultiDateRangeWithType if `hasExpand` is true', () => {
    const { container } = render(<MultiDateRangeWithType {...initialProps} />);
    expect(container.querySelector('.MuiGrid-grid-md-8')).not.toBeNull();
  });
  it('render MultiDateRangeWithType in approval page', async () => {
    mockLocationData.mockReturnValue({
      pathname: '/orders/approval',
      search: '',
      state: undefined,
      hash: '',
    });
    const { container } = render(
      <MultiDateRangeWithType {...initialProps} options={null} />
    );
    expect(
      container.querySelector('#mui-component-select-date')
    ).not.toBeNull();
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(
      screen.getByText('order.shipping.insuranceApprovedOn')
    ).toBeInTheDocument();
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
  it('render MultiDateRangeWithType in order all page', async () => {
    mockLocationData.mockReturnValue({
      pathname: '/orders/all',
      search: '',
      state: undefined,
      hash: '',
    });
    const { container } = render(
      <MultiDateRangeWithType {...initialProps} options={null} />
    );
    expect(
      container.querySelector('#mui-component-select-date')
    ).not.toBeNull();
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(
      screen.queryByText('order.shipping.insuranceApprovedOn')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('presentation')).toBeInTheDocument();
  });
});
