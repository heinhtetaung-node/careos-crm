import { Divider } from '@alphafounders/ui';
import _find from 'lodash/find';
import _get from 'lodash/get';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  useGetOrderItemsQuery,
  useUpdateOrderDataMutation,
} from 'data/slices/orderSlice';
import RadioGroup from 'presentation/components/common/RadioGroup/RadioGroup';
import { AddressType } from 'presentation/components/modal/LeadDetailsModal/AddressModal/helper';
import {
  policyholderOptions as options,
  ExtraTitle,
} from 'presentation/components/modal/Qc/UpdateDataMyself/helper';
import { PurchasingPurposes } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import { updateOrder } from 'presentation/redux/actions/order';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { format } from 'utils/datetime';
import useSnackbar from 'utils/snackbar';

import { patchOrderPayload } from './helper';

import RenderItem from '../InfoPanel/RenderItem';
import { IField } from '../InfoPanel/type';
import useLeadUpdater from '../../LeadDetailsPage/leadUpdater';

type CurrentPolicyHolder = (typeof options)[number];

type PolicyholderInfoProps = {
  readOnly?: boolean;
};

export function getFormattedOrder(
  order: any,
  newPolicyHolder: any,
  addressType: any
) {
  return {
    name: order.name,
    data: {
      ...order.data,
      policyHolder: {
        ...order.data.policyHolder,
        policyAddress: {
          ...order.data.policyHolder.policyAddress,
          ...(addressType === AddressType.COMPANY && {
            companyName: order.data.policyHolder?.companyName ?? '',
            taxId: order.data.policyHolder?.companyTaxId ?? '',
          }),
          addressType,
        },
        ...newPolicyHolder.payload,
        ...(newPolicyHolder.value === 'isPolicyholder' && {
          firstName: order?.customer?.firstName,
          lastName: order?.customer?.lastName,
          ...(order?.customer?.dateOfBirth && {
            dateOfBirth: order?.customer?.dateOfBirth
              ? format(new Date(order.customer.dateOfBirth), 'yyyy-MM-dd')
              : '',
          }),
        }),
        ...(newPolicyHolder.value === 'isNotPolicyholder' && {
          title: order.data.policyHolder?.title ?? ExtraTitle.KHUN,
          gender: order.data.policyHolder?.gender ?? 'm',
        }),
        ...(newPolicyHolder.value === 'isCompany' && {
          companyName: order.data.policyHolder?.companyName ?? '',
          companyTaxId: order.data.policyHolder?.companyTaxId ?? '',
        }),
      },
    },
  };
}

function PolicyholderInfo({ readOnly = false }: PolicyholderInfoProps) {
  const dispatch = useAppDispatch();
  const { updateLead, jsonUpdater } = useLeadUpdater();
  const { orderId } = useParams();
  const [
    updatePolicyHolder,
    { error: updatePolicyError, isSuccess: updatePolicySuccess },
  ] = useUpdateOrderDataMutation();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const order = useAppSelector((state) => state.order?.payload);
  const policyHolder = useAppSelector(
    (state) => state.order?.payload?.data?.policyHolder
  );
  const [currentPolicyHolder, setCurrentPolicyHolder] =
    useState<CurrentPolicyHolder | null>(null);

  const { data: orderData } = useGetOrderItemsQuery(
    {
      orderId: orderId!,
    },
    {
      skip: !orderId,
    }
  );

  const policyholderOptions = options.map((option) => ({
    ...option,
    disabled: readOnly,
  }));

  useEffect(() => {
    const isCustomer = _get(policyHolder, 'isCustomer');
    const isCompany = _get(policyHolder, 'isCompany');
    const current = _find(policyholderOptions, {
      payload: { isCustomer, isCompany },
    });
    if (current) {
      setCurrentPolicyHolder(current);
    } else {
      setCurrentPolicyHolder(policyholderOptions[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (updatePolicySuccess) {
      showSuccessSnackbar(getString('text.updateOrderSuccessfully'));
      return;
    }
    if (updatePolicyError) {
      showErrorSnackbar(
        getString('text.updateOrderFailed', {
          message:
            (updatePolicyError as Record<string, any>)?.data?.message ?? '',
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatePolicySuccess, updatePolicyError]);

  const titleOptions = undefined;

  const isPolicyholder: IField[] = [
    {
      title: 'Title',
      value: policyHolder?.title ?? ExtraTitle.KHUN,
      type: 'select',
      name: 'title',
      isEditable: !readOnly,
      testId: 'policyholder-title',
      options: titleOptions,
    },
    {
      title: 'firstName',
      value: policyHolder?.firstName || '',
      type: 'text',
      isEditable: false,
      testId: 'policyholder-first-name',
      name: 'firstName',
    },
    {
      title: 'lastName',
      value: policyHolder?.lastName || '',
      type: 'text',
      isEditable: false,
      testId: 'policyholder-last-name',
      name: 'lastName',
    },
    {
      title: 'DocumentType',
      type: 'select',
      value: order?.data?.idType || null,
      name: 'documentType',
      isEditable: !readOnly,
      disabled: readOnly,
      testId: 'policyholder-document-type',
    },
    {
      title: 'DocumentId',
      value: order?.data?.idNumber ?? '',
      type: 'text',
      isEditable: !readOnly,
      testId: 'policyholder-document-id',
      name: 'documentId',
    },
    {
      titleString: getString('text.dateOfBirth'),
      type: 'date',
      value: orderData?.customer?.customer?.dateOfBirth || null,
      name: 'dateOfBirth',
      isEditable: false,
      disabled: true,
      testId: 'policyholder-date-of-birth',
    },
  ];

  const isCompany: IField[] = [
    {
      title: 'taxId',
      value: policyHolder?.companyTaxId || '',
      type: 'text',
      name: 'companyTaxId',
      isEditable: !readOnly,
      disabled: readOnly,
      testId: 'policyholder-taxid',
    },
    {
      title: 'companyName',
      value: policyHolder?.companyName || '',
      type: 'text',
      name: 'companyName',
      isEditable: !readOnly,
      disabled: readOnly,
      testId: 'policyholder-company-name',
    },
  ];

  const isNotPolicyholder: IField[] = [
    {
      title: 'Title',
      value: policyHolder?.title ?? ExtraTitle.KHUN,
      type: 'select',
      name: 'title',
      isEditable: !readOnly,
      options: titleOptions,
      testId: 'policyholder-title',
    },
    {
      title: 'firstName',
      value: policyHolder?.firstName || '',
      type: 'text',
      isEditable: !readOnly,
      testId: 'policyholder-first-name',
      name: 'firstName',
    },
    {
      title: 'lastName',
      value: policyHolder?.lastName || '',
      type: 'text',
      isEditable: !readOnly,
      testId: 'policyholder-last-name',
      name: 'lastName',
    },
    {
      titleString: getString('text.dateOfBirth'),
      type: 'date',
      value: policyHolder?.dateOfBirth || null,
      name: 'dateOfBirth',
      isEditable: true,
      disabled: readOnly,
      testId: 'policyholder-date-of-birth',
    },
    {
      title: 'DocumentId',
      value: order?.data?.idNumber ?? '',
      type: 'text',
      isEditable: !readOnly,
      testId: 'policyholder-id-number',
      name: 'documentId',
    },
    {
      title: 'DocumentType',
      type: 'select',
      value: order?.data?.idType || null,
      name: 'documentType',
      isEditable: !readOnly,
      testId: 'policyholder-document-type',
    },
  ];

  const leadFieldMap: Record<string, string> = {
    firstName: 'policyHolderFirstName',
    lastName: 'policyHolderLastName',
    dateOfBirth: 'policyHolderDOB',
    title: 'policyTitle',
    companyName: 'customerPolicyAddress/0/companyName',
    companyTaxId: 'customerPolicyAddress/0/taxId',
    documentId: 'policyHolderNationalId',
  };

  const formatValue = (name: string, value: any) =>
    name === 'dateOfBirth' ? format(value, 'yyyy-MM-dd') : value;

  const resolveOrderTarget = (name: string) => {
    if (name === 'documentType') return { key: 'idType', nested: false };
    if (name === 'documentId') return { key: 'idNumber', nested: false };

    return { key: name, nested: true };
  };

  const onUpdateOrder = (payload: any) => {
    if (order?.name) {
      let formatedOrder = {};
      if (payload.name === 'documentType' || payload.name === 'documentId') {
        formatedOrder = {
          name: order.name,
          data: {
            ...order.data,
            [payload.name === 'documentType' ? 'idType' : 'idNumber']:
              payload.value,
          },
        };
      } else {
        formatedOrder = {
          name: order.name,
          data: {
            ...order.data,
            policyHolder: {
              ...order.data.policyHolder,
              [payload.name]:
                payload.name === 'dateOfBirth'
                  ? format(payload.value, 'yyyy-MM-dd')
                  : payload.value,
            },
          },
        };
      }
      // ✅ Sync lead (if mapped)
      const leadPath = leadFieldMap[payload.name];
      if (leadPath) {
        try {
          updateLead(`/${leadPath}`, formatValue(payload.name, payload.value));
        } catch (error) {
          console.error('Failed to update lead:', error);
        }
      }

      dispatch(updateOrder(formatedOrder));
    }
  };

  const policyHolderTypeMap: Record<string, PurchasingPurposes> = {
    isPolicyholder: PurchasingPurposes.customerIsPolicyHolder,
    isNotPolicyholder: PurchasingPurposes.customerIsNotPolicyHolder,
    isCompany: PurchasingPurposes.companyIsPolicyHolder,
  };

  const handlePolicyHolderChange = async (value: any) => {
    const newPolicyHolder = policyholderOptions.find(
      (item) => item.value === value
    );
    if (!newPolicyHolder || !order.name) return;
    setCurrentPolicyHolder(newPolicyHolder);

    const updateResponse = await updatePolicyHolder({
      orderId: orderId!,
      payload: patchOrderPayload(order, newPolicyHolder),
    });

    // update lead
    if (!('error' in updateResponse)) {
      const policyHolderType = policyHolderTypeMap[newPolicyHolder.value];
      if (policyHolderType) {
        try {
          const policyHolderUpdates: Array<{
            path: string;
            value: any;
            op: 'add';
          }> = [
            {
              path: '/policyHolderType',
              value: policyHolderType,
              op: 'add',
            },
          ];
          if (policyHolderType === 'customer') {
            if (order.data?.idNumber != null) {
              policyHolderUpdates.push({
                path: '/policyHolderNationalId',
                value: order.data.idNumber,
                op: 'add',
              });
            }
            if (order.data?.policyHolder?.title != null) {
              policyHolderUpdates.push({
                path: '/policyTitle',
                value: order.data.policyHolder.title,
                op: 'add',
              });
            }

            if (order.data?.policyHolder?.firstName != null) {
              policyHolderUpdates.push({
                path: '/policyHolderFirstName',
                value: order.data.policyHolder.firstName,
                op: 'add',
              });
            }
            if (order.data?.policyHolder?.lastName != null) {
              policyHolderUpdates.push({
                path: '/policyHolderLastName',
                value: order.data.policyHolder.lastName,
                op: 'add',
              });
            }
            if (order.data?.policyHolder?.dateOfBirth != null) {
              policyHolderUpdates.push({
                path: '/policyHolderDOB',
                value: order.data.policyHolder.dateOfBirth,
                op: 'add',
              });
            }
          }
          await jsonUpdater(policyHolderUpdates, false);
        } catch (error) {
          console.error('Failed to update policy holder type:', error);
        }
      }
    }

    const addressType =
      newPolicyHolder.value === 'isCompany'
        ? AddressType.COMPANY
        : AddressType.PERSONAL;

    const formattedOrder = getFormattedOrder(
      order,
      newPolicyHolder,
      addressType
    );

    dispatch(updateOrder(formattedOrder));
  };

  const getFieldsForPolicyHolderInformation = () => {
    switch (currentPolicyHolder?.value) {
      case 'isPolicyholder':
        return isPolicyholder;
      case 'isCompany':
        return isCompany;
      default:
        return isNotPolicyholder;
    }
  };

  return (
    <div className="mb-[11px] rounded-[10px] border border-solid border-[#e9edf5]">
      <h3 className="m-0 py-[10px] px-[15px] text-primary bg-muted-light rounded-t-[10px]">
        {getString('text.policyHolderInformation')}
      </h3>
      {currentPolicyHolder && (
        <>
          <div className="px-3 py-2">
            <RadioGroup
              options={policyholderOptions}
              value={currentPolicyHolder?.value}
              onChange={(_e: any, value: any) =>
                handlePolicyHolderChange(value)
              }
            />
          </div>
          <Divider variant="secondary" />
          <RenderItem
            props={getFieldsForPolicyHolderInformation()}
            handleUpdateOrder={onUpdateOrder}
          />
        </>
      )}
    </div>
  );
}

export default PolicyholderInfo;
