import user from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import { PackageSource } from 'shared/types/packages';

import PackageBrief from './PackageBrief';
import { getInsuranceTypeSubtitleDisplayText } from '../packageListing.helper';

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: jest.fn(() => ({
    'lead-1513-enable-compare-3-package-package-listing-page-20221007': {
      enabled: false,
    },
  })),
}));

const mockInsurePackage = {
  id: 'renewalPackages/38607d7d-bb8e-485f-a674-f386de567f7c',
  displayName: '',
  expiryDate: '-',
  disablePackage: false,
  isRecommended: true,
  carInsuranceType: 'Type 1',
  insuranceKind: 'both',
  logo: 'https://storage.googleapis.com/skillful-rush/insurers/7.png',
  title: 'Bangkok Insurance',
  subtitle: 'packageListing.values.insuranceType.Type 1',
  sumCoverage: '1,200',
  repairType: 'packageListing.values.repairType.Dealer',
  premium: '646',
  originalPrice: '646',
  hasDiscount: false,
  headerType: 'secondary' as any,
  discount: null,
  installments: null,
  rating: 4.9,
  details: [
    {
      hasData: true,
      title: 'packageListing.titles.packagePrice',
      items: [
        {
          label: 'packageListing.labels.voluntaryPrice',
          text: 'packageListing.templates.includedPrice',
          textValues: {
            value: '0',
          },
        },
        {
          label: 'packageListing.labels.mandatoryPrice',
          text: 'packageListing.templates.includedPrice',
          textValues: {
            value: '646',
          },
        },
        {
          label: 'packageListing.labels.totalPrice',
          text: 'packageListing.templates.price',
          textValues: {
            value: '646',
          },
        },
      ],
    },
  ],
  termsAndConditions: '',
  packageSource: 'renewal_manual_quote' as PackageSource,
};

describe('<PackageBrief />', () => {
  it('should render the component', () => {
    render(
      <PackageBrief
        insurancePackage={mockInsurePackage as any}
        removePackage={jest.fn()}
        isComparePackage
      />
    );
    expect(screen.getByText(mockInsurePackage.title)).toBeInTheDocument();
    const expectedSubtitle = getInsuranceTypeSubtitleDisplayText(
      mockInsurePackage as any
    );
    expect(
      screen.getByText((content) => {
        const norm = (s: string) => s.replace(/\u00A0/g, ' ');
        return norm(content) === norm(expectedSubtitle);
      })
    ).toBeInTheDocument();
  });

  it('should call remove if click remove', async () => {
    render(
      <PackageBrief
        insurancePackage={mockInsurePackage as any}
        removePackage={jest.fn()}
        isComparePackage
      />
    );
    expect(
      screen.getByTestId(
        'remove-renewalPackages/38607d7d-bb8e-485f-a674-f386de567f7c'
      )
    ).toBeInTheDocument();
    await user.click(
      screen.getByTestId(
        'remove-renewalPackages/38607d7d-bb8e-485f-a674-f386de567f7c'
      )
    );
  });

  it('should render package premium price if we passed hashDiscount is false', () => {
    render(
      <PackageBrief
        insurancePackage={mockInsurePackage as any}
        removePackage={jest.fn()}
        isComparePackage
      />
    );
    expect(screen.getByTestId('premium-price')).toBeInTheDocument();
  });

  it('should render package original and premium price if we passed hashDiscount is true', () => {
    mockInsurePackage.hasDiscount = true;
    render(
      <PackageBrief
        insurancePackage={mockInsurePackage as any}
        removePackage={jest.fn()}
        isComparePackage
      />
    );
    expect(screen.getByTestId('premium-price')).toBeInTheDocument();
    expect(screen.getByTestId('discount')).toBeInTheDocument();
  });
});
