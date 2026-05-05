import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { CustomerPage } from '.';

const initialState = {
  authReducer: {
    data: {
      user: {
        name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
        role: 'roles/sales',
      },
    },
  },
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest
    .fn()
    .mockReturnValue({ id: 'a1469f6a-9a4f-4b24-b04d-b433b52c4239' }),
}));

jest.mock('data/slices/customerSlice', () => ({
  ...jest.requireActual('data/slices/customerSlice'),
  useGetCustomerPhoneNumberQuery: jest.fn().mockReturnValue({
    data: {
      phones: [
        {
          name: 'customers/a1469f6a-9a4f-4b24-b04d-b433b52c4239/phones/b1cf5483-1e84-4509-8622-50b5595aa1e2',
          createTime: '2023-03-14T00:55:59.902211Z',
          updateTime: '2023-03-14T00:55:59.902211Z',
          deleteTime: null,
          phone: '+66888888881',
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
  useGetCustomerLeadsQuery: jest.fn().mockReturnValue({
    data: {
      leads: [],
    },
    isLoading: false,
    isError: false,
  }),
  useGetCustomerQuery: jest.fn().mockReturnValue({
    data: {
      name: 'customers/a1469f6a-9a4f-4b24-b04d-b433b52c4239',
      createTime: null,
      updateTime: null,
      deleteTime: null,
      createBy: '',
      humanId: 'C524657',
      firstName: 'ພະຍັນຊະນະປະສົມ',
      lastName: 'ພະຍັນຊະນະປະສົມ',
      gender: 'M',
      dateOfBirth: '',
      companyNames: [],
    },
    isLoading: false,
    isError: false,
  }),
  useGetCustomerEmailQuery: jest.fn().mockReturnValue({
    data: {
      emails: [
        {
          name: 'customers/fa7a512e-6dbc-4a8f-99cd-6c23f089817f/emails/489311f6-0bc6-4777-b9ed-f1da01e727f5',
          createTime: '2023-09-29T03:05:23.529552Z',
          updateTime: '2023-09-29T03:05:23.529552Z',
          deleteTime: null,
          email: 'pactum@rabbit.co.th',
        },
      ],
      nextPageToken: '',
    },
    isLoading: false,
    isError: false,
  }),
  useGetCustomerOrdersQuery: jest.fn().mockReturnValue({
    data: [
      {
        carPlate: 'test',
        orderId: 'test',
        paymentStatus: 'Yes',
        totalInvoice: '12345',
      },
    ],
    isLoading: false,
    isError: false,
  }),
}));

describe('Testing of CustomerDetailsPage Component with flag on', () => {
  beforeEach(() => {
    render(<CustomerPage />, { initialState });
  });
  it('should render Customer Page', () => {
    expect(screen.getAllByTestId('customer-section-comp').length).toEqual(3);
  });
});
