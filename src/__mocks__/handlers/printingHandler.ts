import DistrictResponse from '@alphafounders/mock-data/json/districts.json';
import { HttpResponse, http } from 'msw';

import ProvinceResponse from 'mock-data/Provinces.mock';
import SubdistrictsResponse from 'mock-data/Subdistricts.mock';
import mockCarPackage from 'shared/helper/OrderCarPackageMock';
import { getMockOrder } from 'shared/helper/OrderMockData';
import OrderPolicy from 'shared/helper/OrderPolicyMockData';

const shippingHandler = [
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces`,
    () => HttpResponse.json(ProvinceResponse)
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces/:provinceId`,
    () => HttpResponse.json({ value: 'success' })
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces/:provinceId/districts`,
    () => HttpResponse.json(DistrictResponse)
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces/:provinceId/districts/:districtId`,
    () => HttpResponse.json({ value: 'success' })
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces/:provinceId/districts/:districtId/subdistricts`,
    () => HttpResponse.json(SubdistrictsResponse)
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/:orderId/documents`,
    () => HttpResponse.json({ value: 'success' })
  ),
  http.get(`${process.env.VITE_GATEWAY_ENDPOINT}/api/users/lookup`, () =>
    HttpResponse.json({ value: 'success' })
  ),
  http.get(
    `${process.env.VITE_GATEWAY_ENDPOINT}/api/orders/:orderId/comments`,
    () => HttpResponse.json({ value: 'success' })
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId`,
    () => {
      const order = getMockOrder();
      return HttpResponse.json(order);
    }
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/payment/:policyId`,
    () => HttpResponse.json('Rabbit care installment')
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/items`,
    () => HttpResponse.json(OrderPolicy.mockPolicyItems)
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/car-package/v1alpha1/packages/:packageId`,
    () => HttpResponse.json(mockCarPackage)
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/:userId`,
    () => HttpResponse.json({ success: true })
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/:customerId`,
    () => HttpResponse.json({ success: true })
  ),
  http.get('http://localhost:4432/api/bff/api/cars/years/:year', () =>
    HttpResponse.json({
      displayName: 'ABC',
      year: 2010,
    })
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers/:insurerId`,
    () =>
      HttpResponse.json({
        name: 'insurers/42',
        displayName: 'FPG Insurance',
        shortnameEn: '',
        shortnameTh: '',
        rating: 0,
        order: 0,
      })
  ),
  http.get('http://localhost:3100/api/cars/years/:carYear', () =>
    HttpResponse.json({
      displayName: 'ABC',
      year: 2010,
    })
  ),
];

export default shippingHandler;
