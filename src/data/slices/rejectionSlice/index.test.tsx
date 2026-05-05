import { renderHook, act } from '@testing-library/react';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';

import { apiSlice } from '../apiSlice';

import { useLazyGetRejectionReasonsQuery } from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

describe('useLazyGetRejectionReasonsQuery', () => {
  it('calls rejection reasons endpoint correctly and transforms the response', async () => {
    const { result } = renderHook(() => useLazyGetRejectionReasonsQuery(), {
      wrapper,
    });
    const [getRejectionReasons] = result.current;

    await act(async () => {
      await getRejectionReasons();
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => {
      expect(isLoading).toBeFalsy();
      expect(data).toEqual([
        {
          id: 0,
          title: 'rejectReason.wrongNumber',
          value: 'wrong_number',
        },
        {
          id: 1,
          title: 'rejectReason.cantContact',
          value: 'cant_contact',
        },
        {
          id: 2,
          title: 'rejectReason.noCar',
          value: 'no_car',
        },
        {
          id: 3,
          title: 'rejectReason.dontCall',
          value: 'dont_call',
        },
        {
          id: 4,
          title: 'rejectReason.notExpiring',
          value: 'not_expiring',
        },
        {
          id: 5,
          title: 'rejectReason.alreadyPurchased',
          value: 'already_purchased',
        },
        {
          id: 6,
          title: 'rejectReason.alreadyPurchasedRabbit',
          value: 'already_purchased_rabbit',
        },
        {
          id: 7,
          title: 'rejectReason.purchasedFromOthersDuringSalesProcess',
          value: 'purchased_from_others_during_sales_process',
        },
        {
          id: 8,
          title: 'rejectReason.renewalCustomer',
          value: 'renewal_customer',
        },
        {
          id: 9,
          title: 'rejectReason.failedUwUnableToInsure',
          value: 'failed_uw_unable_to_insure',
        },
        {
          id: 10,
          title: 'rejectReason.soldCar',
          value: 'sold_car',
        },
        {
          id: 11,
          title: 'rejectReason.cancelledBeforeRenewal',
          value: 'cancelled_before_renewal',
        },
        {
          id: 12,
          title: 'rejectReason.needMoreInstallmentOptions',
          value: 'need_more_installment_options',
        },
        {
          id: 13,
          title: 'rejectReason.dissatisfiedWithService',
          value: 'dissatisfied_with_service',
        },
        {
          id: 14,
          title: 'rejectReason.expensive',
          value: 'expensive',
        },
        {
          id: 15,
          title: 'rejectReason.carNotInUse',
          value: 'car_not_in_use',
        },
        {
          id: 16,
          title: 'rejectReason.customerComparingInsurancePrice',
          value: 'customer_comparing_insurance_price',
        },
        {
          id: 17,
          title: 'rejectReason.customerDidnotGetSameInstallmentAsLastYear',
          value: 'customer_didnot_get_same_installment_as_last_year',
        },
        {
          id: 18,
          title:
            'rejectReason.getOfferFromOtherCompanyWithInstallmentAndDiscount',
          value: 'get_offer_from_other_company_with_installment_and_discount',
        },
        {
          id: 19,
          title: 'rejectReason.doNotWantInstallmentFee',
          value: 'do_not_want_installment_fee',
        },
        {
          id: 20,
          title: 'rejectReason.purchasedDirectlyFromInsurer',
          value: 'purchased_directly_from_insurer',
        },
        {
          id: 21,
          title: 'rejectReason.duplicateWithFreshLead',
          value: 'duplicate_with_fresh_lead',
        },
        {
          id: 22,
          title: 'rejectReason.duplicateWithDatabaseLead',
          value: 'duplicate_with_database_lead',
        },
        {
          id: 23,
          title: 'rejectReason.duplicateWithRenewLead',
          value: 'duplicate_with_renew_lead',
        },
        {
          id: 24,
          title: 'rejectReason.duplicateWithAdbRenewLead',
          value: 'duplicate_with_adb_renew_lead',
        },
        {
          id: 25,
          title: 'rejectReason.testLead',
          value: 'test_lead',
        },
        {
          id: 26,
          title: 'rejectReason.customerDidnotPickup',
          value: 'customer_didnot_pickup',
        },
      ]);
    });
  });
});
