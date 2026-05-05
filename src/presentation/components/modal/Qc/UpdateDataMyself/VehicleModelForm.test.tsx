// @ts-nocheck — useUpdateCarData mock uses untyped props so eslint-plugin-jest’s Babel parse stays valid
import React from 'react';
import { fireEvent, render, screen, waitFor } from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import { CAR_ROWS } from 'presentation/components/CarInfoSection/EditableCarSection/interface';

import VehicleModelForm, { toNumberOrNull } from './VehicleModelForm';

const mockUpdateLead = jest.fn();
const mockUpdateOrder = jest.fn();
const mockGetCarData = jest.fn();
const mockHandleAutocompleteChange = jest.fn();

jest.mock('data/slices/carSlice', () => ({
  useLazyGetCarDataQuery: () => [mockGetCarData, { isLoading: false }],
}));

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    useLeadUpdaterFromOrder: () => ({ updateLead: mockUpdateLead }),
  })
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
  }),
}));

jest.mock('data/slices/orderSlice', () => {
  const actual = jest.requireActual('data/slices/orderSlice');
  return {
    ...actual,
    useUpdateOrderDataMutation: jest
      .fn()
      .mockImplementation(() => [mockUpdateOrder, { isLoading: false }]),
  };
});

const mockUseUpdateCarData = jest.fn((initialCarInfo) => ({
  isLoading: false,
  carState: initialCarInfo,
  dataSchema: {
    [CAR_ROWS.CAR_YEAR]: {
      InputComponent: (props) => (
        <div>
          <div>{props.title}</div>
          <button
            type="button"
            data-testid="vehicle-model-year-change"
            onClick={() => props.handleUpdate({})}
          >
            change-year
          </button>
        </div>
      ),
      inputProps: { name: 'year', title: 'leadDetailFields.year' },
    },
    [CAR_ROWS.CAR_BRAND]: {
      InputComponent: ({ title }) => <div>{title}</div>,
      inputProps: { name: 'brand', title: 'leadDetailFields.brand' },
    },
    [CAR_ROWS.CAR_MODEL]: {
      InputComponent: ({ title }) => <div>{title}</div>,
      inputProps: { name: 'model', title: 'leadDetailFields.model' },
    },
    [CAR_ROWS.SUB_MODEL]: {
      InputComponent: (props) => (
        <div>
          <div>{props.title}</div>
          <button
            type="button"
            data-testid="vehicle-model-submodel-change"
            onClick={() =>
              props.handleUpdate({ selections: { value: 77 } })
            }
          >
            change-submodel
          </button>
        </div>
      ),
      inputProps: {
        name: 'carSubModelYear',
        title: 'leadDetailFields.submodel',
      },
    },
  },
  handleAutocompleteChange: mockHandleAutocompleteChange,
}));

jest.mock(
  'presentation/components/CarInfoSection/EditableCarSection/useUpdateCarData',
  () => ({
    __esModule: true,
    default: (initialCarInfo) => mockUseUpdateCarData(initialCarInfo),
  })
);

beforeEach(() => {
  mockGetCarData.mockReset();
  mockHandleAutocompleteChange.mockClear();
});

describe('toNumberOrNull', () => {
  test('returns null for null and undefined', () => {
    expect(toNumberOrNull(null)).toBeNull();
    expect(toNumberOrNull(undefined)).toBeNull();
  });

  test('returns finite numbers and null for NaN', () => {
    expect(toNumberOrNull(2020)).toBe(2020);
    expect(toNumberOrNull(0)).toBe(0);
    expect(toNumberOrNull(NaN)).toBeNull();
  });

  test('parses trimmed strings and returns null for blank strings', () => {
    expect(toNumberOrNull('  2019  ')).toBe(2019);
    expect(toNumberOrNull('')).toBeNull();
    expect(toNumberOrNull('   ')).toBeNull();
  });
});

test('hydrates car info from getCarData when order has carSubModelYear but no lead car', async () => {
  mockGetCarData.mockResolvedValue({
    isError: false,
    data: [
      {
        manufacturedYears: [2019],
        uniqueBrands: [{ id: 101 }],
        uniqueModels: [{ id: 202 }],
        car: [
          {
            name: 'cars/brands/101/models/202/submodels/303',
            engineSize: '2000',
            transmissionType: 'AT',
            doors: 4,
            cabType: 'double',
            fuelType: 'Gasoline',
            isVan: false,
          },
        ],
      },
    ],
  });

  const orderDetail = {
    ...OrderDetail,
    car: undefined,
    order: {
      ...OrderDetail.order,
      data: {
        ...OrderDetail.order.data,
        carSubModelYear: 4,
      },
    },
  };

  render(
    <VehicleModelForm
      data={orderDetail as any}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={jest.fn()}
      handleLoading={jest.fn()}
    />
  );

  await waitFor(() => {
    expect(mockGetCarData).toHaveBeenCalledWith({
      pathParam: 'brands/-/models/-/submodels/-/years/4:getUniqueCars',
      queryParam: {},
      field: '',
    });
  });

  await waitFor(() => {
    const lastCall = mockUseUpdateCarData.mock.calls.at(-1)?.[0] as any;
    expect(lastCall?.brand).toBe(101);
    expect(lastCall?.model).toBe(202);
    expect(lastCall?.year).toBe(2019);
    expect(lastCall?.subModel).toBe(303);
    expect(lastCall?.carSubModelYear).toBe(4);
    expect(lastCall?.transmission).toBe('AT');
    expect(lastCall?.engineSize).toBe('2000');
    expect(lastCall?.noOfDoors).toBe(4);
    expect(lastCall?.cabType).toBe('double');
    expect(lastCall?.fuelType).toBe('Gasoline');
    expect(lastCall?.isVan).toBe(false);
  });
});

test('hydrate merge uses null year when API returns multiple manufactured years', async () => {
  mockGetCarData.mockResolvedValue({
    isError: false,
    data: [
      {
        manufacturedYears: [2018, 2019],
        uniqueBrands: [{ id: 101 }],
        uniqueModels: [{ id: 202 }],
        car: [
          {
            name: 'cars/brands/101/models/202/submodels/303',
            engineSize: '2000',
            transmissionType: 'AT',
            doors: 4,
            cabType: 'double',
            fuelType: 'Gasoline',
            isVan: false,
          },
        ],
      },
    ],
  });

  const orderDetail = {
    ...OrderDetail,
    car: undefined,
    order: {
      ...OrderDetail.order,
      data: {
        ...OrderDetail.order.data,
        carSubModelYear: 4,
      },
    },
  };

  render(
    <VehicleModelForm
      data={orderDetail as any}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={jest.fn()}
      handleLoading={jest.fn()}
    />
  );

  await waitFor(() => {
    const lastCall = mockUseUpdateCarData.mock.calls.at(-1)?.[0] as any;
    expect(lastCall?.year).toBeNull();
    expect(lastCall?.brand).toBe(101);
    expect(lastCall?.model).toBe(202);
    expect(lastCall?.subModel).toBe(303);
    expect(lastCall?.noOfDoors).toBe(4);
    expect(lastCall?.cabType).toBe('double');
    expect(lastCall?.isVan).toBe(false);
  });
});

test('sets selected submodel year from SUB_MODEL handleUpdate and submits that value', async () => {
  mockUpdateLead.mockClear();
  mockUpdateOrder.mockClear();

  const orderDetail = {
    ...OrderDetail,
    order: {
      ...OrderDetail.order,
      data: {
        ...OrderDetail.order.data,
        carSubModelYear: 99,
      },
    },
  };

  render(
    <VehicleModelForm
      data={orderDetail as any}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={jest.fn()}
      handleLoading={jest.fn()}
    />
  );

  fireEvent.click(screen.getByTestId('vehicle-model-submodel-change'));

  const form = screen.getByTestId('update-vehicle-model-form');
  fireEvent.submit(form);

  await waitFor(() => {
    expect(mockUpdateLead).toHaveBeenCalledWith('/carSubModelYear', 77);
    expect(mockUpdateOrder).toHaveBeenCalledWith({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
      payload: [
        {
          op: 'add',
          path: 'data/carSubModelYear',
          value: 77,
        },
      ],
    });
  });
});

test('clears selected submodel year on non-SUB_MODEL change and forwards to handleAutocompleteChange', async () => {
  mockUpdateLead.mockClear();

  const orderDetail = {
    ...OrderDetail,
    order: {
      ...OrderDetail.order,
      data: {
        ...OrderDetail.order.data,
        carSubModelYear: 99,
      },
    },
  };

  render(
    <VehicleModelForm
      data={orderDetail as any}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={jest.fn()}
      handleLoading={jest.fn()}
    />
  );

  fireEvent.click(screen.getByTestId('vehicle-model-year-change'));

  expect(mockHandleAutocompleteChange).toHaveBeenCalledWith({}, 'year');

  fireEvent.submit(screen.getByTestId('update-vehicle-model-form'));

  await waitFor(() => {
    expect(mockUpdateLead).not.toHaveBeenCalled();
  });
});

test('submits selected submodel year when vehicle model form is updated', async () => {
  mockUpdateLead.mockClear();

  const orderDetail = {
    ...OrderDetail,
    order: {
      ...OrderDetail.order,
      data: {
        ...OrderDetail.order.data,
        carSubModelYear: 99,
      },
    },
  };

  render(
    <VehicleModelForm
      data={orderDetail as any}
      setSubmitButtonToggle={jest.fn() as any}
      handleModalToggle={jest.fn()}
      handleLoading={jest.fn()}
    />
  );

  const form = screen.getByTestId('update-vehicle-model-form');
  expect(form).toBeInTheDocument();
  fireEvent.submit(form);

  await waitFor(() => {
    expect(mockUpdateLead).toHaveBeenCalledWith('/carSubModelYear', 99);
    expect(mockUpdateOrder).toHaveBeenCalledWith({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
      payload: [
        {
          op: 'add',
          path: 'data/carSubModelYear',
          value: 99,
        },
      ],
    });
  });
});
