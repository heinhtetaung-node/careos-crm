import type { PremiumDetailProduct } from './insurancePackageApi.types';
import type { PremiumToPackage } from 'presentation/pages/car-insurance/PackageListingPageNew/packageListing.helper';
import { INSURER_LOGO_BASE_URL } from 'config/constant';
import { normalizeInsuranceTypeLabel } from '../../helper';

function normalizeRepairType(value: string): 'Dealer' | 'Garage' | '' {
  const v = (value ?? '').toString().trim().toLowerCase();
  if (!v) return '';
  if (v.includes('dealer')) return 'Dealer';
  if (v.includes('garage')) return 'Garage';
  // sometimes backend returns "Garage repair" / "Dealer repair"
  if (v.includes('authorized')) return 'Dealer';
  return '';
}

function getCovUnits(
  coverages: PremiumDetailProduct['coverages'],
  type: string
): number {
  const c = coverages.find((x) => x.coverageType === type);
  if (!c?.singleValue?.units) return 0;
  const units = Number.parseInt(c.singleValue.units, 10);
  const nanos = Number(c.singleValue.nanos ?? 0);
  if (Number.isNaN(units) || Number.isNaN(nanos)) return 0;
  const satangFromNanos = Math.round(nanos / 10_000_000);
  return units + satangFromNanos;
}

function getCovText(
  coverages: PremiumDetailProduct['coverages'],
  type: string
): string {
  const c = coverages.find((x) => x.coverageType === type);
  return c?.textValue ?? '';
}

/** Map coverageType from API to PremiumToPackage coverageDetails keys (values in satang). */
function buildCoverageDetails(coverages: PremiumDetailProduct['coverages']) {
  const byType = (type: string) => getCovUnits(coverages, type);
  return {
    maximumAnnualCoverage:
      byType('maximumAnnualCoverage') ||
      byType('ownCarDamage') ||
      byType('ownedCarDamage') ||
      0,
    theftAndFireCoverage:
      byType('theftAndFireCoverage') ||
      byType('fireAndTheft') ||
      byType('ownedCarFireTheft') ||
      0,
    floodCoverage:
      byType('floodCoverage') ||
      byType('flood') ||
      byType('ownedCarFlood') ||
      0,
    personalInjury: byType('personalInjury') || 0,
    medicalExpense: byType('medicalExpense') || 0,
    bailBond: byType('bailBond') || 0,
    propertyDamage: byType('propertyDamage') || 0,
    deathPerPerson: byType('deathPerPerson') || 0,
    maximumDeath: byType('maximumDeath') || byType('thirdPartyMaxDeath') || 0,
  };
}

/**
 * Convert premium detail product (from detail API) to PremiumToPackage shape
 * so it can be passed to transformPremiumToPackage and then to handleOpenPackage.
 */
export default function premiumDetailProductToPremiumToPackage(
  product: PremiumDetailProduct,
  insurerId: string,
  fallback?: {
    insuranceType?: string;
    repairType?: string;
    subModel?: string;
    carCoverageSatang?: number;
    deductibleSatang?: number;
  }
): PremiumToPackage {
  const { premium: p, package: pkg, coverages } = product;

  const totalPriceSatang = Number.parseInt(p.price.units, 10) || 0;

  const mandatoryPricePerYear = getCovUnits(coverages, 'mandatoryPrice');

  const insuranceType =
    getCovText(coverages, 'insuranceType') ??
    fallback?.insuranceType ??
    'Unknown';

  const insuranceTypeLower = insuranceType.toLowerCase();

  const isBothType =
    insuranceTypeLower.includes('mandatory') &&
    insuranceTypeLower.includes('type');

  const premiumSatang = isBothType
    ? totalPriceSatang
    : Math.max(0, totalPriceSatang - mandatoryPricePerYear);

  const repairTypeRaw =
    getCovText(coverages, 'repairType') ?? fallback?.repairType ?? '';

  const repairType = normalizeRepairType(repairTypeRaw) || repairTypeRaw;

  const oicCode =
    getCovText(coverages, 'oicCode') || getCovText(coverages, 'OicCode') || '';

  const deductibleText = getCovText(coverages, 'deductible');

  const deductibleSatang = Number.isNaN(Number.parseInt(deductibleText, 10))
    ? getCovUnits(coverages, 'deductible') || (fallback?.deductibleSatang ?? 0)
    : Number.parseInt(deductibleText, 10) || 0;

  const carCoverage =
    getCovUnits(coverages, 'maximumAnnualCoverage') ||
    getCovUnits(coverages, 'ownCarDamage') ||
    (fallback?.carCoverageSatang ?? 0);

  const insuranceCategory =
    insuranceType.trim().toLowerCase() === 'mandatory'
      ? 'mandatory'
      : 'voluntary';

  const logo = `${INSURER_LOGO_BASE_URL}/insurers/${insurerId}.png`;

  const packageResourceName = p.name;

  let applicableProvinces: string[] = [];

  if (pkg.applicableProvince) {
    applicableProvinces = pkg.applicableProvince.includes(',')
      ? pkg.applicableProvince.split(',').map((pge) => pge.trim())
      : [pkg.applicableProvince];
  }

  return {
    id: packageResourceName,
    packageName: pkg.packageName || p.description || '',
    insuranceType: normalizeInsuranceTypeLabel(insuranceType),
    insuranceCategory,
    repairType,
    subModel: fallback?.subModel || '',
    carCoverage,
    deductible: deductibleSatang,
    price: isBothType
      ? totalPriceSatang + mandatoryPricePerYear
      : totalPriceSatang,
    insuranceCompany: {
      name: insurerId,
      displayName: `Insurer ${insurerId}`,
      logo,
    },
    oicCode,
    startDate: pkg.validFrom || '',
    expiryDate: pkg.validTo || '',
    mandatoryPricePerYear,
    premium: premiumSatang,
    coverageDetails: buildCoverageDetails(coverages),
    termsAndConditions: pkg.wording || '',
    applicableProvinces,
  };
}
