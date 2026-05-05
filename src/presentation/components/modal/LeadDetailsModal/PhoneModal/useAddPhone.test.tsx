import { http, HttpResponse } from 'msw';

import {
  getCustomerPhonesHandler,
  updateCustomerPrimaryPhoneHandler,
} from '__mocks__/handlers/customerHandler';
import { server } from '__mocks__/server';
import { PRODUCTS } from 'config/TypeFilter';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';

import useAddPhone from './useAddPhone';

const mockedLeadStore = {
  leadsDetailReducer: {
    lead: {
      payload: {
        data: {
          customerPhoneNumber: [
            {
              phone: '+6612345678',
              status: 'unverified',
            },
            {
              phone: '+6611111111',
              status: 'unverified',
            },
          ],
        },
      },
    },
  },
};

const mockLeadStoreWithPrimaryContact = {
  leadsDetailReducer: {
    lead: {
      payload: {
        data: {
          customerPhoneNumber: [
            {
              phone: '+6612345678',
              status: 'unverified',
            },
            {
              phone: '+6611111111',
              status: 'unverified',
            },
          ],
        },
      },
    },
  },
};

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

describe('useAddPhone', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should call show success snackbar if api success', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      )
    );
    const { result }: any = renderHook(useAddPhone);
    await result.current.addPhone('+6612345678');
    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.addPhoneSuccess',
      status: 'success',
    });
  });

  test('should call show error snackbar if api is error', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        () => HttpResponse.json({ message: 'error message' }, { status: 500 })
      )
    );
    const { result }: any = renderHook(useAddPhone);
    await result.current.addPhone('+6612345678');
    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'error message',
      status: 'error',
    });
  });

  test("should add new phone number if phone number doesn't exist yet", async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );
    const { result }: any = renderHook(useAddPhone);
    const response = await result.current.addPhone('+6612345678');
    expect(response.data[0].value).toStrictEqual([
      { phone: '+6612345678', status: 'unverified' },
    ]);
  });

  test('should throw if phone number is already exist', async () => {
    const mockedHandler = jest.fn();
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedHandler(await request.json()))
      )
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockedLeadStore,
    });
    await result.current.addPhone('+6612345678');
    expect(mockedHandler).not.toHaveBeenCalled();
  });

  test('should set primaryPhoneIndex', async () => {
    const mockedHandler = jest.fn((arg) => arg);
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedHandler(await request.json()))
      )
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockLeadStoreWithPrimaryContact,
    });
    const response = await result.current.addPhone('+6622222222', true);
    expect(response.data[0].value).toStrictEqual([
      {
        phone: '+6612345678',
        status: 'unverified',
      },
      {
        phone: '+6611111111',
        status: 'unverified',
      },
      {
        phone: '+6622222222',
        status: 'unverified',
      },
    ]);
    expect(mockedHandler).toHaveBeenCalledTimes(2);
    expect(mockedHandler.mock.calls[1][0]).toEqual([
      {
        op: 'add',
        path: '/primaryPhoneIndex',
        value: 2,
      },
    ]);
  });
});

describe('useAddPhone.setPrimaryContact', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should set primary phone number', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockLeadStoreWithPrimaryContact,
    });
    const response = await result.current.setPrimaryPhoneIndex(3);
    expect(response.data[0].value).toStrictEqual(3);
  });

  test('setPrimaryPhoneIndex sends /customer/primaryPhoneIndex when health product', async () => {
    const captureBody = jest.fn();
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) => {
          const body = await request.json();
          captureBody(body);
          return HttpResponse.json(body);
        }
      )
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: {
        ...mockLeadStoreWithPrimaryContact,
        typeSelectorReducer: {
          globalProductSelectorReducer: {
            data: PRODUCTS.HEALTH_PRODUCT_INSURANCE,
          },
        },
      },
    });
    await result.current.setPrimaryPhoneIndex(3);
    expect(captureBody).toHaveBeenCalledWith([
      {
        op: 'add',
        path: '/customer/primaryPhoneIndex',
        value: 3,
      },
    ]);
  });

  test('should set primary phone id for customer service', async () => {
    server.use(getCustomerPhonesHandler(), updateCustomerPrimaryPhoneHandler());
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockLeadStoreWithPrimaryContact,
    });
    const response = await result.current.setPrimaryPhoneForCustomer(
      '0999999999',
      'customerId'
    );
    expect(response.data.primaryPhoneId).toStrictEqual('customerPhoneId');
  });

  test('should create customer phone when number is not on customer then set primary', async () => {
    const createdPhoneId = 'customers/foo/phones/new-from-lead';
    server.use(
      getCustomerPhonesHandler({ phones: [], nextPageToken: '' }),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/:customerId/phones`,
        () =>
          HttpResponse.json({
            name: createdPhoneId,
            phone: '+66888888888',
          })
      ),
      updateCustomerPrimaryPhoneHandler({ primaryPhoneId: createdPhoneId })
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockLeadStoreWithPrimaryContact,
    });
    const response = await result.current.setPrimaryPhoneForCustomer(
      encodeURIComponent('+66888888888'),
      'customerId'
    );
    expect(response.data.primaryPhoneId).toStrictEqual(createdPhoneId);
  });

  test('setPrimaryPhoneForCustomer uses last phone resource when multiple phones returned', async () => {
    const lastPhoneResourceName =
      'customers/d8f8386b-5026-4e9f-89e2-fd5eb848b344/phones/last-one';
    server.use(
      getCustomerPhonesHandler({
        phones: [
          {
            name: 'customers/d8f8386b-5026-4e9f-89e2-fd5eb848b344/phones/first-one',
            createTime: '2023-03-19T12:47:27.803273Z',
            updateTime: '2023-03-19T12:47:27.803273Z',
            deleteTime: null,
            phone: '+66799999999',
          },
          {
            name: lastPhoneResourceName,
            createTime: '2023-03-19T12:47:27.803273Z',
            updateTime: '2023-03-19T12:47:27.803273Z',
            deleteTime: null,
            phone: '+66799999999',
          },
        ],
        nextPageToken: '',
      }),
      updateCustomerPrimaryPhoneHandler({
        primaryPhoneId: lastPhoneResourceName,
      })
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockLeadStoreWithPrimaryContact,
    });
    const response = await result.current.setPrimaryPhoneForCustomer(
      '+66799999999',
      'customerId'
    );
    expect(response.data.primaryPhoneId).toStrictEqual(lastPhoneResourceName);
  });

  test('setPrimaryPhoneForCustomer shows error snackbar when create phone fails', async () => {
    server.use(
      getCustomerPhonesHandler({ phones: [], nextPageToken: '' }),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/:customerId/phones`,
        () =>
          HttpResponse.json({ message: 'cannot create phone' }, { status: 500 })
      )
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockLeadStoreWithPrimaryContact,
    });
    const response = await result.current.setPrimaryPhoneForCustomer(
      '+66888888888',
      'customerId'
    );
    expect(response).toEqual({});
    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'cannot create phone',
      status: 'error',
    });
  });

  test('setPrimaryPhoneForCustomer returns empty object when create phone response omits name', async () => {
    server.use(
      getCustomerPhonesHandler({ phones: [], nextPageToken: '' }),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/:customerId/phones`,
        () => HttpResponse.json({ phone: '+66888888888' })
      )
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockLeadStoreWithPrimaryContact,
    });
    const response = await result.current.setPrimaryPhoneForCustomer(
      '+66888888888',
      'customerId'
    );
    expect(response).toEqual({});
  });

  test('should show snackbar if api fail for some reason', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        () =>
          HttpResponse.json({ message: 'mocked fail message' }, { status: 500 })
      )
    );
    const { result }: any = renderHook(useAddPhone, {
      initialState: mockedLeadStore,
    });
    await result.current.setPrimaryPhoneIndex(1);
    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'mocked fail message',
        status: 'error',
      });
    });
  });
});
