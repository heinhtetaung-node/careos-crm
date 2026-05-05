import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import FeatureFlags from 'config/flagsmithConfig';
import { mockUseFlags } from 'shared/helper/flagsmith';
import { Package } from 'shared/types/packages';
import getEndpoint from 'utils/endpointHelper';

import { defaultFiltervalue } from '../PackageFilter/packageFilter.helper';
import transformPackages from '../packageTransformation';

import CompareBar from './index';

var mockPushFn: jest.Mock;

jest.mock('react-router-dom', () => {
  mockPushFn = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn().mockReturnValue(mockPushFn),
  };
});

const package1: Package = {
  bailBondCoverage: 200000,
  canBuy: false,
  carDiscountAmount: '0',
  carDiscountPercentage: 0,
  carInsuranceType: 'Type 2',
  carRepairType: 'Garage',
  couponDiscountAmount: 0,
  createTime: '2022-01-07T13:10:22Z',
  deductibleAmount: 0,
  displayName: 'Type 2+_OIC 110_Super safe _Garage_Bangkok Metropolitan Region',
  expireTime: '9999-01-01T00:00:00Z',
  fireTheftCoverage: 100000,
  floodCoverage: 0,
  grossMandatoryPremium: '64600',
  grossVoluntaryPremium: '650000',
  hasCctvDiscount: false,
  insuranceCategory: 'voluntary',
  insuranceCompany: {
    displayName: 'AXA Insurance Pubilic Company Limited',
    displayNameTh: 'บริษัท  แอกซ่าประกันภัย จำกัด (มหาชน)',
    logo: 'https://storage.googleapis.com/skillful-rush/insurers/6.png',
    name: 'insurers/19',
    order: 11,
    rating: 45,
    shortnameEn: 'AXA Insurance',
    shortnameTh: 'แอกซ่า ประกันภัย',
  },
  invoicePrice: '71400',
  isLowCost: false,
  liabilityPerAccidentCoverage: 100,
  liabilityPerPersonCoverage: 500,
  liabilityPropertyCoverage: 100,
  medicalExpensesCoverage: 100,
  name: 'packages/1379868',
  originalPrice: 7146,
  packageSource: 'import',
  personalAccidentCoverage: 100,
  product: 'products/car-insurance',
  sumCoverage: 100,
  sumCoverageMax: 100,
  sumCoverageMin: 100,
  sumInsuredDefault: 710,
  sumInsuredMax: 710,
  sumInsuredMin: 640,
  sumInsuredSource: 'sum_coverage_max',
  termsEn:
    '1.แพคเกจที่จดทะเบียน กทม,นครปฐม,นนทบุรี,ปทุมธานี,สมุทรปราการ และสมุทรสาคร\n 2.ไม่รับประกันรถที่ตกแต่งดัดแปลงโหลดเตี้ยหรือรถนำเข้า"',
  termsTh:
    '1.แพคเกจที่จดทะเบียน กทม,นครปฐม,นนทบุรี,ปทุมธานี,สมุทรปราการ และสมุทรสาคร\n 2.ไม่รับประกันรถที่ตกแต่งดัดแปลงโหลดเตี้ยหรือรถนำเข้า"',
  priceSummary: {
    interestRate: 0,
    interestAmount: '0',
    processingFeeRate: 0,
    processingFeeAmount: '0',
    feeRate: 0,
    feeAmount: '0',
    discountRate: 0,
    discountAmount: '0',
    netDiscountRate: 0,
    netDiscountAmount: '0',
    packagePriceAfterDiscount: '490000',
    netPremiumAmount: '490000',
    initialAmount: '163333',
    subsequentAmount: '163333',
  },
  installmentDetails: [
    {
      period: 1,
      paymentAmount: '163333',
      principal: '163333',
      addOns: '0',
      interest: '0',
      processingFee: '0',
      principalBalance: '326667',
      interestBalance: '0',
      processingFeeBalance: '0',
      totalBalance: '326667',
    },
  ],
};

const package2: Package = {
  bailBondCoverage: 200000,
  canBuy: false,
  carDiscountAmount: '0',
  carDiscountPercentage: 0,
  carInsuranceType: 'Type 2',
  carRepairType: 'Garage',
  couponDiscountAmount: 0,
  createTime: '2022-01-07T13:10:22Z',
  deductibleAmount: 0,
  displayName: 'Type 2+_OIC 110_Super safe _Garage_Bangkok Metropolitan Region',
  expireTime: '9999-01-01T00:00:00Z',
  fireTheftCoverage: 100000,
  floodCoverage: 0,
  grossMandatoryPremium: '64600',
  grossVoluntaryPremium: '650000',
  hasCctvDiscount: false,
  insuranceCategory: 'voluntary',
  insuranceCompany: {
    displayName: 'Bangkok Insurance Pubilic Company Limited',
    displayNameTh: 'บริษัท  แอกซ่าประกันภัย จำกัด (มหาชน)',
    logo: 'https://storage.googleapis.com/skillful-rush/insurers/6.png',
    name: 'insurers/17',
    order: 11,
    rating: 45,
    shortnameEn: 'Bangkok Insurance',
    shortnameTh: 'แอกซ่า ประกันภัย',
  },
  invoicePrice: '714600',
  isLowCost: false,
  liabilityPerAccidentCoverage: 100,
  liabilityPerPersonCoverage: 500,
  liabilityPropertyCoverage: 100,
  medicalExpensesCoverage: 100,
  name: 'packages/1379869',
  originalPrice: 714,
  packageSource: 'import',
  personalAccidentCoverage: 100,
  product: 'products/car-insurance',
  sumCoverage: 100,
  sumCoverageMax: 100,
  sumCoverageMin: 100,
  sumInsuredDefault: 710,
  sumInsuredMax: 710,
  sumInsuredMin: 640,
  sumInsuredSource: 'sum_coverage_max',
  termsEn:
    '1.แพคเกจที่จดทะเบียน กทม,นครปฐม,นนทบุรี,ปทุมธานี,สมุทรปราการ และสมุทรสาคร\n 2.ไม่รับประกันรถที่ตกแต่งดัดแปลงโหลดเตี้ยหรือรถนำเข้า"',
  termsTh:
    '1.แพคเกจที่จดทะเบียน กทม,นครปฐม,นนทบุรี,ปทุมธานี,สมุทรปราการ และสมุทรสาคร\n 2.ไม่รับประกันรถที่ตกแต่งดัดแปลงโหลดเตี้ยหรือรถนำเข้า"',
  priceSummary: {
    interestRate: 0,
    interestAmount: '0',
    processingFeeRate: 0,
    processingFeeAmount: '0',
    feeRate: 0,
    feeAmount: '0',
    discountRate: 0,
    discountAmount: '0',
    netDiscountRate: 0,
    netDiscountAmount: '0',
    packagePriceAfterDiscount: '490000',
    netPremiumAmount: '490000',
    initialAmount: '163333',
    subsequentAmount: '163333',
  },
  installmentDetails: [
    {
      period: 1,
      paymentAmount: '163333',
      principal: '163333',
      addOns: '0',
      interest: '0',
      processingFee: '0',
      principalBalance: '326667',
      interestBalance: '0',
      processingFeeBalance: '0',
      totalBalance: '326667',
    },
  ],
};

const mockedPackage: Package[] = [package1];
const mockedTwoPackages: Package[] = [package1, package2];

const filtervalue = {
  ...defaultFiltervalue,
  paymentOption: 'FULL_PAYMENT',
};

describe('CompareBar with one package.', () => {
  beforeEach(() => {
    mockPushFn.mockClear();
    mockUseFlags([]);
  });

  it('should show comparison', () => {
    render(
      <CompareBar
        packages={transformPackages(mockedPackage, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
        maxCompareLimit={3}
      />
    );
    expect(screen.getByText('AXA Insurance')).toBeInTheDocument();
    expect(screen.queryAllByText('packageListing.addToCompare')).toHaveLength(
      2
    );
  });

  it('should call remove if click remove', async () => {
    const mockedRemoveFn = jest.fn();
    render(
      <CompareBar
        packages={transformPackages(mockedPackage, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={mockedRemoveFn}
      />
    );
    await user.click(screen.getByTestId('remove-packages/1379868'));
    expect(mockedRemoveFn).toHaveBeenCalled();
  });

  it('all the buttons on compare bar should be disabled', () => {
    render(
      <CompareBar
        packages={transformPackages(mockedPackage, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
      />
    );

    const download = screen.getByTestId('download-tool-bar');
    const compareButton = screen.getByRole('button', {
      name: '1 packageListing.compare',
    });

    expect(download).toBeDisabled();
    expect(compareButton).toBeDisabled();
    expect(screen.queryByTestId('copy-link-tool-bar')).not.toBeInTheDocument();
  });

  it('should show copy link button as disabled when flag is enabled and only one package is selected', () => {
    mockUseFlags([FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP]);
    render(
      <CompareBar
        packages={transformPackages(mockedPackage, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
      />
    );

    const copyLink = screen.getByTestId('copy-link-tool-bar');
    expect(copyLink).toBeDisabled();
  });
});

describe('CompareBar with two packages.', () => {
  beforeEach(() => {
    mockPushFn.mockClear();
    mockUseFlags([]);
  });

  it('should show comparison', () => {
    render(
      <CompareBar
        packages={transformPackages(mockedTwoPackages, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
        maxCompareLimit={3}
      />
    );
    expect(screen.getByText('Bangkok Insurance')).toBeInTheDocument();
    expect(screen.getByText('AXA Insurance')).toBeInTheDocument();
    expect(screen.queryAllByText('packageListing.addToCompare')).toHaveLength(
      1
    );
  });

  it('should call remove if click remove', async () => {
    const mockedRemoveFn = jest.fn();
    render(
      <CompareBar
        packages={transformPackages(mockedTwoPackages, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={mockedRemoveFn}
      />
    );
    await user.click(screen.getByTestId('remove-packages/1379868'));
    expect(mockedRemoveFn).toHaveBeenCalled();
  });

  it('should redirect to compare page if click compare btn', async () => {
    render(
      <CompareBar
        packages={transformPackages(mockedTwoPackages, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
      />
    );
    await user.click(
      screen.getByRole('button', { name: '2 packageListing.compare' })
    );
    expect(mockPushFn).toHaveBeenCalledWith(
      '/leads/:id/compare?insuranceKind=BOTH&paymentOption=FULL_PAYMENT&paymentMethod=QR_CODE&installmentPlan=1&packageFilter.newSearch=true&packageFilter.modelId=%5Bobject+Object%5D&packageFilter.brandId=%5Bobject+Object%5D&packageFilter.carYear=%5Bobject+Object%5D&id=packages%2F1379868%2Cpackages%2F1379869'
    );
  });

  it('should download quotation if click download', async () => {
    const mockHandler = jest.fn((arg) => arg);
    server.use(
      http.post(
        getEndpoint('/v1alpha1:generateAndDownloadQuotation'),
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    render(
      <CompareBar
        packages={transformPackages(mockedTwoPackages, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'text.download' }));
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledWith({
        carInsuranceQuotationFilter: {
          filters: [
            {
              insuranceKind: 'BOTH',
              package: 'packages/1379868',
            },
            {
              insuranceKind: 'BOTH',
              package: 'packages/1379869',
            },
          ],
        },
        includeShipmentFee: true,
        includeCustomQuote: true,
        lead: 'leads/undefined',
        product: '',
      });
    });
  });

  it('should call copy link url', async () => {
    mockUseFlags([FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP]);
    const mockHandler = jest.fn((arg) => arg);
    server.use(
      http.post(getEndpoint('/v1alpha1:generateLink'), async ({ request }) =>
        HttpResponse.json(mockHandler(await request.json()))
      )
    );
    render(
      <CompareBar
        packages={transformPackages(mockedTwoPackages, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
      />,
      {
        initialState: {
          typeSelectorReducer: {
            globalProductSelectorReducer: {
              data: 'products/car-insurance',
            },
          },
        },
      }
    );
    await user.click(
      screen.getByRole('button', { name: 'packageListing.copyLink' })
    );
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledWith({
        action: 'comparison',
        carInsurancePackageFilter: {
          filters: [
            {
              insuranceKind: 'BOTH',
              package: 'packages/1379868',
            },
            {
              insuranceKind: 'BOTH',
              package: 'packages/1379869',
            },
          ],
        },
        includeCustomQuote: true,
        lead: 'leads/undefined',
        product: 'products/car-insurance',
      });
    });
  });
});

describe('CompareBar with maxCompareLimit={2} (flag disabled).', () => {
  beforeEach(() => {
    mockPushFn.mockClear();
    mockUseFlags([]);
  });

  it('should show 1 empty slot when one package is selected', () => {
    render(
      <CompareBar
        packages={transformPackages(mockedPackage, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
        maxCompareLimit={2}
      />
    );
    expect(screen.getByText('AXA Insurance')).toBeInTheDocument();
    expect(screen.queryAllByText('packageListing.addToCompare')).toHaveLength(
      1
    );
  });

  it('all buttons should be disabled when only one package is selected', () => {
    render(
      <CompareBar
        packages={transformPackages(mockedPackage, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
        maxCompareLimit={2}
      />
    );

    const download = screen.getByTestId('download-tool-bar');
    const compareButton = screen.getByRole('button', {
      name: '1 packageListing.compare',
    });

    expect(download).toBeDisabled();
    expect(compareButton).toBeDisabled();
  });

  it('should show 0 empty slots when two packages are selected', () => {
    render(
      <CompareBar
        packages={transformPackages(mockedTwoPackages, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
        maxCompareLimit={2}
      />
    );
    expect(screen.getByText('AXA Insurance')).toBeInTheDocument();
    expect(screen.getByText('Bangkok Insurance')).toBeInTheDocument();
    expect(screen.queryAllByText('packageListing.addToCompare')).toHaveLength(
      0
    );
  });

  it('should enable buttons when exactly two packages are selected', () => {
    render(
      <CompareBar
        packages={transformPackages(mockedTwoPackages, {} as any)}
        savePackages={[]}
        useMultipleSuminsured={false}
        filter={filtervalue}
        removePackage={jest.fn()}
        maxCompareLimit={2}
      />
    );

    const download = screen.getByTestId('download-tool-bar');
    const compareButton = screen.getByRole('button', {
      name: '2 packageListing.compare',
    });

    expect(download).not.toBeDisabled();
    expect(compareButton).not.toBeDisabled();
  });
});
