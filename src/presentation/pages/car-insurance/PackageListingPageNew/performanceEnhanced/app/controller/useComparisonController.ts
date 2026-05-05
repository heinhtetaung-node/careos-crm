import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from 'presentation/redux/hooks/typedHooks';
import {
  addToComparison,
  removeFromComparison as removeFromComparisonAction,
} from 'data/slices/packageListing';
import { useLazyGetGenericPackageDetailQuery } from 'data/slices/genericPackageSlice';
import usePackageStorage from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/usePackageStorage';
import transformPackages from 'presentation/pages/car-insurance/PackageListingPageNew/packageTransformation';
import transformPackageFromGenericToNormal from 'presentation/pages/car-insurance/PackageDetailPage/transformPackageFromGenericToNormal';
import { mergePackagesForCompareBar } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { getMaximumPackageLimit } from 'data/slices/packageListing/helper';
import type { FilterInterface } from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/interface';

type AnyRecord = Record<string, any>;

export interface CompareBarControllerProps {
  packages: any[];
  savePackages: any;
  filterValues: FilterInterface;
  removePackage: (id: string) => void;
  maxCompareLimit: number;
}

export interface ComparisonControllerArgs {
  currentData: AnyRecord;
  rawPackages: any[];
  filterValues: FilterInterface;
  packagesForComparison: string[];
  maxCompareLimit?: number;
}

export interface ComparisonControllerResult {
  addForComparison: (packageId: string) => Promise<void> | void;
  removeFromComparison: (packageId: string) => void;
  compareBarProps: CompareBarControllerProps;
}

/**
 * Handles package comparison state and builds props for the compare bar.
 *
 * @param currentData Current listing context used to fetch generic package details.
 * @param rawPackages Raw package list from the listing result.
 * @param filterValues Active filter values applied to the compare bar package view.
 * @param packagesForComparison Selected package ids stored for comparison.
 * @returns Controller actions and compare bar props.
 */
export function useComparisonController({
  currentData,
  rawPackages,
  filterValues,
  packagesForComparison,
  maxCompareLimit,
}: ComparisonControllerArgs): ComparisonControllerResult {
  const dispatch = useAppDispatch();
  const [comparedPackages, setComparedPackages] = useState<any[]>([]);
  const { packageData: packagesForComparisonNew } = usePackageStorage();
  const [getGenericPackageDetail] = useLazyGetGenericPackageDetailQuery();

  /**
   * Fetches and normalizes previously selected generic packages for compare mode.
   * @returns void
   */
  const preparePackagesForComparison = async () => {
    const year = currentData?.yearValue ?? 0;
    const insuranceKind = currentData?.insuranceKind?.toString().toUpperCase();

    const validIds = packagesForComparison.filter((id) =>
      id.startsWith('premiums/')
    );

    if (!validIds.length) return;

    try {
      const packages = await Promise.all(
        validIds.map(async (id) =>
          getGenericPackageDetail({
            id,
            carSubModelYear: year,
            insuranceKind,
          }).then(({ data }) => transformPackageFromGenericToNormal(data))
        )
      );

      setComparedPackages(packages);
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Adds a package to compare state and fetches detail for generic package ids.
   * @param packageId The ID of the package to add for comparison.
   * @returns void
   */
  const addForComparison = async (packageId: string) => {
    if (packagesForComparison.includes(packageId)) {
      return;
    }
    if (!packageId.startsWith('premiums/')) {
      dispatch(
        addToComparison({
          id: packageId,
          maxLimit: maxCompareLimit ?? getMaximumPackageLimit(),
        })
      );
      return;
    }
    const response = await getGenericPackageDetail({
      id: packageId,
      carSubModelYear: currentData?.yearValue ?? 0,
      insuranceKind: currentData?.insuranceKind?.toString().toUpperCase(),
    });
    const transformed = transformPackageFromGenericToNormal(response?.data);
    const max = maxCompareLimit ?? getMaximumPackageLimit();
    const atCapacity = packagesForComparison.length >= max;
    dispatch(addToComparison({ id: packageId, maxLimit: max }));
    setComparedPackages((prev) => {
      const next = prev.filter((p) => p.name !== packageId);
      if (!atCapacity) {
        return [...next, transformed];
      }
      return [...next.slice(0, max - 1), transformed];
    });
  };

  useEffect(() => {
    if (
      packagesForComparison.length > 0 &&
      comparedPackages.length === 0 &&
      currentData?.yearValue &&
      currentData?.insuranceKind
    ) {
      preparePackagesForComparison();
    }
  }, [
    packagesForComparison,
    comparedPackages.length,
    currentData?.yearValue,
    currentData?.insuranceKind,
  ]);

  /**
   * Removes a package from local compare data and Redux comparison ids.
   * @param packageId The ID of the package to remove from comparison.
   * @returns void
   */
  const removeFromComparison = (packageId: string) => {
    setComparedPackages((prev) => prev.filter((pkg) => pkg.name !== packageId));
    dispatch(removeFromComparisonAction(packageId));
  };

  const compareBarPackages = useMemo(
    () =>
      transformPackages(
        mergePackagesForCompareBar(
          packagesForComparison,
          comparedPackages,
          rawPackages
        ),
        filterValues
      ),
    [comparedPackages, packagesForComparison, rawPackages, filterValues]
  );

  const compareBarProps: CompareBarControllerProps = {
    packages: compareBarPackages,
    savePackages: packagesForComparisonNew,
    filterValues,
    removePackage: removeFromComparison,
    maxCompareLimit: maxCompareLimit ?? getMaximumPackageLimit(),
  };

  return {
    addForComparison,
    removeFromComparison,
    compareBarProps,
  };
}
