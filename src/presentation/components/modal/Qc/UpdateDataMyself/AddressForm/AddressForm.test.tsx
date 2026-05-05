import { fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  ComponentWithProvider,
  render,
  screen,
  within,
} from '__tests__/rtl-test-utils';
import { PRODUCTS } from 'config/TypeFilter';
import {
  questionFields,
  Questions,
} from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';

import AddressForm from './AddressForm';

const shippingFields =
  questionFields.find((q) => q.qId === Questions.SHIPPING_ADDRESS)?.fields ??
  [];

const mockUpdateOrder = jest.fn().mockResolvedValue({});

jest.mock('data/slices/orderSlice', () => {
  const actual = jest.requireActual('data/slices/orderSlice');
  return {
    ...actual,
    useUpdateOrderDataMutation: () => [
      mockUpdateOrder,
      {
        isSuccess: false,
        isLoading: false,
        isError: false,
        reset: jest.fn(),
      },
    ],
    useLazyGetOrderItemsQuery: () => [jest.fn()],
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ orderId: 'order-test-id' }),
}));

const baseShippingProps = {
  addressType: 'personal',
  addressLine: 'Line 1',
  province: 'Bangkok',
  provinceCode: 100000,
  district: 'Phra Nakhon',
  districtCode: 100100,
  subDistrict: 'Phra Borom Maha Ratchawang',
  subDistrictCode: 100101,
  postalCode: 10200,
  disabled: false,
  fields: shippingFields,
  question: Questions.SHIPPING_ADDRESS,
  fullName: 'Ship Full',
  firstName: 'Ship',
  lastName: 'User',
};

describe('Test <AddressForm/>', () => {
  it('Test <AddressForm/> correctly select district', async () => {
    render(
      <ComponentWithProvider>
        <AddressForm
          addressType="personal"
          addressLine="Test Address updated"
          province="Bangkok"
          provinceCode={100000}
          district="Phra Nakhon"
          districtCode={100100}
          subDistrict="Phra Borom Maha Ratchawang"
          subDistrictCode={100101}
          postalCode={10200}
          disabled={false}
        />
      </ComponentWithProvider>
    );
    await waitFor(async () => {
      expect(
        screen.getByTestId('subdistrict-autocomplete')
      ).toBeInTheDocument();
      const subdistrictAutoCompleteInput = screen.getByTestId(
        'subdistrict-autocomplete'
      );
      await userEvent.click(subdistrictAutoCompleteInput);
      const menu = screen.getByRole('presentation');
      expect(screen.getByText('Wat Ratchabophit')).toBeInTheDocument();
      const option = within(menu).getByText('Wat Ratchabophit');
      await userEvent.click(option);
      expect(screen.getByDisplayValue('Wat Ratchabophit')).toBeInTheDocument();
    });
  });

  it('Test <AddressForm/> correctly reset the rest fields when new province is selected', async () => {
    render(
      <ComponentWithProvider>
        <AddressForm
          addressLine="Test Address updated"
          province="Bangkok"
          provinceCode={100000}
          district="Phra Nakhon"
          districtCode={100100}
          subDistrict="Phra Borom Maha Ratchawang"
          addressType="personal"
          subDistrictCode={100101}
          postalCode={10200}
          disabled={false}
        />
      </ComponentWithProvider>
    );

    await waitFor(async () => {
      expect(screen.getByTestId('province-autocomplete')).toBeInTheDocument();
      const provinceAutocomplete = screen.getByTestId('province-autocomplete');
      await userEvent.click(provinceAutocomplete);
      const menu = screen.getByRole('presentation');
      const option = within(menu).getByText('Samut Prakan');
      await userEvent.click(option);
      const districtAutocomplete = screen.getByTestId('district-autocomplete');
      const subDistrictAutocomplete = screen.getByTestId(
        'subdistrict-autocomplete'
      );
      const postalCodeTextfield = screen.getByTestId('postal-code-textfield');

      expect(districtAutocomplete).toHaveDisplayValue('');
      expect(subDistrictAutocomplete).toHaveDisplayValue('');
      expect(postalCodeTextfield).toHaveDisplayValue('');
    });
  });
});

describe('AddressForm shipping fullName by product', () => {
  beforeEach(() => {
    mockUpdateOrder.mockClear();
  });

  it('includes shippingAddress/fullName patch for motor orders', async () => {
    render(
      <ComponentWithProvider>
        <AddressForm
          {...baseShippingProps}
          orderProduct={PRODUCTS.CAR_PRODUCT_INSURANCE}
        />
      </ComponentWithProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('update-data-myself-form')).toBeInTheDocument()
    );

    fireEvent.submit(screen.getByTestId('update-data-myself-form'));

    await waitFor(() => expect(mockUpdateOrder).toHaveBeenCalled());

    const { payload } = mockUpdateOrder.mock.calls[0][0];
    expect(
      payload.some(
        (p: { path: string }) =>
          p.path === 'data/policyHolder/shippingAddress/fullName'
      )
    ).toBe(true);
  });

  it('omits shippingAddress/fullName patch for non-motor orders', async () => {
    render(
      <ComponentWithProvider>
        <AddressForm
          {...baseShippingProps}
          orderProduct={PRODUCTS.HEALTH_PRODUCT_INSURANCE}
        />
      </ComponentWithProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('update-data-myself-form')).toBeInTheDocument()
    );

    fireEvent.submit(screen.getByTestId('update-data-myself-form'));

    await waitFor(() => expect(mockUpdateOrder).toHaveBeenCalled());

    const { payload } = mockUpdateOrder.mock.calls[0][0];
    expect(
      payload.some(
        (p: { path: string }) =>
          p.path === 'data/policyHolder/shippingAddress/fullName'
      )
    ).toBe(false);
  });
});
