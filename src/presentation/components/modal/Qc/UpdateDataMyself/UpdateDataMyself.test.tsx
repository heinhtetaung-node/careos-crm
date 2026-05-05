/* eslint-disable @typescript-eslint/no-non-null-assertion */
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, within, act, waitFor } from '__tests__/rtl-test-utils';
import { MockDeliveryOptions } from 'mock-data/DeliveryOptions.mock';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import UploadedDocumentsMock from 'mock-data/UploadedDocuments.mock';
import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import { Questions } from 'presentation/pages/car-insurance/OrderDetailPage/QcDetailPage/config';

import UpdateDataMyself from './UpdateDataMyself';

var mockedUseParams: jest.Mock;
const handleModalToggle = jest.fn();
const handleOptionSwitch = jest.fn();

jest.mock('react-router-dom', () => {
  mockedUseParams = jest.fn();
  return {
    ...(jest.requireActual('react-router-dom') as any),
    useParams: mockedUseParams.mockReturnValue({
      orderId: 'b5843e5c-8196-4d39-97c5-0700adc8a3f3',
    }),
  };
});

jest.mock('data/slices/deliveryOptionSlice', () => ({
  useGetDeliveryOptionsQuery: jest.fn().mockReturnValue({
    data: MockDeliveryOptions,
    isLoading: false,
    isSuccess: true,
  }),
}));

describe.skip('Test <UpdateDataMyself/>', () => {
  beforeEach(() => {
    handleModalToggle.mockClear();
    handleOptionSwitch.mockClear();
  });

  it('Test <QcInfoPanel/> display dialog and fill form for name of the policy holder', async () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.POLICYHOLDER_NAME_TITLE }}
        selectedDocument={UploadedDocumentsMock.documents.find(
          (doc) => doc?.type === DocumentType.DOCUMENT_TYPE_ID_CARD
        )}
      />
    );

    const updateForm = screen.getByTestId('update-data-myself-form');
    expect(updateForm).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox');
    await userEvent.click(inputs[0]);

    const presentations = await screen.findAllByRole('presentation');
    const menu = presentations[1];
    const option = within(menu).getByText('text.mr');

    await waitFor(async () => {
      await userEvent.click(option);
      expect(menu).not.toBeInTheDocument();
    });

    const titleInput = screen.getByDisplayValue('text.mr');
    expect(titleInput).toBeInTheDocument();

    const firstNameInput = screen.getByDisplayValue('firstName updated');
    expect(firstNameInput).toBeInTheDocument();

    const secondNameInput = screen.getByDisplayValue('lastName updated');
    expect(secondNameInput).toBeInTheDocument();
    expect(screen.getByTestId('image-preview')).toBeInTheDocument();
  });

  it('Test <QcInfoPanel/> display dialog and fill form for the delivery option', async () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.PREFERRED_DELIVERY }}
      />
    );

    const shipmentType = screen.getByDisplayValue('qc.kerry');
    expect(shipmentType).toBeInTheDocument();

    const deliveryOptionsField = screen.getByRole('textbox', {
      name: /qc\.deliveryoptions/i,
    });
    await userEvent.click(deliveryOptionsField);

    const deliveryOptions = screen.getAllByRole('option');
    await userEvent.click(deliveryOptions[0]);

    expect(
      await screen.findAllByDisplayValue('qc.digitalDelivery')
    ).not.toBeNull();
  });

  it('Test <QcInfoPanel/> display dialog and fill form for the policy start date', () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.POLICYSTARTDATE }}
      />
    );
    const policyStartDate = screen.getByDisplayValue('14/01/2030');
    expect(policyStartDate).toBeInTheDocument();
  });

  it('Test <UpdateDataMyself/> show drivers one correctly', () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.DRIVER_ONE_NAME_AGE }}
      />
    );

    expect(screen.getByText('qc.firstDriver')).toBeInTheDocument();
    expect(screen.getByText('11/03/1995')).toBeInTheDocument();
  });

  it('Test <UpdateDataMyself/> show drivers two correctly', () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.DRIVER_TWO_NAME_AGE }}
      />
    );

    expect(screen.getByText('qc.secondDriver')).toBeInTheDocument();
    expect(screen.getByText('15/05/1994')).toBeInTheDocument();
  });

  it('Test <UpdateDataMyself/> show fill autocomplete value correctly', async () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.VEHICLE_COLOR }}
        selectedDocument={UploadedDocumentsMock.documents.find(
          (doc) => doc?.type === DocumentType.DOCUMENT_TYPE_VEHICLE_REGISTRATION
        )}
      />
    );

    let chips = screen.getAllByTestId('custom-chip');

    expect(chips[0]).toHaveTextContent('order.vehicleColor.red');
    expect(chips[1]).toHaveTextContent('order.vehicleColor.darkBlue');
    expect(chips[2]).toHaveTextContent('order.vehicleColor.yellow');
    expect(screen.getByTestId('pdf-preview')).toBeInTheDocument();

    const combobox = screen.getByRole('combobox');
    const selectField = combobox.querySelector('input')!;
    // // click select field to show the dropdown
    await userEvent.click(selectField);

    // // dialog itself is presentation too. so we need to select secondo one.
    const presentations = await screen.findAllByRole('presentation');
    const menu = presentations[1];

    // // choose black option
    const option = within(menu).getByText('order.vehicleColor.black');

    await waitFor(async () => {
      await userEvent.click(option);
      // dropdown should be closed
      expect(menu).not.toBeInTheDocument();
      chips = screen.getAllByTestId('custom-chip');
      expect(chips[3]).toHaveTextContent('order.vehicleColor.black');
      await userEvent.tab();
      await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
    });
  });

  it('Test <UpdateDataMyself/> correctly switch between dialog', async () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.VEHICLE_COLOR, isEditable: true }}
      />
    );

    const radios = screen.getAllByRole('radio');

    await userEvent.click(radios[1]);
    expect(handleModalToggle).toHaveBeenCalled();
    expect(handleOptionSwitch).toHaveBeenCalledWith('salesFix');
  });

  it('Test <UpdateDataMyself/> correctly update textfield', async () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.ENGINE_NUM }}
      />
    );

    const input = screen.getByTestId('common-textfield');
    await waitFor(async () => {
      await userEvent.clear(input);
      expect(input).toHaveValue('');
      await userEvent.type(input, 'ENG123456');
      expect(input).toHaveValue('ENG123456');
    });
  });

  it('Test <UpdateDataMyself/> License pate update form', async () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.VEHICLE_LICENSE }}
        selectedDocument={UploadedDocumentsMock.documents.find(
          (doc) => doc?.type === DocumentType.DOCUMENT_TYPE_VEHICLE_REGISTRATION
        )}
      />
    );

    expect(screen.getByTestId('license-plate')).toBeInTheDocument();
    expect(screen.getByTestId('pdf-preview')).toBeInTheDocument();
  });

  it("Test <UpdateDataMyself/> doesn't show checkbox for policy address", () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.POLICYHOLDER_ADDRESS }}
      />
    );

    const checkbox = screen.queryByRole('checkbox', {
      name: 'qc.usePolicyAddress',
    });

    expect(checkbox).not.toBeInTheDocument();
  });

  it('Test <UpdateDataMyself/> policy address for shipping address if they are same', () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.SHIPPING_ADDRESS }}
      />
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'qc.usePolicyAddress',
    });

    expect(checkbox).toBeChecked();
  });

  it('Test <UpdateDataMyself/> policyholder differentiation', async () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.POLICYHOLDER_DIFFERENTIATION }}
      />
    );
    const insured = screen.getByRole('textbox');
    expect(insured).toHaveValue('qc.customerIsInsuredPerson');
  });

  it("Test <UpdateDataMyself/> show 'Update data' in dialog title for driver", () => {
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.DRIVER_ONE_NAME_AGE, groupId: 'driver' }}
      />
    );

    expect(screen.getByText('qc.updateData')).toBeInTheDocument();
  });
});

describe('Test <UpdateDataMyself/> update api', () => {
  beforeEach(() => {
    handleModalToggle.mockClear();
    handleOptionSwitch.mockClear();
  });

  it('Test policyholder differentiation update value', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3:patchData`,
        () =>
          HttpResponse.json({
            value: 'success',
          })
      )
    );
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.POLICYHOLDER_DIFFERENTIATION }}
      />
    );
    const combobox = screen.getByRole('combobox');
    const selectField = combobox.querySelector('input')!;
    await userEvent.click(selectField);

    const presentations = await screen.findAllByRole('presentation');
    const menu = presentations[1];

    const option = within(menu).getByText('qc.policyHolderIsCompany');

    await userEvent.click(option);
    await waitFor(async () => {
      expect(menu).not.toBeInTheDocument();
      const insuredNew = screen.getByRole('textbox');
      expect(insuredNew).toHaveValue('qc.policyHolderIsCompany');
    });
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
  });

  it('Test order patch data fails', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3:patchData`,
        () => HttpResponse.json({ message: 'error message' }, { status: 500 })
      )
    );

    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.ENGINE_NUM }}
      />
    );
    const input = screen.getByTestId('common-textfield');
    await userEvent.clear(input);

    await userEvent.type(input, 'ENG123456');
    await userEvent.tab();
    const updateBtn = screen.getByRole('button', { name: 'qc.update' });
    expect(updateBtn).toBeInTheDocument();
    await userEvent.click(updateBtn);

    await waitFor(() => {
      expect(handleModalToggle.mock.calls.length).toBe(0);
    });
  });

  it('Test order patch data', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3:patchData`,
        () =>
          HttpResponse.json({
            value: 'success',
          })
      )
    );
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.ENGINE_NUM }}
      />
    );
    const input = screen.getByTestId('common-textfield');

    await waitFor(async () => {
      await userEvent.clear(input);
      expect(input).toHaveValue('');
      await userEvent.type(input, 'ENG123456');
      expect(input).toHaveValue('ENG123456');
      await userEvent.tab();
      await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
    });
  });

  it('Test customer patch data', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/64d0c224-49dc-47bf-a3e2-6677f92d3c06`,
        () =>
          HttpResponse.json({
            value: 'success',
          })
      )
    );
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.HAS_CUSTOMER_EMAIL }}
      />
    );
    const input = screen.getByTestId('common-textfield');
    await waitFor(async () => {
      await userEvent.clear(input);
      expect(input).toHaveValue('');
      await userEvent.type(input, 'test@test.com');
      await userEvent.tab();
      await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
      expect(input).toHaveValue('test@test.com');
    });
  });

  it('Test address patch data with address form - billing address', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3:patchData`,
        () =>
          HttpResponse.json({
            value: 'success',
          })
      )
    );
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.BILLING_ADDRESS }}
      />
    );
    const addressLine = screen.getByTestId('address-line-textfield');
    await act(async () => {
      await userEvent.clear(addressLine);
    });
    await act(async () => {
      await userEvent.type(addressLine, 'Test 123');
    });
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
    await waitFor(() => {
      expect(handleModalToggle).toHaveBeenCalled();
    });
  });

  it('Test address patch data with address form - shipping address', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3:patchData`,
        () =>
          HttpResponse.json({
            value: 'success',
          })
      )
    );
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.SHIPPING_ADDRESS }}
      />
    );
    const addressLine = screen.getByTestId('address-line-textfield');
    await act(async () => {
      await userEvent.type(addressLine, 'Test 123');
    });
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
    await waitFor(() => {
      expect(handleModalToggle).toHaveBeenCalled();
    });
  });

  it('Test address patch data using same as policy address', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/b5843e5c-8196-4d39-97c5-0700adc8a3f3:patchData`,
        () =>
          HttpResponse.json({
            value: 'success',
          })
      )
    );
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.BILLING_ADDRESS }}
      />
    );
    const checkbox = screen.getByRole('checkbox', {
      name: 'qc.usePolicyAddress',
    });
    await userEvent.click(checkbox);
    await userEvent.tab();
    await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
    await waitFor(() => {
      expect(handleModalToggle).toHaveBeenCalled();
    });
  });

  it.skip('Test policy patch data to update policy start date', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/items/:policyId`,
        () =>
          HttpResponse.json({
            value: 'success',
          })
      )
    );
    render(
      <UpdateDataMyself
        modalToggle
        handleOptionSwitch={handleOptionSwitch}
        handleModalToggle={handleModalToggle}
        order={OrderDetail as any}
        question={{ qId: Questions.POLICYSTARTDATE }}
      />
    );
    const input = screen.getByRole('textbox');

    await waitFor(async () => {
      await userEvent.clear(input);
      expect(input).toHaveValue('');
      await userEvent.type(input, '20/10/2033');
      await userEvent.tab();
      await userEvent.click(screen.getByRole('button', { name: 'qc.update' }));
      expect(input).toHaveValue('20/10/2033');
    });
  });
});
