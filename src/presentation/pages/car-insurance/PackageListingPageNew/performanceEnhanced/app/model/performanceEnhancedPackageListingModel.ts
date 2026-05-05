export interface PerformanceStatFilters {
  [key: string]: unknown;
}

export interface PerformanceEnhancedPackageListingModel {
  loadInitialData: (filters: PerformanceStatFilters) => Promise<void>;
}

export function performanceEnhancedPackageListingModel(): PerformanceEnhancedPackageListingModel {
  const loadInitialData = async (_filters: PerformanceStatFilters) => {
    throw new Error(
      'performanceEnhancedPackageListingModel.loadInitialData is not implemented.'
    );
  };

  return {
    loadInitialData,
  };
}
