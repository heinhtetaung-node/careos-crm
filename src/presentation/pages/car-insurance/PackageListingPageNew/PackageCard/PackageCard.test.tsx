import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import FeatureFlags from 'config/flagsmithConfig';
import { INSURANCE_KIND } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import { mockUseFlags } from 'shared/helper/flagsmith';
import { InsuranceKind } from 'shared/types/insurers';
import { CarInsuranceType, PackageSource } from 'shared/types/packages';
import getApiEndpoint from 'utils/endpointHelper';

import PackageCard from './index';

var mockPushFn: jest.Mock;

jest.mock('../DiscountAndPayment', () => {
  function MockedComponent() {
    return (
      <div data-testid="discount-and-payment">Mocked Discount and Payment</div>
    );
  }
  return MockedComponent;
});

const Props = {
  insurancePackage: {
    id: 'packages/1234',
    isRecommended: true,
    disablePackage: false,
    logo: 'logo',
    title: 'title',
    subtitle: 'subtitle',
    premium: '100',
    originalPrice: '1000',
    hasDiscount: true,
    isIncludedMandatoryPrice: false,
    headerType: 'warning' as string | undefined,
    carInsuranceType: 'type1' as CarInsuranceType,
    discount: {
      amount: '10',
      percent: 1,
    },
    installments: null,
    rating: 44,
    details: [
      {
        hasData: true,
        title: 'detail title',
        items: [
          {
            label: 'item label',
            text: 'item text template',
            textValues: { value: 'item value' },
          },
        ],
      },
    ],
    extraData: {
      invoicePrice: '1234000',
      grossMandatoryPremium: '123000',
      grossVoluntaryPremium: '100000',
      filterInsuranceCategory: 'both' as INSURANCE_KIND,
    },
    packageSource: 'manual' as PackageSource,
    termsAndConditions: 'term and conditions',
    displayName: 'displayName',
    expiryDate: '2022-02-02',
    repairType: 'repairType',
    sumCoverage: '100,000',
    insuranceKind: 'voluntary' as InsuranceKind,
  } as any,
  filterValues: {
    deductible: 'no_deductible' as any,
    insuranceCategory: 'mandatory' as any,
    paymentOption: 'FULL_PAYMENT',
    installment: 1,
    insuranceType: {
      'Type 1': false,
      'Type 2': false,
      'Type 3': false,
      'Type 2+': false,
      'Type 3+': false,
    },
    insurer: {
      'insurers/7': true,
      'insurers/27': true,
      'insurers/35': true,
      'insurers/24': true,
      'insurers/19': true,
    },
    price: { min: 646, max: 28200 },
    repairType: 'both' as any,
    sortBy: 'brand' as any,
    sumInsured: { min: 0, max: 10000 },
    isDefaultSumInsured: false,
  },
  isExpanded: false,
  isSelected: false,
  isSelectedForComparison: false,
  onSelectPackage: jest.fn(),
  onComparePackage: jest.fn(),
  onRemoveFromComparison: jest.fn(),
  onClick: jest.fn(),
  expandPackage: jest.fn(),
  carDetails: {} as any,
  leadData: {} as any,
};

jest.mock('react-router-dom', () => {
  mockPushFn = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ id: 'fakeId' }),
    useNavigate: jest.fn().mockReturnValue(mockPushFn),
  };
});

describe('<PackageCard />', () => {
  beforeEach(() => {
    mockPushFn.mockClear();
  });

  test('should render correctly', () => {
    render(
      <PackageCard
        leadData={{} as any}
        isExpanded={false}
        expandPackage={jest.fn()}
        insurancePackage={Props.insurancePackage}
        isSelected={false}
        isSelectedForComparison={false}
        onComparePackage={jest.fn()}
        onRemoveFromComparison={jest.fn()}
        filterValues={Props.filterValues}
      />
    );
    expect(
      screen.getByTestId('package-card-packages/1234')
    ).toBeInTheDocument();
  });

  test('should show manual quote as header if the package is manual quote', () => {
    Props.insurancePackage.packageSource = 'manual';
    render(<PackageCard {...Props} />);
    expect(screen.getByText('packageListing.manualQuote')).toBeInTheDocument();
  });

  test('should not show manual quote as header if package is not manual quote', () => {
    Props.insurancePackage.packageSource = 'import';
    Props.insurancePackage.headerType = undefined;
    render(<PackageCard {...Props} />);
    expect(
      screen.queryByText('packageListing.manualQuote')
    ).not.toBeInTheDocument();
  });

  test('should show discount if hasDiscount is true', () => {
    Props.insurancePackage.hasDiscount = true;
    render(<PackageCard {...Props} />);
    expect(screen.getByTestId('discount')).toBeInTheDocument();
  });

  test('should not show discount if hasDiscount if false', () => {
    Props.insurancePackage.hasDiscount = false;
    render(<PackageCard {...Props} />);
    expect(screen.queryByTestId('discount')).not.toBeInTheDocument();
  });

  test('should not show installment if paymentOption is others', () => {
    Props.insurancePackage.installments = null;
    render(<PackageCard {...Props} />);
    expect(screen.queryByTestId('installment')).not.toBeInTheDocument();
  });

  test('should call comparePackage if compare btn is clicked', async () => {
    render(<PackageCard {...Props} />);
    await user.click(
      screen.getByRole('button', { name: 'packageListing.compare' })
    );
    expect(Props.onComparePackage).toHaveBeenCalled();
  });

  test('should call removeFromPackage if package is alreaded selected for compare and compare btn is clicked', async () => {
    Props.isSelectedForComparison = true;
    render(<PackageCard {...Props} />);
    await user.click(
      screen.getByRole('button', { name: 'packageListing.compare' })
    );
    expect(Props.onRemoveFromComparison).toHaveBeenCalled();
  });

  test('should display disabled select button.', async () => {
    render(<PackageCard {...Props} />);
    const selectBtn = screen.getByRole('button', { name: 'text.select' });
    expect(selectBtn).toBeInTheDocument();
    expect(selectBtn).toBeDisabled();
  });

  test('should call api and set link in clipboard', async () => {
    mockUseFlags([FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP]);
    const mockHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1:generateLink`,
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    render(<PackageCard {...Props} />);
    await user.click(screen.getByTestId('copy-link-packages/1234'));
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
  });

  test('should call download endpoint', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1:generateLink`,
        async ({ request }) =>
          HttpResponse.json(mockHandler(await request.json()))
      )
    );
    render(<PackageCard {...Props} />);
    await user.click(screen.getByRole('button', { name: 'text.download' }));
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
  });

  test('should show selected text', () => {
    render(<PackageCard {...Props} isSelected />);
    expect(screen.getByRole('button', { name: 'packageListing.selected' }));
  });

  test('should not show including mandatory text', () => {
    render(<PackageCard {...Props} isSelected />);
    expect(
      screen.queryByText('packageListing.includingCompulsoryPrice')
    ).not.toBeInTheDocument();
  });

  test('should show including mandatory text', () => {
    Props.insurancePackage.insuranceKind = 'both';
    render(<PackageCard {...Props} isSelected />);
    const element = screen.getByTestId('compulsory-text');
    expect(element).toBeInTheDocument();
  });

  test('should not be able to click download, copy, select, compare on package is disabled', async () => {
    mockUseFlags([FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP]);
    const mockCopyLinkHandler = jest.fn();
    const mockDownloadHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1:generateLink`,
        async ({ request }) =>
          HttpResponse.json(mockCopyLinkHandler(await request.json()))
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1:generateLink`,
        async ({ request }) =>
          HttpResponse.json(mockDownloadHandler(await request.json()))
      )
    );
    render(<PackageCard {...Props} disabled />);
    await user.click(screen.getByRole('button', { name: 'text.download' }));
    await waitFor(() => expect(mockCopyLinkHandler).not.toHaveBeenCalled());
    await user.click(screen.getByTestId('copy-link-packages/1234'));
    await waitFor(() => expect(mockDownloadHandler).not.toHaveBeenCalled());
    expect(
      screen.getByRole('button', { name: 'packageListing.compare' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'text.select' })).toBeDisabled();
    await user.click(screen.getByText('title'));
    expect(mockPushFn).not.toHaveBeenCalled();
  });

  it('should redirect to detail page if clicked on package', async () => {
    render(<PackageCard {...Props} />);
    await user.click(screen.getByText('title'));
    expect(mockPushFn).toHaveBeenCalledWith(
      '/leads/fakeId/detail/custom?insuranceKind=MANDATORY&sumInsuredMin=0&sumInsuredMax=1000000&paymentOption=FULL_PAYMENT&paymentMethod=QR_CODE&installmentPlan=1&id=packages%2F1234'
    );
  });

  test('should not show renweal quote as header if package is not renweal quote', () => {
    Props.insurancePackage.packageSource = 'manual';
    Props.insurancePackage.headerType = undefined;
    render(<PackageCard {...Props} />);
    expect(
      screen.queryByText('packageListing.renewalPackage')
    ).not.toBeInTheDocument();
  });

  test('should render renweal quote as header if package is renweal quote', () => {
    Props.insurancePackage.packageSource = 'renewal_manual_quote';
    Props.insurancePackage.headerType = 'renewal' as any;
    render(<PackageCard {...Props} />);
    expect(
      screen.queryByText('packageListing.renewalPackage')
    ).toBeInTheDocument();
  });

  test('should show renewal quote as header if the package is renewal quote', () => {
    Props.insurancePackage.packageSource = 'renewal_manual_quote';
    render(<PackageCard {...Props} />);
    expect(
      screen.getByText('packageListing.renewalPackage')
    ).toBeInTheDocument();
  });

  test('should display discount and payment section on click over payment info', async () => {
    Props.expandPackage.mockClear();
    render(<PackageCard {...Props} isExpanded />);
    await user.click(screen.getByTestId('installment-info'));
    expect(Props.expandPackage).toHaveBeenCalled();
    await waitFor(
      () =>
        expect(screen.getByTestId('discount-and-payment')).toBeInTheDocument(),
      { timeout: 10 }
    );
  });

  test('should call the delete api if delete package', async () => {
    const modifyProps = JSON.parse(JSON.stringify(Props));
    modifyProps.insurancePackage.packageSource = 'custom';
    const mockHandler = jest.fn();
    server.use(
      http.get(getApiEndpoint('/api/v1alpha1/packages/1234'), () =>
        HttpResponse.json(mockHandler())
      )
    );
    render(<PackageCard {...modifyProps} />);
    await user.click(screen.getByTestId('delete-package'));
    const deleteModal = screen.getByTestId('delete-modal');
    expect(deleteModal).toBeInTheDocument();
    const confirmBtn = within(deleteModal).getByRole('button', {
      name: 'text.confirmButton',
    });
    await user.click(confirmBtn);
    await waitForElementToBeRemoved(deleteModal);
    waitFor(() => expect(mockHandler).toHaveBeenCalled());
  });

  test('should show copy link button when feature flag is enabled', () => {
    mockUseFlags([FeatureFlags.BROK_5373_ENABLE_COPYLINK_20260417_TEMP]);
    render(<PackageCard {...Props} />);
    expect(screen.getByTestId('copy-link-packages/1234')).toBeInTheDocument();
  });

  test('should not show copy link button when feature flag is disabled', () => {
    mockUseFlags([]);
    render(<PackageCard {...Props} />);
    expect(
      screen.queryByTestId('copy-link-packages/1234')
    ).not.toBeInTheDocument();
  });
});
