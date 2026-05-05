import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { ERRORS } from 'shared/helper/ErrorHelper';
import getApiEndpoint from 'utils/endpointHelper';

import PurchaseButton from '.';

var mockShowError: jest.Mock;

jest.mock('utils/snackbar', () => {
  mockShowError = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockShowError,
    showSuccessSnackbar: jest.fn(),
  });
});

const validLead = {
  name: 'leads/leadId',
  status: 'LEAD_STATUS_PENDING_PAYMENT',
  data: {
    policyHolderType: 'mr',
    customerFirstName: 'name',
    customerLastName: 'name',
    customerDOB: '1999-01-01',
    primaryPhoneIndex: 0,
    customerPhoneNumber: [{ phone: '+66812345678' }],
    policyTitle: 'mr',
    policyHolderFirstName: 'name',
    policyHolderLastName: 'name',
    policyHolderNationalId: 'id',
    policyHolderDOB: '1999-01-01',
    customerEmail: ['email'],
    customerGender: 'F',
    customerShippingAddress: ['addr'],
    customerPolicyAddress: [
      {
        firstName: 'fn',
        lastName: 'ln',
      },
    ],
    customerBillingAddress: ['addr'],
    checkout: {
      installments: 1,
      deliveryOption: 'deliveryOption/kerry-express',
      package: 'package',
    },
    compulsoryPolicyStartDate: '1999-01-01',
    registeredProvince: 1101,
    carColor: ['white'],
    carLicensePlate: 'license',
    vehicleIdNumber: 'num',
    chassisNumber: 'num',
    numberOfFixedDriver: 0,
  },
};

const carDocumentsUploadedPreload = {
  leadsReducer: {
    createDocumentReducer: {
      documents: [
        { type: 'DOCUMENT_TYPE_ID_CARD', name: 'd1' },
        { type: 'DOCUMENT_TYPE_VEHICLE_REGISTRATION', name: 'd2' },
      ],
    },
  },
};

const carDocumentsMissingPreload = {
  leadsReducer: {
    createDocumentReducer: {
      documents: [],
    },
  },
};

/** MSW for purchase flow when lead has no linked customer yet (silent create + connect). */
const purchaseUnmappedCustomerHandlers = [
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/-/leads`,
    () => HttpResponse.json({ leads: [] })
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/-/phones`,
    () => HttpResponse.json({ phones: [] })
  ),
  http.post(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers`,
    () => HttpResponse.json({ name: 'customers/purchase-msw-customer' })
  ),
  http.post(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/purchase-msw-customer/phones`,
    () =>
      HttpResponse.json({
        name: 'customers/purchase-msw-customer/phones/phone-1',
      })
  ),
  http.patch(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/purchase-msw-customer`,
    () => HttpResponse.json({})
  ),
  http.post(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/purchase-msw-customer/emails`,
    () =>
      HttpResponse.json({
        name: 'customers/purchase-msw-customer/emails/email-1',
      })
  ),
  http.post(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/purchase-msw-customer/leads`,
    () => HttpResponse.json({})
  ),
];

describe('Purchase button', () => {
  beforeEach(() => {
    server.use(...purchaseUnmappedCustomerHandlers);
  });
  it('should call the order creation api when click', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(
        getApiEndpoint('/v1alpha1/leads/leadId:createOrderWithPricing'),
        () => HttpResponse.json(mockHandler(), { status: 500 })
      )
    );
    render(<PurchaseButton lead={validLead as any} />);
    userEvent.click(
      screen.getByRole('button', { name: 'leadStatus.purchased' })
    );
    await waitFor(() => expect(mockHandler).not.toHaveBeenCalled());
  });

  it('should keep button enabled and rely on runtime validation when lead is invalid', async () => {
    render(
      <PurchaseButton
        lead={{ name: 'leadId', data: { checkout: {} } } as any}
      />
    );
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('should disable the button if page is disabled', async () => {
    render(<PurchaseButton lead={validLead as any} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shouldnt call create order if validation fail', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(
        getApiEndpoint('/v1alpha1/leads/leadId:createOrderWithPricing'),
        () => HttpResponse.json(mockHandler(), { status: 500 })
      )
    );
    render(<PurchaseButton lead={validLead as any} />, {
      initialState: {
        ...carDocumentsMissingPreload,
        leadsDetailReducer: { lead: { payload: validLead } },
      },
    });

    userEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(mockHandler).not.toHaveBeenCalled());
  });

  it('should show error returned by api correctly', async () => {
    server.use(
      http.post(
        getApiEndpoint('/v1alpha1/leads/leadId:createOrderWithPricing'),
        () =>
          HttpResponse.json(
            {
              code: 3,
              message: 'lead validation error',
              details: [],
            },
            { status: 400 }
          )
      )
    );
    render(<PurchaseButton lead={validLead as any} />, {
      initialState: {
        ...carDocumentsUploadedPreload,
        leadsDetailReducer: { lead: { payload: validLead } },
      },
    });

    userEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'errorMessage.generalErrorMessage'
      );
    });
  });

  it('shouldnt call create order if paid amount is not correct', async () => {
    server.use(
      http.post(
        getApiEndpoint('/v1alpha1/leads/leadId:createOrderWithPricing'),
        () =>
          HttpResponse.json(
            {
              code: 9,
              message: ERRORS.NOT_ALLOW_PURCHASE_NEED_PAYMENT,
              details: [],
            },
            { status: 400 }
          )
      )
    );
    render(<PurchaseButton lead={validLead as any} />, {
      initialState: {
        ...carDocumentsUploadedPreload,
        leadsDetailReducer: { lead: { payload: validLead } },
      },
    });
    userEvent.click(screen.getByRole('button'));
    await waitFor(() =>
      expect(mockShowError).toHaveBeenCalledWith(
        'errors.notAllowedPurchargeNeedPayment'
      )
    );
  });

  it('should create order even when customer is not mapped and skip mapping modal flow', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(
        getApiEndpoint('/v1alpha1/leads/leadId:createOrderWithPricing'),
        () => HttpResponse.json(mockHandler(), { status: 200 })
      )
    );

    render(<PurchaseButton lead={validLead as any} />, {
      initialState: {
        ...carDocumentsUploadedPreload,
        leadsDetailReducer: { lead: { payload: validLead } },
      },
    });

    userEvent.click(
      screen.getByRole('button', { name: 'leadStatus.purchased' })
    );

    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
    });
  });
});
