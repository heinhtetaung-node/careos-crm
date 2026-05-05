import { waitFor } from '@testing-library/react';
import user from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, within } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';
import FeatureFlags from 'config/flagsmithConfig';

import InsurerInfoSection from './InsurerInfoSection';
import { getInsuranceKindTranslation } from './InsurerInfoSection.helper';

const fakeInsurers = [
  {
    displayName: 'text.noInsurer',
    id: 0,
    name: '',
    order: 0,
    title: 'text.noInsurer',
  },
  {
    name: 'insurers/42',
    displayName: 'Dhipaya',
    title: 'Dhipaya',
    order: 3,
    id: 42,
  },
  {
    name: 'insurers/40',
    displayName: 'Chubb Samaggi Insurance Co. (PLC)',
    title: 'Chubb Samaggi Insurance Co. (PLC)',
    order: 3,
    id: 40,
  },
  {
    name: 'insurers/38',
    displayName: 'Roojai Insurance',
    title: 'Roojai Insurance',
    order: 3,
    id: 38,
  },
];

const initialState = {
  leadsDetailReducer: {
    lead: {
      payload: {
        annotations: {
          '@immutable/product-car/last-package-price': 100,
          '@immutable/product-car/last-invoice-price': 90,
          '@immutable/product-car/last-discount': 10,
        },
        name: 'name/leadId',
        data: {
          checkout: { coupon: 'Rabbit2020', package: '1233' },
          preferredSumInsured: 0,
          insuranceKind: 'both',
          currentInsurer: 42,
          preferredInsurer: 38,
          voluntaryInsuranceType: ['type_1'],
        },
        type: 'LEAD_TYPE_RENEWAL',
        status: 'PURCHASE',
      },
    },
  },
};

const mockedRequestQuoteFn = jest.fn();
const mockHandler = jest.fn();
let isManualPackageReasonEnabled = true;
let isCurrentPolicyExpiryDateEnabled = true;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ id: '123' }),
}));

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: {
      role: 'roles/admin',
    },
  })),
}));

jest.mock('data/slices/paymentOptionsSlice', () => ({
  useGetInstallmentOptionsQuery: jest.fn().mockReturnValue({
    data: [
      {
        id: 3,
        title: '3 installments',
        value: '3',
      },
      {
        id: 1,
        title: '1 time',
        value: '1',
      },
    ],
    refetch: jest.fn(),
  }),
}));

jest.mock('shared/helper/utilities', () => ({
  ...jest.requireActual('shared/helper/utilities'),
  getLeadIdFromPath: jest.fn().mockReturnValue('leadId'),
}));

// Mock flagsmith feature flag
jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: () => ({
    [FeatureFlags.BROK_3490_ENABLE_MANUAL_PACKAGE_CREATION_REASON_20251110_TEMP]:
      {
        enabled: isManualPackageReasonEnabled,
      },
    [FeatureFlags.BROK_5710_SHOW_CURRENT_POLICY_EXPIRY_DATE_CAR_LEAD_DETAIL_20260429_TEMP]:
      {
        enabled: isCurrentPolicyExpiryDateEnabled,
      },
  }),
}));

describe('<InsurerInfoSection Component/>', () => {
  beforeEach(() => {
    mockHandler.mockClear();
    isCurrentPolicyExpiryDateEnabled = true;
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/leadId:patchData`,
        async ({ request }) => mockHandler(await request.json())
      )
    );
  });

  it('will be mounted correctly', () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );
    expect(screen.getByText('text.insurance')).toBeInTheDocument();
  });

  it('renders current policy expiry date field under current insurer when flag enabled', () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );

    expect(
      screen.getByText('text.expiryDateOfCurrentPolicy')
    ).toBeInTheDocument();
  });

  it('hides current policy expiry date field when feature flag is disabled', () => {
    isCurrentPolicyExpiryDateEnabled = false;

    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );

    expect(
      screen.queryByText('text.expiryDateOfCurrentPolicy')
    ).not.toBeInTheDocument();
  });

  it('check change and update type', async () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );
    const insuranceTypeSelect = within(
      screen.getByTestId('common-my-complete')
    );
    await user.type(insuranceTypeSelect.getByRole('textbox'), 'Type 2+');
    await user.click(screen.getByText('Type 2+'));
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/voluntaryInsuranceType',
          value: ['type_1', 'type_2+'],
        },
      ])
    );
  });

  it('check changing current insurer', async () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );

    const currentInsurerDropdown = within(
      screen.getByTestId('currentInsurer')
    ).getByRole('textbox');
    await user.click(currentInsurerDropdown);
    await user.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'Roojai Insurance',
      })
    );
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/currentInsurer',
          value: 38,
        },
        {
          op: 'remove',
          path: '/checkout/package',
          value: null,
        },
      ])
    );
  });

  it('should not add remove package payload when current insurer is changed if package is not selected yet', async () => {
    const newState = JSON.parse(JSON.stringify(initialState));
    newState.leadsDetailReducer.lead.payload.data.checkout = {};
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState: newState }
    );

    const currentInsurerDropdown = within(
      screen.getByTestId('currentInsurer')
    ).getByRole('textbox');
    await user.click(currentInsurerDropdown);
    await user.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'Roojai Insurance',
      })
    );
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/currentInsurer',
          value: 38,
        },
      ])
    );
  });

  it('check changing preferred insurer', async () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );

    const preferredInsurerDropdown = within(
      screen.getByTestId('preferredInsurer')
    ).getByRole('textbox');
    await user.click(preferredInsurerDropdown);
    await user.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'Chubb Samaggi Insurance Co. (PLC)',
      })
    );
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith([
        { op: 'add', path: '/preferredInsurer', value: 40 },
      ])
    );
  });

  it('check change and update sum insured', async () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );
    await user.type(
      within(screen.getByTestId('preferredSumInsured')).getByRole('textbox'),
      '12345'
    );
    await user.tab();
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith([
        { op: 'add', path: '/preferredSumInsured', value: 12345 },
      ])
    );
  });

  it('click request custom quote opens modal', async () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );
    await user.click(
      screen.getByRole('button', { name: 'text.requestCustomPackage' })
    );
    // Verify that the modal opens instead of calling onRequestQuote directly
    await waitFor(() => {
      expect(screen.getByTestId('reason-textarea')).toBeInTheDocument();
    });
    expect(mockedRequestQuoteFn).not.toHaveBeenCalled();
  });

  it('getInsuranceKindTranslaction both', () => {
    const result = getInsuranceKindTranslation('both');
    expect(result).toBe('leadDetailFields.insuranceKinds.both');
  });

  it('getInsuranceKindTranslaction mandatory', () => {
    const result = getInsuranceKindTranslation('mandatory');
    expect(result).toBe('leadDetailFields.insuranceKinds.compulsory');
  });

  it('getInsuranceKindTranslaction voluntary', () => {
    const result = getInsuranceKindTranslation('voluntary');
    expect(result).toBe('leadDetailFields.insuranceKinds.voluntary');
  });

  it('getInsuranceKindTranslaction edge', () => {
    const result = getInsuranceKindTranslation(undefined);
    expect(result).toBe('');
  });

  it('renders the ViewPurchaseButton component correctly when insuranceKind is both', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car-package/v1alpha1/packages/123456`,
        () => HttpResponse.json({ displayName: 'Fake package name 1' })
      )
    );

    const fakeLeadInfo = {
      name: 'name/leadId',
      data: {
        insuranceKind: 'both',
        checkout: {
          package: '123456',
        },
      },
    };

    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      {
        initialState: {
          leadsDetailReducer: { lead: { payload: fakeLeadInfo } },
        },
      }
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('btn-view-selected-package')
      ).toBeInTheDocument();
    });
  });

  it('renders the ViewPurchaseButton component correctly when insuranceKind is mandatory.', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car-package/v1alpha1/packages/1/mandatory`,
        () => HttpResponse.json({ displayName: 'Fake package name 2' })
      )
    );

    const fakeLeadInfo = {
      name: 'name/leadInfo',
      data: {
        insuranceKind: 'mandatory',
        checkout: {
          package: '1',
        },
      },
    };

    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      {
        initialState: {
          leadsDetailReducer: { lead: { payload: fakeLeadInfo } },
        },
      }
    );

    await waitFor(() => {
      expect(
        screen.getByTestId('btn-view-selected-package')
      ).toBeInTheDocument();
    });
  });

  it('should show previous order info if lead status is renewal', () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );
    expect(screen.getByText('text.lastPackagePrice')).toBeInTheDocument();
    expect(screen.getByText('text.lastInvoicePrice')).toBeInTheDocument();
    expect(screen.getByText('text.lastDiscount')).toBeInTheDocument();
  });

  it('should not show previous order info if lead status is not renewal', () => {
    const newState = JSON.parse(JSON.stringify(initialState));
    newState.leadsDetailReducer.lead.payload.type = 'LEAD_TYPE_NEW';
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState: newState }
    );
    expect(
      screen.queryByTestId('previous-package-price')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('previous-invoice-price')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('previous-discount')).not.toBeInTheDocument();
  });

  it('should show the Create Payment button when feature flag is on', async () => {
    const { getByTestId } = render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );

    await waitFor(() =>
      expect(getByTestId('create-payment-button')).toBeInTheDocument()
    );
  });

  /* This should be fixed from another separate PR */
  it.skip('should call remove op when user changes the current insurer to "No Insurer"', async () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );
    const currentInsurerMainContainer = screen.getByTestId(
      'current-insurer-section'
    );

    const dropdown = within(currentInsurerMainContainer).getByRole('button');
    await user.click(dropdown);
    const selection = within(screen.getByRole('listbox'));
    await user.click(selection.getByText('text.noInsurer'));
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledWith([
        { op: 'remove', path: '/currentInsurer' },
        { op: 'remove', path: '/checkout/package' },
      ]);
    });
  });

  it.skip('should not call api even when user select "No Insurer" as lead does not have preferred insurer', async () => {
    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState }
    );
    const preferredInsurerDropdown = within(
      screen.getByTestId('preferredInsurer')
    ).getByRole('textbox');
    await user.click(preferredInsurerDropdown);
    await user.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'text.noInsurer',
      })
    );

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalledTimes(0);
    });
  });

  it('displays selected delivery option when shipping section', async () => {
    const newState = JSON.parse(JSON.stringify(initialState));
    newState.leadsDetailReducer.lead.payload.data.checkout.deliveryOption =
      'deliveryOptions/kerry-express';

    server.use(
      http.get(
        getApiEndpoint('/v1alpha1/leads/leadId:viewSelectedPackageWithPricing'),
        () =>
          HttpResponse.json({
            carPackageWithPricing: {
              package: {
                customQuoteDetails: {
                  deliveryOption: 'deliveryOptions/kerry-express',
                },
              },
            },
          })
      )
    );

    render(
      <InsurerInfoSection
        insurers={fakeInsurers}
        onRequestQuote={mockedRequestQuoteFn}
      />,
      { initialState: newState }
    );

    expect(
      screen.getByTestId('deliveryOption-readOnly-input')
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('deliveryOption-readOnly-input')).toHaveValue(
        'qc.kerryExpress'
      )
    );
  });
});
