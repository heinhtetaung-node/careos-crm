import React, { useCallback, useEffect, useRef } from 'react';
import { getString } from 'presentation/theme/localization';
import type { GenericPackageTransformResponse as GenericPackagesResponse } from 'data/slices/genericPackageSlice';
import type {
  AggregationCriteriaInput,
  AggregationInsurerItem,
} from '../../model/insurancePackageApi.types';
import { getAggregationRanges } from '../../model/insurancePackageApi';
import { useEnhancedPackageListController } from '../../controller/useEnhancedPackageListController';
import SortableHeader from '../components/SortableHeader';
import InsurerBlock from '../components/InsurerBlock';
import {
  COLUMN_DEFINITIONS,
  COLUMN_CLASSES,
  skeletonRows,
} from 'mock-data/EnhancedPackageList.mock';

export interface EnhancedMiddleContentProps {
  handleOpenPackage: (pkg: unknown) => void;
  genericPackages: GenericPackagesResponse;
  addForComparison: (id: string) => void;
  handleSort: (column: string) => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  isLoading: boolean;
  error: { status: number; data: { message: string } } | undefined;
  fetchMore?: (insurerId: string) => Promise<number | undefined>;
  filterChanged?: boolean;
  filterTopKey?: string;
  aggregationCriteria?: AggregationCriteriaInput;
}

export default function EnhancedPackageList({
  genericPackages,
  isLoading,
  error,
  handleOpenPackage,
  addForComparison,
  handleSort,
  sortBy,
  sortDirection,
  filterTopKey,
  aggregationCriteria,
}: Readonly<EnhancedMiddleContentProps>) {
  const pendingSortReopenInsurerIdsRef = useRef<string[]>([]);
  const isSortRetogglePendingRef = useRef(false);
  const {
    aggregationData,
    expandedInsurerIds,
    expandedInsurerId,
    expandedDescriptionPremiumId,
    premiumDetailsById,
    searchResultsByInsurer,
    loadingMoreInsurerIds,
    loadingMoreInsurerId,
    selectedSubModelByInsurer,
    isSearchLoading,
    loadAggregation,
    toggleInsurer,
    handleScroll,
    toggleDescription,
    handlePaymentClick,
    handleQuotation,
    handleSubModelChange,
    totalCount,
    getInsurerName,
  } = useEnhancedPackageListController({
    genericPackages,
    isLoading,
    aggregationCriteria,
    filterTopKey,
    sortBy,
    sortDirection,
    handleOpenPackage,
    addForComparison,
  });

  const concatWithBrandModelYear = useCallback(
    (subModel: string) => {
      const modelText =
        aggregationCriteria?.modelText?.toLowerCase().trim() ?? '';
      const normalizedSubModel = subModel
        ?.toLowerCase()
        .replace(modelText, '')
        .trim();
      return [
        aggregationCriteria?.brandText,
        aggregationCriteria?.modelText,
        normalizedSubModel || undefined,
        aggregationCriteria?.year,
      ]
        .filter(Boolean)
        .join(' ');
    },
    [
      aggregationCriteria?.brandText,
      aggregationCriteria?.modelText,
      aggregationCriteria?.year,
    ]
  );

  const handleSortAndRetoggle = useCallback(
    (column: string) => {
      const currentlyExpanded = [...expandedInsurerIds];

      if (currentlyExpanded.length === 0) {
        handleSort(column);
        return;
      }

      pendingSortReopenInsurerIdsRef.current = currentlyExpanded;
      isSortRetogglePendingRef.current = true;

      currentlyExpanded.forEach((insurerId) => {
        toggleInsurer(insurerId);
      });

      handleSort(column);
    },
    [expandedInsurerIds, handleSort, toggleInsurer]
  );

  useEffect(() => {
    if (!isSortRetogglePendingRef.current) return;
    if (expandedInsurerIds.length > 0) return;

    const insurerIdsToReopen = pendingSortReopenInsurerIdsRef.current;
    pendingSortReopenInsurerIdsRef.current = [];
    isSortRetogglePendingRef.current = false;

    insurerIdsToReopen.forEach((insurerId: string) => {
      toggleInsurer(insurerId);
    });
  }, [expandedInsurerIds, toggleInsurer]);

  // Surface API errors first, even if aggregation hasn't arrived yet.
  if (error?.status) {
    return (
      <div className="mb-10 w-full text-xs">
        <div className="flex items-center justify-center py-4 px-4 bg-red-100 text-red-700 font-medium">
          {error?.data?.message ?? getString('text.error')}
        </div>
      </div>
    );
  }

  const insurers = aggregationData?.insurers ?? [];

  // Show skeleton until we have aggregation data or while base list is loading.
  if (!aggregationData || isLoading) {
    return (
      <div className="mb-10 w-full text-xs">
        <div className="flex gap-4 py-4 px-4 bg-[#E9EDF5] sticky top-0 shadow-sm font-medium">
          {COLUMN_DEFINITIONS.map((column) => (
            <div
              key={`header-skeleton-${column.id}`}
              className={column.className}
            />
          ))}
        </div>
        {skeletonRows.map((rowKey) => (
          <div
            key={rowKey}
            className="flex gap-4 py-4 px-4 bg-[#F2F3FA] h-10 animate-pulse border-b border-0 border-solid border-primaryColor border-opacity-10"
          >
            {COLUMN_DEFINITIONS.map((column) => (
              <div
                key={`row-skeleton-${rowKey}-${column.id}`}
                className={column.className}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-auto custom-scrollbar flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col mb-10 w-full text-xs">
        <div className="flex items-center justify-between py-2 bg-white rounded-t border border-gray-100 border-b-0">
          <span className="font-semibold text-sm">
            {totalCount} {getString('newPackageListing.packages')}
          </span>
          <button
            type="button"
            className="text-xs text-gray-500 hover:underline"
            onClick={() => loadAggregation()}
          >
            {getString('text.clearAll')}
          </button>
        </div>
        <div className="flex gap-4 py-4 px-4 bg-[#E9EDF5] sticky top-0 shadow-sm font-medium shrink-0">
          <div className={COLUMN_CLASSES[0]}>
            {getString('newPackageListing.packageName')}
          </div>
          <div className={COLUMN_CLASSES[1]}>
            {getString('newPackageListing.insuranceType')}
          </div>
          <div className={COLUMN_CLASSES[2]}>
            {getString('newPackageListing.repairType')}
          </div>
          <div className={COLUMN_CLASSES[3]}>
            {getString('newPackageListing.subModel')}
          </div>
          <div className={COLUMN_CLASSES[4]}>
            <SortableHeader
              label={getString('newPackageListing.carCoverage')}
              sortKey="maximumannualcoverage"
              currentSort={sortBy}
              direction={sortDirection}
              onSort={handleSortAndRetoggle}
            />
          </div>
          <div className={COLUMN_CLASSES[5]}>
            {getString('newPackageListing.deductible')}
          </div>
          <div className={COLUMN_CLASSES[6]}>
            <SortableHeader
              label={getString('newPackageListing.price')}
              sortKey="price"
              currentSort={sortBy}
              direction={sortDirection}
              onSort={handleSortAndRetoggle}
            />
          </div>
        </div>
        {insurers.length === 0 && (
          <div className="flex items-center justify-center py-4 px-4 bg-red-100 text-red-700 font-medium">
            {getString('newPackageListing.errors.no_matching_products_found')}
          </div>
        )}
        {insurers.map((insurer: AggregationInsurerItem) => {
          const expanded = expandedInsurerIds
            ? expandedInsurerIds.includes(insurer.insurerId)
            : expandedInsurerId === insurer.insurerId;
          const ranges = getAggregationRanges(insurer.metrics);
          const subModels = ranges.subModels ?? [];
          const selectedSub =
            selectedSubModelByInsurer[insurer.insurerId] ?? '';
          const premiums = searchResultsByInsurer[insurer.insurerId] ?? [];
          const isLoadingMore = loadingMoreInsurerIds
            ? loadingMoreInsurerIds.includes(insurer.insurerId)
            : loadingMoreInsurerId === insurer.insurerId;
          return (
            <InsurerBlock
              key={insurer.insurerId}
              concatWithBrandModelYear={concatWithBrandModelYear}
              insurer={insurer}
              expanded={expanded}
              ranges={ranges}
              subModels={subModels}
              selectedSub={selectedSub}
              premiums={premiums}
              isSearchLoading={isSearchLoading}
              isLoadingMore={isLoadingMore}
              onToggle={toggleInsurer}
              onSubModelChange={handleSubModelChange}
              onScroll={handleScroll}
              expandedDescriptionPremiumId={expandedDescriptionPremiumId}
              premiumDetailsById={premiumDetailsById}
              onToggleDescription={toggleDescription}
              onCompare={addForComparison}
              onPayment={handlePaymentClick}
              getInsurerName={getInsurerName}
              onQuotation={handleQuotation}
              columnClasses={COLUMN_CLASSES}
            />
          );
        })}
      </div>
    </div>
  );
}
