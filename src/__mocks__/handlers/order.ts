import { HttpResponse, http } from 'msw';

import { basePaths } from 'data/slices/apiSlice';
import { OrderDetail } from 'mock-data/OrderDetail.mock';
import getApiEndpoint from 'utils/endpointHelper';

const mockAddons = [
  {
    price: '70000',
    addonType: 'ROADSIDE_ASSISTANCE',
    qcStatus: 'ITEM_QC_STATUS_APPROVED',
  },
  {
    price: '70000',
    addonType: 'ASSET',
    submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
    qcStatus: 'ITEM_QC_STATUS_APPROVED',
  },
  {
    price: '70000',
    addonType: 'CAR_REPLACEMENT',
    qcStatus: 'ITEM_QC_STATUS_APPROVED',
  },
];

const orderHandler = [
  http.get(
    `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/:orderId`,
    () => HttpResponse.json(OrderDetail)
  ),
  http.get(
    `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId//documents`,
    () => HttpResponse.json({ data: [] })
  ),
  http.get(
    getApiEndpoint(`${basePaths.order}/orders/:orderId/items/:policyId/addons`),
    () =>
      HttpResponse.json({
        addons: mockAddons,
      })
  ),
  http.patch(
    getApiEndpoint(
      `${basePaths.order}/orders/:orderId/items/:policyId\\:updateSubmissionStatus`
    ),
    () => HttpResponse.json(null, { status: 200 })
  ),
];

export default orderHandler;
