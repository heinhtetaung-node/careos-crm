import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { ShipmentProviders } from 'shared/constants/orderType';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import DiscountSection from '.';

const mockPushFn = jest.fn();
var mockGetPaymentOptions = jest.fn();

var mockShowError: jest.Mock;
var mockHandleErrors: jest.Mock;
var mockUseFlags: any;

jest.mock('utils/snackbar', () => {
  mockShowError = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockShowError,
  });
});
jest.mock('../helper', () => {
  mockHandleErrors = jest.fn();
  return {
    ...jest.requireActual('../helper'),
    getFormattedError: mockHandleErrors,
  };
});

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(() => ({
    values: {
      deliveryOption: 'deliveryOptions/kerry-express',
    },
  })),
}));

jest.mock('../AddonAndShipping/helper', () => ({
  useGetShippingOptions: jest.fn().mockReturnValue({
    shippingOptions: [
      {
        key: 'deliveryOptions/kerry-express',
        price: '50',
        shippingFee: 5000,
      },
    ],
    isLoading: false,
  }),
}));

jest.mock('flagsmith/react', () => {
  mockUseFlags = {
    'brok-3220_enable-voucher-checkbox-on-package-payment-detail-page_20251007_temp':
      {
        enabled: true,
      },
  };
  return {
    ...jest.requireActual('flagsmith/react'),
    useFlags: jest.fn().mockReturnValue(mockUseFlags),
  };
});

const mockUseAppSelector = jest.fn();
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: (selector: (state: unknown) => string) =>
    mockUseAppSelector(selector),
}));

describe('<DiscountSection /> handleDiscountChange coverage (lines 405-418)', () => {
  const leadId = 'leads/fakeLeadId';
  const packageId = 'packages/fakePackageId';
  const campaignsResponse = [
    {
      name: 'campaigns/1',
      displayName: 'Campaign A',
      maxDiscountPercent: '2500',
    },
  ];

  beforeEach(() => {
    mockUseAppSelector.mockReturnValue('products/car-insurance');
    server.use(
      http.get(
        getApiEndpoint(
          `/v1alpha1/${leadId}/${packageId}:discountDetails`,
          ServicesName.GFF
        ),
        () =>
          HttpResponse.json({
            campaigns: campaignsResponse,
          })
      )
    );
  });

  it('covers 405-410: car-insurance path calls setFieldValue with convertedValue', async () => {
    mockUseAppSelector.mockReturnValue('products/car-insurance');
    render(
      <Formik
        initialValues={{
          discountType: null,
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={{ name: leadId } as any}
          onClose={mockPushFn}
          packageData={
            {
              id: packageId,
              premium: '10000.00',
              grossVoluntaryPremium: '10000',
              extraData: { grossVoluntaryPremium: '10000' },
              insuranceKind: 'both',
            } as any
          }
          getPaymentOptions={jest.fn()}
          setCampaignName={jest.fn()}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );

    const discountTypeSelect = screen.getByTestId('discountType-select');
    await userEvent.click(within(discountTypeSelect).getByRole('button'));
    const options = within(screen.getByRole('presentation')).getAllByRole(
      'option'
    );
    await userEvent.click(options[3]);

    await waitFor(() => {
      expect(screen.getByTestId('discount-options')).toBeInTheDocument();
    });

    const discountPercentInput = within(
      screen.getByTestId('discountPercent-input')
    ).getByRole('textbox');
    await userEvent.clear(discountPercentInput);
    await userEvent.type(discountPercentInput, '50');

    await waitFor(() => {
      const discountAmountInput = within(
        screen.getByTestId('discountAmount-input')
      ).getByRole('textbox');
      expect(discountAmountInput).toHaveValue();
      expect(Number((discountAmountInput as HTMLInputElement).value)).toBe(
        5000
      );
    });
  });

  it('covers 411-414: health-insurance path sets discountAmount as (convertedValue/100).toFixed(2)', async () => {
    mockUseAppSelector.mockReturnValue('products/health-insurance');
    render(
      <Formik
        initialValues={{
          discountType: null,
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={{ name: leadId } as any}
          onClose={mockPushFn}
          packageData={
            {
              id: packageId,
              premium: '10000.00',
              grossVoluntaryPremium: '10000',
              extraData: { grossVoluntaryPremium: '10000' },
              insuranceKind: 'both',
            } as any
          }
          getPaymentOptions={jest.fn()}
          setCampaignName={jest.fn()}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );

    const discountTypeSelect = screen.getByTestId('discountType-select');
    await userEvent.click(within(discountTypeSelect).getByRole('button'));
    const options = within(screen.getByRole('presentation')).getAllByRole(
      'option'
    );
    await userEvent.click(options[3]);

    await waitFor(() => {
      expect(screen.getByTestId('discount-options')).toBeInTheDocument();
    });

    const discountPercentInput = within(
      screen.getByTestId('discountPercent-input')
    ).getByRole('textbox');
    await userEvent.clear(discountPercentInput);
    await userEvent.type(discountPercentInput, '50');

    await waitFor(() => {
      const discountAmountInput = within(
        screen.getByTestId('discountAmount-input')
      ).getByRole('textbox');
      expect(discountAmountInput).toHaveValue();
      expect((discountAmountInput as HTMLInputElement).value).toBe('50.00');
    });
  });

  it('covers 415-416: health-insurance path sets discountPercent as (convertedValue*100).toFixed(2)', async () => {
    mockUseAppSelector.mockReturnValue('products/health-insurance');
    render(
      <Formik
        initialValues={{
          discountType: null,
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={{ name: leadId } as any}
          onClose={mockPushFn}
          packageData={
            {
              id: packageId,
              premium: '10000.00',
              grossVoluntaryPremium: '10000',
              extraData: { grossVoluntaryPremium: '10000' },
              insuranceKind: 'both',
            } as any
          }
          getPaymentOptions={jest.fn()}
          setCampaignName={jest.fn()}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );

    const discountTypeSelect = screen.getByTestId('discountType-select');
    await userEvent.click(within(discountTypeSelect).getByRole('button'));
    const options = within(screen.getByRole('presentation')).getAllByRole(
      'option'
    );
    await userEvent.click(options[3]);

    await waitFor(() => {
      expect(screen.getByTestId('discount-options')).toBeInTheDocument();
    });

    const discountAmountInput = within(
      screen.getByTestId('discountAmount-input')
    ).getByRole('textbox');
    await userEvent.clear(discountAmountInput);
    await userEvent.type(discountAmountInput, '5000');

    await waitFor(() => {
      const discountPercentInput = within(
        screen.getByTestId('discountPercent-input')
      ).getByRole('textbox');
      expect(discountPercentInput).toHaveValue();
      expect((discountPercentInput as HTMLInputElement).value).toBe('5000.00');
    });
  });
});

describe('<DiscountSection />', () => {
  beforeEach(() => {
    mockShowError.mockClear();
  });

  it('should render component correctly', () => {
    render(
      <Formik
        initialValues={{
          discountType: 'carDiscount',
          maxDiscount: null,
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
          approver: null,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={{} as any}
          onClose={mockPushFn}
          packageData={
            {
              premium: '12,345.67',
              extraData: {
                grossVoluntaryPremium: '1234567',
              },
            } as any
          }
          getPaymentOptions={jest.fn()}
          setCampaignName={jest.fn()}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );
    expect(screen.getByTestId('discount-section')).toBeInTheDocument();
  });

  it('should show error snackbar when api throws error', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          '/v1alpha1/leads/fakeLeadId/packages/fakePackageId:discountDetails'
        ),
        (_) =>
          HttpResponse.json(
            {
              code: 5,
              message: 'Not Found',
              details: [],
            },
            { status: 404 }
          )
      )
    );

    render(
      <Formik
        initialValues={{
          discountType: 'carDiscount',
          maxDiscount: null,
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
          approver: null,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={
            {
              name: 'leads/fakeLeadId',
            } as any
          }
          onClose={mockPushFn}
          packageData={
            {
              id: 'packages/fakePackageId',
              premium: '10000.00',
              extraData: {
                grossVoluntaryPremium: '10000',
              },
            } as any
          }
          getPaymentOptions={jest.fn()}
          setCampaignName={jest.fn()}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );
    expect(screen.getByTestId('discount-section')).toBeInTheDocument();
    expect(screen.getByTestId('discountType-select')).toBeInTheDocument();
    expect(screen.queryByTestId('discount-options')).not.toBeInTheDocument();

    const DiscountTypeSelect = screen.getByTestId('discountType-select');
    const discountButton = within(DiscountTypeSelect).getByRole('button');
    await userEvent.click(discountButton);

    const discountTypeListbox = within(screen.getByRole('presentation'));
    const options = await discountTypeListbox.findAllByRole('option');
    await userEvent.click(options[2]);

    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalled();
    });
  });

  it.skip('should enable the button when all data is entered', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          '/v1alpha1/leads/fakeLeadId/packages/fakePackageId:discountDetails'
        ),
        (_) =>
          HttpResponse.json({
            campaigns: [
              {
                name: 'product/products/car-insurance/carmodel/brands/24/models/183/insurer/insurers/27/premium/1000000/repairtype/DEALER/leadtype/LEAD_TYPE_NEW',
                displayName: 'Normal',
                maxDiscountPercent: '2500',
              },
            ],
          })
      ),
      http.get(getApiEndpoint('/v1alpha1:getDiscountApprover'), (_) =>
        HttpResponse.json({
          displayName: 'Rajendra Sharma',
        })
      )
    );

    render(
      <Formik
        initialValues={{
          discountType: 'carDiscount',
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
          approver: null,
          deliveryOption: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={
            {
              name: 'leads/fakeLeadId',
            } as any
          }
          onClose={mockPushFn}
          packageData={
            {
              id: 'packages/fakePackageId',
              premium: '10000.00',
              // incoming as satang value
              grossVoluntaryPremium: '1000000',
              insuranceKind: 'both',
            } as any
          }
          setCampaignName={jest.fn()}
          getPaymentOptions={mockGetPaymentOptions}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );

    expect(screen.getByTestId('discount-section')).toBeInTheDocument();
    expect(screen.getByTestId('discountType-select')).toBeInTheDocument();
    expect(screen.queryByTestId('discount-options')).not.toBeInTheDocument();

    const DiscountTypeSelect = screen.getByTestId('discountType-select');
    const discountButton = within(DiscountTypeSelect).getByRole('button');
    await userEvent.click(discountButton);

    const discountTypeListbox = within(screen.getByRole('presentation'));
    const options = await discountTypeListbox.findAllByRole('option');
    await userEvent.click(options[2]);

    await waitFor(() => {
      expect(screen.queryByTestId('discount-options')).toBeInTheDocument();
    });

    expect(screen.getByTestId('checkPaymentOptions-btn')).toBeDisabled();

    const campaignNameSelect = screen.getByTestId('campaignName-select');
    const campaignButton = within(campaignNameSelect).getByRole('button');
    await userEvent.click(campaignButton);

    const campaignPresentation = within(screen.getByRole('presentation'));

    await waitFor(async () => {
      const campaignOptions = campaignPresentation.getAllByRole('option');
      expect(campaignOptions).toHaveLength(2);
      await userEvent.click(campaignOptions[1]);
    });

    const discountPercentInput = within(
      screen.getByTestId('discountPercent-input')
    ).getByRole('textbox');

    await userEvent.type(discountPercentInput, '50');

    const discountAmountInput = within(
      screen.getByTestId('discountAmount-input')
    ).getByRole('textbox');

    expect(discountAmountInput).toHaveValue('500000');
    await userEvent.tab();

    await waitFor(() => {
      const approverInput = within(
        screen.getByTestId('input-approver')
      ).getByRole('textbox');
      expect(approverInput).toHaveValue('Rajendra Sharma');
    });

    expect(screen.getByTestId('checkPaymentOptions-btn')).toBeEnabled();
    await userEvent.click(screen.getByTestId('checkPaymentOptions-btn'));

    await waitFor(() => {
      expect(mockGetPaymentOptions).toHaveBeenCalledWith({
        leadId: 'leads/fakeLeadId',
        packageId: 'packages/fakePackageId',
        queryParams: {
          'discount.amount': '500000',
          'discount.discountType': 'agent_discount',
          'discount.percentage': '5000',
          insuranceKind: 'BOTH',
          shipmentFee: 5000,
        },
      });
    });
  });

  it.skip('should display error snackbar when getDiscountApprover api throws error', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          '/v1alpha1/leads/fakeLeadId/packages/fakePackageId:discountDetails'
        ),
        (_) =>
          HttpResponse.json(
            {
              code: 3,
              message: 'validation error',
              details: [
                {
                  '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
                  reason: 'REQUEST_VALIDATION_ERROR',
                  metadata: {
                    detail: 'user does not belong to any team',
                    field: 'approver',
                    rule: 'invalid.approver',
                  },
                },
              ],
            },
            { status: 400 }
          )
      )
    );

    render(
      <Formik
        initialValues={{
          discountType: 'carDiscount',
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
          approver: null,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={
            {
              name: 'leads/fakeLeadId',
            } as any
          }
          onClose={mockPushFn}
          packageData={
            {
              id: 'packages/fakePackageId',
              premium: '10000.00',
              grossVoluntaryPremium: '1000000',
            } as any
          }
          setCampaignName={jest.fn()}
          getPaymentOptions={jest.fn()}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );

    expect(screen.getByTestId('discount-section')).toBeInTheDocument();
    expect(screen.getByTestId('discountType-select')).toBeInTheDocument();
    expect(screen.queryByTestId('discount-options')).not.toBeInTheDocument();

    const DiscountTypeSelect = screen.getByTestId('discountType-select');
    const discountButton = within(DiscountTypeSelect).getByRole('button');
    await userEvent.click(discountButton);

    const discountTypeListbox = within(screen.getByRole('presentation'));
    const options = await discountTypeListbox.findAllByRole('option');
    await userEvent.click(options[2]);

    await waitFor(() => {
      expect(screen.queryByTestId('discount-options')).toBeInTheDocument();
    });

    expect(screen.getByTestId('checkPaymentOptions-btn')).toBeDisabled();

    const campaignNameSelect = screen.getByTestId('campaignName-select');
    const campaignButton = within(campaignNameSelect).getByRole('button');
    await userEvent.click(campaignButton);

    const campaignPresentation = within(screen.getByRole('presentation'));

    await waitFor(async () => {
      const campaignOptions = campaignPresentation.getAllByRole('option');
      expect(campaignOptions).toHaveLength(2);
      await userEvent.click(campaignOptions[1]);
    });

    const discountPercentInput = within(
      screen.getByTestId('discountPercent-input')
    ).getByRole('textbox');

    await userEvent.type(discountPercentInput, '50');

    const discountAmountInput = within(
      screen.getByTestId('discountAmount-input')
    ).getByRole('textbox');

    expect(discountAmountInput).toHaveValue('500000');
    await userEvent.tab();

    await waitFor(() => {
      expect(mockHandleErrors).toHaveBeenCalledWith({
        data: {
          code: 3,
          message: 'validation error',
          details: [
            {
              '@type': 'type.googleapis.com/rf.bff.v1alpha1.ErrorInfo',
              reason: 'REQUEST_VALIDATION_ERROR',
              metadata: {
                detail: 'user does not belong to any team',
                field: 'approver',
                rule: 'invalid.approver',
              },
            },
          ],
        },
        status: 400,
      });
    });
  });

  it('should render correctly with when edited package is mandatory and call getPaymetOptions api automatically', async () => {
    mockGetPaymentOptions = jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: 'promise resolved' }));

    render(
      <Formik
        initialValues={{
          discountType: null,
          campaignName: null,
          discountPercent: null,
          discountAmount: null,
        }}
        onSubmit={jest.fn()}
      >
        <DiscountSection
          leadData={
            {
              name: 'leads/fakeLeadId',
            } as any
          }
          onClose={mockPushFn}
          packageData={
            {
              id: 'packages/fakePackageId',
              premium: '10000.00',
              insuranceKind: 'mandatory',
              extraData: {
                grossVoluntaryPremium: '1000000',
              },
            } as any
          }
          setCampaignName={jest.fn()}
          getPaymentOptions={mockGetPaymentOptions}
          showPricing={jest.fn()}
          resetForm={jest.fn()}
        />
      </Formik>
    );

    expect(screen.getByTestId('discount-section')).toBeInTheDocument();
    expect(screen.getByTestId('discountType-select')).toBeInTheDocument();
    expect(mockGetPaymentOptions).toHaveBeenCalled();
  });

  it.skip('should prefill values for custom package', async () => {
    server.use(
      http.get(
        getApiEndpoint(
          'v1alpha1/leads/leadId/packages/1234:discountDetails',
          ServicesName.GFF
        ),
        () =>
          HttpResponse.json({
            campaigns: [{ name: 'campaigns/1234', displayName: 'Campaign' }],
          })
      )
    );
    render(
      <DiscountSection
        leadData={{ name: 'leads/leadId' } as any}
        onClose={mockPushFn}
        packageData={
          {
            premium: '12,345.67',
            extraData: {
              grossVoluntaryPremium: '1234567',
            },
            packageSource: 'custom',
            insuranceKind: 'both',
            customQuoteDetail: {
              originalPackageName: 'packages/1234',
              discountType: 'campaign_discount',
              discountRequest: {
                source: 'campaigns/1234',
                discountPercentage: 100,
                discountAmount: 100,
                approver: 'fn ln',
                maxDiscount: 1000,
              },
              deliveryOption: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
            },
          } as any
        }
        getPaymentOptions={jest.fn(() => Promise.resolve({}))}
        setCampaignName={jest.fn()}
        showPricing={jest.fn()}
        resetForm={jest.fn()}
      />
    );
    await waitFor(() =>
      expect(
        within(screen.getByTestId('discountType-select')).getByText(
          'discountPricing.discountType.campaign'
        )
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(screen.getByTestId('campaignName-select')).getByText('Campaign')
      ).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(
        within(screen.getByTestId('discountPercent-input')).getByRole('textbox')
      ).toHaveValue('1')
    );
    await waitFor(() =>
      expect(
        within(screen.getByTestId('input-approver')).getByRole('textbox')
      ).toHaveValue('fn ln')
    );
    await waitFor(() =>
      expect(screen.getByTestId('checkPaymentOptions-btn')).toBeDisabled()
    );
  });
});
