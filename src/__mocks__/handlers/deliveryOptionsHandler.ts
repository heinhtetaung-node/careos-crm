import { HttpResponse, http } from 'msw';

import { MockDeliveryOptions } from 'mock-data/DeliveryOptions.mock';
import getApiEndpoint from 'utils/endpointHelper';

export const getDeliveryOptionsHandler = (
  mockResponse: any = MockDeliveryOptions
) =>
  http.get(getApiEndpoint('/api/order-shipment/v1alpha1/deliveryOptions'), () =>
    HttpResponse.json(mockResponse)
  );

export default getDeliveryOptionsHandler;
