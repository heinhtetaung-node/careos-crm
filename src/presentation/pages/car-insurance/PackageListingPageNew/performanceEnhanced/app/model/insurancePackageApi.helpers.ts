import type {
  AggregationRequest,
  AggregationCriteriaInput,
  SearchRequest,
} from './insurancePackageApi.types';

/**
 * Normalized submodel string from lead/UI criteria (prefers `subModelText`, then `carSubModelYear`).
 * Not wired into aggregation/search request bodies; kept for reuse (e.g. filtering, analytics, future API).
 */
export function resolveSubmodelFromCriteria(
  input: AggregationCriteriaInput
): string | undefined {
  switch (true) {
    case Boolean(input.subModelText):
      return String(input.subModelText).toLowerCase().trim();
    case Boolean(input.carSubModelYear):
      return String(input.carSubModelYear).toLowerCase().trim();
    default:
      return undefined;
  }
}

function normalizeInsurancetype(
  types: AggregationCriteriaInput['insurancetype']
): string[] | undefined {
  if (!types || types.length === 0) return undefined;

  if (types.length === 1 && types[0] === 'compulsory') {
    return ['compulsory'];
  }

  const hasCompulsory = types.includes('compulsory');
  const filtered = types.filter((t) => t !== 'compulsory');
  const mapped = filtered.map((t) =>
    t.toString().toLowerCase().replace('_', ' ')
  );

  if (!hasCompulsory) {
    return mapped.length > 0 ? mapped : undefined;
  }

  const withCompulsory = mapped.map((t) => `${t} compulsory`);
  return withCompulsory.length > 0 ? withCompulsory : undefined;
}

function normalizeProvince(province: string): string[] {
  if (!province) return ['0'];
  return ['0', province.toString()];
}

/** Build aggregation request body from controller/filter state. */
export function buildAggregationRequest(
  input: AggregationCriteriaInput
): AggregationRequest {
  const vehicleregistrationpurpose = input.drivingPurpose
    ? [input.drivingPurpose]
    : undefined;
  const dashcam = input.dashCam
    ? ['required', 'not required']
    : ['not required'];
  const insurer =
    input.selectedInsurers && input.selectedInsurers.length > 0
      ? input.selectedInsurers
      : undefined;
  const insurancetype = normalizeInsurancetype(input.insurancetype);

  return {
    criteria: {
      redbookid: input.redbookId?.toLowerCase() ?? '',
      ...(vehicleregistrationpurpose && { vehicleregistrationpurpose }),
      dashcam,
      ...(insurer && {
        insurer: insurer.map((i) => i.toString().replace('insurers/', '')),
      }),
      ...(input.province && { provinces: normalizeProvince(input.province) }),
      ...(input.coverage_min != null && {
        maximumannualcoveragemin: input.coverage_min,
      }),
      ...(input.coverage_max != null && {
        maximumannualcoveragemax: input.coverage_max,
      }),
      ...(insurancetype && insurancetype.length > 0 && { insurancetype }),
      ...(input.repairtype != null && {
        repairtype: input.repairtype,
      }),
      ...(input.deductible != null && {
        deductible: input.deductible,
      }),
    },
    metrics: [
      'price_min',
      'price_max',
      'coverage_min',
      'coverage_max',
      'sub_models',
      'package_count',
    ],
    productType: 'motor',
  };
}

/** Build search request for a single insurer (when expanding row). */
export function buildSearchRequest(
  input: AggregationCriteriaInput,
  options: {
    insurerId: string;
    sortBy: 'price' | 'maximumannualcoverage';
    direction: 'asc' | 'desc';
    limit: number;
    nextToken?: string;
  }
): SearchRequest {
  const vehicleregistrationpurpose = input.drivingPurpose
    ? [input.drivingPurpose]
    : undefined;
  const dashcam = input.dashCam
    ? ['required', 'not required']
    : ['not required'];
  const insurancetype = normalizeInsurancetype(input.insurancetype);
  return {
    productType: 'motor',
    criteria: {
      redbookid: input.redbookId?.toLowerCase() ?? '',
      ...(vehicleregistrationpurpose && { vehicleregistrationpurpose }),
      dashcam,
      insurer: [options.insurerId],
      ...(insurancetype && insurancetype.length > 0 && { insurancetype }),
      ...(input.province && { provinces: normalizeProvince(input.province) }),
      ...(input.coverage_min != null && {
        maximumannualcoveragemin: input.coverage_min,
      }),
      ...(input.coverage_max != null && {
        maximumannualcoveragemax: input.coverage_max,
      }),
      ...(input.repairtype != null && { repairtype: input.repairtype }),
      ...(input.deductible != null && { deductible: input.deductible }),
    },
    attributes: [
      'insurancetype',
      'deductible',
      'submodel',
      'repairtype',
      'maximumannualcoverage',
      'display_name',
    ],
    cursor: {
      limit: options.limit,
      direction: options.direction,
      sort_by: options.sortBy,
      ...(options.nextToken && { token: options.nextToken }),
    },
  };
}
