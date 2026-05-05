import { format } from 'date-fns';
import _isEmpty from 'lodash/isEmpty';
import { useCallback, useEffect, useState } from 'react';

import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import {
  useLazyGetOrderByLeadIdQuery,
  useUpdateOrderByIdMutation,
} from 'data/slices/orderSlice';
import { setValuesToDataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/helper';
import { DataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

import { PRODUCTS } from 'config/TypeFilter';
import {
  getPurchasingPurposeOptions,
  PurchasingPurposes,
} from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import { getAgeByDOB } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

import { POLICYHOLDER_ROWS } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/config';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { HealthLead } from 'shared/types/lead';
import {
  getPolicyHolderSectionConfig,
  HEALTH_POLICYHOLDER_ROWS,
} from '../../config';

interface Args {
  isDisabled: boolean;
  isPartiallyDisabled: boolean;
  isHealthOrder?: boolean;
  customerIsPolicyHolder?: boolean;
  setPolicyHolderTypeUpdated?: (value: string) => void;
}

function usePolicyHolderInformation({
  isDisabled,
  isPartiallyDisabled,
  isHealthOrder,
  customerIsPolicyHolder,
  setPolicyHolderTypeUpdated,
}: Args) {
  const [dataSchema, setDataSchema] = useState<DataSchema>(
    getPolicyHolderSectionConfig()
  );

  const { updateLead } = useLeadUpdater();
  const lead = useGetLeadSelector() as any as HealthLead;
  const orderDetail = useAppSelector(
    (currentState) => currentState.order?.payload
  );
  const [updateOrderById] = useUpdateOrderByIdMutation();
  const [getOrderByOrderId] = useLazyGetOrderByLeadIdQuery();

  const { errors, setFieldTouch } = useLeadDetailError();
  type SetFieldTouchArg = Parameters<typeof setFieldTouch>[0];

  const nameDisabled =
    (isDisabled && !isPartiallyDisabled) ||
    (isHealthOrder && customerIsPolicyHolder);

  const orderId = orderDetail?.name?.split?.('/')?.[1];

  const handleUpdateOrder = useCallback(
    async (orderFieldName: string, value: any) => {
      const latestOrderDetail = await getOrderByOrderId({
        leadId: lead.humanId,
      }).unwrap();
      let payload = {
        [orderFieldName]: value,
      };
      const latestOrderDetailData = latestOrderDetail?.orders?.find(
        (item: any) => item.name.split('/')[1] === orderId
      )?.data;
      if (orderFieldName.includes('/') && latestOrderDetailData) {
        const [key, subKey] = orderFieldName.split('/');
        payload = {
          [key]: {
            ...(latestOrderDetailData[
              key as keyof typeof latestOrderDetailData
            ] as Record<string, any>),
            [subKey]: value,
          },
        };
      } else {
        payload = {
          ...(latestOrderDetailData ?? {}),
          [orderFieldName]: value,
        };
      }
      updateOrderById({
        orderId,
        payload: {
          data: {
            ...latestOrderDetailData,
            ...payload,
          },
        },
      });
    },
    [getOrderByOrderId, lead.humanId, orderId, updateOrderById]
  );

  const handleUpdateLeadAndOrder = useCallback(
    async (
      value: unknown,
      fieldName: SetFieldTouchArg | null,
      payloadKey: HEALTH_POLICYHOLDER_ROWS,
      orderFieldName: string,
      addOrRemove?: 'add' | 'remove'
    ) => {
      if (fieldName) setFieldTouch(fieldName);
      if (addOrRemove) {
        updateLead(`/${payloadKey}`, value, addOrRemove);
      } else {
        updateLead(`/${payloadKey}`, value);
      }

      if (!orderId) return;

      handleUpdateOrder(orderFieldName, value);
    },
    [orderId, updateLead, setFieldTouch, updateOrderById, lead.humanId]
  );

  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderType,
          patches: {
            isDisabled,
            options: getPurchasingPurposeOptions().filter(
              (opt) => opt.value !== PurchasingPurposes.companyIsPolicyHolder
            ),
            onChange: (_e: any, payload: any) => {
              setPolicyHolderTypeUpdated?.(payload);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderType);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderTitle);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderFirstName);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderLastName);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderNationalId);
              setFieldTouch('policyHolderRace');
              setFieldTouch('policyHolderOccupation');
              updateLead(
                `/${HEALTH_POLICYHOLDER_ROWS.policyHolderType}`,
                payload
              );
              handleUpdateOrder(
                'policyHolder/isCustomer',
                payload === PurchasingPurposes.customerIsPolicyHolder
              );
            },
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderTitle,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            options: getOptionData(
              'LeadTitle',
              PRODUCTS.HEALTH_PRODUCT_INSURANCE
            ),
            handleUpdate: (payload: any) =>
              handleUpdateLeadAndOrder(
                payload.selections.value,
                POLICYHOLDER_ROWS.policyHolderTitle,
                HEALTH_POLICYHOLDER_ROWS.policyHolderTitle,
                'policyHolder/title'
              ),
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName,
          patches: {
            isDisabled: nameDisabled,
            handleUpdate: (payload: any) =>
              handleUpdateLeadAndOrder(
                payload[HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName],
                POLICYHOLDER_ROWS.policyHolderFirstName,
                HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName,
                'policyHolder/firstName'
              ),
            showPenIcon: isHealthOrder && !nameDisabled,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderLastName,
          patches: {
            isDisabled: nameDisabled,
            handleUpdate: (payload: any) =>
              handleUpdateLeadAndOrder(
                payload[HEALTH_POLICYHOLDER_ROWS.policyHolderLastName],
                POLICYHOLDER_ROWS.policyHolderLastName,
                HEALTH_POLICYHOLDER_ROWS.policyHolderLastName,
                'policyHolder/lastName'
              ),
            showPenIcon: isHealthOrder && !nameDisabled,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) =>
              handleUpdateLeadAndOrder(
                payload[HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId],
                POLICYHOLDER_ROWS.policyHolderNationalId,
                HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId,
                'idNumber'
              ),
            showPenIcon: isHealthOrder && !isDisabled,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderDob,
          patches: {
            isDisabled: isDisabled || (isHealthOrder && customerIsPolicyHolder),
            onChangeDate: (payload: any) =>
              handleUpdateLeadAndOrder(
                payload ? format(payload, 'yyyy-MM-dd') : '',
                POLICYHOLDER_ROWS.policyHolderDob,
                HEALTH_POLICYHOLDER_ROWS.policyHolderDob,
                'policyHolder/dateOfBirth',
                payload ? 'add' : 'remove'
              ),
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderAge,
          patches: {
            isDisabled,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderPassport,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) =>
              handleUpdateLeadAndOrder(
                payload[HEALTH_POLICYHOLDER_ROWS.policyHolderPassport],
                POLICYHOLDER_ROWS.policyHolderPassport,
                HEALTH_POLICYHOLDER_ROWS.policyHolderPassport,
                'idNumber'
              ),
            showPenIcon: isHealthOrder && !isDisabled,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderRace,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch('policyHolderRace');
              updateLead(
                `/${HEALTH_POLICYHOLDER_ROWS.policyHolderRace}`,
                payload[HEALTH_POLICYHOLDER_ROWS.policyHolderRace]
              );
            },
            showPenIcon: isHealthOrder && !isDisabled,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch('policyHolderOccupation');
              updateLead(
                `/${HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation}`,
                payload[HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation]
              );
            },
            showPenIcon: isHealthOrder && !isDisabled,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderLocale,
          patches: {
            options: getOptionData('Locale'),
            isDisabled,
            handleChange: (payload: any) => {
              handleUpdateLeadAndOrder(
                payload.target.value,
                null,
                HEALTH_POLICYHOLDER_ROWS.policyHolderLocale,
                'policyHolder/communicationLanguage'
              );
            },
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderGender,
          patches: {
            options: getOptionData('Gender'),
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_POLICYHOLDER_ROWS.policyHolderGender}`,
                payload.selections?.value
              );
            },
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderWeight,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_POLICYHOLDER_ROWS.policyHolderWeight}`,
                +payload[HEALTH_POLICYHOLDER_ROWS.policyHolderWeight]
              );
            },
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderHeight,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_POLICYHOLDER_ROWS.policyHolderHeight}`,
                +payload[HEALTH_POLICYHOLDER_ROWS.policyHolderHeight]
              );
            },
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyJobDescription,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_POLICYHOLDER_ROWS.policyJobDescription}`,
                payload[HEALTH_POLICYHOLDER_ROWS.policyJobDescription]
              );
            },
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled, isPartiallyDisabled, customerIsPolicyHolder]);

  // load data from lead schama
  useEffect(() => {
    const orderPolicyHolder = {
      firstName: orderDetail?.data?.policyHolder?.firstName,
      lastName: orderDetail?.data?.policyHolder?.lastName,
      dob: orderDetail?.data?.policyHolder?.dateOfBirth,
    };
    const { type, title, firstName, lastName, nationalId, dob } = {
      ...lead.data.policyHolder,
      ...(isHealthOrder ? orderPolicyHolder : {}),
    };

    const customerIsPolicyHolder =
      lead.data?.policyHolder?.type ===
      PurchasingPurposes.customerIsPolicyHolder;

    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderType,
          patches: {
            value: type ?? '',
            error: errors.policyHolderType,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderTitle,
          patches: {
            value: title ?? '',
            error: errors.policyTitle,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderFirstName,
          patches: {
            value: firstName ?? '',
            error: errors.policyHolderFirstName,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderLastName,
          patches: {
            value: lastName ?? '',
            error: errors.policyHolderLastName,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderNationalId,
          patches: {
            value: nationalId ?? '',
            error: errors.policyHolderNationalId,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderDob,
          patches: {
            value: dob ?? null,
            hidden: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderAge,
          patches: {
            value: _isEmpty(dob) ? '' : getAgeByDOB(dob as string),
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderPassport,
          patches: {
            value:
              (lead.data as unknown as HealthLead['data'])?.policyHolder
                ?.passport ?? '',
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderRace,
          patches: {
            value:
              (lead.data as unknown as HealthLead['data'])?.policyHolderRace ??
              null,
            error: errors.policyHolderRace,
            isReadOnly: customerIsPolicyHolder,
            showAsterisk: !customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderOccupation,
          patches: {
            value:
              (lead.data as unknown as HealthLead['data'])
                ?.policyHolderOccupation ?? null,
            error: errors.policyHolderOccupation,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderLocale,
          patches: {
            value: (lead?.data as any)?.policyHolder?.locale ?? '',
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderGender,
          patches: {
            value: lead.data.policyHolder?.gender ?? '',
            error: null,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderWeight,
          patches: {
            value: lead.data.policyHolder?.weight ?? '',
            error: null,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyHolderHeight,
          patches: {
            value: lead.data.policyHolder?.height ?? '',
            error: null,
            isReadOnly: customerIsPolicyHolder,
          },
        },
        {
          name: HEALTH_POLICYHOLDER_ROWS.policyJobDescription,
          patches: {
            value: lead.data.policyHolder?.jobDescription ?? '',
            error: null,
          },
        },
      ])
    );
  }, [lead, errors]);

  return { dataSchema };
}

export default usePolicyHolderInformation;
