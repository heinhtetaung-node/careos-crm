import { http, HttpResponse } from 'msw';
import { act } from 'react-dom/test-utils';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';

import useLeadUpdater from '.';

var mockActionCreator: jest.Mock;

jest.mock('presentation/redux/actions/ui', () => {
  mockActionCreator = jest.fn(() => ({ type: 'action' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockActionCreator,
  };
});

jest.mock('data/slices/customerSlice', () => ({
  ...jest.requireActual('data/slices/customerSlice'),
  useGetConnectedLeadsSelector: jest.fn().mockReturnValue({
    customer: { name: 'customers/customerId/leads/leadId' },
  }),
}));

const mockLeadUpdateHandler = jest.fn();
const initialState = (newDataResponse?: any) => ({
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/leadId',
        createTime: '2022-05-01T05:30:39.476110Z',
        updateTime: '2022-05-01T05:30:50.663813Z',
        deleteTime: null,
        createBy: '',
        product: 'products/car-insurance',
        schema: 'schemas/efce3390-8da6-44b3-9e4c-2c7b78ca2c9d',
        data: {
          carDashCam: true,
          carModified: false,
          carSubModelYear: 46444,
          carUsageType: 'personal',
          checkout: {
            coupon: '1234',
            package: '1379744',
            installments: 1,
          },
          currentInsurer: 27,
          customerBillingAddress: [],
          customerEmail: ['cypresstest1234@mail.co.th'],
          customerFirstName: 'ไซเปรส',
          customerGender: 'f',
          customerLastName: 'เปย์เมนต์',
          customerPhoneNumber: [
            {
              phone: '+66900000000',
              status: 'unverified',
            },
          ],
          customerPolicyAddress: [],
          customerShippingAddress: [],
          insuranceKind: 'both',
          locale: 'th-th',
          marketingConsent: true,
          policyStartDate: '2022-05-01',
          policyHolderType: 'customer',
          registeredProvince: 130000,
          utm: {
            lead_source: 'rabbit.co.th',
          },
          voluntaryInsuranceType: ['type_2+', 'type_3+'],
          firstDriverDOB: '1991-01-15',
          firstDriverFirstName: 'Hello',
          firstDriverLastName: 'Hello',
          firstDriverLicense: '12345678',
          firstDriverNationalId: 'FakeNationalID',
          secondDriverDOB: '1987-01-19',
          secondDriverFirstName: 'World',
          secondDriverLastName: 'World',
          secondDriverLicense: '87654321',
          secondDriverPassport: 'FakePassport',
          ...(newDataResponse && newDataResponse),
        },
        source: 'sources/83894936-ac03-4e7d-ba4b-6fc5f3b529b2',
        important: false,
        assignedTo: '',
        status: 'LEAD_STATUS_NEW',
        humanId: 'L9855791',
        root: '',
        type: 'LEAD_TYPE_NEW',
        isRejected: false,
        reference: '',
        annotations: null,
      },
    },
  },
});

describe('leadUpdater', () => {
  beforeEach(() => {
    mockLeadUpdateHandler.mockClear();
    mockActionCreator.mockClear();
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockLeadUpdateHandler(await request.json()))
      )
    );
  });

  test('should show error message if lead update fail', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        () => HttpResponse.json({ error: 'err' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).updateLead('/currentInsurer', 7);
    await waitFor(() =>
      expect(mockActionCreator).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.updateLeadFail',
        status: 'error',
      })
    );
  });

  test('should call add op when user changes the current insurer to "Bangkok Insurance Public Company Limited" and also remove package if exist', async () => {
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).updateLead('/currentInsurer', 7);
    expect(mockLeadUpdateHandler).toHaveBeenCalledWith([
      { op: 'add', path: '/currentInsurer', value: 7 },
      { op: 'remove', path: '/checkout/package', value: null },
      { op: 'remove', path: '/checkout/installments', value: null },
    ]);
  });

  test('should remove voucher if installment is updated with more than 1 time but not if 1 or 0', async () => {
    const couponHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/leadId:removeVoucher`,
        async ({ request }) =>
          HttpResponse.json(couponHandler(await request.json()))
      )
    );
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await act(() =>
      (result.current as any).updateLead('/checkout/installments', 3)
    );
    expect(mockLeadUpdateHandler).toHaveBeenCalledWith([
      { op: 'add', path: '/checkout/installments', value: 3 },
    ]);
    await waitFor(() => expect(couponHandler).toHaveBeenCalled());
  });

  test('should not remove voucher if installment is updated with 1 or 0', async () => {
    const couponHandler = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/leadId:removeVoucher`,
        async ({ request }) =>
          HttpResponse.json(couponHandler(await request.json()))
      )
    );
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).updateLead('/checkout/installments', 1);
    expect(mockLeadUpdateHandler).toHaveBeenCalledWith([
      { op: 'add', path: '/checkout/installments', value: 1 },
    ]);
    await waitFor(() => expect(couponHandler).not.toHaveBeenCalled());
  });

  test('should show error message if delete voucher fail', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/v1alpha1/leads/leadId:removeVoucher`,
        () => HttpResponse.json({ error: 'err' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).updateLead('/checkout/installments', 3);
    await waitFor(() =>
      expect(mockActionCreator).toHaveBeenCalledWith({
        isOpen: true,
        message: 'Error removing voucher',
        status: 'error',
      })
    );
  });

  test('should patch customer if lead is connected with customer', async () => {
    const mockCustomerHandler = jest
      .fn()
      .mockReturnValue({ message: 'success' });
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/customerId`,
        async ({ request }) =>
          HttpResponse.json(mockCustomerHandler(await request.json()))
      )
    );
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).updateLead('/customerFirstName', 'firstName');
    await waitFor(() =>
      expect(mockCustomerHandler).toHaveBeenCalledWith({
        firstName: 'firstName',
      })
    );
  });

  test('should call remove op and remove all fixedDriverModal data when fixedDriver is changed to 0', async () => {
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).updateLead('/numberOfFixedDriver', 0);
    expect(mockLeadUpdateHandler).toHaveBeenCalledWith(
      expect.arrayContaining([
        { op: 'add', path: '/numberOfFixedDriver', value: 0 },
        { op: 'remove', path: '/firstDriverDOB', value: null },
        { op: 'remove', path: '/firstDriverFirstName', value: null },
        { op: 'remove', path: '/firstDriverLastName', value: null },
        { op: 'remove', path: '/firstDriverLicense', value: null },
        { op: 'remove', path: '/firstDriverNationalId', value: null },
        { op: 'remove', path: '/secondDriverDOB', value: null },
        { op: 'remove', path: '/secondDriverFirstName', value: null },
        { op: 'remove', path: '/secondDriverLastName', value: null },
        { op: 'remove', path: '/secondDriverLicense', value: null },
        { op: 'remove', path: '/secondDriverPassport', value: null },
      ])
    );
  });

  test('should call remove op and remove all second driver related fixedDriverModal data when fixedDriver is changed to 1 from 2', async () => {
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).updateLead('/numberOfFixedDriver', 1);
    expect(mockLeadUpdateHandler).toHaveBeenCalledWith(
      expect.arrayContaining([
        { op: 'add', path: '/numberOfFixedDriver', value: 1 },
        { op: 'remove', path: '/secondDriverDOB', value: null },
        { op: 'remove', path: '/secondDriverFirstName', value: null },
        { op: 'remove', path: '/secondDriverLastName', value: null },
        { op: 'remove', path: '/secondDriverLicense', value: null },
        { op: 'remove', path: '/secondDriverPassport', value: null },
      ])
    );
  });

  test('should call remove op and remove firstDriverNationalId and secondDriverPassport when firstDriverPassport and secondDriverNationalId are added', async () => {
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).jsonUpdater([
      {
        path: '/firstDriverPassport',
        op: 'add',
        value: 'FakePassport',
      },
      {
        path: '/secondDriverNationalId',
        op: 'add',
        value: 'FakeNationalId',
      },
    ]);
    expect(mockLeadUpdateHandler).toHaveBeenCalledWith(
      expect.arrayContaining([
        { op: 'add', path: '/firstDriverPassport', value: 'FakePassport' },
        { op: 'add', path: '/secondDriverNationalId', value: 'FakeNationalId' },
        { op: 'remove', path: '/firstDriverNationalId', value: null },
        { op: 'remove', path: '/secondDriverPassport', value: null },
      ])
    );
  });

  test('should call remove op and remove firstDriverPassport and secondDriverNationalId when firstDriverNationalId and secondDriverPassport are added', async () => {
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState({
        firstDriverPassport: 'newFakePassport',
        secondDriverNationalId: 'newFakeNationalId',
      }),
    });

    await (result.current as any).jsonUpdater([
      {
        path: '/firstDriverNationalId',
        op: 'add',
        value: 'FakeNationalId',
      },
      {
        path: '/secondDriverPassport',
        op: 'add',
        value: 'FakePassport',
      },
    ]);

    expect(mockLeadUpdateHandler).toHaveBeenCalledWith(
      expect.arrayContaining([
        { op: 'add', path: '/firstDriverNationalId', value: 'FakeNationalId' },
        { op: 'add', path: '/secondDriverPassport', value: 'FakePassport' },
        { op: 'remove', path: '/firstDriverPassport', value: null },
        { op: 'remove', path: '/secondDriverNationalId', value: null },
      ])
    );
  });

  test('should reset checkout data', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        () => HttpResponse.json({}, { status: 500 })
      )
    );
    const { result } = renderHook(() => useLeadUpdater(), {
      initialState: initialState(),
    });
    await (result.current as any).resetCheckout([
      {
        path: '/checkout/package',
        op: 'remove',
        value: null,
      },
    ]);
    await waitFor(() =>
      expect(mockActionCreator).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.updateLeadFail',
        status: 'error',
      })
    );
  });
});
