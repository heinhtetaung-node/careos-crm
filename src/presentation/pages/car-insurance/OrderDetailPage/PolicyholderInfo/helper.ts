import format from 'date-fns/format';
import _get from 'lodash/get';

import { OrderDetailState } from 'data/slices/orderSlice/interface';
import { AddressType } from 'presentation/components/modal/LeadDetailsModal/AddressModal/helper';
import { ExtraTitle } from 'presentation/components/modal/Qc/UpdateDataMyself/helper';

interface NewPolicyHolder {
  disabled: boolean;
  title: string;
  label: string;
  value: string;
  payload: {
    isCustomer: boolean;
    isCompany: boolean;
  };
}

export const patchOrderPayload = (
  order: OrderDetailState,
  newPolicyHolder: NewPolicyHolder
) => {
  const { firstName = '', lastName = '' } = _get(order, 'customer');
  const {
    companyName = '',
    companyTaxId = '',
    title = ExtraTitle.KHUN,
    gender = 'm',
  } = _get(order, 'data.policyHolder');

  const addressType =
    newPolicyHolder.value === 'isCompany'
      ? AddressType.COMPANY
      : AddressType.PERSONAL;

  const updateDataValue: Record<string, any>[] = [];
  const payloadPrepare = (paths: Record<string, any>) => {
    paths.forEach((pathItem: Record<string, any>) => {
      const { path: payloadPath = '', value: payloadValue = '' } = pathItem;
      updateDataValue.push({
        op: 'add',
        path: `data/policyHolder/${payloadPath}`,
        value: payloadValue,
      });
    });
  };

  if (addressType === AddressType.COMPANY) {
    payloadPrepare([
      {
        path: 'isCompany',
        value: true,
      },
      {
        path: 'policyAddress/companyName',
        value: companyName,
      },
      {
        path: 'policyAddress/taxId',
        value: companyTaxId,
      },
      {
        path: 'companyName',
        value: companyName,
      },
      {
        path: 'companyTaxId',
        value: companyTaxId,
      },
    ]);
  } else {
    payloadPrepare([
      {
        path: 'isCompany',
        value: false,
      },
    ]);
  }

  if (newPolicyHolder.value === 'isNotPolicyholder') {
    payloadPrepare([
      {
        path: 'firstName',
        value: firstName,
      },
      {
        path: 'lastName',
        value: lastName,
      },
      {
        path: 'title',
        value: title,
      },
      {
        path: 'gender',
        value: gender,
      },
    ]);
  }

  if (newPolicyHolder.value === 'isPolicyholder') {
    payloadPrepare([
      {
        path: 'policyAddress/fullName',
        value: `${firstName} ${lastName}`,
      },
      {
        path: 'isCustomer',
        value: true,
      },
    ]);
  } else {
    payloadPrepare([
      {
        path: 'isCustomer',
        value: false,
      },
    ]);
  }

  if (order?.customer?.dateOfBirth) {
    payloadPrepare([
      {
        path: 'dateOfBirth',
        value: format(new Date(order?.customer?.dateOfBirth), 'yyyy-MM-dd'),
      },
    ]);
  }

  return updateDataValue;
};

export default patchOrderPayload;
