import { getString } from 'presentation/theme/localization';
import type { SearchPremiumItem } from './app/model/insurancePackageApi.types';
import { formatCurrency } from 'shared/helper/utilities';

export interface PerformanceStatFilters {
  status: string[];
  team: string[];
}

export const initialFilterValues: PerformanceStatFilters = {
  status: [],
  team: [],
};

export function formatPriceUnits(units: string): string {
  const num = Number.parseInt(units, 10);
  if (Number.isNaN(num)) return units;
  return formatCurrency(num, true);
}

// --- Shared helpers for performanceEnhanced package listing ---

export function getPremiumAttrs(premium: SearchPremiumItem) {
  const out = Object.fromEntries(
    premium.attributes.map((c) => [
      c.label,
      c.string ??
        c.float ??
        (typeof c.bool === 'boolean' ? String(c.bool) : ''),
    ])
  ) as Record<string, string | number>;

  return {
    insuranceType: String(out.insurancetype ?? ''),
    repairType: String(out.repairtype ?? ''),
    submodel: String(out.submodel ?? ''),
    maximumannualcoverage: formatCurrency(
      Number(out.maximumannualcoverage) / 100
    ),
    deductible: String(out.deductible ?? ''),
    display_name: String(out.display_name ?? ''),
  };
}

/** Extract premium ID from name "premiums/uuid" for detail API. */
export function getPremiumIdFromName(name: string): string {
  return name.replace(/^premiums\//, '');
}

export const normalizeInsuranceTypeLabel = (value?: string): string => {
  if (!value) return '';
  const mandatoryLocale = getString('insuranceTypes.mandatorySm'); // ชั้น 2+ พรบ
  const typeLocale = getString('packageListing.insuranceTypeSm');
  if (['compulsory', 'mandatory'].includes(value.toLowerCase())) {
    return mandatoryLocale;
  }
  return value
    .replaceAll(/compulsory/gi, mandatoryLocale)
    .replaceAll(/mandatory/gi, mandatoryLocale)
    .replaceAll(/type/gi, typeLocale);
};

// Default page size for insurer package search
export const SEARCH_PAGE_SIZE = 50;
