/* eslint-disable @typescript-eslint/no-non-null-assertion */
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import {
  getNewShippingMethodsOptions,
  getShippingOption,
} from 'shared/constants/deliveryOptions';
import { ShipmentProviders, ShippingMethods } from 'shared/constants/orderType';

import {
  getFilterFormInitialValues,
  getShippingFilter,
  omitUninterestedFilterValues,
} from './helper';
import ShippingFilterPanel from './ShippingFilterActionPanel';

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

describe('Test <ShippingFilterActionPanel/>', () => {
  it('Test <ShippingFilterActionPanel/> render successfully', () => {
    render(<ShippingFilterPanel />);
    expect(
      screen.getByTestId('shipping-action-filter-panel')
    ).toBeInTheDocument();
  });

  it('Test <ShippingFilterActionPanel/> can select one of preferred delivery options', async () => {
    render(<ShippingFilterPanel />);

    const preferredDeliveryOptions = screen.getAllByRole('combobox')[2];
    await userEvent.click(preferredDeliveryOptions.querySelector('input')!);
    const menu = screen.getByRole('presentation');

    const option = within(menu).getByText('qc.digitalDelivery');
    await userEvent.click(option);

    await waitFor(
      () => {
        expect(
          screen.getByDisplayValue('qc.digitalDelivery')
        ).toBeInTheDocument();
      },
      { timeout: 30000 }
    );
  });

  it('Test <ShippingFilterActionPanel/> show collapse button with correct icon', async () => {
    render(<ShippingFilterPanel />);
    const collapseButton = screen.getByTestId('collapse-button');
    expect(screen.getByTestId('down-icon')).toBeInTheDocument();
    await userEvent.click(collapseButton);
    expect(screen.getByTestId('up-icon')).toBeInTheDocument();
  });

  it('Test <ShippingFilterActionPanel/> render search text in search btn', () => {
    render(<ShippingFilterPanel />);
    const shipmentSearchBtn = screen.getByTestId('shipment-search-btn');
    expect(shipmentSearchBtn).toBeInTheDocument();
    expect(screen.getByText('text.search')).toBeInTheDocument();
  });

  it('Test <ShippingFilterActionPanel/> submit/reset action', async () => {
    const mockHandleSortAndSearch = jest.fn();
    render(
      <ShippingFilterPanel handleSortAndSearch={mockHandleSortAndSearch} />
    );

    const collapseButton = screen.getByTestId('collapse-button');
    const search = screen.getByRole('button', { name: 'text.search' });
    const reset = screen.getByRole('button', { name: 'text.reset' });

    await userEvent.click(collapseButton);
    const comboInput = screen.getByDisplayValue(
      'searchFieldPrintingAndShippingOption.orderId'
    );

    await userEvent.click(comboInput);

    const searchByDropdown = screen.getByRole('presentation');
    await userEvent.click(
      within(searchByDropdown).getByText(
        'searchFieldPrintingAndShippingOption.orderId'
      )
    );

    await userEvent.type(screen.getByPlaceholderText('text.search...'), '1234');
    await userEvent.tab();

    await userEvent.click(search);

    await waitFor(
      () => {
        expect(mockHandleSortAndSearch).toHaveBeenCalledWith(
          {
            searchBy: {
              searchBy: 'order.humanId',
              searchTerm: '1234',
            },
          },
          { currentPage: 1 }
        );
      },
      { timeout: 3000 }
    );

    await userEvent.click(reset);

    await waitFor(
      () => {
        expect(mockHandleSortAndSearch.mock.calls[1]).toEqual([{}]);
      },
      { timeout: 3000 }
    );
  });

  it('Test getShippingFilter utility', () => {
    [
      {
        searchBy: 'order.orderId',
        searchTerm: '1234',
        expectation: 'order.orderId="1234"',
      },
      {
        searchBy: 'order.data.carLicensePlate.text',
        searchTerm: '33ย-3234 กท',
        expectation: 'order.data.carLicensePlate.text:"33ย-3234 กท"',
      },
      {
        searchBy: 'order.data.policyHolder.fullName',
        searchTerm: 'Name',
        expectation: 'order.data.policyHolder.fullName:"Name"',
      },
    ].forEach(({ searchBy, searchTerm, expectation }) => {
      const filterPayload = getShippingFilter({
        searchBy: { searchBy, searchTerm },
      });

      expect(filterPayload).toEqual(expectation);
    });
  });
});

describe('Test utils', () => {
  it('Test getShippingFilter util', () => {
    let initialValue: any = getFilterFormInitialValues();
    let filterValue = omitUninterestedFilterValues(initialValue);
    expect(getShippingFilter(filterValue)).toEqual('');

    [
      {
        input: { insuranceCompany: { value: 'insurers/27' } },
        expectation: 'items[].insurer="insurers/27"',
      },
      {
        input: {
          preferredDeliveryOption: { value: 'deliveryOptions/kerry-standard' },
        },
        expectation:
          'items[].insurer="insurers/27" order.data.deliveryOption="deliveryOptions/kerry-standard"',
      },
      {
        input: { insuranceType: { value: 'MOTOR_TYPE_1' } },
        expectation:
          'items[].insurer="insurers/27" order.data.deliveryOption="deliveryOptions/kerry-standard" items[].motorItemType="MOTOR_TYPE_1"',
      },
      {
        input: {
          insuranceApprovedOn: {
            endDate: 'Fri Nov 11 2022 23:59:59 GMT+0700',
            startDate: 'Tue Nov 08 2022 00:00:00 GMT+0700',
          },
        },
        expectation:
          'items[].insurer="insurers/27" order.data.deliveryOption="deliveryOptions/kerry-standard" items[].motorItemType="MOTOR_TYPE_1" items[].approvalTime>="2022-11-07T17:00:00.000Z" items[].approvalTime<="2022-11-11T16:59:59.000Z"',
      },
      {
        input: {
          policyDocument: {
            value:
              'items[].approvalStatus="ITEM_APPROVAL_STATUS_POLICY_UPLOADED"',
          },
        },
        expectation:
          'items[].insurer="insurers/27" items[].approvalStatus="ITEM_APPROVAL_STATUS_POLICY_UPLOADED" order.data.deliveryOption="deliveryOptions/kerry-standard" items[].motorItemType="MOTOR_TYPE_1" items[].approvalTime>="2022-11-07T17:00:00.000Z" items[].approvalTime<="2022-11-11T16:59:59.000Z"',
      },
      {
        input: {
          paymentStatus: {
            value: true,
          },
        },
        expectation:
          'items[].insurer="insurers/27" items[].approvalStatus="ITEM_APPROVAL_STATUS_POLICY_UPLOADED" order.data.deliveryOption="deliveryOptions/kerry-standard" items[].motorItemType="MOTOR_TYPE_1" items[].approvalTime>="2022-11-07T17:00:00.000Z" items[].approvalTime<="2022-11-11T16:59:59.000Z" order.isFullyPaid="true"',
      },
    ].forEach(({ input, expectation }) => {
      initialValue = {
        ...initialValue,
        ...input,
      };
      filterValue = omitUninterestedFilterValues(initialValue);
      expect(getShippingFilter(filterValue)).toContain(expectation);
    });
  });
});

describe('Test helpers', () => {
  test('Test getNewShippingMethodsOptions', () => {
    expect(getNewShippingMethodsOptions()).toEqual([
      { title: 'qc.digitalDelivery', value: ShipmentProviders.EMAIL },
      {
        title: 'qc.standardDelivery',
        value: ShipmentProviders.COURIER_PROVIDER_KERRY,
      },
      {
        title: 'qc.expressDelivery',
        value: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS,
      },
      {
        title: 'qc.expressDeliveryDashcam',
        value: ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS_DASHCAM,
      },
    ]);
  });
  test('Test getShippingOption', () => {
    expect(getShippingOption(ShippingMethods.EMAIL)).toEqual(
      'qc.deliverByEmail'
    );
    expect(getShippingOption(ShippingMethods.COURIER)).toEqual('qc.kerry');
  });
});
