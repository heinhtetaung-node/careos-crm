import { HttpResponse, http } from 'msw';

import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';

import useAddAddress from './useAddAddress';

var mockedShowSnapbar: jest.Mock;
var mockedGetLeadSelector: jest.Mock;

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: jest.fn().mockReturnValue('leadId'),
}));
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnapbar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnapbar,
  };
});

jest.mock('presentation/redux/selectors/lead', () => {
  mockedGetLeadSelector = jest.fn(() => ({}));
  return {
    useGetLeadSelector: mockedGetLeadSelector,
  };
});

const mockedAddress = {
  policy: { name: 'policy' },
  billing: { name: 'billing' },
  shipping: { name: 'shipping' },
  shipmentAddressIsSame: true,
  billingAddressIsSame: true,
};

const leadEndpoint = `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/leadId:patchData`;

describe('useAddAddress', () => {
  beforeEach(() => mockedShowSnapbar.mockClear());

  test('show show success snapbar if api success', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    const { result }: any = renderHook(useAddAddress);
    await result.current.addAddress(mockedAddress);
    expect(mockedShowSnapbar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.addAddressSuccessful',
      status: 'success',
    });
  });

  test('show show error snapbar if api success', async () => {
    server.use(
      http.patch(leadEndpoint, () =>
        HttpResponse.json({ message: 'error message' }, { status: 500 })
      )
    );
    const { result }: any = renderHook(useAddAddress);
    await result.current.addAddress(mockedAddress);
    expect(mockedShowSnapbar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'error message',
      status: 'error',
    });
  });

  test('billing address should be the same with policy if billingAddressIsSame is true', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    const { result }: any = renderHook(useAddAddress);
    const response = await result.current.addAddress(mockedAddress);
    expect(
      response.data.req.find(
        (payload: any) => payload.path === '/customerBillingAddress'
      ).value
    ).toStrictEqual([{ name: 'policy' }]);
  });

  test('shipping address should be the same with policy if shippingAddressIsSame is true', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    const { result }: any = renderHook(useAddAddress);
    const response = await result.current.addAddress(mockedAddress);
    expect(
      response.data.req.find(
        (payload: any) => payload.path === '/customerShippingAddress'
      ).value
    ).toStrictEqual([{ name: 'policy' }]);
  });

  test('billing address should be billing if billingAddressIsSame is false', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    const { result }: any = renderHook(useAddAddress);
    const response = await result.current.addAddress({
      ...mockedAddress,
      billingAddressIsSame: false,
    });
    expect(
      response.data.req.find(
        (payload: any) => payload.path === '/customerBillingAddress'
      ).value
    ).toStrictEqual([{ name: 'billing' }]);
  });

  test('shipping address should be shipping if shippingAddressIsSame is false', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    const { result }: any = renderHook(useAddAddress);
    const response = await result.current.addAddress({
      ...mockedAddress,
      shipmentAddressIsSame: false,
    });
    expect(
      response.data.req.find(
        (payload: any) => payload.path === '/customerShippingAddress'
      ).value
    ).toStrictEqual([{ name: 'shipping' }]);
  });

  test('should replace if shipping address alread exist', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    mockedGetLeadSelector.mockReturnValue({
      data: {
        customerShippingAddress: [{ name: 'existingAddress' }],
        customerPolicyAddress: [],
        customerBillingAddress: [],
      },
    });

    const { result }: any = renderHook(useAddAddress);
    const response = await result.current.addAddress({
      ...mockedAddress,
      shipmentAddressIsSame: false,
    });
    expect(
      response.data.req.find(
        (payload: any) => payload.path === '/customerShippingAddress'
      ).op
    ).toStrictEqual('replace');
  });

  test('should replace if billing address alread exist', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    mockedGetLeadSelector.mockReturnValue({
      data: {
        customerShippingAddress: [],
        customerPolicyAddress: [],
        customerBillingAddress: [{ name: 'existingAddress' }],
      },
    });

    const { result }: any = renderHook(useAddAddress);
    const response = await result.current.addAddress({
      ...mockedAddress,
      shipmentAddressIsSame: false,
    });
    expect(
      response.data.req.find(
        (payload: any) => payload.path === '/customerBillingAddress'
      ).op
    ).toStrictEqual('replace');
  });

  test('should replace if policy address alread exist', async () => {
    server.use(
      http.patch(leadEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    mockedGetLeadSelector.mockReturnValue({
      data: {
        customerShippingAddress: [],
        customerPolicyAddress: [{ name: 'existingAddress' }],
        customerBillingAddress: [],
      },
    });

    const { result }: any = renderHook(useAddAddress);
    const response = await result.current.addAddress({
      ...mockedAddress,
      shipmentAddressIsSame: false,
    });
    expect(
      response.data.req.find(
        (payload: any) => payload.path === '/customerPolicyAddress'
      ).op
    ).toStrictEqual('replace');
  });
});
