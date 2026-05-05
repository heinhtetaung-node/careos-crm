import { useEffect, useMemo, useState } from 'react';

import { setValuesToDataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/helper';
import { DataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';

import { HealthLead } from 'shared/types/lead';

import { PRODUCTS } from 'config/TypeFilter';
import { THAI_COUNTRY_CODE } from 'presentation/components/modal/LeadDetailsModal/PhoneModal';
import {
  generateBeneficiarySectionConfig,
  getBeneficiaryFieldKeys,
} from '../../config';

interface Args {
  isDisabled: boolean;
  isHealthOrder: boolean;
  beneficiaryIndex?: number; // Optional parameter to specify which beneficiary (0 for primary, 1 for additional)
}

function useBeneficiary({
  isDisabled,
  isHealthOrder,
  beneficiaryIndex = 0,
}: Args) {
  // Use the new consolidated functions to get config and field keys
  const config = useMemo(
    () => generateBeneficiarySectionConfig(beneficiaryIndex),
    [beneficiaryIndex]
  );

  const rows = useMemo(
    () => getBeneficiaryFieldKeys(beneficiaryIndex),
    [beneficiaryIndex]
  );

  const [dataSchema, setDataSchema] = useState<DataSchema>(config);

  const { updateLead } = useLeadUpdater();
  const lead = useGetLeadSelector() as unknown as HealthLead;
  const showPenIcon = isHealthOrder && !isDisabled;

  // set update function and initial options
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: rows.beneficiaryTitle,
          patches: {
            isDisabled,
            options: getOptionData(
              'LeadTitle',
              PRODUCTS.HEALTH_PRODUCT_INSURANCE
            ),
            handleUpdate: (payload: any) => {
              updateLead(`/${rows.beneficiaryTitle}`, payload.selections.value);
            },
          },
        },
        {
          name: rows.beneficiaryFirstName,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${rows.beneficiaryFirstName}`,
                payload[rows.beneficiaryFirstName]
              );
            },
            showPenIcon,
          },
        },
        {
          name: rows.beneficiaryLastName,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${rows.beneficiaryLastName}`,
                payload[rows.beneficiaryLastName]
              );
            },
            showPenIcon,
          },
        },
        {
          name: rows.beneficiaryGender,
          patches: {
            options: getOptionData('Gender'),
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${rows.beneficiaryGender}`,
                payload.selections?.value
              );
            },
          },
        },
        {
          name: rows.beneficiaryPhone,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              const internationalPhoneNumber = payload[
                rows.beneficiaryPhone
              ].replace(/^0+/, THAI_COUNTRY_CODE);

              updateLead(`/${rows.beneficiaryPhone}`, internationalPhoneNumber);
            },
            showPenIcon,
          },
        },
        {
          name: rows.beneficiaryEmail,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${rows.beneficiaryEmail}`,
                payload[rows.beneficiaryEmail]
              );
            },
            showPenIcon,
          },
        },
        {
          name: rows.beneficiaryRelationship,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${rows.beneficiaryRelationship}`,
                payload[rows.beneficiaryRelationship]
              );
            },
            showPenIcon,
          },
        },
        {
          name: rows.beneficiaryAddress,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              updateLead(
                `/${rows.beneficiaryAddress}`,
                payload[rows.beneficiaryAddress]
              );
            },
            showPenIcon,
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled, beneficiaryIndex]);

  // set lead data as values
  useEffect(() => {
    if (!lead?.data?.beneficiaries?.length) return;

    // Check if we have data for the requested beneficiary index
    if (beneficiaryIndex >= lead.data.beneficiaries.length) return;

    const {
      firstName,
      lastName,
      gender,
      title,
      phone,
      email,
      relationship,
      address,
    } = lead.data.beneficiaries[beneficiaryIndex];

    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: rows.beneficiaryTitle,
          patches: {
            value: title,
          },
        },
        {
          name: rows.beneficiaryFirstName,
          patches: {
            value: firstName,
          },
        },
        {
          name: rows.beneficiaryLastName,
          patches: {
            value: lastName,
          },
        },
        {
          name: rows.beneficiaryGender,
          patches: {
            value: gender,
          },
        },
        {
          name: rows.beneficiaryEmail,
          patches: {
            value: email,
          },
        },
        {
          name: rows.beneficiaryPhone,
          patches: {
            value: phone,
          },
        },
        {
          name: rows.beneficiaryRelationship,
          patches: {
            value: relationship,
          },
        },
        {
          name: rows.beneficiaryAddress,
          patches: {
            value: address,
          },
        },
      ])
    );
  }, [lead, beneficiaryIndex, rows]);

  return {
    dataSchema,
  };
}

export default useBeneficiary;
