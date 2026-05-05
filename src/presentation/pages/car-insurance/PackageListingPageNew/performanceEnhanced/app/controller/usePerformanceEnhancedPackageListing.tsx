import { CarDetails } from '@alphafounders/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { useFormik } from 'formik';
import { useParams } from 'react-router-dom';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { usePackagesForComparison } from 'data/slices/packageListing';
import useSnackbar from 'utils/snackbar';
import { getString } from 'presentation/theme/localization';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import useTransformedPackages from 'presentation/pages/car-insurance/PackageListingPageNew/hooks/useTransformedPackages';
import InsurerList from 'mock-data/InsurersList.mock';
import type { FilterInterface } from 'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/interface';
import type { GenericPackageTransformResponse } from 'data/slices/genericPackageSlice';
import type { AggregationCriteriaInput } from 'presentation/pages/car-insurance/PackageListingPageNew/performanceEnhanced/app/model/insurancePackageApi.types';
import { PackagesList } from 'presentation/components/Packages/PackagesList';
import {
  ModalControllerProps,
  usePaymentModalController,
} from 'presentation/pages/car-insurance/PackageListingPageNew/performanceEnhanced/app/controller/usePaymentModalController';
import {
  useComparisonController,
  type CompareBarControllerProps,
} from 'presentation/pages/car-insurance/PackageListingPageNew/performanceEnhanced/app/controller/useComparisonController';
import { GenericPackagesResponse } from '../../../types';
import { useInsuranceKindFilterSync } from '../../../useInsuranceKindFilterSync';

export interface PerformanceEnhancedLayoutState {
  showFilterTop: boolean;
  showMainContent: boolean;
}

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
  /** When FilterTop values change, aggregation is refetched. */
  filterTopKey?: string;
  /** Criteria from controller to drive aggregation/search. When set, calls aggregation API. */
  aggregationCriteria?: AggregationCriteriaInput;
}

export interface EnhancedMiddleProps {
  handleOpenPackage: (pkg: any) => void;
  genericPackages: GenericPackageTransformResponse;
  addForComparison: (id: string) => void;
  handleSort: (column: string) => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  isLoading: boolean;
  error: { status: number; data: { message: string } } | undefined;
  fetchMore: (insurer: string) => Promise<number>;
  filterChanged: boolean;
  filterTopKey: string;
  aggregationCriteria?: AggregationCriteriaInput;
}

export interface FilterSideBarProps {
  filter: {
    values: FilterInterface;
    setValues: (values: FilterInterface) => void;
  };
  currentData: any;
  setCurrentData: (data: any) => void;
  rawPackages: any;
  setInitialCar: (data: any) => void;
  setForceRefreshingTable?: (data: any) => void;
}

export interface FilterTopProps {
  initialPriceRange: [number, number];
  priceRange?: [number, number];
  onPriceRangeChange: (range: [number, number] | undefined) => void;
  insuranceTypes: string[];
  onInsuranceTypesChange: (types: string[]) => void;
  repairTypes: string[];
  onRepairTypesChange: (types: string[]) => void;
  deductibles: string[];
  onDeductiblesChange: (deductibles: string[]) => void;
  selectedInsurers: string[];
  onSelectedInsurersChange: (insurers: string[]) => void;
}

export interface PackagesListControllerProps {
  forceRefreshingTable: boolean;
  listProps: ComponentProps<typeof PackagesList>;
}

export interface PerformanceEnhancedControllerResult {
  layoutState: PerformanceEnhancedLayoutState;
  filterSideBarProps: FilterSideBarProps;
  filterTopProps: FilterTopProps;
  enhancedMiddleProps: EnhancedMiddleContentProps;
  packagesListProps: PackagesListControllerProps;
  modalProps: ModalControllerProps;
  compareBarProps: CompareBarControllerProps;
  packagesCountLabel: string;
}

export function usePerformanceEnhancedPackageListing(): PerformanceEnhancedControllerResult {
  const flags = useFlags([
    FeatureFlags.BROK_5517_ENABLE_3_PACKAGE_COMPARISON_20260420_TEMP,
  ]);
  const is3PackageComparisonEnabled =
    flags[FeatureFlags.BROK_5517_ENABLE_3_PACKAGE_COMPARISON_20260420_TEMP]
      ?.enabled ?? false;
  const maxCompareLimit = is3PackageComparisonEnabled ? 3 : 2;

  const [priceRange, setPriceRange] = useState<[number, number]>();
  const [insuranceTypes, setInsuranceTypes] = useState<string[]>([]);
  const [repairTypes, setRepairTypes] = useState<string[]>([]);
  const [deductibles, setDeductibles] = useState<string[]>([]);
  const [selectedInsurers, setSelectedInsurers] = useState<string[]>(() =>
    InsurerList.map((insurer) => insurer.key)
  );
  const [forceRefreshingTable, setForceRefreshingTable] = useState(false);
  const [currentScroll, setCurrentScroll] = useState<number>(0);
  const [initialCar, setInitialCar] = useState<any>({});
  const lead = useGetLeadSelector();
  const { updateLead } = useLeadUpdater(lead?.name);
  const [selectedCustomPackage, setSelectedCustomPackage] = useState<string>();
  const [filterChanged, setFilterChanged] = useState(false);
  const [initialPriceRange, setInitialPriceRange] = useState<[number, number]>([
    0, 10000000000,
  ]);
  const [showFilterTop, setShowFilterTop] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [currentData, setCurrentData] = useState<any>({});
  const [sortBy, setSortBy] = useState<string>('premium_value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const params = useParams<{ id: string }>();
  const [expendedPackage, setExpendedPackage] = useState('');
  const [openPopupId, setOpenPopupId] = useState<string | null>(null);
  const selectedPackage = lead?.data?.checkout?.package ?? '';
  const packagesForComparison = usePackagesForComparison();
  const voluntryInsuranceTypes = lead?.data?.voluntaryInsuranceType;
  const { showErrorSnackbar } = useSnackbar();
  const filter = useFormik<FilterInterface>({
    initialValues: {} as FilterInterface,
    onSubmit: () => undefined,
  });

  // Stub for generic packages (no useGenericPackagesWithInsurers here)
  const genericPackages = useMemo(
    () => ({ packages: [] as any[], total: 0 }),
    []
  );

  const isLoading = false;
  const error = undefined;
  const fetchMore = useCallback(async (_insurer: string) => 0, []);

  /**
   * sections for calling controllers and hooks to manage data fetching, state, and user interactions, ensuring separation of concerns and optimized performance
   */
  const {
    customPackages: _customPackages,
    manualRenewalImportPackages,
    rawPackages,
    carDetails,
    refetch,
  } = useTransformedPackages(
    params?.id ?? '',
    filter.values,
    true,
    currentData
  );

  const refetchCustomPackage = useCallback(
    async (selected?: string) => {
      setForceRefreshingTable(true);
      if (selected) {
        setSelectedCustomPackage(selected);
      }
      try {
        await refetch();
      } finally {
        setForceRefreshingTable(false);
      }
    },
    [refetch]
  );

  const { addForComparison, removeFromComparison, compareBarProps } =
    useComparisonController({
      currentData,
      rawPackages,
      filterValues: filter.values,
      packagesForComparison,
      maxCompareLimit,
    });

  const {
    handleSelectPackage,
    handleOpenPackage,
    renderPackageCard,
    modalProps,
    openedPackages,
    setOpenedPackages,
  } = usePaymentModalController({
    selectedCustomPackage,
    refetchCustomPackage,
    voluntryInsuranceTypes,
    lead,
    showErrorSnackbar,
    setExpendedPackage,
    selectedPackage,
    packagesForComparison,
    filterValues: filter.values,
    addForComparison,
    removeFromComparison,
    expendedPackage,
  });

  /**
   * useMemo section for derived data and props to optimize performance and prevent unnecessary re-renders
   */
  const customPackages = useMemo(
    () => [..._customPackages, ...manualRenewalImportPackages],
    [_customPackages, manualRenewalImportPackages]
  );

  // Memoized packages list for PackagesList (deduped + enriched)
  const packagesForList = useMemo(() => {
    const carDetailsDisplay = carDetails as CarDetails;
    return customPackages
      .filter(
        (pkg: any, index: number, self: any) =>
          index === self.findIndex((t: any) => t.name === pkg.name)
      )
      .map((pkg: any) => ({
        ...pkg,
        subModel: carDetailsDisplay?.displayName,
        noOfDoors: carDetailsDisplay?.doors,
        engineSize: carDetailsDisplay?.engineSize,
      }));
  }, [customPackages, carDetails]);

  const filterValues = useMemo(
    () => ({
      ...currentData,
      engineSize: currentData?.engineSize,
      noOfDoors: currentData?.noOfDoors,
    }),
    [currentData]
  );

  const filterTopKey = useMemo(
    () =>
      JSON.stringify({
        priceRange,
        insuranceTypes,
        repairTypes,
        deductibles,
        selectedInsurers,
      }),
    [priceRange, insuranceTypes, repairTypes, deductibles, selectedInsurers]
  );

  const packagesCountLabel = useMemo(
    () =>
      `${genericPackages?.total ?? 0} ${getString(
        'newPackageListing.packages'
      )}`,
    [genericPackages?.total]
  );

  const setInsuranceCategory = useCallback(
    (insuranceKind: string) =>
      filter.setFieldValue('insuranceCategory', insuranceKind),
    [filter.setFieldValue]
  );
  const handleInsuranceTypesChange = useInsuranceKindFilterSync({
    leadData: lead?.data,
    updateLead,
    setInsuranceTypes,
    setInsuranceCategory,
    setCurrentData,
  });

  const handleSort = useCallback(
    (column: string) => {
      setSortBy(column);
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    },
    [sortDirection]
  );

  const prepareInitialPriceRange = useCallback(() => {
    const maxAnnualCoverageArray = (genericPackages?.packages ?? []).flatMap(
      (pkg: any) =>
        pkg.packages.map(
          (pkgDetail: any) => pkgDetail.coverageDetails.maximumAnnualCoverage
        )
    );

    if (!maxAnnualCoverageArray.length) {
      return;
    }

    const flatMaxAnnualCoverageArray = [...maxAnnualCoverageArray];
    setInitialPriceRange([
      Math.min(...flatMaxAnnualCoverageArray),
      Math.max(...flatMaxAnnualCoverageArray),
    ]);
  }, [genericPackages?.packages]);

  /**
   * useEffects for staggered display and data fetching/updating, ensuring side effects are handled correctly
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => setShowFilterTop(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!showFilterTop) return () => {};
    const id = requestAnimationFrame(() => setShowMainContent(true));
    return () => cancelAnimationFrame(id);
  }, [showFilterTop]);

  useEffect(() => {
    const selected = lead?.data?.checkout?.package;
    // Selecting a package updates lead.checkout.package; this effect keeps the
    // custom list in sync, but must not refetch in a loop when callbacks change.
    if (!selected) return;
    if (selectedCustomPackage === selected) return;
    refetchCustomPackage(selected);
  }, [
    lead?.data?.checkout?.package,
    selectedCustomPackage,
    refetchCustomPackage,
  ]);

  useEffect(() => {
    if (
      currentData?.carSubModelYear &&
      lead?.data?.carSubModelYear &&
      currentData?.carSubModelYear !== lead?.data?.carSubModelYear
    ) {
      refetch();
    }
  }, [currentData?.carSubModelYear, lead?.data?.carSubModelYear, refetch]);

  useEffect(() => {
    setFilterChanged(true);
    const timer = setTimeout(() => setFilterChanged(false), 100);
    return () => clearTimeout(timer);
  }, [
    priceRange,
    insuranceTypes,
    repairTypes,
    deductibles,
    selectedInsurers,
    currentData?.yearValue,
    currentData?.brandText,
    currentData?.modelText,
    currentData?.subModelText,
    currentData?.drivingPurpose,
    currentData?.dashCam,
  ]);

  useEffect(() => {
    if (genericPackages && genericPackages?.packages?.length > 0) {
      prepareInitialPriceRange();
    }
  }, [
    insuranceTypes,
    repairTypes,
    deductibles,
    selectedInsurers,
    currentData?.yearValue,
    currentData?.brandText,
    currentData?.modelText,
    currentData?.subModelText,
    currentData?.drivingPurpose,
    currentData?.dashCam,
    genericPackages,
    prepareInitialPriceRange,
  ]);

  useEffect(() => {
    if (
      !priceRange &&
      genericPackages &&
      genericPackages?.packages?.length > 0
    ) {
      prepareInitialPriceRange();
    }
  }, [priceRange, genericPackages, prepareInitialPriceRange]);

  /**
   * Props for components
   */
  const layoutState: PerformanceEnhancedLayoutState = {
    showFilterTop,
    showMainContent,
  };

  const filterSideBarProps: FilterSideBarProps = useMemo(
    () => ({
      filter,
      currentData,
      setCurrentData,
      rawPackages,
      setInitialCar,
      setForceRefreshingTable,
    }),
    [
      filter,
      currentData,
      setCurrentData,
      rawPackages,
      setInitialCar,
      setForceRefreshingTable,
    ]
  );

  // Memoized props for FilterTop
  const filterTopProps: FilterTopProps = useMemo(
    () => ({
      initialPriceRange,
      priceRange,
      onPriceRangeChange: setPriceRange,
      insuranceTypes,
      onInsuranceTypesChange: handleInsuranceTypesChange,
      repairTypes,
      onRepairTypesChange: setRepairTypes,
      deductibles,
      onDeductiblesChange: setDeductibles,
      selectedInsurers,
      onSelectedInsurersChange: setSelectedInsurers,
    }),
    [
      initialPriceRange,
      priceRange,
      insuranceTypes,
      handleInsuranceTypesChange,
      repairTypes,
      deductibles,
      selectedInsurers,
    ]
  );

  const deductibleMap = {
    no_deductible: 'false',
    only_deductible: 'true',
  };

  const [defaultCoverageMin, defaultCoverageMax] = initialPriceRange;

  const enhancedMiddleProps: EnhancedMiddleContentProps = {
    handleOpenPackage,
    genericPackages,
    addForComparison,
    handleSort,
    sortBy,
    sortDirection,
    isLoading,
    error,
    fetchMore,
    filterChanged,
    filterTopKey,
    aggregationCriteria: {
      year: currentData?.yearValue ?? currentData?.year,
      brandText: currentData?.brandText,
      modelText: currentData?.modelText,
      subModelText: currentData?.subModelText,
      carSubModelYear: currentData?.carSubModelYear,
      redbookId: currentData?.redbookId,
      drivingPurpose: currentData?.drivingPurpose,
      dashCam: currentData?.dashCam,
      selectedInsurers,
      insurancetype: insuranceTypes,
      repairtype: repairTypes?.map?.((type) => type.concat(' repair')) ?? [],
      coverage_min:
        priceRange?.[0] ??
        currentData?.maximumAnnualCoverageMin ??
        currentData?.maximumAnnualCoverage ??
        defaultCoverageMin,
      coverage_max:
        priceRange?.[1] ??
        currentData?.maximumAnnualCoverageMax ??
        currentData?.maximumAnnualCoverage ??
        defaultCoverageMax,
      deductible:
        deductibles?.map(
          (d) => deductibleMap[d as keyof typeof deductibleMap]
        ) ?? [],
      province: currentData?.province,
    },
  };

  const packagesListProps: PackagesListControllerProps = {
    forceRefreshingTable,
    listProps: {
      showAlsoManualAndRenewal: true,
      setForceRefreshingTable,
      setOpenedPackages,
      openedPackages,
      setOpenPopupId,
      id: 'tset-cus',
      packages: packagesForList,
      renderPackageCard,
      setExpendedPackage,
      packageType: 'custom',
      scrollableHeight: '400px',
      carSubModelYear: currentData?.carSubModelYear ?? '',
      handleCompare: addForComparison,
      leadId: params?.id ?? '',
      selectedPackage: selectedCustomPackage,
      selectPackage: handleSelectPackage,
      noOfDoors: filter.values.noOfDoors?.toString(),
      engineSize: filter.values.engineSize?.toString(),
      expendedPackage,
      currentScroll,
      setCurrentScroll,
      openPopUpId: openPopupId,
      subModels: [],
      previousCarInformation: '',
      filterValues,
      initialCar,
      voluntryInsuranceTypes: lead?.data?.voluntaryInsuranceType,
    },
  };

  return {
    layoutState,
    filterSideBarProps,
    filterTopProps,
    enhancedMiddleProps,
    packagesListProps,
    modalProps,
    compareBarProps,
    packagesCountLabel,
  };
}
