import _ from 'lodash';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserRoles } from 'config/constant';
import LeadDetail from 'data/repository/leadDetail/cloud';
import { INSURANCE_KIND } from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import { IInsurer, ISelection } from 'presentation/models/lead/insurer';
import { getString } from 'presentation/theme/localization';
import LocalStorage, { LOCALSTORAGE_KEY } from 'shared/helper/LocalStorage';
import { customForkJoin } from 'shared/helper/operator';
import { countingAgeToPresent, mappingLeadType } from 'shared/helper/utilities';
import { Lead } from 'shared/types/lead';

const localStorageService = new LocalStorage();

export const LIST_INSURERS_PAGE_SIZE = '100';
const FIXED_LIST = [7, 27, 28, 35, 23, 19, 5, 33, 11];

export const fakeInsurerObject = {
  currentInsurer: 1,

  preferredInsurer: 1,

  preferredType: [
    {
      title: 'Type 1',
      value: 'type_1',
    },
  ],

  preferredSumInsured: 0,

  mandatory: false,

  expiryDate: '2025-11-16',

  youngestDriverDob: '1997-12-16',
};

export const fakeInsurers = [
  {
    name: 'insurers/42',
    displayName: 'Dhipaya',
    order: 3,
    id: 42,
  },
  {
    name: 'insurers/40',
    displayName: 'Chubb Samaggi Insurance Co. (PLC)',
    order: 3,
    id: 40,
  },
  {
    name: 'insurers/38',
    displayName: 'Roojai Insurance',
    order: 3,
    id: 38,
  },
];

export const fakeTypes = [
  {
    title: 'Type 1',
    value: 'type_1',
  },
  {
    title: 'Type 2',
    value: 'type_2',
  },
  {
    title: 'Type 2+',
    value: 'type_2+',
  },
  {
    title: 'Type 3',
    value: 'type_3',
  },
  {
    title: 'Type 3+',
    value: 'type_3+',
  },
];

export interface ICarInfo {
  brand: number | null;
  model: number | null;
  subModel: number | null;
  year: number | null;
  carSubModelYear: number | null;
  fuelType?: string | null;
  transmission: string | null;
  engineSize: number | null;
  noOfDoors: number | null;
  cabType: string | null;
  carModified: boolean | undefined;
  carDashCam: boolean | undefined;
  carUsageType: 'personal' | 'commercial' | undefined;
  carRegisteredSeats: number | undefined;
  registeredProvince: number | null;
  redPlate?: boolean | undefined;
  carLicensePlate?: string | undefined;
  chassisNumber: number | string | undefined;
  vehicleIdNumber: number | string | undefined;
  carColor: string[] | undefined;
  isVan?: boolean;
  redbookId?: string | null;
}

const getRedPlateFromReponse = (licensePlate: string) =>
  licensePlate === 'redplate';

const getResponseFromBooleanField = (
  responseObject: { [key: string]: any },
  fieldName: string
) => {
  if (_.has(responseObject, fieldName)) {
    return _.get(responseObject, fieldName);
  }

  return undefined;
};

export const formatCarInfo = (customerInfo: any, carInfoGeneral: any) => {
  const carInfo: ICarInfo = {
    brand: carInfoGeneral.brand,
    model: carInfoGeneral.model,
    subModel: carInfoGeneral.subModel,
    year: carInfoGeneral.year,
    carSubModelYear: carInfoGeneral.carSubModelYear,
    fuelType: carInfoGeneral.fuelType || '',
    transmission: carInfoGeneral.transmissionType || '',
    engineSize: carInfoGeneral.engineSize || null,
    noOfDoors: carInfoGeneral?.noOfDoor ?? '',
    cabType: carInfoGeneral?.cabType
      ? carInfoGeneral.cabType.replace('_', ' ')
      : '',
    carModified: customerInfo?.data
      ? getResponseFromBooleanField(customerInfo.data, 'carModified')
      : undefined,
    carDashCam: customerInfo?.data
      ? getResponseFromBooleanField(customerInfo.data, 'carDashCam')
      : undefined,
    carUsageType: customerInfo?.data?.carUsageType || undefined,
    carRegisteredSeats: customerInfo?.data?.carRegisteredSeats || undefined,
    registeredProvince: customerInfo?.data?.registeredProvince || null,
    redPlate: _.has(customerInfo, 'data.carLicensePlate')
      ? getRedPlateFromReponse(customerInfo?.data?.carLicensePlate)
      : undefined,
    carLicensePlate: customerInfo?.data?.carLicensePlate || null,
    chassisNumber: customerInfo?.data?.chassisNumber || '',
    vehicleIdNumber: customerInfo?.data?.vehicleIdNumber || '',
    carColor: customerInfo?.data?.carColor || undefined,
    isVan: carInfoGeneral.isVan || undefined,
    redbookId: carInfoGeneral.redbookId || null,
  };
  return carInfo;
};

export const formatPreferredType = (types: string[]) => {
  let newTypeArr;
  if (types) {
    newTypeArr = types.map((type) =>
      fakeTypes.find((fakeType) => fakeType.value === type)
    );
  }
  return newTypeArr as ISelection[];
};

export interface IInsurerItem {
  name: string;
  displayName: string;
  order: number;
  id: number;
  title?: string;
}

export interface IInsurerFromApi {
  insurers: IInsurerItem[];
  nextPageToken: string;
  responseTimes: number;
}

export const getInsurerFromList = (
  insurerId: number,
  listInsurer: IInsurerItem[]
) => {
  let insurerName;
  const newInsurerId = `insurers/${insurerId}`;

  listInsurer.forEach((insurer) => {
    if (insurer.name === newInsurerId) {
      insurerName = insurer.displayName;
    }
  });

  return insurerName || '';
};

export const convertMandatory = (mandatory: string) => {
  if (mandatory === 'mandatory' || mandatory === 'both') return 'Yes';
  if (mandatory === 'voluntary') return 'No';
  return '';
};

export const formatInsurerInfo = (customerInfo: any) => {
  let insurerInfo;
  if (customerInfo) {
    insurerInfo = {
      currentInsurer: customerInfo?.data?.currentInsurer,
      preferredInsurer: customerInfo?.data?.preferredInsurer,
      preferredType: formatPreferredType(
        customerInfo?.data?.voluntaryInsuranceType
      ),
      preferredSumInsured: customerInfo?.data?.preferredSumInsured || 0,
      mandatory: convertMandatory(customerInfo?.data?.insuranceKind) || '',
      expiryDate: customerInfo?.data?.policyExpiryDate,
      youngestDriverDob: customerInfo?.data?.youngestDriverDOB || '',
      coupon:
        customerInfo?.data?.checkout?.coupon ||
        customerInfo?.data?.checkout?.voucher ||
        '',
      status: customerInfo?.status || '',
      paymentSchedule: customerInfo?.data?.checkout?.installments || 0,
    };
  }
  return insurerInfo as IInsurer;
};

export const getProvinceNameByLanguage = (response: IProvince) => {
  let result = '';
  if (response) {
    result =
      localStorageService.getItemByKey(LOCALSTORAGE_KEY.LOCALE) === 'en'
        ? response.nameEn
        : response.nameTh;
  }
  return result;
};

export const formatCustomerInfo = (customerInfo: any) => {
  const defaultCustomerInfo = {
    assignedTo: '',
    data: {
      numberOfFixedDriver: 0,
      firstDriverDOB: '',
      secondDriverDOB: '',
      customerDOB: '',
    },
  };

  const customerInfoWithDefaults = {
    ...defaultCustomerInfo,
    ...customerInfo,
    data: {
      ...defaultCustomerInfo.data,
      ...customerInfo.data,
    },
  };

  return {
    lead: {
      customerFirstName:
        customerInfoWithDefaults?.data?.customerFirstName || '',
      customerLastName: customerInfoWithDefaults?.data?.customerLastName || '',
      status: customerInfoWithDefaults?.status || '',
      gender: customerInfoWithDefaults?.data?.customerGender || '',
      customerDOB: customerInfoWithDefaults.data.customerDOB,
      age:
        countingAgeToPresent(customerInfoWithDefaults.data.customerDOB) || '',
      customerReference: '',
      leadType: mappingLeadType(customerInfoWithDefaults?.type) || '',
      leadReference: customerInfoWithDefaults?.humanId || '',
      leadParent: '',
      name: customerInfoWithDefaults?.name || '',
      isRejected: customerInfoWithDefaults?.isRejected || false,
      reference:
        customerInfoWithDefaults?.reference &&
        customerInfoWithDefaults.reference !== ''
          ? customerInfoWithDefaults.reference
          : null,
    },
    customer: {
      firstName: customerInfoWithDefaults?.data?.customerFirstName || '',
      lastName: customerInfoWithDefaults?.data?.customerLastName || '',
      gender: customerInfoWithDefaults?.data?.customerGender || '',
      customerDOB: customerInfoWithDefaults.data.customerDOB,
      nationalId: customerInfoWithDefaults?.data?.policyHolderNationalId || '',
      numberOfFixedDriver: customerInfoWithDefaults.data.numberOfFixedDriver,
      firstDriverDOB: customerInfoWithDefaults.data.firstDriverDOB,
      secondDriverDOB: customerInfoWithDefaults.data.secondDriverDOB,
      language: customerInfoWithDefaults.data.locale,
    },
    policyHolder: {
      title: customerInfoWithDefaults?.data?.policyTitle || '',
      firstName: customerInfoWithDefaults?.data?.policyHolderFirstName || '',
      lastName: customerInfoWithDefaults?.data?.policyHolderLastName || '',
      companyName: (customerInfoWithDefaults?.data?.customerPolicyAddress ??
        [])[0]?.companyName,
      taxId: (customerInfoWithDefaults?.data?.customerPolicyAddress ?? [])[0]
        ?.taxId,
      DOB: customerInfoWithDefaults.data?.policyHolderDOB || '',
      age:
        countingAgeToPresent(customerInfoWithDefaults?.data?.policyHolderDOB) ||
        '',
      nationalId: customerInfoWithDefaults?.data?.policyHolderNationalId || '',
      numberOfFixedDriver: customerInfoWithDefaults.data.numberOfFixedDriver,
      firstDriverDOB: customerInfoWithDefaults.data.firstDriverDOB,
      secondDriverDOB: customerInfoWithDefaults.data.secondDriverDOB,
    },
    leadInfo: {
      agentName: customerInfoWithDefaults.assignedTo,
      id: customerInfoWithDefaults?.humanId || '',
      type: getString(mappingLeadType(customerInfoWithDefaults?.type)),
      refId: customerInfoWithDefaults?.reference || '-',
      sundayContactable:
        customerInfoWithDefaults?.data?.sundayContactable ?? false,
    },
  } as any;
};

export const initialCarData = {
  brand: null,
  model: null,
  year: null,
  subModel: null,
  carSubModelYear: null,
  fuelType: '',
  transmission: '',
  engineSize: null,
  noOfDoors: null,
  cabType: '',
  carModified: undefined,
  carDashCam: undefined,
  carUsageType: undefined,
  carRegisteredSeats: undefined,
  registeredProvince: null,
  redPlate: undefined,
  carLicensePlate: undefined,
  chassisNumber: '',
  vehicleIdNumber: '',
  carColor: undefined,
};

export const initialInsurerData = {
  currentInsurer: 0,
  preferredInsurer: 0,
  preferredType: [],
  preferredSumInsured: 0,
  mandatory: '',
  expiryDate: '',
  youngestDriverDob: '',
  coupon: '',
  status: '',
};

export const initialCustomerData = {
  lead: {
    customerFirstName: '',
    customerLastName: '',
    status: '',
    gender: '',
    customerDOB: '',
    age: null,
    customerProvince: '',
    customerCity: '',
    customerReference: '',
    leadType: '',
    leadReference: '',
    leadParent: '',
    name: '',
    isRejected: false,
    language: '',
  },
};

export enum UpdateLeadDetailsType {
  Installment = 'Installment',
  CurrentInsurer = 'currentInsurer',
  PreferredInsurer = 'preferredInsurer',
  PreferredSumInsured = 'preferredSumInsured',
  VoluntaryInsuranceType = 'voluntaryInsuranceType',
  DeliveryOption = 'shippingOption',
}

export interface IVoluntaryInsuranceType {
  title: string;
  value: string;
}

export const getValueVoluntaryInsuranceType = (
  value: IVoluntaryInsuranceType[]
) => value.map((type) => type.value);

export const canViewLead = (user: any, assignment: any): boolean => {
  if (!user) return false;
  if (
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.MANAGER_ROLE,
      UserRoles.INBOUND_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.DOCUMENT_COLLECTIONS,
      UserRoles.QUALITY_CONTROL,
      UserRoles.PROBLEM_CASE,
      UserRoles.SHIPMENT,
      UserRoles.ACCOUNTING,
      UserRoles.BACK_OFFICE,
      UserRoles.CI_AGENT,
      UserRoles.CI_SUPERVISOR,
    ].includes(user.role)
  ) {
    return true;
  }
  if (user.role === UserRoles.SALE_ROLE && assignment?.length) {
    return assignment[0].user === user.name;
  }
  return false;
};

export interface ICheckoutPackage {
  package: string;
}

export interface IProvince {
  name: string;
  nameEn: string;
  nameTh: string;
}

export const getCarDescription = (res: any) => ({
  subModel: res.name.substring(0, res.name.indexOf('/years')),
  model: res.name.substring(0, res.name.indexOf('/submodels')),
  brand: res.name.substring(0, res.name.indexOf('/models')),
});

export const clearSub$ = new Subject();
export const leadDetailCarForkJoin = (res: any, registeredProvince: string) => {
  const { brand, model, subModel } = getCarDescription(res);

  return customForkJoin(
    LeadDetail.getCarSubModel(subModel),
    LeadDetail.getCarModel(model),
    LeadDetail.getCarBrand(brand),
    LeadDetail.getProvinceById(registeredProvince),
    of(res)
  ).pipe(takeUntil(clearSub$));
};

export const customCarGeneral = ([
  carSubModel,
  carModel,
  carBrand,
  carProvince,
  carYear,
]: any[]) => ({
  year: carYear.year,
  brand: carBrand.displayName,
  model: carModel.displayName,
  subModel: carSubModel.displayName,
  engineSize: carYear?.migratedAsCurated
    ? carSubModel.engineSize
    : Math.abs(carSubModel.engineDescription * 1000),
  transmissionType: carSubModel.transmissionType,
  sumInsuredMax: carYear.sumInsuredMax,
  carProvince: getProvinceNameByLanguage(carProvince),
  carProvinceOIC: carProvince,
  noOfDoor: carSubModel.doors,
  cabType: carSubModel?.cabType,
  isCurated: carYear?.migratedAsCurated,
  isVan: carModel?.isVan,
  fuelType: carYear.fuelType,
});

export interface CarApiResponseProps {
  car: any;
  manufacturedYears: any;
  uniqueBrands: any;
  uniqueModels: any;
}

export const customCarData = (
  carApiResponse: CarApiResponseProps,
  carSubModelYear: number | string
) => {
  const carInformation =
    carApiResponse?.car?.length === 1 ? carApiResponse.car[0] : null;
  const carYear =
    carApiResponse?.manufacturedYears?.length === 1
      ? carApiResponse.manufacturedYears[0]
      : null;
  const carBrand =
    carApiResponse?.uniqueBrands?.length === 1
      ? carApiResponse.uniqueBrands[0]
      : null;
  const carModel =
    carApiResponse?.uniqueModels?.length === 1
      ? carApiResponse.uniqueModels[0]
      : null;

  return {
    year: carYear,
    brand: carBrand?.id ?? null,
    model: carModel?.id ?? null,
    subModel: carInformation?.displayName ?? null,
    carSubModelYear,
    engineSize: carInformation?.engineSize ?? null,
    transmissionType: carInformation?.transmissionType ?? null,
    sumInsuredMax: carInformation?.sumInsuredMax ?? null,
    noOfDoor: carInformation?.doors ?? null,
    cabType: carInformation?.cabType ?? null,
    isCurated: carInformation?.migratedAsCurated ?? null,
    isVan: carInformation?.isVan ?? null,
    fuelType: carInformation?.fuelType ?? null,
    redbookId: carInformation?.redbookId ?? null,
  };
};

export const getCityProvinceName = (province: string, city: string) => ({
  province: province || '',
  districts: city || '',
});

export const camelCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/\s(.)/g, (charAfterSpace) => charAfterSpace.toUpperCase())
    .replace(/\s/g, '');

export const getFieldTitle = (title?: string) => {
  const titleKey = title ? _.camelCase(title) : '';
  return titleKey ? getString(`leadDetailFields.${titleKey}`) : '';
};

export const sortPreferedInsurers = (insurers: IInsurerItem[]) => {
  const fixed: Array<IInsurerItem> = [];
  const rest: Array<IInsurerItem> = [];
  insurers.map((item: IInsurerItem) => {
    const newItem = _.cloneDeep(item);
    newItem.title = item.displayName;

    if (FIXED_LIST.includes(newItem?.id)) {
      fixed[FIXED_LIST.indexOf(newItem?.id)] = newItem;
      return fixed;
    }
    return rest.push(newItem);
  });

  // We need to add this fake option for the insurers.
  // So that when agent selects this option we remove it from lead.
  const fakeSelectOption = {
    displayName: 'No insurer',
    displayNameTh: 'ไม่มีบริษัทประกัน',
    id: 0,
    logo: '',
    name: '',
    order: 0,
    rating: 0,
    shortnameEn: '',
    shortnameTh: '',
    title: getString('text.noInsurer'),
  };

  const allInsurers = fixed.concat(
    rest.sort((a, b) => a.displayName.localeCompare(b.displayName))
  );

  // Add the select option to the top.
  allInsurers.unshift(fakeSelectOption);
  return allInsurers;
};

export interface IAgentInformation {
  key: string;
  value: string;
}

export const getAgentInfo = (
  allUsers: IAgentInformation[],
  userKey: string
) => {
  if (!userKey) return '-';

  let result = '-';
  const agentInfo = _.find(allUsers, ['key', userKey]);

  if (agentInfo) {
    result = agentInfo.value;
  }
  return result;
};

export const getCustomerSectionTitle = (title: string) =>
  title ? getString(`leadDetailFields.${title}`) : '';

export const getOptionsValue = (options: any, value: string | number) => {
  if (options?.length && value) {
    const selectedOption = options?.find((option: any) => option.id === value);
    return selectedOption?.displayName || selectedOption?.title;
  }
  return '';
};

export const getPreferredTypeValue = (optionsValue: any) => {
  if (optionsValue?.length) {
    const optionsValueArr: any = [];
    optionsValue.forEach((option: any) => {
      optionsValueArr.push(option.title);
    });
    return optionsValueArr.join(', ');
  }
  return '';
};

export const hasPackageSearchRequiredFields = (leadData: any) => {
  if (leadData === undefined) return false;

  const requiredFields = [
    'carSubModelYear',
    'registeredProvince',
    'carUsageType',
    'insuranceKind',
  ];
  let hasField = true;

  requiredFields.forEach((field) => {
    if (
      !Object.prototype.hasOwnProperty.call(leadData, field) ||
      leadData[field] === ''
    ) {
      hasField = false;
    }
  });

  if (
    (!Array.isArray(leadData.voluntaryInsuranceType) ||
      leadData.voluntaryInsuranceType.length === 0) &&
    leadData.insuranceKind !== INSURANCE_KIND.MANDATORY
  ) {
    hasField = false;
  }

  return hasField;
};

export const getPendingRejection = (response: any) => {
  let isPending = false;
  if (response?.rejections?.length) {
    isPending = response.rejections.find(
      (item: any) => item.decideTime === null
    );
  }

  return Boolean(isPending);
};

export const checkIsInstallment = (customer: any) => {
  if (customer.data?.insuranceKind !== INSURANCE_KIND.MANDATORY) {
    return (customer.data?.checkout?.installments ?? 0) > 1;
  }
  return false;
};

export const isMotorLead = (lead?: Lead) =>
  lead?.product === undefined || lead?.product === 'products/car-insurance';
