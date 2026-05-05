export interface MoneyValue {
  currencyCode: string;
  units: string;
  nanos: number;
}

type RedbookVehicleKey = {
  redbookid: string;
};

type CriteriaVehicleKey = {
  year: number;
  brand: string;
  model: string;
};

type VehicleKey = RedbookVehicleKey | CriteriaVehicleKey;

type CommonCriteriaFields = {
  vehicleregistrationpurpose?: string[];
  dashcam?: string[];
  insurer?: string[];
  province?: string[];
  coverage_min?: number;
  coverage_max?: number;
};

/** Vehicle identity is either a Red Book ID or the combination of year + brand + model. */
export type AggregationCriteria = VehicleKey & CommonCriteriaFields;

export type AggregationMetricLabel =
  | 'price_min'
  | 'price_max'
  | 'coverage_min'
  | 'coverage_max'
  | 'sub_models'
  | 'package_count'
  | 'insurancetype'
  | 'repairtype'
  | 'deductible';

export interface AggregationMetricMoney {
  label: Exclude<AggregationMetricLabel, 'sub_models' | 'package_count'>;
  money: MoneyValue;
}

export interface AggregationMetricList {
  label: 'sub_models';
  listValue: string[];
}

export interface AggregationMetricCount {
  label: 'package_count';
  count: string;
}

export type AggregationMetric =
  | AggregationMetricMoney
  | AggregationMetricList
  | AggregationMetricCount;

export interface AggregationInsurerItem {
  insurerId: string;
  packageCount: string;
  metrics: AggregationMetric[];
}

export interface AggregationRequest {
  criteria: AggregationCriteria;
  metrics: AggregationMetricLabel[];
  productType: 'motor';
}

export interface AggregationResponse {
  totalPackages: string;
  insurers: AggregationInsurerItem[];
}

/** Vehicle identity is either a Red Book ID or the combination of year + brand + model. */
export type SearchCriteria = VehicleKey & CommonCriteriaFields;

export type SearchAttributeLabel =
  | 'insurancetype'
  | 'deductible'
  | 'submodel'
  | 'repairtype'
  | 'coverage_min'
  | 'coverage_max'
  | 'coverage_price'
  | 'maximumannualcoverage'
  | 'display_name';
export interface SearchCursor {
  limit: number;
  direction: 'asc' | 'desc';
  sort_by: 'price' | 'maximumannualcoverage';
  token?: string;
}
export interface SearchRequest {
  productType: 'motor';
  criteria: SearchCriteria;
  attributes: SearchAttributeLabel[];
  cursor: SearchCursor;
}

export interface PremiumAttribute {
  money?: MoneyValue;
  label: string;
  string?: string;
  float?: number;
  bool?: boolean;
}

export interface SearchPremiumItem {
  name: string;
  productType: string;
  attributes: PremiumAttribute[];
  price: MoneyValue;
  premiumId: string;
}

export interface SearchResponse {
  premiums: SearchPremiumItem[];
  totalCount: string;
  currentCount: string;
  nextToken?: string;
}

export interface PremiumDetailPremium {
  name: string;
  premiumId: string;
  price: MoneyValue;
  description: string;
  createTime: string;
  updateTime: string;
  deleteTime: string | null;
  redbookId: string;
  insurerCarId: string;
  valueRatio: number;
}

export interface PremiumDetailPackage {
  name: string;
  packageId: string;
  insurerReferenceCode: string;
  packageName: string;
  insurer: string;
  wording: string;
  validFrom: string;
  validTo: string;
  description: string;
  purchaseReady: boolean;
  applicableProvince: string;
  createTime: string;
  updateTime: string;
  deleteTime: string | null;
}

export interface PremiumDetailCoverage {
  name: string;
  coverageId: string;
  coverageType: string;
  coverageName: string;
  textValue: string;
  singleValue: MoneyValue | null;
  minValue: unknown;
  avgValue: unknown;
  maxValue: unknown;
  limit: unknown;
  isAddOn: boolean;
  addOnPremium: unknown;
  addOnDefaultStatus: boolean;
  displayOrder: number;
  description: string;
  createTime: string;
  updateTime: string;
  deleteTime: string | null;
}

export interface PremiumDetailProduct {
  premium: PremiumDetailPremium;
  package: PremiumDetailPackage;
  coverages: PremiumDetailCoverage[];
}

export interface PremiumDetailResponse {
  product: PremiumDetailProduct;
}

export interface AggregationCriteriaInput {
  year?: number;
  brandText?: string;
  modelText?: string;
  subModelText?: string;
  carSubModelYear?: string | number;
  redbookId?: string | null;
  drivingPurpose?: 'personal' | 'commercial';
  dashCam?: boolean;
  selectedInsurers?: string[];
  insurancetype?: string[];
  repairtype?: string[];
  coverage_min?: number;
  coverage_max?: number;
  deductible?: string[];
  province?: string;
}

export function getAggregationMetricValue<T>(
  metrics: AggregationMetric[],
  label: AggregationMetricLabel
): T | undefined {
  const m = metrics.find((x) => x.label === label);
  if (!m) return undefined;
  if ('money' in m && m.money) return m.money.units as unknown as T;
  if ('listValue' in m && m.listValue) return m.listValue as unknown as T;
  return undefined;
}

export function getAggregationRanges(metrics: AggregationMetric[]) {
  const toNum = (u: string | undefined) =>
    u ? Number.parseInt(u, 10) : undefined;
  return {
    priceMin: toNum(getAggregationMetricValue<string>(metrics, 'price_min')),
    priceMax: toNum(getAggregationMetricValue<string>(metrics, 'price_max')),
    coverageMin: toNum(
      getAggregationMetricValue<string>(metrics, 'coverage_min')
    ),
    coverageMax: toNum(
      getAggregationMetricValue<string>(metrics, 'coverage_max')
    ),
    subModels: getAggregationMetricValue<string[]>(metrics, 'sub_models') ?? [],
  };
}
