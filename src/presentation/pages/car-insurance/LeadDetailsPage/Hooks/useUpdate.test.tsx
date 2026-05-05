import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { act, renderHook } from '__tests__/rtl-test-utils';

import { useUpdateLead, useUpdateCustomer } from './useUpdate';

var mockedShowSnackbar: jest.Mock;

jest.mock('presentation/redux/actions/ui', () => {
  const mockFn = jest.fn(() => ({
    type: '',
    payload: {},
  }));
  mockedShowSnackbar = mockFn;
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackbar,
  };
});

describe.skip('useUpdateLead', () => {
  beforeEach(() => mockedShowSnackbar.mockClear());

  test('should show success snackbar if api is success', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/leadId:patchData`,
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );
    const { result } = renderHook(useUpdateLead);
    await act(() =>
      (result.current as any)[0]({
        leadId: 'leadId',
        payload: [{ op: 'add', path: 'testpath', value: 'testvalue' }],
      })
    );
    expect(mockedShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
      })
    );
  });

  test('should show error snackbar if api fail', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/leadId:patchData`,
        async ({ request }) =>
          HttpResponse.json(await request.json(), { status: 400 })
      )
    );
    const { result } = renderHook(useUpdateLead);
    await act(() =>
      (result.current as any)[0]({
        leadId: 'leadId',
        payload: [{ op: 'add', path: 'testpath', value: 'testvalue' }],
      })
    );
    expect(mockedShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
      })
    );
  });
});
describe('useUpdateCustomer', () => {
  beforeEach(() => mockedShowSnackbar.mockClear());

  test('should show success snackbar if api is success', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customerId`,
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );
    const { result } = renderHook(useUpdateCustomer);
    await act(() =>
      (result.current as any)[0]({
        customerId: 'customerId',
        payload: { firstName: 'testvalue' },
      })
    );
    expect(mockedShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
      })
    );
  });

  test('should show error snackbar if api fail', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/customerId`,
        async ({ request }) =>
          HttpResponse.json(await request.json(), { status: 400 })
      )
    );
    const { result } = renderHook(useUpdateCustomer);
    await act(() =>
      (result.current as any)[0]({
        customerId: 'customerId',
        payload: { op: 'add', path: 'testpath', value: 'testvalue' },
      })
    );
    expect(mockedShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
      })
    );
  });
});
