import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

export const useSelectedPackage = () =>
  useAppSelector((state) =>
    parseInt(
      (state.leadsDetailReducer.lead as any).payload?.data?.checkout?.package,
      10
    )
  );

export const usePackagesForComparison = () =>
  useAppSelector((state) => state.packageListingReducer.packagesForComparison);
