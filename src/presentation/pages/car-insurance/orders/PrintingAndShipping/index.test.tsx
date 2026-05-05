import MockShipments from '@alphafounders/mock-data/json/shipments.json';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { act, render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { MockInsurers } from 'mock-data/Insurers.mock';
import { MockUsersData } from 'mock-data/UserData.mock';
import { store } from 'presentation/redux/store';

import { formatShipmentMethods } from './PolicySearchSlice';

import PrintingAndShipping from '.';

var mockHandleReset: jest.Mock;
jest.mock('presentation/pages/car-insurance/orders/table.helper.ts', () => {
  mockHandleReset = jest.fn();
  return {
    __esModule: true,
    ...jest.requireActual(
      'presentation/pages/car-insurance/orders/table.helper.ts'
    ),
    handleReset: mockHandleReset,
  };
});

const storeRef = setupApiStore(apiSlice);

function ComponentWithProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

// TODO: Refactor bad test
describe.skip('Test <PrintingAndShipping/>', () => {
  beforeEach(() => {
    server.use(
      http.get(`${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users`, () =>
        HttpResponse.json(MockUsersData)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/orders`,
        () =>
          HttpResponse.json({
            orders: [
              {
                order: {
                  name: 'orders/87e9920e-11eb-48a8-b318-3184c0c1e3b5',
                  lead: 'leads/c1a6fe3c-1e4d-4164-b309-3eeac211a972',
                  createTime: '2022-09-06T03:14:30.469408Z',
                  updateTime: '2022-09-06T03:15:25.678490Z',
                  deleteTime: null,
                  convertBy: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
                  supervisor: 'users/5dfb2174-75ed-4180-a257-6b893a71b08f',
                  isCancelled: false,
                  product: 'products/car-insurance',
                  invoicePrice: '129042',
                  humanId: 'L9873392',
                  discounts: [],
                  payment: '',
                  customer: 'customers/7e37606b-cf13-4b4f-88e5-8b4bb109c035',
                  schema: 'orderSchemas/a85f07e5-071f-460d-842c-aa9e37edbed2',
                  data: {
                    carDashCam: true,
                    carLicensePlate: 'กฉ-2868',
                    carModified: false,
                    carSubModelYear: 46918,
                    carUsageType: 'personal',
                    chassisNumber: 'ABC1112000',
                    docsShipmentMethod: 'Email',
                    engineNumber: 'ENG0008888',
                    firstDriverDOB: '1991-01-11',
                    firstDriverName: 'Driver Test',
                    idNumber: '1222',
                    idType: 'Passport',
                    isRedPlate: false,
                    numberOfSeats: 4,
                    oicCode: '110',
                    policyHolder: {
                      communicationLanguage: 'th-en',
                      companyName: 'Rabbit',
                      companyTaxId: '123400',
                      dateOfBirth: '1994-01-21',
                      firstName: 'ธเนศ',
                      fullName: 'ธเนศ กองวัฒนศิลป์',
                      gender: 'f',
                      isCompany: true,
                      isCustomer: false,
                      lastName: 'กองวัฒนศิลป์',
                      nationalID: '1816524775000',
                      policyAddress: {
                        address: 'Pracharat Sai.2 Rd',
                        addressType: 'personal',
                        companyName: 'Company A',
                        district: 210100,
                        fullName: 'Pracharat Sai.2 Rd. Bangsue',
                        isBillingAddress: true,
                        isShippingAddress: true,
                        postCode: 21160,
                        province: 210000,
                        subDistrict: 210105,
                        taxId: '121212',
                      },
                      shippingAddress: {
                        address: 'ชั้น 29 1 S Sathon Rd',
                        addressType: 'personal',
                        district: 102800,
                        fullName:
                          'ชั้น 29 1 S Sathon Rd, Thung Maha Mek, Sathon, Bangkok',
                        postCode: 10120,
                        province: 100000,
                        subDistrict: 102802,
                      },
                      title: 'Mr.',
                    },
                    registeredProvince: 100000,
                    secondDriverDOB: '1990-02-15',
                    secondDriverName: 'Second Test',
                    vehicleColor: ['red', 'dark blue', 'yellow'],
                  },
                  documentBy: '',
                  documentStatus: 'DOCUMENT_STATUS_COMPLETE',
                  qcBy: '',
                  qcStatus: 'QC_STATUS_APPROVED',
                  submissionStatus: 'SUBMISSION_STATUS_PRESUBMITTED',
                  approvalStatus: 'APPROVAL_STATUS_UNSPECIFIED',
                },
                customer: {
                  name: 'customers/7e37606b-cf13-4b4f-88e5-8b4bb109c035',
                  createTime: '2022-09-06T03:14:30.101857344Z',
                  updateTime: '2022-09-06T03:14:30.101857344Z',
                  deleteTime: null,
                  createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
                  humanId: 'C1030428',
                  firstName: 'Michel',
                  lastName: 'Raggio',
                },
                items: [
                  {
                    name: 'orders/87e9920e-11eb-48a8-b318-3184c0c1e3b5/items/2fbfdbe7-399e-4bc4-a1b2-c0d0798d1e3b',
                    createTime: '2022-09-06T03:14:30.518934Z',
                    updateTime: '2022-09-06T03:15:25.665454Z',
                    deleteTime: null,
                    product: 'products/car-insurance',
                    package: 'packages/2',
                    price: '64521',
                    grossPremium: '64521',
                    netPremium: '60000',
                    vatPercent: 700,
                    vatAmount: '4221',
                    stampDutyPercentage: 40,
                    stampDuty: '300',
                    addons: [],
                    documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
                    qcStatus: 'ITEM_QC_STATUS_APPROVED',
                    submissionStatus: 'ITEM_SUBMISSION_STATUS_PRESUBMITTED',
                    approvalStatus: 'ITEM_APPROVAL_STATUS_POLICY_UPLOADED',
                    discounts: [],
                    motorItemType: 'MOTOR_TYPE_2_PLUS',
                    isCancelled: false,
                    submissionBy: '',
                    approvalBy: '',
                    submitDate: '0001-01-01T00:00:00Z',
                    insurer: 'insurers/42',
                    humanId: 'L9873392-2',
                    adjustedPremium: '50000',
                    sumInsured: '50000',
                    policyStartDate: '2022-09-06T10:00:00.553872Z',
                    printingAndShippingStatus:
                      'ITEM_PRINTING_AND_SHIPPING_STATUS_UNSPECIFIED',
                  },
                  {
                    name: 'orders/87e9920e-11eb-48a8-b318-3184c0c1e3b5/items/49be2256-4d91-4a72-8d8f-8b7826acfa6c',
                    createTime: '2022-09-06T03:14:30.491531Z',
                    updateTime: '2022-09-06T03:15:25.672161Z',
                    deleteTime: null,
                    product: 'products/car-insurance',
                    package: 'packages/1',
                    price: '64521',
                    grossPremium: '64521',
                    netPremium: '60000',
                    vatPercent: 700,
                    vatAmount: '4221',
                    stampDutyPercentage: 40,
                    stampDuty: '300',
                    addons: [],
                    documentStatus: 'ITEM_DOCUMENT_STATUS_COMPLETE',
                    qcStatus: 'ITEM_QC_STATUS_APPROVED',
                    submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
                    approvalStatus: 'ITEM_APPROVAL_STATUS_REJECTED',
                    discounts: [],
                    motorItemType: 'MOTOR_TYPE_COMPULSORY',
                    isCancelled: false,
                    submissionBy: '',
                    approvalBy: '',
                    submitDate: '0001-01-01T00:00:00Z',
                    insurer: 'insurers/1',
                    humanId: 'L9873392-1',
                    adjustedPremium: '70000',
                    sumInsured: '100000000',
                    policyStartDate: '2022-09-29T22:00:00Z',
                    printingAndShippingStatus:
                      'ITEM_PRINTING_AND_SHIPPING_STATUS_UNSPECIFIED',
                  },
                ],
                latestShipments: [
                  {
                    item: 'orders/87e9920e-11eb-48a8-b318-3184c0c1e3b5/items/2fbfdbe7-399e-4bc4-a1b2-c0d0798d1e3b',
                    shipment: {
                      shipmentMethod: 'SHIPMENT_METHOD_COURIER',
                      trackingNumber: 'RABL098916243',
                      shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
                      statusUpdateTime: '2022-12-03T09:02:32.145916982Z',
                    },
                  },
                ],
                documentAgent: null,
                qcAgent: null,
                attributes: {
                  earliestPolicyStartDate: '2022-09-06T10:00:00',
                  leadHumanId: 'L9873392',
                  source: 'sources/a1904979-06dc-4496-89eb-331e4a9ed5ff',
                  sourceDisplayName: 'Lead source',
                },
                documentTeam: null,
                qcTeam: null,
              },
            ],
            total: '60',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
        () => HttpResponse.json(MockInsurers)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/orders/:orderId/shipments:getLatest`,
        () => HttpResponse.json(MockShipments)
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/orders/:orderId/shipments`,
        (_) =>
          HttpResponse.json({
            items: [
              'orders/87e9920e-11eb-48a8-b318-3184c0c1e3b5/items/2fbfdbe7-399e-4bc4-a1b2-c0d0798d1e3b',
            ],
            shipmentMethod: 'SHIPMENT_METHOD_COURIER',
            shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
            statusUpdateTime: '2022-12-14T04:23:18.999423916Z',
          })
      )
    );
    render(
      <ComponentWithProvider>
        <PrintingAndShipping />
      </ComponentWithProvider>
    );
  });

  it('Test <PrintingAndShipping/> successfully show shipment when user click expand button', async () => {
    const expandIcon = await screen.findByTestId('L9873392-expand-row-button');
    act(async () => {
      await userEvent.click(expandIcon);
    });

    const policyId = await screen.findByText('L9873392-2');
    const policyStartDate = await screen.findAllByText('30/09/2022');
    const insurer = await screen.findByText('FPG Insurance');
    const insurancePackage = await screen.findByText('motoType.type2Plus');
    expect(policyId).toBeInTheDocument();
    expect(policyStartDate[0]).toBeInTheDocument();
    expect(insurer).toBeInTheDocument();
    expect(insurancePackage).toBeInTheDocument();
  });

  it('Test <PrintingAndShipping/> sorting and pagination work', async () => {
    await Promise.resolve(true);
    const sortableLabel = await screen.findAllByTestId('table-sort-label');
    // sort by order id
    await userEvent.click(sortableLabel[0]);
  });

  it('Test <PrintingAndShipping/> show policy table as default', async () => {
    await waitFor(() => {
      expect(screen.getByText('RABL098916243')).toBeInTheDocument();
      expect(screen.getAllByText('shipmentStatus.delivered')).toHaveLength(2);
      expect(screen.getByText(/03\/12\/2022/)).toBeInTheDocument();
      expect(screen.getByText(/09\/12\/2022/)).toBeInTheDocument();
    });
  });
});

describe('Test filter panel', () => {
  it('Shipment listing view reset button behaviour', async () => {
    render(
      <ComponentWithProvider>
        <PrintingAndShipping />
      </ComponentWithProvider>
    );

    const comboInput = screen.getAllByTestId('common-textfield')[1];
    await userEvent.click(comboInput);

    const presentations = screen.getAllByRole('presentation');
    const dropdown = presentations[presentations.length - 1];

    await userEvent.click(
      within(dropdown).getByText('order.shipping.policyDocsUploaded')
    );

    const reset = screen.getByRole('button', { name: 'text.reset' });
    await userEvent.click(reset);

    expect(mockHandleReset).toHaveBeenCalled();
  });

  it('Should cancelled orders checkbox clear on reset', async () => {
    render(<PrintingAndShipping />);
    const showCancelledCheckbox = screen.getByTestId('show-cancelled-orders');
    expect(showCancelledCheckbox).toBeInTheDocument();

    await userEvent.click(showCancelledCheckbox);
    expect(showCancelledCheckbox.className).toMatch(/Mui-checked/);

    const comboInput = screen.getAllByTestId('common-textfield')[1];
    await userEvent.click(comboInput);

    const presentations = screen.getAllByRole('presentation');
    const dropdown = presentations[presentations.length - 1];

    await userEvent.click(
      within(dropdown).getByText('order.shipping.policyDocsUploaded')
    );

    const reset = screen.getByRole('button', { name: 'text.reset' });
    await userEvent.click(reset);
    expect(mockHandleReset).toHaveBeenCalled();
    expect(showCancelledCheckbox.className).not.toMatch(/Mui-checked/);
  });
});

describe('Test formatShipmentMethods util', () => {
  test('formatShipmentMethods format correctly', () => {
    const mockShipments = [
      {
        shipmentMethod: 'SHIPMENT_METHOD_COURIER',
        shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
        statusUpdateTime: '2022-12-09T07:46:25.255058482Z',
        trackingNumber: '',
      },
      {
        shipmentMethod: 'SHIPMENT_METHOD_COURIER',
        shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
        statusUpdateTime: '2022-12-03T09:02:32.145916982Z',
        trackingNumber: 'RABL098916243',
      },
    ];

    const output = formatShipmentMethods(mockShipments as any);

    expect(output).toMatchObject({
      deliveredByCourier: {
        shipmentStatus: 'SHIPMENT_STATUS_DELIVERED',
        statusUpdateTime: '2022-12-03T09:02:32.145916982Z',
      },
    });
  });
});
