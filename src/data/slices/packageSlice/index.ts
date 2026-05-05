import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

interface PackageRequest {
  packageId: string;
  isMandatory?: boolean;
}

interface PackageResponse {
  displayName: string;
  [key: string]: number | string | any;
}

const buildPackagePath = (packageId: string): string => {
  const isPremuimPackage = packageId.startsWith('premiums/');
  if (isPremuimPackage) {
    return `api/car-package/v1alpha1/packages/-/${packageId}`;
  }

  if (packageId.includes('/')) {
    return `api/car-package/v1alpha1/${packageId}`;
  }

  return `api/car-package/v1alpha1/packages/${packageId}`;
};

const packageSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPackageDetails: build.query<PackageResponse, PackageRequest>({
      query: ({ packageId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: buildPackagePath(packageId),
        }),
        method: 'GET',
      }),
    }),
    getRenewalPackageDetails: build.query<
      PackageResponse & { displayName: string },
      { packageId: string }
    >({
      query: ({ packageId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: buildPackagePath(packageId),
        }),
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useGetPackageDetailsQuery,
  useLazyGetPackageDetailsQuery,
  useLazyGetRenewalPackageDetailsQuery,
} = packageSlice;
