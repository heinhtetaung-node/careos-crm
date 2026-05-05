import { useFormikContext } from 'formik';
import _isEqual from 'lodash/isEqual';
import React, { useEffect, useMemo } from 'react';

import { getLanguage, getString } from 'presentation/theme/localization';
import {
  getPaymentDetails,
  sortPaymentOptionKeys,
} from 'shared/helper/leadPaymentInformation';
import {
  PackageDetails,
  PaymentOption,
  PaymentOptions,
} from 'shared/types/lead';

import FormikPaymentSelection from '../PaymentSelection';

interface Props {
  isLoading?: boolean;
  packageDetails?: PackageDetails;
  paymentOptions?: PaymentOptions;
}

function PaymentSelectionSection({
  isLoading,
  packageDetails,
  paymentOptions,
}: Props) {
  const { values, setValues } = useFormikContext<{
    paymentOption: number;
    paymentMethod: number;
    issuingBank: number;
    installmentPlan: number;
  }>();

  const isCustomPackage = useMemo(() => {
    if (packageDetails == null) return false;

    return !packageDetails.priceDetails.resourceName?.startsWith('packages/');
  }, [packageDetails]);

  const paymentOptionKeys = useMemo(() => {
    if (!paymentOptions) return [];
    return sortPaymentOptionKeys(paymentOptions);
  }, [paymentOptions]);

  const paymentOptionList = useMemo(() => {
    if (paymentOptions == null) return [];

    return paymentOptionKeys.map((option, index) => ({
      // TODO Can update use the enum here instead to deal with the enum issue
      value: index,
      text: getString(
        `paymentOptions.${option
          .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          .toUpperCase()}`
      ),
    }));
  }, [paymentOptions, paymentOptionKeys]);

  const paymentMethods = useMemo(() => {
    if (paymentOptions == null) return undefined;

    const nPaymentDetails = getPaymentDetails(
      paymentOptions,
      values.paymentOption,
      values.issuingBank,
      values.installmentPlan,
      packageDetails?.paymentMethod,
      packageDetails?.cardProvider
    );

    if (
      nPaymentDetails == null ||
      values.paymentMethod >= nPaymentDetails.length
    )
      return undefined;

    return nPaymentDetails
      .map(({ paymentMethod }: { paymentMethod: string }) => paymentMethod)
      .map((method: string, index: number) => ({
        value: index,
        text: getString(`paymentMethods.${method}`),
      }));
  }, [values, paymentOptions]);

  const installmentPlans = useMemo(() => {
    if (paymentOptions == null) return undefined;

    const paymentOption =
      paymentOptions[paymentOptionKeys[values.paymentOption]];

    if (paymentOption == null || 'paymentDetails' in paymentOption)
      return undefined;

    let nInstallmentPlans: number[] = [];
    if ('availablePlans' in paymentOption) {
      nInstallmentPlans = paymentOption.availablePlans;
    } else {
      nInstallmentPlans =
        paymentOption.cardProviders[values.issuingBank].availablePlans;
    }

    return nInstallmentPlans.map((plan, index) => ({
      value: index,
      text: plan.toString(),
    }));
  }, [values, paymentOptions, paymentOptionKeys]);

  const issuingBanks = useMemo(() => {
    if (paymentOptions == null) return undefined;

    const paymentOption =
      paymentOptions[paymentOptionKeys[values.paymentOption]];

    if (
      paymentOption == null ||
      'paymentDetails' in paymentOption ||
      ('availablePlans' in paymentOption && !packageDetails?.cardProvider)
    )
      return undefined;

    return (
      'cardProviders' in paymentOption
        ? paymentOption.cardProviders
        : 'directDebitProviders' in paymentOption
          ? paymentOption.directDebitProviders
          : []
    ).map(({ displayNameEn, displayNameTh }, index) => ({
      value: index,
      text: getLanguage() === 'th' ? displayNameTh : displayNameEn,
    }));
  }, [paymentOptions, paymentOptionKeys, values]);

  useEffect(() => {
    if (!packageDetails) return;
    const paymentOption = paymentOptionList.find(
      (current) =>
        current.text ===
        getString(`paymentOptions.${packageDetails.paymentOption}`)
    );

    const paymentMethod = paymentMethods?.find(
      (current: { text: string }) =>
        current.text ===
        getString(`paymentMethods.${packageDetails.paymentMethod}`)
    );

    const installment = installmentPlans?.find(
      (current) =>
        current.text === packageDetails.numberOfInstallments.toString()
    );

    let cardProvider: number | undefined;
    if (
      packageDetails.paymentOption ===
      PaymentOption[PaymentOption.CREDIT_CARD_INSTALLMENT]
    )
      cardProvider =
        paymentOptions?.creditCardInstallment?.cardProviders?.findIndex(
          (current) => current.name === packageDetails.cardProvider
        );

    if (
      packageDetails.paymentOption ===
        PaymentOption[PaymentOption.RABBIT_CARE_INSTALLMENT] &&
      paymentMethod?.text === getString('paymentMethods.DIRECT_DEBIT')
    ) {
      cardProvider =
        paymentOptions?.rabbitCareInstallment?.directDebitProviders?.findIndex(
          (current) => current.name === packageDetails.cardProvider
        );
    }

    const newValues = {
      ...values,
      paymentOption: paymentOption?.value ?? 0,
      paymentMethod: paymentMethod?.value ?? 0,
      // Another hack
      installmentPlan: installment?.value ?? 0,
      ...(cardProvider && { issuingBank: cardProvider ?? 0 }),
    };

    if (_isEqual(values, newValues)) return;

    setValues(newValues);
  }, [
    isCustomPackage,
    paymentOptions,
    packageDetails,
    paymentOptionList,
    paymentMethods,
    installmentPlans,
    issuingBanks,
    values,
    setValues,
  ]);

  return (
    <FormikPaymentSelection
      isLoading={isLoading}
      paymentOptions={paymentOptionList}
      paymentMethods={paymentMethods}
      issuingBanks={issuingBanks}
      installmentPlans={installmentPlans}
      isFullPayment={
        // Does this work?
        paymentOptionKeys[values.paymentOption] !== 'rabbitCareInstallment'
      }
      isCustomPackage={isCustomPackage}
      isReadOnly={!!packageDetails}
    />
  );
}

export default PaymentSelectionSection;
