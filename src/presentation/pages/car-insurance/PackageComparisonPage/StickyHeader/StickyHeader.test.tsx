import user from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import StickyHeader from '.';

const mockOnClickBackFn: jest.Mock = jest.fn();
const mockOnRemoveFn: jest.Mock = jest.fn();

jest.spyOn(window, 'close').mockImplementation(jest.fn());

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn(() => ({
    'lead-1513-enable-compare-3-package-package-listing-page-20221007': {
      enabled: false,
    },
  })),
}));

const packages = [
  {
    id: '1',
    logo: `/static/img/dummy/Bangkok.png`,
    title: 'Bangkok Insurance',
    subtitle: 'Type 2+',
    premium: 30000,
    price: 30000,
    packageSource: 'manual',
  },
  {
    id: '2',
    logo: `/static/img/dummy/Dhipaya.png`,
    title: 'Dhipaya Insurance',
    subtitle: 'Type 1',
    premium: 30000,
    price: 30000,
    packageSource: 'renewal_manual_quote',
  },
];

describe('<StickyHeader />', () => {
  beforeEach(() => {
    render(
      <StickyHeader
        packages={packages as any}
        onClickBack={mockOnClickBackFn}
        onRemove={mockOnRemoveFn}
        selectedPackageId="packages/1"
      />
    );
  });

  it('should render the component', () => {
    expect(screen.getByTestId('comparison-sticky-header')).toBeInTheDocument();
    expect(screen.getByText('Back')).toBeInTheDocument();
  });

  it('should render the packages passed', async () => {
    const firstInsurance = within(screen.getByTestId('insurance-1-info'));
    const removeIcon = firstInsurance.getByTestId('insurance-1-remove');
    const selectButton = firstInsurance.getByRole('button', {
      name: 'text.select',
    });

    expect(removeIcon).toBeInTheDocument();
    await user.click(removeIcon);

    expect(mockOnRemoveFn).toHaveBeenNthCalledWith(1, '1');

    expect(selectButton).toBeInTheDocument();
    await user.click(selectButton);

    expect(firstInsurance.getByText('Bangkok Insurance')).toBeInTheDocument();
    expect(firstInsurance.getByText('Type 2+')).toBeInTheDocument();
  });
});
