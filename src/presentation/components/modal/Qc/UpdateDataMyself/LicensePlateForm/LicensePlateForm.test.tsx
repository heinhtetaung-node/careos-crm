import _setWith from 'lodash/setWith';
import React from 'react';

import {
  act,
  ComponentWithProvider,
  fireEvent,
  render,
  screen,
  waitFor,
} from '__tests__/rtl-test-utils';
import { OrderDetail } from 'mock-data/OrderDetail.mock';

import LicensePlateForm from './LicensePlateForm';
import userEvent from '@testing-library/user-event';

const mockUpdateLead = jest.fn();
const mockUpdateOrderByIdUnwrap = jest.fn();
const mockUpdateOrderById = jest.fn();
const mockFetchOrderUnwrap = jest.fn();
const mockFetchOrder = jest.fn();
const mockUseGetAddressDataQuery = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ orderId: 'order-123' }),
}));

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    ...jest.requireActual(
      'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater'
    ),
    useLeadUpdaterFromOrder: () => ({
      updateLead: mockUpdateLead,
    }),
  })
);

jest.mock('data/slices/orderSlice', () => ({
  ...jest.requireActual('data/slices/orderSlice'),
  useUpdateOrderByIdMutation: () => [mockUpdateOrderById],
  useLazyGetOrderItemsQuery: () => [mockFetchOrder],
}));

jest.mock('data/slices/addressSlice', () => ({
  ...jest.requireActual('data/slices/addressSlice'),
  useGetAddressDataQuery: () => mockUseGetAddressDataQuery(),
}));

const mockHandleModalToggle = jest.fn();
const mockHandleButtonDisable = jest.fn();

describe('Test <LicensePlateForm/>', () => {
  let licenseInput;
  beforeEach(() => {
    mockUseGetAddressDataQuery.mockReset();
    mockUseGetAddressDataQuery.mockReturnValue({
      data: [
        { nameEn: 'Bangkok', name: 'provinces/100000' },
        { nameEn: 'Chiang Mai', name: 'provinces/500000' },
      ],
    });
    mockUpdateLead.mockReset();
    mockUpdateLead.mockResolvedValue(undefined);
    mockUpdateOrderByIdUnwrap.mockReset();
    mockUpdateOrderByIdUnwrap.mockResolvedValue({});
    mockUpdateOrderById.mockReset();
    mockUpdateOrderById.mockReturnValue({ unwrap: mockUpdateOrderByIdUnwrap });
    mockFetchOrderUnwrap.mockReset();
    mockFetchOrderUnwrap.mockResolvedValue({});
    mockFetchOrder.mockReset();
    mockFetchOrder.mockReturnValue({ unwrap: mockFetchOrderUnwrap });
    mockHandleModalToggle.mockReset();
    mockHandleButtonDisable.mockReset();

    act(() => {
      render(
        <ComponentWithProvider>
          <LicensePlateForm
            orderData={OrderDetail as any}
            handleModalToggle={mockHandleModalToggle}
            handleButtonDisable={mockHandleButtonDisable}
          />
        </ComponentWithProvider>
      );
    });

    licenseInput = screen.getByTestId('license-plate');
  });

  it('Should component render successfully', async () => {
    expect(screen.getByTestId('license-plate')).toBeInTheDocument();
  });

  it('Should license plate input change', async () => {
    await userEvent.clear(licenseInput);
    await userEvent.type(licenseInput, '112233');
    expect(licenseInput).toHaveValue('11-2233');

    await userEvent.clear(licenseInput);
    await userEvent.type(licenseInput, '2nn9999');
    expect(licenseInput).toHaveValue('2nn-9999');
    expect(mockHandleButtonDisable).toHaveBeenCalled();
  });

  it('Should handle license plate format onPaste event', async () => {
    await waitFor(() => {
      fireEvent.paste(licenseInput, {
        clipboardData: { getData: () => '3nn12345' },
      });
    });
    expect(licenseInput).toHaveValue('3nn-12345');
    expect(mockHandleButtonDisable).toHaveBeenCalled();
  });

  it('Should redplate checkbox checked work', async () => {
    const redplateCheckbox = screen.getByTestId('is-redplate');
    await waitFor(() => {
      fireEvent.click(redplateCheckbox);
    });
    expect(licenseInput).toHaveValue('redplate');
    expect(licenseInput).toHaveAttribute('disabled');
    expect(mockHandleButtonDisable).toHaveBeenCalled();
  });

  it('Should redplate checkbox unchecked return original data for license input', async () => {
    const redplateCheckbox = screen.getByTestId('is-redplate');
    await waitFor(() => {
      fireEvent.click(redplateCheckbox);
    });
    await waitFor(() => {
      fireEvent.click(redplateCheckbox);
    });
    expect(licenseInput).toHaveValue('กพ-1234');
    expect(licenseInput).not.toHaveAttribute('disabled');
    expect(mockHandleButtonDisable).toHaveBeenCalled();
  });

  it('Should submit current plate and fallback registeredProvince to order data', async () => {
    fireEvent.submit(screen.getByTestId('update-data-myself-form'));

    await waitFor(() => {
      expect(mockUpdateLead).toHaveBeenNthCalledWith(
        1,
        '/registeredProvince',
        100000
      );
      expect(mockUpdateLead).toHaveBeenNthCalledWith(
        2,
        '/carLicensePlate',
        'กพ-1234 กท'
      );
      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: 'order-123',
        payload: {
          data: {
            ...OrderDetail.order.data,
            carLicensePlate: 'กพ-1234 กท',
            isRedPlate: false,
            registeredProvince: 100000,
          },
        },
      });
      expect(mockFetchOrder).toHaveBeenCalledWith({ orderId: 'order-123' });
      expect(mockHandleModalToggle).toHaveBeenCalled();
    });
  });

  it('Should submit redplate and changed registeredProvince', async () => {
    await userEvent.click(screen.getByTestId('is-redplate'));
    await userEvent.click(screen.getByTestId('province'));
    await userEvent.click(await screen.findByText('Chiang Mai'));

    fireEvent.submit(screen.getByTestId('update-data-myself-form'));

    await waitFor(() => {
      expect(mockUpdateLead).toHaveBeenNthCalledWith(
        1,
        '/registeredProvince',
        500000
      );
      expect(mockUpdateLead).toHaveBeenNthCalledWith(
        2,
        '/carLicensePlate',
        'redplate'
      );
      expect(mockUpdateOrderById).toHaveBeenCalledWith({
        orderId: 'order-123',
        payload: {
          data: {
            ...OrderDetail.order.data,
            carLicensePlate: 'redplate',
            isRedPlate: true,
            registeredProvince: 500000,
          },
        },
      });
      expect(mockFetchOrder).toHaveBeenCalledWith({ orderId: 'order-123' });
      expect(mockHandleModalToggle).toHaveBeenCalled();
    });
  });
});

test('Should find correct licence province code by customer registeredProvince', async () => {
  act(() => {
    const OrderWithRedplate = _setWith(OrderDetail, 'order.data', {
      ...OrderDetail.order.data,
      isRedPlate: true,
      carLicensePlate: 'redplate',
    });
    render(
      <ComponentWithProvider>
        <LicensePlateForm
          orderData={OrderWithRedplate as any}
          handleModalToggle={mockHandleModalToggle}
          handleButtonDisable={mockHandleButtonDisable}
        />
      </ComponentWithProvider>
    );
  });
  const redplateCheckbox = screen.getByTestId('is-redplate');
  await waitFor(() => {
    fireEvent.click(redplateCheckbox);
  });
  expect(screen.getByText('กท')).toBeInTheDocument();
});

test('Should handle undefined provinces data without crashing', async () => {
  mockUseGetAddressDataQuery.mockReset();
  mockUseGetAddressDataQuery.mockReturnValue({ data: undefined });

  render(
    <ComponentWithProvider>
      <LicensePlateForm
        orderData={OrderDetail as any}
        handleModalToggle={mockHandleModalToggle}
        handleButtonDisable={mockHandleButtonDisable}
      />
    </ComponentWithProvider>
  );

  expect(screen.getByTestId('license-plate')).toBeInTheDocument();
  expect(screen.queryByText('กท')).not.toBeInTheDocument();
});

test('Should keep province code empty when registeredProvince is null or empty', async () => {
  mockUseGetAddressDataQuery.mockReset();
  mockUseGetAddressDataQuery.mockReturnValue({
    data: [
      { nameEn: 'Empty', name: 'provinces/' },
      { nameEn: 'Unknown', name: 'provinces/999999' },
    ],
  });

  const orderWithoutProvince = _setWith(
    structuredClone(OrderDetail),
    'order.data',
    {
      ...OrderDetail.order.data,
      carLicensePlate: 'กพ-1234',
      registeredProvince: null,
    }
  );

  render(
    <ComponentWithProvider>
      <LicensePlateForm
        orderData={orderWithoutProvince as any}
        handleModalToggle={mockHandleModalToggle}
        handleButtonDisable={mockHandleButtonDisable}
      />
    </ComponentWithProvider>
  );

  expect(screen.queryByText('กท')).not.toBeInTheDocument();

  await userEvent.click(screen.getByTestId('province'));
  await userEvent.click(await screen.findByText('Unknown'));
  expect(screen.queryByText('กท')).not.toBeInTheDocument();

  await userEvent.click(screen.getByTestId('province'));
  await userEvent.click(await screen.findByText('Empty'));
  expect(screen.queryByText('กท')).not.toBeInTheDocument();
});

test('Should not call updateLead or updateOrderById when orderData is undefined', async () => {
  mockUseGetAddressDataQuery.mockReset();
  mockUseGetAddressDataQuery.mockReturnValue({
    data: [{ nameEn: 'Bangkok', name: 'provinces/100000' }],
  });
  mockUpdateLead.mockReset();
  mockUpdateOrderById.mockReset();
  mockFetchOrder.mockReset();

  render(
    <ComponentWithProvider>
      <LicensePlateForm
        orderData={undefined}
        handleModalToggle={mockHandleModalToggle}
        handleButtonDisable={mockHandleButtonDisable}
      />
    </ComponentWithProvider>
  );

  fireEvent.submit(screen.getByTestId('update-data-myself-form'));

  await waitFor(() => {
    expect(mockUpdateLead).not.toHaveBeenCalled();
    expect(mockUpdateOrderById).not.toHaveBeenCalled();
    expect(mockFetchOrder).not.toHaveBeenCalled();
  });
});
