import React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, screen } from '@testing-library/react';

import { render, waitFor } from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';

import CommonForm from './CommonForm';
import FeatureFlags from 'config/flagsmithConfig';
import { mockUseFlags } from 'shared/helper/flagsmith';
import { OICCollection } from 'shared/constants/packageStaticData';

/** `var` so Jest-hoisted `jest.mock` can assign before TDZ (`let` → ReferenceError). */
// eslint-disable-next-line no-var
var mockUpdateOrder;

const mockUseGetAddressDataQuery = jest.fn();

mockUseFlags([
  FeatureFlags.BROK_122_UPDATE_CUSTOMER_ON_UPDATE_OF_QC_POLICY_20240808_TEMP,
]);

jest.mock('data/slices/addressSlice', () => ({
  ...jest.requireActual('data/slices/addressSlice'),
  useGetAddressDataQuery: () => mockUseGetAddressDataQuery(),
}));

jest.mock('data/slices/orderSlice', () => {
  mockUpdateOrder = jest.fn().mockImplementation(() => {
    const p = Promise.resolve({});
    return Object.assign(p, {
      unwrap: () => Promise.resolve({}),
    });
  });
  return {
    useUpdateOrderDataMutation: jest
      .fn()
      .mockImplementation(() => [
        mockUpdateOrder,
        { isSuccess: false, isLoading: false },
      ]),
  };
});

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/Hooks/useUpdate',
  () => ({
    ...jest.requireActual(
      'presentation/pages/car-insurance/LeadDetailsPage/Hooks/useUpdate'
    ),
    useUpdateCustomer: jest.fn(() => [
      jest.fn(),
      {
        isLoading: false,
        isSuccess: true,
      },
    ]),
  })
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ orderId: 'orders/123' }),
}));

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    useLeadUpdaterFromOrder: () => ({
      updateLead: jest.fn().mockResolvedValue(undefined),
    }),
  })
);

beforeEach(() => {
  mockUseGetAddressDataQuery.mockReset();
  mockUseGetAddressDataQuery.mockReturnValue({ data: undefined });
});

test('should <CommonForm/> correctly format and submit for dob picker', async () => {
  const handleModalToggle = jest.fn();
  render(
    <CommonForm
      data={OrderDetail as any}
      optionsMap={{}}
      fields={[
        {
          fieldType: 'dobPicker',
          title: 'qc.dobOfThePolicyHolder',
          name: 'policyHolderDOB',
          value: 'order.data.policyHolder.dateOfBirth',
          updatePath: 'data/policyHolder/dateOfBirth',
        },
      ]}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={handleModalToggle}
      handleLoading={jest.fn() as any}
    />
  );

  const el = document.getElementById('update-data-myself') as any;
  el?.submit();

  await waitFor(() => {
    expect(mockUpdateOrder).toHaveBeenCalledWith({
      orderId: 'orders/123',
      payload: [
        {
          op: 'add',
          path: 'data/policyHolder/dateOfBirth',
          value: '2000-01-21',
        },
      ],
    });
    expect(handleModalToggle).toHaveBeenCalled();
  });
});

test('initializes registeredProvince from order data when provinces API returns options', () => {
  mockUseGetAddressDataQuery.mockReturnValue({
    data: [
      { nameEn: 'Bangkok', name: 'provinces/100000' },
      { nameEn: 'Chiang Mai', name: 'provinces/500000' },
    ],
  });

  render(
    <CommonForm
      data={OrderDetail as any}
      optionsMap={{
        registeredProvince: [
          { title: 'Bangkok', value: '100000' },
          { title: 'Chiang Mai', value: '500000' },
        ],
      }}
      fields={[
        {
          fieldType: 'autocomplete',
          title: 'text.province',
          name: 'registeredProvince',
          value: 'order.data.registeredProvince',
          updatePath: 'data/registeredProvince',
        },
      ]}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={jest.fn() as any}
      handleLoading={jest.fn() as any}
    />
  );

  expect(screen.getByDisplayValue('Bangkok')).toBeInTheDocument();
});

test('should <CommonForm/> correctly submit OIC code and driving purpose', async () => {
  const orderWithOic = {
    ...OrderDetail,
    order: {
      ...OrderDetail.order,
      data: {
        ...OrderDetail.order.data,
        oicCode: 'TYPE_110',
      },
    },
  };
  const oicOptions = OICCollection(false);
  const handleModalToggle = jest.fn();

  render(
    <CommonForm
      data={orderWithOic as any}
      optionsMap={{
        oicCode: oicOptions,
        carUsageType: [
          { label: 'Personal', value: 'personal' },
          { label: 'Commercial', value: 'commercial' },
        ],
      }}
      fields={[
        {
          fieldType: 'select',
          title: 'qc.oicCode',
          name: 'oicCode',
          value: 'order.data.oicCode',
          updatePath: 'data/oicCode',
        },
        {
          fieldType: 'radio',
          title: 'leadDetailFields.drivingPurpose',
          name: 'carUsageType',
          value: 'order.data.carUsageType',
          updatePath: 'data/carUsageType',
        },
      ]}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={handleModalToggle}
      handleLoading={jest.fn() as any}
    />
  );

  const nativeInput = document.querySelector(
    '[data-testid="qc-oic-code-select"] input.MuiSelect-nativeInput'
  );
  expect(nativeInput).toBeTruthy();
  fireEvent.change(nativeInput!, { target: { value: '120' } });
  await userEvent.click(screen.getByLabelText('Commercial'));

  const el = document.getElementById('update-data-myself') as any;
  el?.submit();

  await waitFor(() => {
    expect(mockUpdateOrder).toHaveBeenCalledWith({
      orderId: 'orders/123',
      payload: [
        {
          op: 'add',
          path: 'data/oicCode',
          value: 'TYPE_120',
        },
        {
          op: 'add',
          path: 'data/carUsageType',
          value: 'commercial',
        },
      ],
    });
    expect(handleModalToggle).toHaveBeenCalled();
  });
});
