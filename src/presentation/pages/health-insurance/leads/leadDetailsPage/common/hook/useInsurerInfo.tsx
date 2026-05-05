import _get from 'lodash/get';
import _isEmpty from 'lodash/isEmpty';
import { useEffect, useMemo, useState } from 'react';

import { useLeadDetailError } from 'data/slices/errorSlice/leadDetailError';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

import { format } from 'date-fns';
import { setValuesToDataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/helper';
import { INSURER_ROWS } from 'presentation/components/InsurerInfoSection/config';
import { InsurerSectionUpdateKeys } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import { PatchParam } from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater/updateRules';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';
import { getInsurerInfoDataSchema, HEALTH_INSURER_ROWS } from '../../config';
import { getDeliveryOptionName, UnderwritingStatusOption } from '../../helper';
import { useUpdateUnderwritingStatus } from './useUpdateUnderwriting';

import { useGetDeliveryOptionsQuery } from 'data/slices/deliveryOptionSlice';
import { useGetSelectedPackageQuery } from 'data/slices/packageListing/api';
import { DataSchema } from 'presentation/components/common/FormikFields/SectionRenderer/interface';
import { yesNoOptions } from 'shared/helper/selectOptions';
import { HealthLead } from 'shared/types/lead';
import {
  getProductCategoryAndPlan,
  productCategory,
} from '../../../PackageListingPage/filterConfig';
/* This hook will control the view of Insurer info section
 * Every ui logic such as disabling and hiding should exit in here
 * The hooks will run every time data update occur and update schema according
 * to the rule. This hook act as controller to our insurer info view modal.
 */
function useInsurerInfo(
  insurers: any[],
  getStatus: () => void,
  disableSection?: boolean
) {
  const lead = useGetLeadSelector();
  const [selectedProductInfo, setSelectedProductinfo] = useState<any | null>({
    ...(lead as any).data.insurance,
  });
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

  const { updateLead, jsonUpdater } = useLeadUpdater();

  const [dataSchema, setDataSchema] = useState(
    getInsurerInfoDataSchema() as any
  );

  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();
  const { updateStatus, status, isOrder, isSuccess, isError } =
    useUpdateUnderwritingStatus(lead);

  const [underwritingStatus, setUnderwritingStatus] = useState(
    'ITEM_UNDERWRITING_STATUS_PENDING_VALIDATION'
  );

  const handleChange = async (name: string, value: any) => {
    if (name === HEALTH_INSURER_ROWS.UNDERWRITING_STATUS) {
      await updateStatus(value);
      getStatus();
      return;
    }
    // When changing category, remove dependent fields
    if (name === HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY) {
      const insurance = lead?.data?.insurance || {};
      const patches: PatchParam[] = [
        {
          path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY,
          value,
          op: 'add',
        },
      ];
      if (insurance.subCategory) {
        patches.push({
          path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_SUB_CATEGORY,
          op: 'remove',
        });
      }
      if (insurance.type) {
        patches.push({
          path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_TYPE,
          op: 'remove',
        });
      }
      if (
        insurance.coverages &&
        Array.isArray(insurance.coverages) &&
        insurance.coverages.length > 0
      ) {
        patches.push({
          path: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_COVERAGES,
          op: 'remove',
        });
      }
      const response = await jsonUpdater(patches);
      if ('error' in response) {
        showErrorSnackbar(getString('text.updateLeadFail'));
        return;
      }
      showSuccessSnackbar(getString('text.updateLeadSuccess'));
      return;
    }
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

  useEffect(() => {
    getStatus();
    if (status?.length) {
      setUnderwritingStatus(status);
    }
  }, [status, isSuccess, isError, isOrder, lead.status]);

  useEffect(() => {
    setDataSchema((prev: DataSchema) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_INSURER_ROWS.DELIVERY_OPTION,
          patches: {
            value: getDeliveryOptionName(
              (selectedPackage as any)?.healthPackage?.customQuoteDetails
                ?.deliveryOption ?? ''
            ),
            isDisabled: disableSection,
            error: errors[HEALTH_INSURER_ROWS.DELIVERY_OPTION],
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

  // load initial options and update functions to dataschema
  useEffect(() => {
    setDataSchema((prev: any) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_INSURER_ROWS.CURRENT_INSURER,
          patches: {
            handleUpdate: (payload: any) =>
              handleChange(`/${payload.name}`, payload.selections?.value),
          },
        },
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_INSURER,
          patches: {
            handleUpdate: (payload: any) =>
              handleChange(`/${payload.name}`, payload.selections?.value),
          },
        },
        {
          name: HEALTH_INSURER_ROWS.POLICY_START_DATE,
          patches: {
            onChangeDate: (val: any) => {
              setFieldTouch(INSURER_ROWS.POLICY_START_DATE);
              handleChange(
                `/${HEALTH_INSURER_ROWS.POLICY_START_DATE}`,
                format(new Date(val), 'yyyy-MM-dd')
              );
            },
          },
        },
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY,
          patches: {
            handleUpdate: (val: any) => {
              setSelectedProductinfo(() => ({
                category: val.selections?.value,
              }));
              handleChange(
                HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY,
                val.selections?.value
              );
            },
            options: productCategory(),
          },
        },
        {
          name: HEALTH_INSURER_ROWS.IS_INSURER_MONTHLY_PREMIUM,
          patches: {
            options: yesNoOptions,
            handleChange: (event: any) =>
              handleChange(
                HEALTH_INSURER_ROWS.IS_INSURER_MONTHLY_PREMIUM,
                event.target.value === 'Yes'
              ),
          },
        },
        {
          name: HEALTH_INSURER_ROWS.NEED_TAX_EXEMPTION,
          patches: {
            options: yesNoOptions,
            handleChange: (event: any) =>
              handleChange(
                HEALTH_INSURER_ROWS.NEED_TAX_EXEMPTION,
                event.target.value === 'Yes'
              ),
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDataSchema((prev: any) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_INSURER_ROWS.UNDERWRITING_STATUS,
          patches: {
            handleUpdate: (val: any) => {
              setUnderwritingStatus(val.selections.value);
              handleChange(
                HEALTH_INSURER_ROWS.UNDERWRITING_STATUS,
                val.selections.value
              );
            },
            isDisabled: !isOrder && lead.status !== 'LEAD_STATUS_PURCHASED',
            options: UnderwritingStatusOption(),
            value:
              !isOrder && lead.status !== 'LEAD_STATUS_PURCHASED'
                ? ''
                : underwritingStatus,
          },
        },
      ])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [underwritingStatus, status, isOrder, lead]);

  useEffect(() => {
    const { data } = lead;

    const category =
      selectedProductInfo?.category ?? (data as any)?.insurance?.category;

    if (!category) return;
    const config = getProductCategoryAndPlan(category);

    setDataSchema((prev: any) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY,
          patches: {
            handleUpdate: (val: any) => {
              setSelectedProductinfo(() => ({
                category: val.selections?.value,
              }));
              handleChange(
                HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_CATEGORY,
                val.selections?.value
              );
            },
            isDisabled: disableSection,
            value: category,
            options: productCategory(),
          },
        },
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_SUB_CATEGORY,
          patches: {
            options: config?.subCategory ?? [],
            title: getString('healthLead.subCategory'),
            isDisabled: disableSection,
            value:
              selectedProductInfo?.subCategory ??
              (data as any)?.insurance?.subCategory,
            handleUpdate: (val: any) => {
              setSelectedProductinfo((_prev: any) => ({
                ..._prev,
                subCategory: val.selections?.value,
              }));
              handleChange(
                HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_SUB_CATEGORY,
                val.selections?.value
              );
            },
          },
        },
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_TYPE,
          patches: {
            options: config?.types ?? [],
            isDisabled: disableSection,
            hidden: category !== 'ipdOpd' || !config?.types,
            value: selectedProductInfo?.type ?? (data as any)?.insurance?.type,
            handleUpdate: (val: any) => {
              setSelectedProductinfo((_prev: any) => ({
                ..._prev,
                type: val.selections?.value,
              }));
              handleChange(
                HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_TYPE,
                val.selections?.value
              );
            },
          },
        },
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_COVERAGES,
          patches: {
            options: config?.coverages ?? [],
            isDisabled: disableSection,
            value:
              selectedProductInfo?.coverage ??
              (data as any)?.insurance?.coverages,
            handleUpdate: (val: any) => {
              setSelectedProductinfo((_prev: any) => ({
                ..._prev,
                coverages: val.selections.map((sel: any) => sel.value),
              }));
              handleChange(
                HEALTH_INSURER_ROWS.PREFERRED_PRODUCT_COVERAGES,
                val.selections.map((sel: any) => sel.value)
              );
            },
          },
        },
      ])
    );
  }, [selectedProductInfo, lead, disableSection]);

  // load api data dependenciesto datashcema
  useEffect(() => {
    setDataSchema((prev: any) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_INSURER_ROWS.CURRENT_INSURER,
          patches: {
            options: insurers.map((x: any) => ({
              id: x.id,
              value: `insurers/${x.id}`,
              title: x.title,
            })),
          },
        },
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_INSURER,
          patches: {
            options: insurers.map((x: any) => ({
              id: x.id,
              value: `insurers/${x.id}`,
              title: x.title,
            })),
          },
        },
      ])
    );
  }, [insurers]);

  // set lead data as values to dataSchema and lead data dependent logics
  useEffect(() => {
    const { data } = lead as any as HealthLead;

    if (!data) return;

    setDataSchema((prev: any) =>
      setValuesToDataSchema(prev, [
        {
          name: HEALTH_INSURER_ROWS.CURRENT_INSURER,
          patches: {
            value: _get(lead, 'data.currentInsurer', 0),
            isDisabled: disableSection,
          },
        },
        {
          name: HEALTH_INSURER_ROWS.PREFERRED_INSURER,
          patches: {
            value: _get(lead, 'data.preferredInsurer', 0),
            isDisabled: disableSection,
          },
        },
        {
          name: HEALTH_INSURER_ROWS.POLICY_START_DATE,
          patches: {
            value: data?.policyStartDate
              ? new Date(data?.policyStartDate)
              : null,
            isDisabled: disableSection,
            error: errors[INSURER_ROWS.POLICY_START_DATE],
          },
        },
        {
          name: HEALTH_INSURER_ROWS.IS_INSURER_MONTHLY_PREMIUM,
          patches: {
            value: data?.insurance?.isInsurerMonthlyPremium ? 'Yes' : 'No',
            error: null,
          },
        },
        {
          name: HEALTH_INSURER_ROWS.NEED_TAX_EXEMPTION,
          patches: {
            value: data?.insurance?.needTaxExemption ? 'Yes' : 'No',
            error: null,
          },
        },
      ])
    );
  }, [lead, disableSection, errors]);

  return {
    dataSchema,
  };
}

export default useInsurerInfo;
