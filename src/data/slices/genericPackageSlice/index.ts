import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';
import { PackageGroup } from 'presentation/pages/car-insurance/PackageListingPageNew/types';
import { INSURER_LOGO_BASE_URL } from 'config/constant';
import { CommonPackageInterface } from '../orderPolicySlice/interface';

export interface CoverageDetails {
  maximumAnnualCoverage: number;
  personalInjury: number;
  medicalExpense: number;
  bailBond: number;
  propertyDamage: number;
  deathPerPerson: number;
  maximumDeath: number;
  floodCoverage: number;
  theftAndFireCoverage: number;
}
interface GenericPackageResponse {
  packages: {
    packages: Array<{
      packageDetail: {
        premiumPackage: any;
        packageName: string;
        insuranceType: string;
        repairType: string;
        insurerCarName: string;
        deductibleAmount: {
          currencyCode: string;
          units: string;
          nanos: number;
        } | null;
        premium: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        insuranceCompanyName: string;
        hasCctvDiscount: boolean;
        validFrom: string;
        validTo: string;
        oicCode: string;
        ownCarDamage: any;
        maximumAnnualCoverage: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        personalInjury: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        personalMedicalExpense: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        personalBailBond: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        thirdPartyPropertyDamage: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        thirdPartyDeathPerPerson: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        thirdPartyMaxDeath: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        ownedCarFlood: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        ownedCarFireTheft: {
          currencyCode: string;
          units: string;
          nanos: number;
        };
        termsAndConditions: string;
        applicableProvinces: string;
        purchaseReady: boolean;
        dashCam: string;
      };
    }>;
  };
  nextToken?: string;
  totalCount?: string;
  currentCount?: string;
}

export interface InsurancePackageDetailResponse {
  package: Package;
  insurer: Insurer;
  sumInsured: string;
  sumInsuredSource: string;
  sumInsuredMin: string;
  sumInsuredMax: string;
  sumInsuredDefault: string;
  couponDiscount: string;
  invoicePrice: string;
  grossVoluntaryPremium: string;
  grossMandatoryPremium: string;
  firstInstallment: string;
  remainingInstallment: string;
}

export interface Package extends CommonPackageInterface {
  startTime: string | null;
  isLowCost: boolean;
  provinces: string[];
  gender: string;
  carUsingPurpose: string;
  noClaimBonus: string;
  excessType: string;
  minYearsOfHoldingDriverLicense: number;
  maxYearsOfHoldingDriverLicense: number;
  minNumberOfClaimsInYear: number;
  maxNumberOfClaimsInYear: number;
  maxAge: number;
  minAge: number;
  minMileage: number;
  maxMileage: number;
  carSubmodels: string[];
  insuranceCategory: string;
  packageType: string;
  noClaimBonusAmount: string;
  claimValue: string;
  numberOfClaims: number;
  lead: string;
  searchable: boolean;
  createBy: string;
  priceResourceName: string;
  customPackageStatus: string;
}

export interface Insurer {
  name: string;
  displayName: string;
  displayNameTh: string;
  shortnameEn: string;
  shortnameTh: string;
  rating: number;
  order: number;
  logo: string;
  phone: string;
  website: string;
  taxId: string;
  ticker: string;
  fax: string;
  addressEn: string;
  addressTh: string;
  contactEmail: string;
  contactPersonName: string;
  infoEn: string;
  infoTh: string;
  carPicturesRequired: boolean;
  brokerCode: string;
}

// Helper function to convert monetary values from {units, nanos} format to number
const convertMonetaryValue = (
  monetaryValue: {
    units: string;
    nanos: number;
  } | null
): number => {
  if (!monetaryValue) return 0;
  const units = parseFloat(monetaryValue.units) || 0;
  const nanos = monetaryValue.nanos || 0;
  return units + nanos / 1000000000; // Convert nanos to units
};

// Helper function to calculate pricing based on insurance type
export const calculateInsurancePricing = (
  insuranceType: string,
  totalPrice: number,
  packageDetail: any
): { mandatoryPricePerYear: number; premium: number } => {
  const voluntaryPrice = packageDetail?.voluntaryPrice
    ? convertMonetaryValue(packageDetail.voluntaryPrice)
    : 0;
  const mandatoryPrice = packageDetail?.mandatoryPrice
    ? convertMonetaryValue(packageDetail.mandatoryPrice)
    : 0;

  // Handle Mandatory insurance type
  if (insuranceType === 'Mandatory') {
    return {
      mandatoryPricePerYear: totalPrice,
      premium: 0,
    };
  }

  // Handle combined insurance types (e.g., "Type 1 Mandatory", "Type 2 Mandatory", "Type 1+ Mandatory")
  // Use regex to match insurance types like "Type 1 Mandatory", "Type 2 Mandatory", "Type 1+ Mandatory", etc.
  if (/^Type \d+\+? Mandatory$/.test(insuranceType ?? '')) {
    return {
      mandatoryPricePerYear: mandatoryPrice || totalPrice,
      premium: voluntaryPrice || totalPrice,
    };
  }

  // Handle voluntary insurance types
  return {
    mandatoryPricePerYear: 0,
    premium: totalPrice,
  };
};
export interface GenericPackageTransformResponse {
  packages: PackageGroup[];
  total: number;
  nextToken?: string;
}

export const extractCoverageDetails = (
  packageDetail: any
): CoverageDetails => ({
  maximumAnnualCoverage: convertMonetaryValue(
    packageDetail.maximumAnnualCoverage
  ),
  personalInjury: convertMonetaryValue(packageDetail.personalInjury),
  medicalExpense: convertMonetaryValue(packageDetail.personalMedicalExpense),
  bailBond: convertMonetaryValue(packageDetail.personalBailBond),
  propertyDamage: convertMonetaryValue(packageDetail.thirdPartyPropertyDamage),
  deathPerPerson: convertMonetaryValue(packageDetail.thirdPartyDeathPerPerson),
  maximumDeath: convertMonetaryValue(packageDetail.thirdPartyMaxDeath),
  floodCoverage: convertMonetaryValue(packageDetail.ownedCarFlood),
  theftAndFireCoverage: convertMonetaryValue(packageDetail.ownedCarFireTheft),
});

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['GENERIC_PACKAGE'],
});
export const genericPackageSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    getGenericPackages: build.query<GenericPackageTransformResponse, any>({
      query: ({
        queryParams,
      }: {
        queryParams: {
          nextToken?: string;
          limit?: number;
          model: string;
          year: number;
          brand: string;
          subModel: string;
          sortBy?: string;
          direction?: 'asc' | 'desc';
          vehicleregistrationpurpose?: string;
          dashCam?: boolean;
          premiummin?: number;
          premiummax?: number;
          insuranceTypes?: string[];
          repairTypes?: string[];
          deductibles?: string[];
          selectedInsurers?: number[];
          province?: string;
          enableProvinceFilter?: boolean;
        };
      }) => {
        const normalizedBrand = queryParams?.brand
          ?.toLowerCase()
          ?.replace(/[\s\-_]+/g, '');

        return {
          url: buildUrl(baseUrls.salesFlow, {
            path: `/api/gff/v1alpha1/car-insurance/packages:search`,
          }),
          body: {
            criteria: {
              brand: normalizedBrand,
              year: queryParams?.year,
              ...(queryParams?.model?.toLowerCase() !== '' && {
                model: queryParams?.model?.toLowerCase(),
              }),
              ...(queryParams?.subModel?.toLowerCase() !== '' && {
                submodel: queryParams?.subModel?.toLowerCase(),
              }),
              ...(queryParams?.vehicleregistrationpurpose?.toLowerCase() !==
                '' && {
                vehicleregistrationpurpose: [
                  queryParams?.vehicleregistrationpurpose?.toLowerCase(),
                ],
              }),
              ...(queryParams?.dashCam?.toString() !== '' && {
                dashcam: [
                  ...(queryParams?.dashCam?.toString() === 'true'
                    ? ['required', 'not required']
                    : ['not required']),
                ],
              }),
              ...(queryParams?.premiummin !== undefined && {
                maximumannualcoveragemin: queryParams.premiummin * 100,
              }),
              ...(queryParams?.premiummax !== undefined && {
                maximumannualcoveragemax: queryParams.premiummax * 100,
              }),
              ...(queryParams?.insuranceTypes &&
                queryParams.insuranceTypes.length > 0 && {
                  insurancetype: queryParams.insuranceTypes,
                }),
              ...(queryParams?.repairTypes &&
                queryParams.repairTypes.length > 0 && {
                  repairtype: queryParams.repairTypes,
                }),
              ...(queryParams?.deductibles &&
                queryParams.deductibles.length > 0 && {
                  deductible: queryParams.deductibles,
                }),
              ...(queryParams?.selectedInsurers &&
                queryParams.selectedInsurers.length > 0 && {
                  insurer: queryParams.selectedInsurers,
                }),
              ...(queryParams?.enableProvinceFilter && {
                provinces: ['0', queryParams?.province].reduce<string[]>(
                  (acc, p) => {
                    if (p != null && p !== '') acc.push(String(p));
                    return acc;
                  },
                  []
                ),
              }),
            },
            productType: `motorinsurance-${normalizedBrand}`,
            cursor: {
              sortBy: queryParams.sortBy ?? 'premium_value',
              direction: queryParams.direction ?? 'asc',
              limit: queryParams?.limit ?? 10,
              ...(queryParams?.nextToken !== undefined && {
                token: queryParams.nextToken,
              }),
            },
          },
          method: 'POST',
        };
      },
      providesTags: ['GENERIC_PACKAGE'],
      transformResponse: (
        response: GenericPackageResponse
      ): GenericPackageTransformResponse => {
        if (response?.packages?.packages) {
          const groupedByInsurer = response.packages.packages.reduce(
            (acc, packageItem) => {
              const { packageDetail } = packageItem;
              const insurerId = packageDetail.insuranceCompanyName;
              const price = convertMonetaryValue(packageDetail.premium);
              const carCoverage = convertMonetaryValue(
                packageDetail.maximumAnnualCoverage
              );

              let insurerObj = acc[insurerId];
              if (!insurerObj) {
                insurerObj = {
                  name: `Insurer ${insurerId}`,
                  insuranceCompany: {
                    name: `Insurance Company ${insurerId}`,
                    displayName: `Insurer ${insurerId}`,
                    logo: `${INSURER_LOGO_BASE_URL}/insurers/${insurerId}.png`,
                  },
                  carCoverageRange: {
                    min: carCoverage,
                    max: carCoverage,
                    highlighted: carCoverage,
                  },
                  priceRange: { min: price, max: price, highlighted: price },
                  packages: [],
                  total: parseFloat(response.totalCount || '0'),
                };
              }
              const currentGroup = insurerObj;
              currentGroup.priceRange.min = Math.min(
                currentGroup.priceRange.min,
                price
              );
              currentGroup.priceRange.max = Math.max(
                currentGroup.priceRange.max,
                price
              );
              currentGroup.priceRange.highlighted = currentGroup.priceRange.min;
              currentGroup.carCoverageRange.min = Math.min(
                currentGroup.carCoverageRange.min,
                carCoverage
              );
              currentGroup.carCoverageRange.max = Math.max(
                currentGroup.carCoverageRange.max,
                carCoverage
              );
              currentGroup.carCoverageRange.highlighted =
                currentGroup.carCoverageRange.min;
              const coverageDetails = extractCoverageDetails(packageDetail);
              const deductibleAmount = convertMonetaryValue(
                packageDetail.deductibleAmount
              );
              const carCoverageAmount = carCoverage;
              const repairTypeValue = packageDetail.repairType;
              const dashCamValue =
                packageDetail.dashCam?.toLowerCase() === 'required'
                  ? 'Yes'
                  : 'No';
              const oicCodeValue = packageDetail.oicCode || 'Unknown';
              const insuranceType = packageDetail.insuranceType || 'Unknown';
              const subModel = packageDetail.insurerCarName;

              const transformedPackage = {
                id: packageDetail.premiumPackage.name,
                name: packageDetail.packageName,
                uploadPackageName: `Insurer ${insurerId}`,
                packageName: packageDetail.packageName,
                insuranceType,
                insuranceCategory: 'Unknown',
                repairType: repairTypeValue,
                subModel,
                carCoverage: carCoverageAmount,
                includeDashCamDiscount: dashCamValue,
                deductible: deductibleAmount,
                price,
                insuranceCompany: `Insurance Company ${insurerId}`,
                oicCode: oicCodeValue,
                startDate: new Date(packageDetail.validFrom),
                expiryDate: new Date(packageDetail.validTo),

                ...calculateInsurancePricing(
                  insuranceType,
                  price,
                  packageDetail
                ),

                coverageDetails,
                termsAndConditions: packageDetail.termsAndConditions || '',
                applicableProvinces: packageDetail.applicableProvinces
                  ? packageDetail.applicableProvinces.split(',')
                  : [],
              };
              currentGroup.packages.push(
                transformedPackage as unknown as PackageGroup['packages'][number]
              );
              return {
                ...acc,
                [insurerId]: currentGroup,
              };
            },
            {} as Record<string, PackageGroup>
          );
          return {
            packages: Object.values(groupedByInsurer),
            total:
              parseInt(response.totalCount || '0', 10) ||
              response.packages.packages.length,
            nextToken: response.nextToken,
          };
        }
        return {
          packages: [],
          total: 0,
        };
      },
    }),
    getGenericPackageDetail: build.query<InsurancePackageDetailResponse, any>({
      query: ({
        id,
        carSubModelYear,
        insuranceKind,
      }: {
        id: string;
        carSubModelYear: number;
        insuranceKind: string;
      }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/car-package/v1alpha1/${id}:compute?car_submodel_year=brands/-/models/-/submodels/-/years/${carSubModelYear}&insurance_kind=${insuranceKind}&number_of_installment=1`,
        }),
      }),
    }),
  }),
});

export const {
  useGetGenericPackagesQuery,
  useLazyGetGenericPackagesQuery,
  useGetGenericPackageDetailQuery,
  useLazyGetGenericPackageDetailQuery,
} = genericPackageSlice;
