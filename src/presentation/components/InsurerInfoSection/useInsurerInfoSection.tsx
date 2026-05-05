import { useFlags } from 'flagsmith/react';
import _camelCase from 'lodash/camelCase';
import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { useEffect, useMemo, useState } from 'react';

import FeatureFlags from 'config/flagsmithConfig';

import { getInsurerInfoDataSchema, INSURER_ROWS } from './config';
import { useGetDeliveryOptionsQuery } from 'data/slices/deliveryOptionSlice';
import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import { formatPreferredType } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { insurerTypeOptions } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import { LEAD_TYPE } from 'shared/constants';
import { format } from 'utils/datetime';

import {
  getInsuranceKindOptions,
  getLastDiscount,
  getLastInvoicePrice,
  getLastPackagePrice,
  INSURANCE_KIND,
  InsurerSectionUpdateKeys,
  isDisabled,
  POLICY_TYPE,
  isValidDate,
} from './InsurerInfoSection.helper';
import { setValuesToDataSchema } from '../common/FormikFields/SectionRenderer/helper';

/* This hook will control the view of Insurer info section
 * Every ui logic such as disabling and hiding should exit in here
 * The hooks will run every time data update occur and update schema according
 * to the rule. This hook act as controller to our insurer info view modal.
 */
function useInsurerInfoSection(
  insurers: any[],
  disableSection?: boolean,
  isPaymentMade = false
) {
  const flags = useFlags([
    FeatureFlags.BROK_5710_SHOW_CURRENT_POLICY_EXPIRY_DATE_CAR_LEAD_DETAIL_20260429_TEMP,
  ]);
  const showCurrentPolicyExpiryDate =
    flags[
      FeatureFlags
        .BROK_5710_SHOW_CURRENT_POLICY_EXPIRY_DATE_CAR_LEAD_DETAIL_20260429_TEMP
    ]?.enabled ?? false;

  const lead = useGetLeadSelector();
  const { errors, setFieldTouch } = useLeadDetailError();
  const { data: selectedPackage } = useGetSelectedPackageQuery(
    {
      leadId: lead.name?.split('/')[1],
      enableDiscountPricing: true,
    },
    {
      skip: _isEmpty(lead.name) || _isEmpty(lead.data?.checkout?.package),
    }
  );

  const { data: deliveryOptions } = useGetDeliveryOptionsQuery();

  const { updateLead } = useLeadUpdater();

  const [dataSchema, setDataSchema] = useState(getInsurerInfoDataSchema());

  const handleChange = (name: string, value: any) => {
    if (
      (name === InsurerSectionUpdateKeys.currentInsurer ||
        name === InsurerSectionUpdateKeys.preferredInsurer) &&
      value === 0
    ) {
      updateLead(name, undefined, 'remove');
    } else {
      updateLead(name, value);
    }
  };

  function getDeliveryOptionName(deliveryOption: string | undefined) {
    if (!deliveryOption) return '-';

    const deliveryTitle = deliveryOption.split('/');
    return getString(
      `qc.${_camelCase(deliveryTitle[deliveryTitle.length - 1])}`
    );
  }

  const transformedDeliveryOptions = useMemo(() => {
    if (deliveryOptions) {
      return deliveryOptions.deliveryOptions.map((delivery) => ({
        id: delivery.name,
        value: delivery.name,
        title: getDeliveryOptionName(delivery.name),
      }));
    }
    return null;
  }, [deliveryOptions]);

  // load initial options and update functions to dataschema
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: INSURER_ROWS.CURRENT_INSURER,
          patches: {
            handleUpdate: (payload: any) =>
              handleChange(`/${payload.name}`, payload.selections?.value),
          },
        },
        {
          name: INSURER_ROWS.PREFERRED_INSURER,
          patches: {
            handleUpdate: (payload: any) =>
              handleChange(`/${payload.name}`, payload.selections?.value),
          },
        },
        {
          name: INSURER_ROWS.EXPIRY_DATE,
          patches: {
            onChangeDate: (val: unknown) => {
              const fieldName = `/${INSURER_ROWS.EXPIRY_DATE}`;

              if (!isValidDate(val)) {
                updateLead(fieldName, undefined, 'remove');
                return;
              }

              const parsedDate = val instanceof Date ? val : new Date(val);

              handleChange(fieldName, format(parsedDate, 'yyyy-MM-dd'));
            },
          },
        },
        {
          name: INSURER_ROWS.PREFERRED_SUM_INSURED,
          patches: {
            handleUpdate: (payload: any) =>
              handleChange(
                `/${INSURER_ROWS.PREFERRED_SUM_INSURED}`,
                Number(payload[INSURER_ROWS.PREFERRED_SUM_INSURED])
              ),
          },
        },
        {
          name: INSURER_ROWS.INSURANCE_KIND,
          patches: {
            options: getInsuranceKindOptions(),
            handleUpdate: (payload: any) => {
              setFieldTouch(INSURER_ROWS.INSURANCE_KIND);
              handleChange(
                `/${INSURER_ROWS.INSURANCE_KIND}`,
                payload.selections?.value
              );
            },
          },
        },
        {
          name: INSURER_ROWS.PREFERRED_TYPE,
          patches: {
            handleSelectChange: (val: any) =>
              handleChange(`/${INSURER_ROWS.PREFERRED_TYPE}`, val),
            options: insurerTypeOptions,
          },
        },
        {
          name: INSURER_ROWS.POLICY_START_DATE,
          patches: {
            onChangeDate: (val: any) => {
              setFieldTouch(INSURER_ROWS.POLICY_START_DATE);
              handleChange(
                `/${INSURER_ROWS.POLICY_START_DATE}`,
                format(new Date(val), 'yyyy-MM-dd')
              );
            },
          },
        },
        {
          name: INSURER_ROWS.COMPULSORY_POLICY_START_DATE,
          patches: {
            onChangeDate: (val: any) => {
              setFieldTouch(INSURER_ROWS.COMPULSORY_POLICY_START_DATE);
              handleChange(
                `/${INSURER_ROWS.COMPULSORY_POLICY_START_DATE}`,
                format(new Date(val), 'yyyy-MM-dd')
              );
            },
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: INSURER_ROWS.DELIVERY_OPTION,
          patches: {
            value: getDeliveryOptionName(
              selectedPackage?.carPackageWithPricing?.package
                ?.customQuoteDetails?.deliveryOption ?? ''
            ),
            isDisabled: disableSection,
            error: errors[INSURER_ROWS.DELIVERY_OPTION],
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPackage,
    disableSection,
    errors,
    lead.data?.checkout?.deliveryOption,
    transformedDeliveryOptions,
  ]);

  // load api data dependenciesto datashcema
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: INSURER_ROWS.CURRENT_INSURER,
          patches: {
            options: insurers.map((x: any) => ({
              id: x.id,
              value: x.id,
              title: x.title,
            })),
          },
        },
        {
          name: INSURER_ROWS.PREFERRED_INSURER,
          patches: {
            options: insurers.map((x: any) => ({
              id: x.id,
              value: x.id,
              title: x.title,
            })),
          },
        },
      ])
    );
  }, [insurers]);

  // set lead data as values to dataSchema and lead data dependent logics
  useEffect(() => {
    setDataSchema((prev) =>
      setValuesToDataSchema(prev, [
        {
          name: INSURER_ROWS.CURRENT_INSURER,
          patches: {
            value: _get(lead, 'data.currentInsurer', 0),
            isDisabled: disableSection || isPaymentMade,
          },
        },
        {
          name: INSURER_ROWS.EXPIRY_DATE,
          patches: {
            hidden: !showCurrentPolicyExpiryDate,
            value: lead.data?.policyExpiryDate
              ? new Date(lead.data?.policyExpiryDate)
              : null,
            isDisabled: disableSection || isPaymentMade,
          },
        },
        {
          name: INSURER_ROWS.PREFERRED_INSURER,
          patches: {
            value: _get(lead, 'data.preferredInsurer', 0),
            isDisabled: disableSection,
          },
        },
        {
          name: INSURER_ROWS.PREFERRED_SUM_INSURED,
          patches: {
            value: _get(lead, 'data.preferredSumInsured', 0),
            isDisabled: disableSection,
          },
        },
        {
          name: INSURER_ROWS.INSURANCE_KIND,
          patches: {
            value: lead.data?.insuranceKind,
            isDisabled: disableSection || isPaymentMade,
            error: errors[INSURER_ROWS.INSURANCE_KIND],
          },
        },
        {
          name: INSURER_ROWS.PREFERRED_TYPE,
          patches: {
            value: formatPreferredType(lead.data?.voluntaryInsuranceType ?? []),
            isDisabled: disableSection,
          },
        },
        {
          name: INSURER_ROWS.POLICY_START_DATE,
          patches: {
            value: lead.data?.policyStartDate
              ? new Date(lead.data?.policyStartDate)
              : null,
            isDisabled:
              disableSection ||
              isDisabled(
                lead.data?.insuranceKind as INSURANCE_KIND,
                POLICY_TYPE.POLICY_START_DATE
              ),
            showAsterisk:
              lead.data?.insuranceKind === 'both' ||
              lead.data?.insuranceKind === 'voluntary',
            error: errors[INSURER_ROWS.POLICY_START_DATE],
          },
        },
        {
          name: INSURER_ROWS.COMPULSORY_POLICY_START_DATE,
          patches: {
            value: lead.data?.compulsoryPolicyStartDate
              ? new Date(lead.data?.compulsoryPolicyStartDate)
              : null,
            isDisabled:
              disableSection ||
              isDisabled(
                lead.data?.insuranceKind as INSURANCE_KIND,
                POLICY_TYPE.COMPULSORY_POLICY_START_DATE
              ),
            showAsterisk:
              lead.data?.insuranceKind === 'both' ||
              lead.data?.insuranceKind === 'mandatory',
            error: errors[INSURER_ROWS.COMPULSORY_POLICY_START_DATE],
          },
        },
        {
          name: INSURER_ROWS.LAST_INVOICE_PRICE,
          patches: {
            hidden: lead.type !== LEAD_TYPE.RENEWAL,
            value: getLastInvoicePrice(lead.annotations),
          },
        },
        {
          name: INSURER_ROWS.LAST_PACKAGE_PRICE,
          patches: {
            hidden: lead.type !== LEAD_TYPE.RENEWAL,
            value: getLastPackagePrice(lead.annotations),
          },
        },
        {
          name: INSURER_ROWS.LAST_DISCOUNT,
          patches: {
            hidden: lead.type !== LEAD_TYPE.RENEWAL,
            value: getLastDiscount(lead.annotations),
          },
        },
      ])
    );
  }, [
    lead,
    disableSection,
    errors,
    isPaymentMade,
    showCurrentPolicyExpiryDate,
  ]);

  return {
    dataSchema,
  };
}

export default useInsurerInfoSection;
