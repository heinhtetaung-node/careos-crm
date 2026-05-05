import { format } from 'date-fns';
import _isEmpty from 'lodash/isEmpty';
import { useEffect, useState } from 'react';

import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { setValuesToDataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/helper';
import { DataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

import { getAgeByDOB } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import { PurchasingPurposes } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

import { PRODUCTS } from 'config/TypeFilter';
import { CUSTOMER_ROWS } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/Customer/config';
import { HealthLead } from 'shared/types/lead';
import {
  HEALTH_CUSTOMER_ROWS,
  HealthCustomerSectionConfig,
} from '../../config';

interface Args {
  isDisabled: boolean;
  isPartiallyDisabled: boolean;
}

function useCustomer({ isDisabled, isPartiallyDisabled }: Args) {
  const [dataSchema, setDataSchema] = useState<DataSchema>(
    HealthCustomerSectionConfig
  );

  const { updateLead } = useLeadUpdater();
  const lead = useGetLeadSelector() as any as HealthLead;
  const { errors, setFieldTouch } = useLeadDetailError();

  // set update function and initial options
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_CUSTOMER_ROWS.firstName,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(CUSTOMER_ROWS.firstName);
              if (
                lead.data?.policyHolder?.type ===
                PurchasingPurposes.customerIsPolicyHolder
              ) {
                setFieldTouch(CUSTOMER_ROWS.firstName);
              }
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.firstName}`,
                payload[HEALTH_CUSTOMER_ROWS.firstName]
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.lastName,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(CUSTOMER_ROWS.lastName);
              if (
                lead.data?.policyHolder?.type ===
                PurchasingPurposes.customerIsPolicyHolder
              ) {
                setFieldTouch(CUSTOMER_ROWS.lastName);
              }
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.lastName}`,
                payload[HEALTH_CUSTOMER_ROWS.lastName]
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.gender,
          patches: {
            options: getOptionData('Gender'),
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(CUSTOMER_ROWS.gender);
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.gender}`,
                payload.selections?.value
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.dob,
          patches: {
            isDisabled,
            onChangeDate: (payload: Date) => {
              setFieldTouch(CUSTOMER_ROWS.dob);
              if (
                lead.data?.policyHolder?.type ===
                PurchasingPurposes.customerIsPolicyHolder
              ) {
                setFieldTouch(CUSTOMER_ROWS.dob);
              }
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.dob}`,
                payload ? format(payload, 'yyyy-MM-dd') : '',
                payload ? 'add' : 'remove'
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.age,
          patches: {
            value: _isEmpty(lead.data?.customer?.dob)
              ? ''
              : getAgeByDOB(lead.data?.customer?.dob),
            isDisabled,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.language,
          patches: {
            options: getOptionData('Locale'),
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleChange: (event: any) => {
              setFieldTouch(CUSTOMER_ROWS.language);
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.language}`,
                event.target.value === 'th-th'
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.title,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            options: getOptionData(
              'LeadTitle',
              PRODUCTS.HEALTH_PRODUCT_INSURANCE
            ),
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.title}`,
                payload.selections.value
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.nationalId,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.nationalId}`,
                payload[HEALTH_CUSTOMER_ROWS.nationalId]
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.weight,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.weight}`,
                +payload[HEALTH_CUSTOMER_ROWS.weight]
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.height,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.height}`,
                +payload[HEALTH_CUSTOMER_ROWS.height]
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.occupation,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.occupation}`,
                payload[HEALTH_CUSTOMER_ROWS.occupation]
              );
            },
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.workAddress,
          patches: {
            isDisabled: isDisabled && !isPartiallyDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${HEALTH_CUSTOMER_ROWS.workAddress}`,
                payload[HEALTH_CUSTOMER_ROWS.workAddress]
              );
            },
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled, isPartiallyDisabled]);

  // set lead data as values
  useEffect(() => {
    const { firstName, lastName, gender, dob } = lead.data.customer;

    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_CUSTOMER_ROWS.firstName,
          patches: {
            value: firstName ?? '',
            error: errors.customerFirstName,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.lastName,
          patches: {
            value: lastName ?? '',
            error: errors.customerLastName,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.gender,
          patches: {
            value: gender ?? '',
            error: errors.customerGender,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.dob,
          patches: {
            value: dob ?? null,
            error: errors.customerDOB,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.age,
          patches: {
            value: _isEmpty(dob) ? '' : getAgeByDOB(dob),
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.language,
          patches: {
            value: (lead?.data as any)?.customer.isThaiNational
              ? 'th-th'
              : 'th-en',
            error: errors[CUSTOMER_ROWS.language],
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.title,
          patches: {
            value: lead.data.customer?.title ?? '',
            error: null,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.nationalId,
          patches: {
            value: lead.data.customer?.nationalId ?? '',
            error: null,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.weight,
          patches: {
            value: lead.data.customer?.weight ?? '',
            error: null,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.height,
          patches: {
            value: lead.data.customer?.height ?? '',
            error: null,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.occupation,
          patches: {
            value: lead.data.customer?.occupation ?? '',
            error: null,
          },
        },
        {
          name: HEALTH_CUSTOMER_ROWS.workAddress,
          patches: {
            value: lead.data.customer?.workAddress ?? '',
            error: null,
          },
        },
      ])
    );
  }, [lead, errors]);

  return {
    dataSchema,
  };
}

export default useCustomer;
