import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import user from '@testing-library/user-event';
import React from 'react';

import InsurerHeader from './InsurerHeader';

it('should click tests', async () => {
  const selectFn = jest.fn();
  const compareFn = jest.fn();
  render(
    <InsurerHeader
      insurancePackage={
        {
          logo: '',
          carInsuranceType: 'type1',
          title: 'Bangkok Insurance',
          rating: 4.99,
          premium: 30000,
          price: 30000,
          customQuoteDetail: {
            approvalStatus: 'APPROVED',
          },
        } as any
      }
      isSelected={false}
      isSelectedForComparison={false}
      isSelectLoading={false}
      showButtons
      onSelect={selectFn}
      onCompare={compareFn}
    />
  );
  window.dispatchEvent(new Event('scroll'));
  const selectBtns = screen.getAllByText('text.select');
  const compareBtns = screen.getAllByText('packageListing.compare');
  selectBtns.forEach((btn) => user.click(btn));
  compareBtns.forEach((btn) => user.click(btn));
  await waitFor(() => {
    expect(selectFn).toHaveBeenCalledTimes(1);
    expect(compareFn).toHaveBeenCalledTimes(1);
  });
});

it('change header type to sticky if scroll', () => {
  render(
    <InsurerHeader
      insurancePackage={
        {
          logo: '',
          carInsuranceType: 'type1',
          title: 'Bangkok Insurance',
          rating: 4.99,
          premium: 30000,
          price: 30000,
        } as any
      }
      isSelected={false}
      isSelectedForComparison
      isSelectLoading={false}
      showButtons
      onSelect={jest.fn()}
      onCompare={jest.fn()}
    />
  );
  expect(screen.queryByTestId('sticky-header')).not.toBeInTheDocument();
  fireEvent.scroll(window, { target: { scrollY: 50 } });
  expect(screen.getByTestId('sticky-header')).toBeInTheDocument();
});

it('should show discount if there is discount', () => {
  render(
    <InsurerHeader
      insurancePackage={
        {
          logo: '',
          carInsuranceType: 'type1',
          title: 'Bangkok Insurance',
          rating: 4.99,
          premium: 30000,
          originalPrice: 30000,
          hasDiscount: true,
        } as any
      }
      isSelected={false}
      isSelectedForComparison
      isSelectLoading={false}
      showButtons
      onSelect={jest.fn()}
      onCompare={jest.fn()}
    />
  );
  expect(screen.getByTestId('discount')).toBeInTheDocument();
  fireEvent.scroll(window, { target: { scrollY: 50 } });
  const stickyHeader = screen.getByTestId('sticky-header');
  expect(stickyHeader).toBeInTheDocument();
  expect(within(stickyHeader).getByTestId('discount')).toBeInTheDocument();
});

it('Select button should be disabled', () => {
  render(
    <InsurerHeader
      insurancePackage={
        {
          logo: '',
          carInsuranceType: 'type1',
          title: 'Bangkok Insurance',
          rating: 4.99,
          premium: 30000,
          price: 30000,
        } as any
      }
      isSelected={false}
      isSelectedForComparison
      isSelectLoading={false}
      showButtons
      onSelect={jest.fn()}
      onCompare={jest.fn()}
    />
  );

  fireEvent.scroll(window, { target: { scrollY: 50 } });
  expect(screen.getByTestId('select-button')).toBeInTheDocument();
  expect(screen.getByTestId('select-button')).toBeDisabled();
});
