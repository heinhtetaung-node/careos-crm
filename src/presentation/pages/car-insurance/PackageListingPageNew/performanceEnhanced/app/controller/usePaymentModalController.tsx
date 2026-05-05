import React, { useCallback, useState } from 'react';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';
import { getLead } from 'presentation/redux/actions/leadDetail/getLeadByName';
import PackageCard from 'presentation/pages/car-insurance/PackageListingPageNew/PackageCard';
import type { TransformedPackageType } from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import { isPackageSelected } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { getString } from 'presentation/theme/localization';
import { useSelectPackageMutation } from 'data/slices/packageListing/api';
import { SelectPackageRequest } from 'data/slices/packageListing/interfaces';

export interface ModalControllerProps {
  show: boolean;
  openedPackage: any[];
  handleCloseModal: () => void;
  refetchCustomPackage: (selected?: string) => Promise<void>;
  setOpenedPackage: (packages: any[]) => void;
  renderPackageCard: (
    pkg: any,
    setOpenedPackageModal?: (arg: any[]) => void
  ) => React.ReactElement;
}

interface SelectPackagePayload {
  payload: {
    paymentOption: string;
    paymentMethod: string;
    installmentPlan: number;
    insuranceKind: string;
    package: string;
  };
}

export interface PaymentModalControllerArgs {
  selectedCustomPackage?: string;
  refetchCustomPackage: (selected?: string) => Promise<void>;
  voluntryInsuranceTypes?: string[];
  lead: any;
  showErrorSnackbar: (message: string) => void;
  setExpendedPackage: (id: string) => void;
  selectedPackage: any;
  packagesForComparison: string[];
  filterValues: Record<string, any>;
  addForComparison: (id: string) => Promise<void> | void;
  removeFromComparison: (id: string) => void;
  expendedPackage: string;
}

export interface PaymentModalControllerResult {
  openedPackages: Array<string | number>;
  setOpenedPackages: React.Dispatch<
    React.SetStateAction<Array<string | number>>
  >;
  handleCloseModal: () => void;
  handleSelectPackage: (payload: SelectPackagePayload) => Promise<void>;
  handleOpenPackage: (data: any) => Promise<void> | void;
  renderPackageCard: (
    pkg: any,
    setOpenedPackageModal?: (arg: any[]) => void
  ) => React.ReactElement;
  modalProps: ModalControllerProps;
}

/**
 * Manages payment/details modal state and package card actions.
 */
export function usePaymentModalController({
  selectedCustomPackage,
  refetchCustomPackage,
  voluntryInsuranceTypes,
  lead,
  showErrorSnackbar,
  setExpendedPackage,
  selectedPackage,
  packagesForComparison,
  filterValues,
  addForComparison,
  removeFromComparison,
  expendedPackage,
}: PaymentModalControllerArgs): PaymentModalControllerResult {
  const dispatch = useAppDispatch();
  const [openedPackages, setOpenedPackages] = useState<Array<string | number>>(
    []
  );
  const [openedPackage, setOpenedPackage] = useState<any[]>([]);
  const [selectPackage] = useSelectPackageMutation();
  // Closes the details modal by clearing the currently opened package list.
  const handleCloseModal = useCallback(() => {
    setOpenedPackage([]);
  }, []);

  /**
   * Handles package selection by calling the selectPackage API and refreshing lead data on success.
   * @param payload The data payload required to select a package.
   * {
    "paymentOption": "FULL_PAYMENT",
    "paymentMethod": "ONLINECARD",
    "installmentPlan": 1,
    "insuranceKind": "MANDATORY",
    "package": "customPackages/25a0d265-4561-457b-a79b-7f6c35e1d9a4",
    }
   * @returns void
   */
  const handleSelectPackage = useCallback(
    async (payload: SelectPackagePayload) => {
      const apiPayload = {
        ...payload,
        payload: {
          ...payload.payload,
          includeCustomQuote: true,
        },
      } as SelectPackageRequest;
      try {
        await selectPackage(apiPayload).unwrap();
        dispatch(getLead());
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to select package:', err);
      }
    },
    [selectPackage, dispatch]
  );

  /**
   * Opens a package in the modal after validating required insurance type selection.
   * @param data The package data to open in the modal.
   * @returns void
   */
  const handleOpenPackage = useCallback(
    async (data: any) => {
      if (
        voluntryInsuranceTypes?.length === 0 &&
        lead?.data?.insuranceKind !== 'mandatory' &&
        !data.name.startsWith('customPackages')
      ) {
        showErrorSnackbar(getString('newPackageListing.selectInsuranceType'));
        return;
      }
      setExpendedPackage(data.id);
      setOpenedPackage((prev) => [...prev, data]);
      setOpenedPackages((prevOpenedPackages) =>
        prevOpenedPackages.includes(data?.id)
          ? prevOpenedPackages
          : [...prevOpenedPackages, data?.id]
      );
    },
    [
      voluntryInsuranceTypes,
      lead?.data?.insuranceKind,
      setExpendedPackage,
      setOpenedPackages,
      showErrorSnackbar,
    ]
  );

  /**
   * Renders a package card configured for modal interactions and compare actions.
   * @param pkg The package data to render.
   * @param setOpenedPackageModal Optional callback to set the opened package modal state.
   * @returns A React element representing the package card.
   */
  const renderPackageCard = useCallback(
    (pkg: any, setOpenedPackageModal?: (arg: any[]) => void) => {
      const x = pkg as TransformedPackageType;
      const cardProps = {
        setOpenedPackage: setOpenedPackageModal ?? setOpenedPackage,
        key: x.id,
        insurancePackage: x,
        isSelected: isPackageSelected(x, selectedPackage),
        isExpanded: expendedPackage === x.id,
        isSelectedForComparison: packagesForComparison.includes(x.id),
        disabled: (x as any).disablePackage,
        disableAction: false,
        expandPackage: setExpendedPackage,
        onComparePackage: addForComparison,
        onRemoveFromComparison: removeFromComparison,
        leadData: lead,
        filterValues,
      };
      return React.createElement(PackageCard as any, {
        ...(cardProps as any),
        isSelected: selectedCustomPackage === pkg.name,
        refetch: () => refetchCustomPackage(pkg?.name),
        handleAfterDelete: () => {
          refetchCustomPackage();
          setOpenedPackageModal?.([]);
        },
      });
    },
    [
      selectedCustomPackage,
      refetchCustomPackage,
      setOpenedPackage,
      selectedPackage,
      expendedPackage,
      packagesForComparison,
      setExpendedPackage,
      addForComparison,
      removeFromComparison,
      lead,
      filterValues,
    ]
  );

  const modalProps: ModalControllerProps = {
    show: !!openedPackage?.length,
    openedPackage,
    handleCloseModal,
    refetchCustomPackage,
    setOpenedPackage,
    renderPackageCard,
  };

  return {
    openedPackages,
    setOpenedPackages,
    handleCloseModal,
    handleSelectPackage,
    handleOpenPackage,
    renderPackageCard,
    modalProps,
  };
}
