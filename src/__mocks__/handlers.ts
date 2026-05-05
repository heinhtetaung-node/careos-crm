import { HttpResponse, http } from 'msw';

import contractHistoryHandler from './handlers/contractHistoryHandler';
import leadHandler from './handlers/leadHandler';
import orderHandler from './handlers/order';
import paymentHistoryHandler from './handlers/paymentHistoryHandler';
import printingHandler from './handlers/printingHandler';
import rejectionReasonsHandler from './handlers/rejectionReasonsHandler';

const flagsmithHandler = http.get(
  'https://edge.api.flagsmith.com/api/v1/flags/',
  async () => HttpResponse.json([])
);

export const getHandlerException = http.get(
  'https://edge.api.flagsmith.com/api/v1/flags/',
  async () => HttpResponse.json({ message: 'No feature' }, { status: 404 })
);

const handlers = [
  // Lead service
  ...leadHandler,
  // Printing and Shipping page
  ...printingHandler,
  ...paymentHistoryHandler,
  ...contractHistoryHandler,
  ...orderHandler,
  ...rejectionReasonsHandler,
  flagsmithHandler,
];

export default handlers;
