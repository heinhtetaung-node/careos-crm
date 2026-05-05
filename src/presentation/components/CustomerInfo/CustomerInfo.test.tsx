import user from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { MockDeliveryOptions } from 'mock-data/DeliveryOptions.mock';
import { ShipmentProviders } from 'shared/constants/orderType';
import * as typedHooks from 'presentation/redux/hooks/typedHooks';

import CustomerInfo, {
  formatCustomerPayload,
  getShipmentPayload,
} from './CustomerInfo';

const storeRef = setupApiStore(apiSlice);

var mockedShowSnackBar: jest.Mock;
var mockedUseParams: jest.Mock;
var orderId = 'b5843e5c-8196-4d39-97c5-0700adc8a3f3';
var mockUpdateLead: jest.Mock;

jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

jest.mock('react-router-dom', () => {
  mockedUseParams = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useParams: mockedUseParams.mockReturnValue({ orderId }),
  };
});

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => {
    mockUpdateLead = jest.fn().mockResolvedValue({});
    return {
      __esModule: true,
      default: () => ({ updateLead: mockUpdateLead }),
    };
  }
);

jest.mock('presentation/redux/hooks/typedHooks', () => ({
  ...jest.requireActual('presentation/redux/hooks/typedHooks'),
  useAppSelector: jest.fn(),
}));

jest.mock('data/slices/deliveryOptionSlice', () => ({
  useGetDeliveryOptionsQuery: jest.fn().mockReturnValue({
    data: MockDeliveryOptions,
    isLoading: false,
    isSuccess: true,
  }),
}));

const buildMockState = (overrides?: Partial<any>) => ({
  order: {
    payload: {
      name: `orders/${orderId}`,
      customer: {
        gender: 'M',
        dateOfBirth: '1990-01-01',
        humanId: 'customer-123',
      },
      data: {
        policyHolder: {
          isCustomer: false,
          communicationLanguage: 'th-th',
        },
      },
    },
  },
  typeSelectorReducer: {
    globalProductSelectorReducer: { data: 'products/car-insurance' },
  },
  ...overrides,
});

beforeEach(() => {
  (typedHooks.useAppSelector as jest.Mock).mockImplementation(
    (selector: any) => {
      try {
        return selector(buildMockState());
      } catch {
        return undefined;
      }
    }
  );
});

test('CustomerInfo renders', async () => {
  render(
    <Provider store={storeRef.store}>
      <CustomerInfo />
    </Provider>
  );
  expect(screen.getByText('order.customerInfo')).toBeInTheDocument();
});

test('CustomerInfo handles value change for a policyholder field', async () => {
  render(
    <Provider store={storeRef.store}>
      <CustomerInfo />
    </Provider>
  );
  const commLang = within(screen.getByTestId('customer-comm-lang'));
  await user.click(commLang.getByRole('button'));
  await user.click(screen.getByRole('option', { name: 'text.english' }));
  await waitFor(() => {
    expect(screen.getByText('text.english')).toBeInTheDocument();
  });
});

test('CustomerInfo handles value change for a customer field', async () => {
  render(
    <Provider store={storeRef.store}>
      <CustomerInfo />
    </Provider>
  );

  const customerId = within(screen.getByTestId('customer-id')).getByRole(
    'textbox'
  );
  await waitFor(async () => {
    await user.tab();
    await user.type(customerId, 'Test');
    await user.tab();
  });

  const gender = within(screen.getByTestId('customer-gender'));
  await user.click(gender.getByRole('button'));
  await user.click(screen.getByRole('option', { name: 'text.female' }));
  await waitFor(() => {
    expect(screen.getByText('text.female')).toBeInTheDocument();
  });
});

test('CustomerInfo updates communication language when policyholder is customer', async () => {
  const mockOrder = {
    name: `orders/${orderId}`,
    customer: {
      gender: 'M',
      dateOfBirth: '1990-01-01',
      humanId: 'customer-123',
    },
    data: {
      policyHolder: {
        isCustomer: true,
        communicationLanguage: 'th-th',
      },
    },
  };

  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId:patchData`,
      () => HttpResponse.json({ data: 'success' })
    )
  );

  (typedHooks.useAppSelector as jest.Mock).mockImplementation(
    (selector: any) => {
      try {
        return selector(
          buildMockState({
            order: { payload: mockOrder },
          })
        );
      } catch {
        return undefined;
      }
    }
  );

  render(
    <Provider store={storeRef.store}>
      <CustomerInfo />
    </Provider>
  );

  const commLang = within(screen.getByTestId('customer-comm-lang'));
  await user.click(commLang.getByRole('button'));
  await user.click(screen.getByRole('option', { name: 'text.english' }));

  await waitFor(() => {
    expect(mockUpdateLead).toHaveBeenCalledWith(
      '/customer/isThaiNational',
      false
    );
  });
});

describe('Test formatCustomerPayload - ', () => {
  it('Gender payload should be upper-cased', () => {
    expect(formatCustomerPayload('gender', 'm')).toEqual('M');
  });

  it('DateOfBirth payload should be formatted', () => {
    expect(
      formatCustomerPayload('dateOfBirth', '1995-01-22T00:00:00.000Z')
    ).toEqual('1995-01-22T00:00:00.000Z');
  });

  it('DateOfBirth payload should be formatted', () => {
    expect(formatCustomerPayload('dateOfBirth', '1992-02-29')).toEqual(
      '1992-02-29T00:00:00.000Z'
    );
  });

  it('Other fields remain unchanged', () => {
    expect(formatCustomerPayload('age', '22')).toEqual('22');
  });
});

describe('Test docsShipmentMethod', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());
  it('Should update docsShipmentMethod fail', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId:patchData`,
        () => HttpResponse.json({}, { status: 400 })
      )
    );

    render(
      <Provider store={storeRef.store}>
        <CustomerInfo />
      </Provider>
    );

    const deliveryOption = within(
      screen.getByTestId('prefered-delivery-option')
    );
    await user.click(deliveryOption.getByRole('button'));

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(4);

    await user.click(options[1]);

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.updateOrderFailed',
        status: 'error',
      });
    });
  });

  it('Should update docsShipmentMethod success', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId:patchData`,
        () =>
          HttpResponse.json(
            HttpResponse.json({
              data: 'success',
            })
          )
      )
    );

    render(
      <Provider store={storeRef.store}>
        <CustomerInfo />
      </Provider>
    );

    const deliveryOption = within(
      screen.getByTestId('prefered-delivery-option')
    );
    await user.click(deliveryOption.getByRole('button'));

    const options = await screen.findAllByRole('option');
    expect(options).toHaveLength(4);

    await user.click(options[1]);

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.updateOrderSuccessfully',
        status: 'success',
      });
    });
  });
});

describe('Test helpers', () => {
  test('Test getShipmentPayload for Express Delivery', () => {
    expect(getShipmentPayload('ExpressDelivery')).toEqual([
      {
        op: 'add',
        path: 'data/docsShipmentMethod',
        value: 'Courier',
      },
      {
        op: 'add',
        path: 'data/deliveryOption',
        value: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
      },
      {
        op: 'add',
        path: 'data/shipmentFee',
        value: 0,
      },
    ]);
  });
  test('Test getShipmentPayload for Digital Delivery', () => {
    expect(getShipmentPayload('DigitalDelivery')).toEqual([
      {
        op: 'add',
        path: 'data/docsShipmentMethod',
        value: 'Email',
      },
      {
        op: 'add',
        path: 'data/deliveryOption',
        value: ShipmentProviders.EMAIL,
      },
      {
        op: 'add',
        path: 'data/shipmentFee',
        value: 0,
      },
    ]);
  });
  test('Test getShipmentPayload for old shipment option', () => {
    expect(getShipmentPayload('InPerson')).toEqual([
      {
        op: 'add',
        path: 'data/docsShipmentMethod',
        value: 'InPerson',
      },
    ]);
  });
});
