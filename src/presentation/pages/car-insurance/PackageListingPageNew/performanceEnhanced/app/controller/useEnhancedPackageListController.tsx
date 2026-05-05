import { useCallback, useEffect, useRef, useState } from 'react';
import _camelCase from 'lodash/camelCase';
import { useNavigate } from 'react-router-dom';
import { getPackageDetailUrl } from 'presentation/routes/Urls';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import type {
  AggregationCriteriaInput,
  AggregationResponse,
  PremiumDetailResponse,
  SearchPremiumItem,
} from '../model/insurancePackageApi.types';
import {
  useGetInsurancePackageAggregationMutation,
  useGetInsurancePackageSearchMutation,
  useLazyGetInsurancePremiumDetailQuery,
  buildAggregationRequest,
  buildSearchRequest,
} from '../model/insurancePackageApi';
import premiumDetailProductToPremiumToPackage from '../model/premiumDetailToPackage';
import {
  getPremiumAttrs,
  getPremiumIdFromName,
  SEARCH_PAGE_SIZE,
} from '../../helper';
import { transformPremiumToPackage } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';

import type { GenericPackageTransformResponse as GenericPackagesResponse } from 'data/slices/genericPackageSlice';

import useInsurerNameController from './useInsurerNameController';
import { getLanguage } from 'presentation/theme/localization';

export interface UseEnhancedPackageListControllerArgs {
  genericPackages: GenericPackagesResponse;
  isLoading: boolean;
  aggregationCriteria?: AggregationCriteriaInput;
  /** When FilterTop changes, aggregation is refetched. */
  filterTopKey?: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  handleOpenPackage: (pkg: unknown) => void;
  addForComparison: (id: string) => void;
}

function buildSearchBodyOptions(
  insurerId: string,
  sortBy: string,
  sortDirection: 'asc' | 'desc',
  nextToken?: string
) {
  const resolvedSortBy: 'maximumannualcoverage' | 'price' =
    sortBy === 'maximumannualcoverage' ? 'maximumannualcoverage' : 'price';
  return {
    insurerId,
    sortBy: resolvedSortBy,
    direction: sortDirection,
    limit: SEARCH_PAGE_SIZE,
    ...(nextToken && { nextToken }),
  };
}

/**
 * Controls package aggregation, insurer expansion, premium detail fetching,
 * and package actions for the enhanced package listing view.
 */
export function useEnhancedPackageListController({
  genericPackages,
  isLoading,
  aggregationCriteria,
  filterTopKey,
  sortBy,
  sortDirection,
  handleOpenPackage,
  addForComparison: _addForComparison,
}: UseEnhancedPackageListControllerArgs) {
  const currentLocale: string = getLanguage();
  const { getInsurerName, isLoading: isInsurerNameLoading } =
    useInsurerNameController();
  const [aggregationData, setAggregationData] =
    useState<AggregationResponse | null>(null);
  const [expandedInsurerIds, setExpandedInsurerIds] = useState<string[]>([]);
  const [expandedDescriptionPremiumId, setExpandedDescriptionPremiumId] =
    useState<string | null>(null);
  const [premiumDetailsById, setPremiumDetailsById] = useState<
    Record<string, PremiumDetailResponse>
  >({});
  const [searchResultsByInsurer, setSearchResultsByInsurer] = useState<
    Record<string, SearchPremiumItem[]>
  >({});
  const [nextTokenByInsurer, setNextTokenByInsurer] = useState<
    Record<string, string>
  >({});
  const [loadingMoreInsurerIds, setLoadingMoreInsurerIds] = useState<string[]>(
    []
  );
  const [selectedSubModelByInsurer, setSelectedSubModelByInsurer] = useState<
    Record<string, string>
  >({});
  const pendingReopenInsurerIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const leadId = getLeadIdFromPath();
  const [fetchAggregation, { isLoading: isAggregationLoading }] =
    useGetInsurancePackageAggregationMutation();
  const [fetchSearch, { isLoading: isSearchLoading }] =
    useGetInsurancePackageSearchMutation();
  const [fetchPremiumDetail] = useLazyGetInsurancePremiumDetailQuery();
  const criteriaYear = aggregationCriteria?.year;
  const criteriaBrand = aggregationCriteria?.brandText;
  const criteriaModel = aggregationCriteria?.modelText;

  useEffect(() => {
    setSelectedSubModelByInsurer({});
  }, [criteriaBrand, criteriaModel]);

  const filterPremiumsBySubModel = useCallback(
    (premiums: SearchPremiumItem[], selectedSubModel?: string) => {
      const normalizedSelected = selectedSubModel
        ?.toLowerCase()
        .replace(criteriaYear?.toString().toLowerCase() ?? '', '')
        .replace(criteriaBrand?.toLowerCase().trim() ?? '', '')
        .replace(criteriaModel?.toLowerCase().trim() ?? '', '')
        .trim();
      if (!normalizedSelected) return premiums;

      return premiums.filter((premium) => {
        let premiumSubModel = getPremiumAttrs(premium)
          .submodel.toLowerCase()
          .trim();

        premiumSubModel = premiumSubModel
          ?.replace(criteriaModel?.toLowerCase().trim() ?? '', '')
          ?.trim();
        if (!premiumSubModel) return false;
        return normalizedSelected === premiumSubModel;
      });
    },
    [criteriaYear, criteriaBrand, criteriaModel]
  );

  // aggregation criteria primitives
  const criteriaSubModel =
    aggregationCriteria?.subModelText ?? aggregationCriteria?.carSubModelYear;
  const criteriaDrivingPurpose = aggregationCriteria?.drivingPurpose;
  const criteriaDashCam = aggregationCriteria?.dashCam;
  const criteriaInsurersKey =
    aggregationCriteria?.selectedInsurers
      ?.slice()
      .sort((a, b) => a.localeCompare(b))
      .join(',') ?? '';
  const criteriaProvince = aggregationCriteria?.province;

  // Refetches insurer aggregation whenever base criteria or top filter changes.
  useEffect(() => {
    if (!criteriaYear || !criteriaBrand || isInsurerNameLoading)
      return () => {};
    const selectedInsurers = criteriaInsurersKey
      ? criteriaInsurersKey.split(',')
      : undefined;
    const criteria: AggregationCriteriaInput = {
      year: criteriaYear,
      brandText: criteriaBrand,
      modelText: criteriaModel,
      subModelText:
        criteriaSubModel != null && criteriaSubModel !== ''
          ? String(criteriaSubModel)
          : undefined,
      carSubModelYear: criteriaSubModel,
      drivingPurpose: criteriaDrivingPurpose,
      dashCam: criteriaDashCam,
      province: criteriaProvince,
      selectedInsurers,
      coverage_max: aggregationCriteria?.coverage_max,
      coverage_min: aggregationCriteria?.coverage_min,
      insurancetype: aggregationCriteria?.insurancetype,
      repairtype: aggregationCriteria?.repairtype,
      deductible: aggregationCriteria?.deductible,
      redbookId: aggregationCriteria?.redbookId,
    };
    let cancelled = false;
    fetchAggregation(buildAggregationRequest(criteria))
      .unwrap()
      .then((res) => {
        if (!cancelled) {
          setAggregationData(res);
          setSearchResultsByInsurer({});
          setNextTokenByInsurer({});
          setExpandedInsurerIds([]);
        }
      })
      .catch(() => {
        if (!cancelled) setAggregationData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [
    criteriaYear,
    criteriaBrand,
    criteriaModel,
    criteriaSubModel,
    criteriaDrivingPurpose,
    criteriaDashCam,
    criteriaInsurersKey,
    criteriaProvince,
    filterTopKey,
    fetchAggregation,
    isInsurerNameLoading,
  ]);

  /**
   * Manually reloads aggregation data and resets insurer-specific cached search state.
   */
  const loadAggregation = useCallback(async () => {
    if (!aggregationCriteria?.year || !aggregationCriteria?.brandText) return;
    try {
      const res = await fetchAggregation(
        buildAggregationRequest(aggregationCriteria)
      ).unwrap();
      setAggregationData(res);
      setSearchResultsByInsurer({});
      setNextTokenByInsurer({});
      setExpandedInsurerIds([]);
    } catch {
      setAggregationData(null);
    }
  }, [aggregationCriteria, fetchAggregation, isInsurerNameLoading]);

  /**
   * Expands/collapses an insurer section and lazily loads its first page of premiums.
   * @param insurerId The ID of the insurer to toggle.
   */
  const toggleInsurer = useCallback(
    async (insurerId: string) => {
      const isExpanded = expandedInsurerIds.includes(insurerId);
      const cachedPremiums = searchResultsByInsurer[insurerId];

      if (isExpanded) {
        setExpandedInsurerIds((prev) => prev.filter((id) => id !== insurerId));
        setSearchResultsByInsurer((prev) => {
          if (!prev[insurerId]) return prev;
          const next = { ...prev };
          delete next[insurerId];
          return next;
        });
        setNextTokenByInsurer((prev) => {
          if (!prev[insurerId]) return prev;
          const next = { ...prev };
          delete next[insurerId];
          return next;
        });
        return;
      }

      setExpandedInsurerIds((prev) =>
        prev.includes(insurerId) ? prev : [...prev, insurerId]
      );

      if (!aggregationCriteria || cachedPremiums) return;
      try {
        const submodel = selectedSubModelByInsurer[insurerId];
        const bodyOptions = buildSearchBodyOptions(
          insurerId,
          sortBy,
          sortDirection
        );
        const body = buildSearchRequest(aggregationCriteria, bodyOptions);
        const res = await fetchSearch(body).unwrap();
        const filteredPremiums = filterPremiumsBySubModel(
          res.premiums ?? [],
          submodel
        );
        setSearchResultsByInsurer((prev) => ({
          ...prev,
          [insurerId]: filteredPremiums,
        }));
        setNextTokenByInsurer((prev) => ({
          ...prev,
          [insurerId]: res.nextToken ?? '',
        }));
      } catch {
        setSearchResultsByInsurer((prev) => ({ ...prev, [insurerId]: [] }));
        setNextTokenByInsurer((prev) => {
          if (!prev[insurerId]) return prev;
          const next = { ...prev };
          delete next[insurerId];
          return next;
        });
      }
    },
    [
      aggregationCriteria,
      fetchSearch,
      expandedInsurerIds,
      searchResultsByInsurer,
      selectedSubModelByInsurer,
      sortBy,
      sortDirection,
      filterPremiumsBySubModel,
    ]
  );

  /**
   * Loads the next premium page for an expanded insurer using pagination token.
   * @param insurerId The ID of the insurer to fetch more premiums for.
   * @returns The number of new premiums loaded.
   */
  const fetchMoreInsurer = useCallback(
    async (insurerId: string) => {
      const token = nextTokenByInsurer[insurerId];
      if (!token || !aggregationCriteria) return 0;

      setLoadingMoreInsurerIds((prev) =>
        prev.includes(insurerId) ? prev : [...prev, insurerId]
      );
      try {
        const submodel = selectedSubModelByInsurer[insurerId];
        const bodyOptions = buildSearchBodyOptions(
          insurerId,
          sortBy,
          sortDirection,
          token
        );
        const body = buildSearchRequest(aggregationCriteria, bodyOptions);
        const res = await fetchSearch(body).unwrap();
        const newPremiums = filterPremiumsBySubModel(
          res.premiums ?? [],
          submodel
        );
        setSearchResultsByInsurer((prev) => ({
          ...prev,
          [insurerId]: [...(prev[insurerId] ?? []), ...newPremiums],
        }));
        const { nextToken } = res;
        setNextTokenByInsurer((prev) => ({
          ...prev,
          [insurerId]: nextToken ?? '',
        }));
        return newPremiums.length;
      } catch {
        return 0;
      } finally {
        setLoadingMoreInsurerIds((prev) =>
          prev.filter((id) => id !== insurerId)
        );
      }
    },
    [
      aggregationCriteria,
      fetchSearch,
      nextTokenByInsurer,
      selectedSubModelByInsurer,
      sortBy,
      sortDirection,
      filterPremiumsBySubModel,
    ]
  );

  /**
   * Triggers infinite scroll loading when the insurer list reaches the bottom.
   * @param e The scroll event.
   * @param insurerId The ID of the insurer being scrolled.
   * @returns void
   */
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>, insurerId: string) => {
      const el = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const hasMore = Boolean(nextTokenByInsurer[insurerId]);
      const isLoadingThisInsurer = loadingMoreInsurerIds.includes(insurerId);
      if (isAtBottom && hasMore && !isLoadingThisInsurer && !isSearchLoading) {
        fetchMoreInsurer(insurerId);
      }
    },
    [
      fetchMoreInsurer,
      loadingMoreInsurerIds,
      nextTokenByInsurer,
      isSearchLoading,
    ]
  );

  /**
   * Toggles premium description expansion and fetches detail on first open.
   * @param premiumName The name of the premium to toggle.
   * @returns void
   */
  const toggleDescription = useCallback(
    (premiumName: string) => {
      const id = getPremiumIdFromName(premiumName);
      setExpandedDescriptionPremiumId((prev) => (prev === id ? null : id));
      if (expandedDescriptionPremiumId !== id && !premiumDetailsById[id]) {
        fetchPremiumDetail({ premiumId: id }).then((result) => {
          const { data } = result;
          if (data) {
            setPremiumDetailsById((prev) => ({ ...prev, [id]: data }));
          }
        });
      }
    },
    [fetchPremiumDetail, expandedDescriptionPremiumId, premiumDetailsById]
  );

  /**
   * Builds a package model from premium detail and opens it in the package modal.
   * @param premium The premium item to convert to a package.
   * @param insurerId The ID of the insurer associated with the premium.
   * @returns void
   */
  const handlePaymentClick = useCallback(
    async (premium: SearchPremiumItem, insurerId: string) => {
      const premiumId = getPremiumIdFromName(premium.name);
      let detail = premiumDetailsById[premiumId];
      if (!detail) {
        const result = await fetchPremiumDetail({ premiumId });
        const { data } = result;
        if (data) {
          detail = data;
          setPremiumDetailsById((prev) => ({ ...prev, [premiumId]: data }));
        }
      }
      if (!detail?.product) return;
      const attrs = getPremiumAttrs(premium);
      const fallbackInsuranceType = attrs.insuranceType;
      const fallbackRepairType = attrs.repairType;
      const fallbackSubModel = attrs.submodel;
      const fallbackCoverage = Number.parseInt(attrs.maximumannualcoverage, 10);

      const fallbackDeductible = Number.parseInt(attrs.deductible, 10);
      const toPackage = premiumDetailProductToPremiumToPackage(
        detail.product,
        insurerId,
        {
          insuranceType: fallbackInsuranceType,
          repairType: fallbackRepairType,
          subModel: fallbackSubModel,
          carCoverageSatang: Number.isNaN(fallbackCoverage)
            ? undefined
            : fallbackCoverage,
          deductibleSatang: Number.isNaN(fallbackDeductible)
            ? undefined
            : fallbackDeductible,
        }
      );
      const transformed: any = transformPremiumToPackage(toPackage as any);
      const insType = (
        fallbackInsuranceType ||
        toPackage.insuranceType ||
        ''
      ).trim();
      const baseInsType = insType.toLowerCase().endsWith('mandatory')
        ? insType
            .slice(0, insType.toLowerCase().lastIndexOf('mandatory'))
            .trim()
        : insType.trim();
      transformed.subtitle =
        toPackage.insuranceCategory === 'mandatory'
          ? 'packageListing.values.insuranceType.mandatory'
          : `packageListing.values.insuranceType.${_camelCase(baseInsType)}`;
      const repairRaw = (
        fallbackRepairType ||
        toPackage.repairType ||
        ''
      ).toString();
      const repairLower = repairRaw.trim().toLowerCase();
      let repairKey = '';
      if (
        repairLower.includes('dealer') ||
        repairLower.includes('authorized')
      ) {
        repairKey = 'Dealer';
      } else if (repairLower.includes('garage')) {
        repairKey = 'Garage';
      }
      transformed.repairType = repairKey
        ? `packageListing.values.repairType.${repairKey}`
        : undefined;
      const insurerDisplayName = getInsurerName(insurerId);
      transformed.title = insurerDisplayName;
      transformed.insuranceCompany = {
        ...transformed.insuranceCompany,
        displayName: insurerDisplayName,
        shortnameEn: insurerDisplayName,
        shortnameTh: insurerDisplayName,
      };
      const coverages = detail?.product?.coverages;
      const termAndCondition = coverages?.find(
        (cov) =>
          (currentLocale === 'th' &&
            ['termsAndConditionsTH', 'termAndConditionTH'].includes(
              cov?.coverageType
            )) ||
          ['termsAndConditionsEN', 'termAndConditionEN'].includes(
            cov?.coverageType
          )
      );
      const termAndConditionText = termAndCondition?.textValue;
      transformed.termsAndConditions = termAndConditionText;
      handleOpenPackage(transformed);
    },
    [fetchPremiumDetail, handleOpenPackage, premiumDetailsById, getInsurerName]
  );

  /**
   * Navigates to quotation/package detail page for the selected package id.
   * @param packageId The ID of the package to view details for.
   * @returns void
   */
  const handleQuotation = useCallback(
    (packageId: string) => {
      navigate(getPackageDetailUrl({ leadId, packageId }));
    },
    [navigate, leadId]
  );

  /**
   * Applies insurer submodel filter and schedules the insurer panel to reopen.
   * @param insurerId The ID of the insurer to update the submodel for.
   * @param value The new submodel value.
   * @returns void
   */
  const handleSubModelChange = useCallback(
    (insurerId: string, value: string) => {
      pendingReopenInsurerIdRef.current = insurerId;
      setSelectedSubModelByInsurer((s) => ({ ...s, [insurerId]: value }));
      setSearchResultsByInsurer((s) => {
        const next = { ...s };
        delete next[insurerId];
        return next;
      });
      setNextTokenByInsurer((s) => {
        const next = { ...s };
        delete next[insurerId];
        return next;
      });
      setExpandedInsurerIds((prev) => prev.filter((id) => id !== insurerId));
    },
    []
  );

  /**
   * Reopens the insurer panel after submodel change reset completes.
   * @returns void
   */
  useEffect(() => {
    const insurerId = pendingReopenInsurerIdRef.current;
    if (!insurerId) return;
    if (expandedInsurerIds.includes(insurerId)) return;
    pendingReopenInsurerIdRef.current = null;
    toggleInsurer(insurerId);
  }, [expandedInsurerIds, toggleInsurer]);

  const totalCount =
    aggregationData?.totalPackages ?? String(genericPackages?.total ?? 0);
  const displayLoading = isLoading || isAggregationLoading;
  const loadingMoreInsurerId =
    loadingMoreInsurerIds.length > 0
      ? loadingMoreInsurerIds[loadingMoreInsurerIds.length - 1]
      : null;
  const expandedInsurerId =
    expandedInsurerIds.length > 0
      ? expandedInsurerIds[expandedInsurerIds.length - 1]
      : null;

  return {
    aggregationData,
    expandedInsurerIds,
    expandedInsurerId,
    expandedDescriptionPremiumId,
    premiumDetailsById,
    searchResultsByInsurer,
    nextTokenByInsurer,
    loadingMoreInsurerIds,
    loadingMoreInsurerId,
    selectedSubModelByInsurer,
    isAggregationLoading,
    isSearchLoading,
    loadAggregation,
    toggleInsurer,
    fetchMoreInsurer,
    handleScroll,
    toggleDescription,
    handlePaymentClick,
    handleQuotation,
    handleSubModelChange,
    totalCount,
    displayLoading,
    getInsurerName,
  };
}
