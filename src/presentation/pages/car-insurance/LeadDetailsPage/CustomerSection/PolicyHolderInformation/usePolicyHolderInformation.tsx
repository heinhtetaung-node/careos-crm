import { format } from 'date-fns';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { useEffect, useState } from 'react';

import { getPolicyHolderSectionConfig, POLICYHOLDER_ROWS } from './config';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { setValuesToDataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/helper';
import { DataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

import {
  getPurchasingPurposeOptions,
  PurchasingPurposes,
} from './PolicyHolderInformation.helper';

import useLeadUpdater from '../../leadUpdater';
import { driverAmount, getAgeByDOB } from '../helper';

interface Args {
  isDisabled: boolean;
  showFixedDriverModal?: boolean;
  setShowFixedDriverModal?: (args: boolean) => void;
  handlePolicyUploaded?: () => void;
}

function usePolicyHolderInformation({
  isDisabled,
  showFixedDriverModal,
  setShowFixedDriverModal,
  handlePolicyUploaded = () => {},
}: Args) {
  const [dataSchema, setDataSchema] = useState<DataSchema>(
    getPolicyHolderSectionConfig()
  );

  const { updateLead } = useLeadUpdater();
  const lead = useGetLeadSelector();
  const { errors, setFieldTouch } = useLeadDetailError();

  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: POLICYHOLDER_ROWS.policyHolderType,
          patches: {
            isDisabled,
            options: getPurchasingPurposeOptions(),
            onChange: async (_e: any, payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderType);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderTitle);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderFirstName);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderLastName);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderCompanyName);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderTaxId);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderNationalId);
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderDob);
              await updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderType}`,
                payload
              );
              handlePolicyUploaded();
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderTitle,
          patches: {
            isDisabled,
            options: getOptionData('LeadTitle'),
            handleUpdate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderTitle);
              updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderTitle}`,
                payload.selections.value
              );
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderFirstName,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderFirstName);
              updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderFirstName}`,
                payload[POLICYHOLDER_ROWS.policyHolderFirstName]
              );
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderLastName,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderLastName);
              updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderLastName}`,
                payload[POLICYHOLDER_ROWS.policyHolderLastName]
              );
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderCompanyName,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderCompanyName);
              updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderCompanyName}`,
                payload[POLICYHOLDER_ROWS.policyHolderCompanyName]
              );
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderTaxId,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderTaxId);
              updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderTaxId}`,
                payload[POLICYHOLDER_ROWS.policyHolderTaxId]
              );
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderNationalId,
          patches: {
            isDisabled,
            handleUpdate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderNationalId);
              updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderNationalId}`,
                payload[POLICYHOLDER_ROWS.policyHolderNationalId]
              );
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderDob,
          patches: {
            isDisabled,
            onChangeDate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.policyHolderDob);
              updateLead(
                `/${POLICYHOLDER_ROWS.policyHolderDob}`,
                payload ? format(payload, 'yyyy-MM-dd') : '',
                payload ? 'add' : 'remove'
              );
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderAge,
          patches: {
            isDisabled,
          },
        },
        {
          name: POLICYHOLDER_ROWS.noOfFixedDriver,
          patches: {
            isDisabled,
            options: driverAmount,
            handleUpdate: (payload: any) => {
              setFieldTouch(POLICYHOLDER_ROWS.noOfFixedDriver);
              updateLead(
                `/${POLICYHOLDER_ROWS.noOfFixedDriver}`,
                payload?.selections?.value
              ).finally(() => {
                if (payload?.selections?.value) {
                  setShowFixedDriverModal?.(!showFixedDriverModal);
                }
              });
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.firstDriverName,
          patches: {
            isDisabled,
            onClick: () => {
              setFieldTouch(POLICYHOLDER_ROWS.firstDriverName);
              setShowFixedDriverModal?.(!showFixedDriverModal);
            },
          },
        },
        {
          name: POLICYHOLDER_ROWS.secondDriverName,
          patches: {
            isDisabled,
            onClick: () => {
              setFieldTouch(POLICYHOLDER_ROWS.secondDriverName);
              setShowFixedDriverModal?.(!showFixedDriverModal);
            },
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDisabled, showFixedDriverModal, setShowFixedDriverModal]);

  // load data from lead schama
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: POLICYHOLDER_ROWS.policyHolderType,
          patches: {
            value: lead.data.policyHolderType,
            error: errors.policyHolderType,
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderTitle,
          patches: {
            value: lead.data.policyTitle,
            hidden:
              lead.data.policyHolderType ===
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
            error: errors.policyTitle,
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderFirstName,
          patches: {
            value: lead.data.policyHolderFirstName,
            hidden:
              lead.data.policyHolderType ===
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
            isReadOnly:
              lead.data.policyHolderType ===
              PurchasingPurposes.customerIsPolicyHolder,
            error: errors.policyHolderFirstName,
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderLastName,
          patches: {
            value: lead.data.policyHolderLastName,
            hidden:
              lead.data.policyHolderType ===
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
            isReadOnly:
              lead.data.policyHolderType ===
              PurchasingPurposes.customerIsPolicyHolder,
            error: errors.policyHolderLastName,
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderNationalId,
          patches: {
            value: lead.data.policyHolderNationalId,
            hidden:
              lead.data.policyHolderType ===
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
            error: errors.policyHolderNationalId,
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderDob,
          patches: {
            value: lead.data.policyHolderDOB ?? null,
            hidden:
              lead.data.policyHolderType ===
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
            isFieldDisabled:
              lead.data.policyHolderType ===
              PurchasingPurposes.customerIsPolicyHolder,
            error: errors.policyHolderDOB,
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderAge,
          patches: {
            value: _isEmpty(lead.data.policyHolderDOB)
              ? ''
              : getAgeByDOB(lead.data.policyHolderDOB as string),
            hidden:
              lead.data.policyHolderType ===
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderCompanyName,
          patches: {
            value: _get(lead, 'data.customerPolicyAddress[0].companyName', ''),
            hidden:
              lead.data.policyHolderType !==
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
            error: errors[POLICYHOLDER_ROWS.policyHolderCompanyName],
          },
        },
        {
          name: POLICYHOLDER_ROWS.policyHolderTaxId,
          patches: {
            value: _get(lead, 'data.customerPolicyAddress[0].taxId', ''),
            hidden:
              lead.data.policyHolderType !==
                PurchasingPurposes.companyIsPolicyHolder ||
              _isEmpty(lead.data?.policyHolderType),
            error: errors[POLICYHOLDER_ROWS.policyHolderTaxId],
          },
        },
        {
          name: POLICYHOLDER_ROWS.noOfFixedDriver,
          patches: {
            value: lead.data.numberOfFixedDriver,
            hidden: _isEmpty(lead.data?.policyHolderType),
            error: errors.numberOfFixedDriver,
          },
        },
        {
          name: POLICYHOLDER_ROWS.firstDriverName,
          patches: {
            value:
              lead.data.firstDriverFirstName && lead.data.firstDriverLastName
                ? `${lead.data.firstDriverFirstName} ${lead.data.firstDriverLastName}`
                : null,
            isDisabled: lead.data.numberOfFixedDriver < 1,
            hidden:
              _isEmpty(lead.data?.policyHolderType) ||
              lead.data.numberOfFixedDriver < 1,
            error: errors[POLICYHOLDER_ROWS.firstDriverName],
          },
        },
        {
          name: POLICYHOLDER_ROWS.secondDriverName,
          patches: {
            value:
              lead.data.secondDriverFirstName && lead.data.secondDriverLastName
                ? `${lead.data.secondDriverFirstName} ${lead.data.secondDriverLastName}`
                : null,
            isDisabled: lead.data.numberOfFixedDriver !== 2,
            hidden:
              _isEmpty(lead.data?.policyHolderType) ||
              lead.data.numberOfFixedDriver !== 2,
            error: errors[POLICYHOLDER_ROWS.secondDriverName],
          },
        },
      ])
    );
  }, [lead, errors]);

  return { dataSchema };
}

export default usePolicyHolderInformation;
