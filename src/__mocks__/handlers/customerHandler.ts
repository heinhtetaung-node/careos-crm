import { HttpResponse, http } from 'msw';

const mockGetCustomerPhonesHanderResponse = {
  phones: [
    {
      name: 'customers/d8f8386b-5026-4e9f-89e2-fd5eb848b344/phones/5ea05a26-0ab4-45f8-a380-89f5679e5f9d',
      createTime: '2023-03-19T12:47:27.803273Z',
      updateTime: '2023-03-19T12:47:27.803273Z',
      deleteTime: null,
      phone: '+66799999999',
    },
  ],
  nextPageToken: '',
};

const mockUpdateCustomerPrimaryPhoneId = {
  primaryPhoneId: 'customerPhoneId',
};

export const getCustomerPhonesHandler = (
  mockResponse: any = mockGetCustomerPhonesHanderResponse,
  customerId = ':customerId'
) =>
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerId}/phones`,
    () => HttpResponse.json(mockResponse)
  );

export const updateCustomerPrimaryPhoneHandler = (
  mockResponse: any = mockUpdateCustomerPrimaryPhoneId
) =>
  http.patch(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/:customerId`,
    () => HttpResponse.json(mockResponse)
  );
