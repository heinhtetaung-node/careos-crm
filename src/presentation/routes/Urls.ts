import _isNil from 'lodash/isNil';
import _omitBy from 'lodash/omitBy';

export const getPackagesUrl = (leadId?: string, isHealth = false) =>
  `${isHealth ? '/health' : ''}/leads/${leadId ?? ':id'}/packages`;

type PackageDetailUrlParams = {
  leadId?: string;
  packageId?: string | number;
  otherParams?: any;
  isHealth?: boolean;
  noParams?: boolean;
  isCustom?: boolean;
};

const buildPackageDetailUrl = (params?: PackageDetailUrlParams) => {
  const {
    leadId,
    packageId,
    otherParams = {},
    isHealth = false,
    noParams = false,
    isCustom = false,
  } = params ?? {};
  const url = `${isHealth ? '/health' : ''}/leads/${leadId ?? ':id'}/detail${
    isCustom ? '/custom' : ''
  }`;

  const queryString = new URLSearchParams(
    _omitBy(
      {
        ...(noParams ? {} : otherParams),
        id: packageId,
      },
      _isNil
    )
  ).toString();
  if (queryString) {
    return `${url}?${queryString}`;
  }
  return url;
};

export const getCustomPackageDetailUrl = (
  params?: Omit<PackageDetailUrlParams, 'isCustom'>
) => buildPackageDetailUrl({ ...params, isCustom: true });

const isCustomPackageDetail = (params?: PackageDetailUrlParams): boolean => {
  if (!params) {
    return false;
  }

  if (typeof params.isCustom === 'boolean') {
    return params.isCustom;
  }

  const packageId = params.packageId?.toString() ?? '';
  return (
    packageId.startsWith('customPackages') ||
    packageId.startsWith('renewalPackages') ||
    packageId.startsWith('packages')
  );
};

export const getPackageDetailUrl = (params?: PackageDetailUrlParams) =>
  isCustomPackageDetail(params)
    ? getCustomPackageDetailUrl(params)
    : buildPackageDetailUrl(params);

export const getPackageComparisonlUrl = (params?: {
  leadId?: string;
  packageId?: string;
  otherParams?: any;
  isHealth?: boolean;
}) => {
  const {
    leadId,
    packageId,
    otherParams = {},
    isHealth = false,
  } = params ?? {};
  const url = `${isHealth ? '/health' : ''}/leads/${leadId ?? ':id'}/compare`;
  const queryString = new URLSearchParams(
    _omitBy(
      {
        ...otherParams,
        id: packageId,
      },
      _isNil
    )
  ).toString();
  if (queryString) {
    return `${url}?${queryString}`;
  }
  return url;
};

export const getBrandImportUrl = () => `/car/brand-import`;
export const getModelImportUrl = () => `/car/model-import`;
export const getRedbookImportUrl = () => `/car/redbook-import`;

// define all the routes here
export enum CRM_ROUTES {
  DISCOUNT_VOUCHER = '/discounts/voucher',
}
