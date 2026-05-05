import { isEmpty } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';

import {
  useGetConnectedLeadsSelector,
  useUpdateCustomerMutation,
} from 'data/slices/customerSlice';
import { useDeleteCouponMutation } from 'data/slices/leadDetailSlices/couponSlice';
import { useUpdateLeadJsonMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { Lead } from 'shared/types/lead';

import {
  getCustomerIdFromMapResource,
  getLeadResourceIdFromOrderLead,
} from './helper';
import {
  healthPreUpdateRules,
  UpdateRules as postUpdateRules,
  HealthUpdateRules as healthPostUpdateRules,
  preUpdateRules,
} from './rules';
import {
  generatePayloadFromRules,
  getUpdateCustomerPayload,
  PatchParam,
  shouldDeleteCoupon,
} from './updateRules';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';
import { OrderDataResponse } from 'data/slices/orderSlice/interface';

function useLeadUpdater(leadIdFromParent: string = '') {
  const [_patchLead, _statusObj] = useUpdateLeadJsonMutation();
  const [deleteCoupon] = useDeleteCouponMutation();
  const [_updateCustomer, _customerStatusObj] = useUpdateCustomerMutation();

  const globalProduct = useAppSelector(
    (state) => state?.typeSelectorReducer?.globalProductSelectorReducer.data
  );

  const isHealthProduct = useMemo(
    () => globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE,
    [globalProduct]
  );

  const leadRef = useRef<Lead>();
  const connectedCustomerRef =
    useRef<ReturnType<typeof useGetConnectedLeadsSelector>>();

  leadRef.current = useGetLeadSelector();
  connectedCustomerRef.current = useGetConnectedLeadsSelector({
    leadId: leadRef.current.name,
    currentCustomer: leadRef.current,
  });

  const leadId = leadRef.current.name?.split('/')[1] ?? leadIdFromParent;

  const dispatch = useDispatch();

  const _rawJsonUpdater = (
    params: PatchParam[],
    applyUpdateRules = true,
    updateLeadId = ''
  ) => {
    const payload = [...params];
    if (applyUpdateRules) {
      payload.push(
        ...generatePayloadFromRules(
          payload,
          leadRef.current as Lead,
          isHealthProduct ? healthPostUpdateRules : postUpdateRules
        )
      );
      payload.unshift(
        ...generatePayloadFromRules(
          payload,
          leadRef.current as Lead,
          isHealthProduct ? healthPreUpdateRules : preUpdateRules
        )
      );
    }
    return _patchLead({
      leadId: leadId || updateLeadId,
      payload,
    });
  };

  const updateLead = async (
    path: string,
    value: any,
    op: 'add' | 'remove' | 'replace' = 'add'
  ) => {
    const snackbarConfig = {
      isOpen: true,
      message: getString('text.updateLeadSuccess'),
      status: CONSTANTS.snackBarConfig.type.success,
    };

    // non-json lead updates
    if (shouldDeleteCoupon(path, value, op, leadRef.current as Lead)) {
      const vResponse = await deleteCoupon(leadId);
      if ('error' in vResponse) {
        snackbarConfig.message = 'Error removing voucher';
        snackbarConfig.status = CONSTANTS.snackBarConfig.type.error;
      }
    }

    const customerUpdatePayload = getUpdateCustomerPayload(
      path,
      value,
      op,
      leadRef.current as Lead,
      connectedCustomerRef.current?.customer,
      isHealthProduct
    );

    if (!isEmpty(customerUpdatePayload)) {
      const cResponse = await _updateCustomer({
        customerId: getCustomerIdFromMapResource(
          connectedCustomerRef.current?.customer?.name ?? ''
        ),
        payload: customerUpdatePayload,
      });
      if ('error' in cResponse) {
        snackbarConfig.message = 'text.updateCustomerFail';
        snackbarConfig.status = CONSTANTS.snackBarConfig.type.error;
      }
    }

    const payload = [{ path, op, value }];
    const response = await _rawJsonUpdater(payload);

    if ('error' in response) {
      snackbarConfig.message = getString('text.updateLeadFail');
      snackbarConfig.status = CONSTANTS.snackBarConfig.type.error;
    }

    dispatch(showSnackBar(snackbarConfig));
  };

  const resetCheckout = async () => {
    const response = await _rawJsonUpdater([
      { path: '/checkout/package', op: 'remove', value: null },
    ]);
    if ('error' in response) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.updateLeadFail'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
  };

  useEffect(() => {
    if (leadId) {
      if (leadRef.current?.name == null) dispatch(getLead());
    }
  }, [dispatch, leadRef, leadId]);

  return {
    updateLead,
    resetCheckout,
    status: _statusObj,
    jsonUpdater: _rawJsonUpdater,
  };
}

/** Prefer lead id from `order.lead` when Redux lead is missing (e.g. QC order detail). */
export function useLeadUpdaterFromOrder(orderData?: OrderDataResponse | null) {
  const leadId = getLeadResourceIdFromOrderLead(orderData?.order?.lead);
  return useLeadUpdater(leadId);
}

export default useLeadUpdater;
