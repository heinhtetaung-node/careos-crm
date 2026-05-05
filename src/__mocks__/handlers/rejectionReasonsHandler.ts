import { HttpResponse, http } from 'msw';

import getApiEndpoint from 'utils/endpointHelper';

const rejectionReasonsHandler = [
  http.get(getApiEndpoint('/api/reject/v1alpha1/rejections\\:reasons'), () =>
    HttpResponse.json({
      rejectReasons: [
        'wrong_number',
        'cant_contact',
        'no_car',
        'dont_call',
        'not_expiring',
        'already_purchased',
        'already_purchased_rabbit',
        'purchased_from_others_during_sales_process',
        'renewal_customer',
        'failed_uw_unable_to_insure',
        'sold_car',
        'cancelled_before_renewal',
        'need_more_installment_options',
        'dissatisfied_with_service',
        'expensive',
        'car_not_in_use',
        'customer_comparing_insurance_price',
        'customer_didnot_get_same_installment_as_last_year',
        'get_offer_from_other_company_with_installment_and_discount',
        'do_not_want_installment_fee',
        'purchased_directly_from_insurer',
        'duplicate_with_fresh_lead',
        'duplicate_with_database_lead',
        'duplicate_with_renew_lead',
        'duplicate_with_adb_renew_lead',
        'test_lead',
        'customer_didnot_pickup',
      ],
    })
  ),
];

export default rejectionReasonsHandler;
