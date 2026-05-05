import { getString } from 'presentation/theme/localization';

function getErrorMsg(err: string) {
  let errorMsg = '';
  if (err.includes('Policy documents not ready')) {
    errorMsg = getString('text.policyNotUploadedErrorMsg');
  } else if (err.includes('Order not fully paid')) {
    errorMsg = getString('text.orderNotFullyPaidErrorMsg');
  } else {
    errorMsg = err;
  }
  return errorMsg;
}

enum CourierProvider {
  COURIER_PROVIDER_KERRY = 'COURIER_PROVIDER_KERRY',
}

export { getErrorMsg, CourierProvider };
