import { Button } from '@alphafounders/ui';
import { CloseIcon } from '@alphafounders/icons';
import { removeZeroPadding } from '@careos/utils';
import { Select, MenuItem, InputLabel } from '@material-ui/core';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import { useFormik, useFormikContext } from 'formik';
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import {
  useLazyGetDiscountCampaignsQuery,
  useLazyGetApproverQuery,
} from 'data/slices/discountAndPricingSlice';
import Input from 'presentation/components/controls/Input';
import { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { getString } from 'presentation/theme/localization';
import { VALID_NUMBER_PATTERN } from 'shared/constants';
import { Lead } from 'shared/types/lead';
import { formatBahtToSatang } from 'utils/currency';
import useSnackbar from 'utils/snackbar';

import {
  discountTypes,
  convertValueTo,
  DiscountType,
  checkPaymentValidation,
  getDiscountParameterFromExistingCustomPackage,
  mapDiscountType,
  getCheckPaymentOptionDiscountParams,
  checkCampaignDiscountError,
  SelectedDiscountInfo,
} from './helper';

import {
  ShippingFeeProps,
  useGetShippingOptions,
} from '../AddonAndShipping/helper';
import { getFormattedError } from '../helper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

interface DiscountProps {
  onClose: () => void;
  leadData: Lead;
  packageData: TransformedPackageType;
  getPaymentOptions: (arg: any) => Promise<unknown>;
  setCampaignName: (campaign: string) => void;
  showPricing: (value: boolean) => void;
  resetForm: () => void;
}

const Discount = React.forwardRef(
  (
    {
      onClose,
      leadData,
      packageData,
      getPaymentOptions,
      setCampaignName,
      showPricing,
      resetForm: resetParentForm,
    }: DiscountProps,
    ref
  ) => {
    const globalProduct = useAppSelector(
      (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
    );
    const [maxDiscount, setMaxDiscount] = useState(0);
    const [approver, setApprover] = useState('');
    const { showErrorSnackbar } = useSnackbar();
    const { values: shippingInfo } = useFormikContext<SelectedDiscountInfo>();

    const handleErrors = (error: FetchBaseQueryError | SerializedError) => {
      const formattedErrorResponse = getFormattedError(error);
      showErrorSnackbar(formattedErrorResponse);
    };

    const [
      getDiscountCampaigns,
      { data: campaignsData, isLoading: isCampaignsLoading },
    ] = useLazyGetDiscountCampaignsQuery();

    const [
      getApprover,
      { error: approverError, isLoading: isLoadingApprover },
    ] = useLazyGetApproverQuery();

    const getDiscountType = () => {
      if (packageData.insuranceKind === 'mandatory') {
        return DiscountType.none;
      }
      if (
        packageData?.discount?.amount &&
        packageData?.packageSource !== 'custom'
      ) {
        return DiscountType.carDiscount;
      }

      return '';
    };

    const { shippingOptions } = useGetShippingOptions({});

    const hasShippingFee: ShippingFeeProps | undefined = shippingOptions.find(
      (opt) => opt.key === shippingInfo.deliveryOption
    );

    const addInsuranceKindAndShipmentInPayload = packageData?.insuranceKind
      ? {
          insuranceKind: packageData.insuranceKind.toUpperCase(),
          ...(hasShippingFee
            ? { shipmentFee: hasShippingFee.shipmentFee }
            : null),
        }
      : {
          ...(hasShippingFee
            ? { shipmentFee: hasShippingFee.shipmentFee }
            : null),
        };

    const {
      values,
      errors,
      setFieldValue,
      setFieldTouched,
      touched,
      resetForm,
      submitForm,
      isSubmitting,
    } = useFormik({
      initialValues: {
        discountType: getDiscountType(),
        campaignName: '',
        discountPercent: 0,
        discountAmount: 0,
        deliveryOption: undefined,
      },
      onSubmit: async () => {
        await getPaymentOptions({
          leadId: leadData.name,
          packageId: packageData?.id || packageData?.name,
          queryParams: {
            ...getCheckPaymentOptionDiscountParams({
              discountType: values.discountType,
              amount: formatBahtToSatang(values.discountAmount.toString()),
              percentage: Math.round(values.discountPercent * 100).toString(),
            }),
            ...addInsuranceKindAndShipmentInPayload,
          },
        });
        showPricing(true);
        setCampaignName(values.campaignName);
      },
      validationSchema: checkPaymentValidation,
    });

    useImperativeHandle(
      ref,
      () => ({
        approver,
        maxDiscount: maxDiscount * 100,
      }),
      [approver, maxDiscount]
    );

    const formattedCampaignData = useMemo(
      () =>
        (campaignsData ?? []).map((data) => ({
          id: data.name,
          value: data,
          title: data.displayName,
        })),
      [campaignsData]
    );

    const disabled = packageData.packageSource === 'custom';

    useEffect(() => {
      if (
        !(
          (values.discountType === DiscountType.carDiscount ||
            values.discountType === DiscountType.none) &&
          packageData.packageSource !== 'custom'
        )
      ) {
        return;
      }
      if (!hasShippingFee) {
        return;
      }

      getPaymentOptions({
        leadId: leadData.name,
        packageId: packageData?.id || packageData?.name,
        queryParams: {
          ...getCheckPaymentOptionDiscountParams({
            discountType: values.discountType,
            amount: packageData?.discount?.amount,
            percentage: packageData?.discount?.percent?.toString(),
          }),
          ...addInsuranceKindAndShipmentInPayload,
        },
      })
        .then((res: any) => {
          if ('error' in res) {
            handleErrors(res.error);
            newrelic?.noticeError?.(res.error);
          }
        })
        .finally(() => {
          showPricing(true);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.discountType, hasShippingFee?.shipmentFee]);

    useEffect(() => {
      if (
        packageData?.packageSource !== 'custom' &&
        !packageData?.name?.includes('custom')
      ) {
        return;
      }
      if (!hasShippingFee) {
        return;
      }
      setFieldValue(
        'discountType',
        mapDiscountType(packageData.customQuoteDetail?.discountType)
      );
      getDiscountCampaigns({
        leadId: leadData.name,
        packageId: packageData.customQuoteDetail?.originalPackageName as string,
        discountType: mapDiscountType(
          packageData.customQuoteDetail?.discountType
        ),
      }).then((response) => {
        if ('error' in response) {
          showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
          newrelic?.noticeError?.(response.error as any);
        } else if (response.data) {
          setFieldValue(
            'campaignName',
            packageData.customQuoteDetail?.discountRequest?.source
          );
          const selectedCampaign = response.data?.find(
            (campaign) =>
              campaign.name ===
              packageData.customQuoteDetail?.discountRequest?.source
          );
          if (
            selectedCampaign?.toString() === DiscountType.selfRenewal.toString()
          ) {
            setMaxDiscount(100);
          } else {
            setMaxDiscount((selectedCampaign?.maxDiscountPercent ?? 0) / 100);
          }
        }
      });
      setFieldValue(
        'discountPercent',
        (packageData.customQuoteDetail?.discountRequest?.discountPercentage ??
          0) / 100
      );
      setFieldValue(
        'discountAmount',
        parseFloat(
          packageData.customQuoteDetail?.discountRequest?.discountAmount ?? '0'
        ) / 100
      );
      setApprover(
        packageData.customQuoteDetail?.discountRequest?.approver ?? '-'
      );
      // edit custom package case
      getPaymentOptions({
        leadId: leadData.name,
        packageId: packageData.customQuoteDetail?.originalPackageName,
        queryParams: {
          ...getDiscountParameterFromExistingCustomPackage(
            packageData.customQuoteDetail
          ),
          ...addInsuranceKindAndShipmentInPayload,
        },
      })
        .then((res: any) => {
          if ('error' in res) {
            handleErrors(res.error);
            newrelic?.noticeError?.(res.error);
          }
          showPricing(true);
        })
        .catch((err) => newrelic?.noticeError?.(err));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasShippingFee?.shipmentFee]);

    const totalAmount = useMemo(() => {
      if (packageData?.grossVoluntaryPremium) {
        return packageData.grossVoluntaryPremium;
      }
      if (packageData?.premium?.units) {
        return packageData?.premium?.units;
      }
      return '0';
    }, [packageData?.grossVoluntaryPremium]);

    const hasApproverData = useMemo(() => {
      if (maxDiscount > values.discountPercent) {
        return true;
      }

      if (!isLoadingApprover && !approverError) {
        return true;
      }

      return false;
    }, [approverError, isLoadingApprover, maxDiscount, values.discountPercent]);

    const isButtonDisabled = useMemo(() => {
      if (values.discountType === DiscountType.carDiscount) {
        return false;
      }

      if (
        values.discountType &&
        values.campaignName &&
        values.discountAmount &&
        values.discountPercent &&
        hasApproverData
      ) {
        return false;
      }

      return true;
    }, [
      values.discountType,
      values.campaignName,
      values.discountAmount,
      values.discountPercent,
      hasApproverData,
    ]);

    const handleDiscountTypeChange = (e: React.ChangeEvent<any>) => {
      resetForm();
      resetParentForm();
      setApprover('');
      showPricing(false);
      const { value: selectedValue } = e.target;
      setFieldValue('discountType', selectedValue);

      getDiscountCampaigns({
        leadId: leadData?.name,
        packageId: packageData?.id || packageData?.name,
        discountType: selectedValue,
      }).then((response) => {
        if ('error' in response) {
          showErrorSnackbar(getString('errorMessage.generalErrorMessage'));
        } else if ((response.data?.length ?? 0) > 0) {
          setFieldValue('campaignName', response.data?.[0].name);
          setMaxDiscount((response.data?.[0].maxDiscountPercent ?? 0) / 100);
        }
      });
    };

    const handleCampaignChange = (e: React.ChangeEvent<any>) => {
      showPricing(false);
      resetParentForm();
      setApprover('');
      setFieldValue('discountPercent', 0);
      setFieldValue('discountAmount', 0);

      const { value: selectedValue } = e.target;
      if (selectedValue) {
        setFieldValue('campaignName', selectedValue.name);
        if (selectedValue.displayName === DiscountType.selfRenewal.toString()) {
          setMaxDiscount(100);
        } else {
          setMaxDiscount(parseFloat(selectedValue.maxDiscountPercent) / 100);
        }
      }
    };

    const handleDiscountChange = (field: string, inputData: any) => {
      showPricing(false);
      resetParentForm();

      let fieldToSet = 'discountAmount';
      let valueToSet = 'amount';

      if (field === 'discountAmount') {
        fieldToSet = 'discountPercent';
        valueToSet = 'percent';
      }

      const { value } = inputData?.target || {};
      if (value) {
        if (!Number.isNaN(Number(value))) {
          setFieldValue(field, removeZeroPadding(value));
          if (VALID_NUMBER_PATTERN.test(value)) {
            setFieldTouched(field);
            const convertedValue = convertValueTo(
              valueToSet,
              value,
              totalAmount
            );
            if (globalProduct === 'products/car-insurance') {
              setFieldValue(fieldToSet, convertedValue);
            } else {
              setFieldValue(
                fieldToSet,
                fieldToSet === 'discountAmount'
                  ? (convertedValue / 100).toFixed(2)
                  : (convertedValue * 100).toFixed(2)
              );
            }
          }
        }
      } else {
        setFieldValue(field, 0);
        setFieldValue(fieldToSet, 0);
      }
    };

    const handleDiscountInputBlur = () => {
      if (values?.discountPercent) {
        const queryParams = {
          product: globalProduct,
          maxDiscountPercent: Math.round(values.discountPercent * 100),
          source: values.campaignName,
        };

        getApprover({
          queryParams,
        }).then((response: any) => {
          if ('error' in response) {
            handleErrors(response.error);
          } else {
            setApprover(response.data?.displayName);
          }
        });
      } else {
        setApprover('');
      }
    };

    const allowedDiscountTypes = useMemo(() => {
      const newDiscountType = [...discountTypes];

      if (packageData?.insuranceKind === 'mandatory') {
        return newDiscountType.filter(
          (type: any) => type.value === DiscountType.none
        );
      }
      if (!packageData?.discount || !packageData?.discount?.amount) {
        if (globalProduct === 'products/health-insurance') {
          return newDiscountType.filter(
            (type: any) =>
              type.value !== DiscountType.carDiscount &&
              type.value !== DiscountType.agentDiscount
          );
        }
        return newDiscountType.filter(
          (type: any) => type.value !== DiscountType.carDiscount
        );
      }

      return newDiscountType;
    }, [packageData]);

    const selectedCampaignTitle = formattedCampaignData?.find(
      (campaign: any) => campaign.id === values.campaignName
    )?.title;

    return (
      <section className="p-4 pb-2" data-testid="discount-section">
        <div className="flex items-start justify-between pb-[10px]">
          <div className="flex items-center">
            <div>
              <span className="text-primary font-bold text-base pr-2">
                {getString('discountPricing.type')}
              </span>
              <Select
                value={values.discountType}
                onChange={handleDiscountTypeChange}
                disabled={disabled}
                name="discountType"
                label={getString('text.pleaseSelect')}
                data-testid="discountType-select"
                className="min-w-[200px]"
              >
                <MenuItem value="" disabled>
                  {getString('text.pleaseSelect')}
                </MenuItem>
                {allowedDiscountTypes.map((type) => (
                  <MenuItem value={type.value} key={type.id}>
                    {getString(type.title)}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100"
              aria-hidden="true"
              role="button"
              data-testid="close-expanded-icon"
              onClick={onClose}
            >
              <CloseIcon fillColor="#a5aac0" />
            </div>
          </div>
        </div>
        {!!formattedCampaignData?.length && (
          <div
            className="grid grid-cols-4 gap-[20px]"
            data-testid="discount-options"
          >
            <div>
              <InputLabel shrink className="pb-1">
                {getString('discountPricing.campaignName')}
              </InputLabel>
              <Select
                value={values.campaignName}
                onChange={handleCampaignChange}
                disabled={disabled}
                name="campaignName"
                className="w-full"
                data-testid="campaignName-select"
                renderValue={(value: any) => {
                  const selectedOption = formattedCampaignData.find(
                    (campaign: any) => campaign.id === value
                  );
                  return selectedOption?.title;
                }}
              >
                <MenuItem value="" disabled>
                  {isCampaignsLoading
                    ? getString('text.loading')
                    : getString('text.pleaseSelect')}
                </MenuItem>
                {formattedCampaignData?.map((campaign: any) => (
                  <MenuItem value={campaign.value} key={campaign.id}>
                    {campaign.title}
                  </MenuItem>
                ))}
              </Select>
            </div>

            <div>
              <InputLabel shrink className="pb-1">
                {getString('discountPricing.discountPercentage')}
              </InputLabel>
              <div className="flex pb-[10px]">
                <Input
                  name="discountPercent"
                  value={values.discountPercent}
                  placeholder="0"
                  adornment="%"
                  variant="outlined"
                  className="border-0 pr-[5px]"
                  dataTestid="discountPercent-input"
                  generic
                  disabled={!values.campaignName || disabled}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleDiscountChange('discountPercent', event)
                  }
                  onBlur={handleDiscountInputBlur}
                  error={
                    (touched.discountPercent && errors.discountPercent) ||
                    checkCampaignDiscountError(
                      maxDiscount,
                      values.discountPercent,
                      values.discountType
                    )
                  }
                />
                <Input
                  name="discountAmount"
                  value={values.discountAmount}
                  placeholder="0"
                  adornment="THB"
                  variant="outlined"
                  className="border-0 pl-[5px] min-w-[140px]"
                  dataTestid="discountAmount-input"
                  generic
                  disabled={!values.campaignName || disabled}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleDiscountChange('discountAmount', event)
                  }
                  onBlur={handleDiscountInputBlur}
                  error={touched.discountAmount && errors.discountAmount}
                />
              </div>
              {values.discountType !== DiscountType.matchPrice &&
                selectedCampaignTitle !==
                  DiscountType.selfRenewal.toString() && (
                  <span data-testid="maxDiscount-span">
                    {getString('discountPricing.maxDiscount', {
                      percent: maxDiscount ?? 0,
                    })}
                  </span>
                )}
            </div>
            <div>
              <InputLabel shrink className="pb-1">
                {getString('discountPricing.approver')}
              </InputLabel>
              <Input
                placeholder="-"
                className="w-full"
                value={approver}
                name="approver"
                data-testid="approver-input"
                disabled
              />
            </div>
            <div className="flex my-7">
              <Button
                dataTestId="checkPaymentOptions-btn"
                text={getString('discountPricing.checkPaymentOptions')}
                className="flex items-center justify-center h-[40px] w-full -mt-[10px]"
                disabled={
                  isButtonDisabled ||
                  disabled ||
                  Boolean(
                    checkCampaignDiscountError(
                      maxDiscount,
                      values.discountPercent,
                      values.discountType
                    )
                  )
                }
                isLoading={isSubmitting}
                onClick={submitForm}
              />
            </div>
          </div>
        )}
      </section>
    );
  }
);

export default Discount;
