import { format } from 'date-fns';
import _isEmpty from 'lodash/isEmpty';
import { useEffect, useState } from 'react';

import { CustomerSectionConfig, CUSTOMER_ROWS } from './config';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { setValuesToDataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/helper';
import { DataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

import useLeadUpdater from '../../leadUpdater';
import { getAgeByDOB } from '../helper';
import { POLICYHOLDER_ROWS } from '../PolicyHolderInformation/config';
import { PurchasingPurposes } from '../PolicyHolderInformation/PolicyHolderInformation.helper';

interface Args {
  isDisabled: boolean;
}

function useCustomer({ isDisabled }: Args) {
  const [dataSchema, setDataSchema] = useState<DataSchema>(
    CustomerSectionConfig
  );

  const { updateLead } = useLeadUpdater();
  const lead = useGetLeadSelector();
  const { errors, setFieldTouch } = useLeadDetailError();

  // set update function and initial options
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: CUSTOMER_ROWS.firstName,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(CUSTOMER_ROWS.firstName);
              if (
                lead.data.policyHolderType ===
                PurchasingPurposes.customerIsPolicyHolder
              ) {
                setFieldTouch(POLICYHOLDER_ROWS.policyHolderFirstName);
              }
              updateLead(
                `/${CUSTOMER_ROWS.firstName}`,
                payload[CUSTOMER_ROWS.firstName]
              );
            },
          },
        },
        {
          name: CUSTOMER_ROWS.lastName,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(CUSTOMER_ROWS.lastName);
              if (
                lead.data.policyHolderType ===
                PurchasingPurposes.customerIsPolicyHolder
              ) {
                setFieldTouch(POLICYHOLDER_ROWS.policyHolderLastName);
              }
              updateLead(
                `/${CUSTOMER_ROWS.lastName}`,
                payload[CUSTOMER_ROWS.lastName]
              );
            },
          },
        },
        {
          name: CUSTOMER_ROWS.gender,
          patches: {
            options: getOptionData('Gender'),
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(CUSTOMER_ROWS.gender);
              updateLead(`/${CUSTOMER_ROWS.gender}`, payload.selections?.value);
            },
          },
        },
        {
          name: CUSTOMER_ROWS.dob,
          patches: {
            isDisabled,
            onChangeDate: (payload: Date) => {
              setFieldTouch(CUSTOMER_ROWS.dob);
              if (
                lead.data.policyHolderType ===
                PurchasingPurposes.customerIsPolicyHolder
              ) {
                setFieldTouch(POLICYHOLDER_ROWS.policyHolderDob);
              }
              updateLead(
                `/${CUSTOMER_ROWS.dob}`,
                payload ? format(payload, 'yyyy-MM-dd') : '',
                payload ? 'add' : 'remove'
              );
            },
          },
        },
        {
          name: CUSTOMER_ROWS.age,
          patches: {
            value: _isEmpty(lead.data.customerDOB)
              ? ''
              : getAgeByDOB(lead.data.customerDOB),
            isDisabled,
          },
        },
        {
          name: CUSTOMER_ROWS.language,
          patches: {
            options: getOptionData('Locale'),
            isDisabled,
            handleChange: (event: any) => {
              setFieldTouch(CUSTOMER_ROWS.language);
              updateLead(`/${CUSTOMER_ROWS.language}`, event.target.value);
            },
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled]);

  // set lead data as values
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: CUSTOMER_ROWS.firstName,
          patches: {
            value: lead.data.customerFirstName,
            error: errors.customerFirstName,
          },
        },
        {
          name: CUSTOMER_ROWS.lastName,
          patches: {
            value: lead.data.customerLastName,
            error: errors.customerLastName,
          },
        },
        {
          name: CUSTOMER_ROWS.gender,
          patches: {
            value: lead.data.customerGender,
            error: errors.customerGender,
          },
        },
        {
          name: CUSTOMER_ROWS.dob,
          patches: {
            value: lead.data.customerDOB ?? null,
            error: errors.customerDOB,
          },
        },
        {
          name: CUSTOMER_ROWS.age,
          patches: {
            value: _isEmpty(lead.data.customerDOB)
              ? ''
              : getAgeByDOB(lead.data.customerDOB),
          },
        },
        {
          name: CUSTOMER_ROWS.language,
          patches: { value: lead.data.locale, error: errors.locale },
        },
      ])
    );
  }, [lead, errors]);

  return {
    dataSchema,
  };
}

export default useCustomer;
