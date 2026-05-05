import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { getString } from 'presentation/theme/localization';

import PackageInfo from './PackageInfo';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key: string) => `translated:${key}`),
}));

const mockGetString = getString as jest.Mock;

describe('PackageInfo component - repairType rendering (lines 51-53)', () => {
  const basePackage: TransformedPackageType = {
    id: 'packages/123',
    subtitle: 'packageListing.values.insuranceType.voluntary',
    insuranceKind: 'voluntary',
    repairType: undefined,
    sumCoverage: '100,000',
    premium: '5000',
    hasDiscount: false,
    customQuoteDetail: {
      priceBreakDown: {
        numberOfMonths: 1,
      },
    },
  } as any;

  beforeEach(() => {
    mockGetString.mockClear();
  });

  it('renders repairType via getString when repairType exists (line 52)', () => {
    const packageWithRepairType = {
      ...basePackage,
      repairType: 'packageListing.repairType.dealer',
    };

    render(<PackageInfo insurancePackage={packageWithRepairType} />);

    // Verify getString was called with the repairType value
    expect(mockGetString).toHaveBeenCalledWith(
      'packageListing.repairType.dealer'
    );

    // Verify the translated value is rendered
    expect(
      screen.getByText('translated:packageListing.repairType.dealer')
    ).toBeInTheDocument();
  });

  it('renders "-" when repairType is undefined (line 53)', () => {
    const packageWithoutRepairType = {
      ...basePackage,
      repairType: undefined,
    };

    render(<PackageInfo insurancePackage={packageWithoutRepairType} />);

    // Should render "-" when repairType is falsy
    const repairTypeSection = screen
      .getByText('translated:packageListing.repairType')
      .closest('div');
    expect(repairTypeSection).toBeInTheDocument();
    expect(repairTypeSection?.textContent).toContain('-');
  });

  it('renders "-" when repairType is null (line 53)', () => {
    const packageWithoutRepairType = {
      ...basePackage,
      repairType: null,
    };

    render(<PackageInfo insurancePackage={packageWithoutRepairType} />);

    const repairTypeSection = screen
      .getByText('translated:packageListing.repairType')
      .closest('div');
    expect(repairTypeSection?.textContent).toContain('-');
  });

  it('renders "-" when repairType is empty string (line 53)', () => {
    const packageWithoutRepairType = {
      ...basePackage,
      repairType: '',
    };

    render(<PackageInfo insurancePackage={packageWithoutRepairType} />);

    const repairTypeSection = screen
      .getByText('translated:packageListing.repairType')
      .closest('div');
    expect(repairTypeSection?.textContent).toContain('-');
  });
});
