/* eslint-disable func-names */
import { FormikValues } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import { of } from 'rxjs';
import * as yup from 'yup';

import LeadDetail from 'data/repository/leadDetail/cloud';
import { packageFields } from 'shared/constants/packageFormFields';
import { selectCollection } from 'shared/constants/packageStaticData';
import { customForkJoin } from 'shared/helper/operator';
import {
  ICreatePackage,
  IInputProps,
  ISelectOptions,
  IManualPackage,
} from 'shared/interfaces/common/lead/package';
import { bahtToSatang } from 'utils/currency';
import { format, differenceInYears } from 'utils/datetime';
import { getString } from 'presentation/theme/localization';

import {
  IInsurerFromApi,
  IInsurerItem,
  sortPreferedInsurers,
} from '../leadDetailsPage.helper';

const YESTERDAY_DATE = new Date(new Date().setDate(new Date().getDate() - 1));
const MINIMUM_CAR_AGE = 1;
export const TRAILING_ZEROES = '0000';
export const LIST_INSURERS_PAGE_SIZE = '100';
export const NUMBER_INPUT_STEP = 10000;
export const YUP_REQUIRED_MSG = () => getString('package.requiredFields');
export const YUP_DATETYPE_ERROR = () => getString('package.invalidDateFormat');
export const YUP_DATE_STARTDATE_MIN_MSG = () => getString('package.minDate');
export const YUP_DATE_MIN_MSG = () =>
  getString('package.expirationDateAndStartDate');

yup.addMethod<yup.NumberSchema>(
  yup.number,
  'isValidStep',
  function (message: string, numberInputStep: number = NUMBER_INPUT_STEP) {
    return this.test('isValidStep', message, function (value: any) {
      const { path, createError } = this;
      if (value % numberInputStep !== 0) {
        return createError({
          path,
          message:
            message ??
            getString('package.stepValidation', {
              amount: Number(numberInputStep).toLocaleString(undefined),
            }),
        });
      }
      return true;
    });
  }
);

const formatDate = (selectedDate: Date) => {
  const convertedDate = format(new Date(selectedDate), 'yyyy-MM-dd');
  return convertedDate;
};

const floodAndTheftCoverageDefaultValue = (
  carInsuranceType: string,
  value: number
) => {
  if (carInsuranceType === 'Type 1') {
    return value;
  }
  return 0;
};

export const getCarAge = (carYear: number) => {
  if (carYear) {
    const currentYear = format(new Date(), 'yyyy');
    const yearDifference = differenceInYears(
      new Date(currentYear.toString()),
      new Date(carYear.toString())
    );

    return yearDifference || MINIMUM_CAR_AGE;
  }
  return null;
};

export const prepareCustomQuoteFormData = (
  formData: FormikValues,
  carSubModel: string,
  provinces?: string
): IManualPackage => {
  const formValue = cloneDeep(formData);

  return {
    packageType: formValue[packageFields.type.name],
    displayName: formValue[packageFields.name.name],
    startTime: new Date(formValue[packageFields.startDate.name]).toISOString(),
    expireTime: new Date(
      formValue[packageFields.expirationDate.name]
    ).toISOString(),
    insurer: `insurers/${formValue[packageFields.insuranceCompanyId.name]}`,
    carInsuranceType: formData[packageFields.carInsuranceType.name]
      .replace(/ /g, '_')
      .replace('+', '_PLUS')
      .toUpperCase(),
    oicCode: `TYPE_${formData[packageFields.oicCode.name]}`,
    carRepairType: formValue[packageFields.carRepairType.name].toUpperCase(),
    modifiedCarAccepted:
      formValue[packageFields.modifiedCarAccepted.name] === 'Yes',
    hasCctvDiscount: formValue[packageFields.hasCctvDiscount.name] === 'Yes',
    carAgeMin: getCarAge(formValue[packageFields.carAge.name]) ?? 0,
    carAgeMax: getCarAge(formValue[packageFields.carAge.name]) ?? 0,
    sumCoverageMin: bahtToSatang(
      Number(formValue[packageFields.sumCoverageMax.name])
    )?.toString(),
    sumCoverageMax: bahtToSatang(
      Number(formValue[packageFields.sumCoverageMax.name])
    )?.toString(),
    deductibleAmount: bahtToSatang(
      formValue[packageFields.deductibleAmount.name]
    ).toString(),
    price: bahtToSatang(formValue[packageFields.price.name]).toString(),
    fireTheftCoverage:
      formValue[packageFields.fireTheftCoverage.name] === 'Yes'
        ? bahtToSatang(
            formValue[packageFields.fireTheftCoverageValue.name]
          ).toString()
        : bahtToSatang(
            floodAndTheftCoverageDefaultValue(
              formValue[packageFields.carInsuranceType.name],
              Number(formValue[packageFields.sumCoverageMax.name])
            )
          ).toString(),
    floodCoverage:
      formValue[packageFields.floodCoverage.name] === 'Yes'
        ? bahtToSatang(
            formValue[packageFields.floodCoverageValue.name]
          ).toString()
        : bahtToSatang(
            floodAndTheftCoverageDefaultValue(
              formValue[packageFields.carInsuranceType.name],
              Number(formValue[packageFields.sumCoverageMax.name])
            )
          ).toString(),
    carSubmodels: [`brands/-/models/-/submodels/${carSubModel}`],
    liabilityPerPersonCoverage: bahtToSatang(
      formValue[packageFields.liabilityPerPersonCoverage.name]
    ).toString(),
    liabilityPropertyCoverage: bahtToSatang(
      formValue[packageFields.liabilityPropertyCoverage.name]
    ).toString(),
    liabilityPerAccidentCoverage: bahtToSatang(
      formValue[packageFields.liabilityPerAccidentCoverage.name]
    ).toString(),
    personalAccidentCoverage: bahtToSatang(
      formValue[packageFields.personalAccidentCoverage.name]
    ).toString(),
    personalAccidentCoverageNo: Number(
      formValue[packageFields.personalAccidentCoverageNo.name]
    ),
    medicalExpensesCoverage: bahtToSatang(
      formValue[packageFields.medicalExpensesCoverage.name]
    ).toString(),
    medicalExpensesCoverageNo: Number(
      formValue[packageFields.medicalExpensesCoverageNo.name]
    ),
    bailBondCoverage: bahtToSatang(
      formValue[packageFields.bailBondCoverage.name]
    ).toString(),
    provinces: provinces ? [`provinces/${provinces}`] : null,
    termsEn: '',
    termsTh: '',
    source: 'MANUAL',
  };
};

export const prepareCreateCustomQuoteData = (
  formData: FormikValues,
  carSubModel: number
): ICreatePackage => {
  const formValue = JSON.parse(JSON.stringify(formData));
  // INFO: Add Trailing Zeroes to THB Number Inputs
  formValue[packageFields.insuranceCompanyId.name] = Number(
    formValue[packageFields.insuranceCompanyId.name]
  );
  formValue[packageFields.startDate.name] = formatDate(
    formValue[packageFields.startDate.name]
  );
  formValue[packageFields.expirationDate.name] = formatDate(
    formValue[packageFields.expirationDate.name]
  );
  // INFO: Car
  // INFO: Transform CarAge Data
  formValue[`${packageFields.carAge.name}_min`] = Number(
    formValue[packageFields.carAge.name]
  );
  formValue[`${packageFields.carAge.name}_max`] = Number(
    formValue[packageFields.carAge.name]
  );
  formValue[packageFields.sumCoverageMin.name] = Number(
    formValue[packageFields.sumCoverageMax.name]
  );
  formValue[packageFields.sumCoverageMax.name] = Number(
    formValue[packageFields.sumCoverageMax.name]
  );
  formValue[packageFields.deductibleAmount.name] = Number(
    formValue[packageFields.deductibleAmount.name]
  );
  formValue[packageFields.price.name] = Number(
    formValue[packageFields.price.name]
  );
  // INFO: Coverage
  formValue[packageFields.liabilityPerAccidentCoverage.name] = Number(
    formValue[packageFields.liabilityPerAccidentCoverage.name]
  );
  formValue[packageFields.liabilityPerPersonCoverage.name] = Number(
    formValue[packageFields.liabilityPerPersonCoverage.name]
  );
  formValue[packageFields.liabilityPropertyCoverage.name] = Number(
    formValue[packageFields.liabilityPropertyCoverage.name]
  );
  formValue[packageFields.personalAccidentCoverage.name] = Number(
    formValue[packageFields.personalAccidentCoverage.name]
  );
  formValue[packageFields.personalAccidentCoverageNo.name] = Number(
    formValue[packageFields.personalAccidentCoverageNo.name]
  );
  formValue[packageFields.medicalExpensesCoverage.name] = Number(
    formValue[packageFields.medicalExpensesCoverage.name]
  );
  formValue[packageFields.medicalExpensesCoverageNo.name] = Number(
    formValue[packageFields.medicalExpensesCoverageNo.name]
  );
  formValue[packageFields.bailBondCoverage.name] = Number(
    formValue[packageFields.bailBondCoverage.name]
  );

  formValue[packageFields.modifiedCarAccepted.name] =
    formValue[packageFields.modifiedCarAccepted.name] === 'Yes';
  formValue[packageFields.hasCctvDiscount.name] =
    formValue[packageFields.hasCctvDiscount.name] === 'Yes';
  formValue[packageFields.fireTheftCoverage.name] =
    formValue[packageFields.fireTheftCoverage.name] === 'Yes'
      ? Number(formValue[packageFields.fireTheftCoverageValue.name])
      : floodAndTheftCoverageDefaultValue(
          formValue[packageFields.carInsuranceType.name],
          Number(formValue[packageFields.sumCoverageMax.name])
        ); // Need to ask
  formValue[packageFields.floodCoverage.name] =
    formValue[packageFields.floodCoverage.name] === 'Yes'
      ? Number(formValue[packageFields.floodCoverageValue.name])
      : floodAndTheftCoverageDefaultValue(
          formValue[packageFields.carInsuranceType.name],
          Number(formValue[packageFields.sumCoverageMax.name])
        ); // Need to ask
  // formValue.provinces = [leadData.registeredProvince];
  formValue.provinces = [];
  formValue.source = 'manual'; // Default value
  formValue.car_submodels = [carSubModel];
  // INFO: Default Hidden Field,
  formValue.active = true;
  formValue.reuse_manual_package = false;
  formValue.is_linkout = false;
  formValue.is_fixed_premium = true;

  // INFO: Delete Some of Form Value
  delete formValue[packageFields.floodCoverageValue.name];
  delete formValue[packageFields.fireTheftCoverageValue.name];
  delete formValue[packageFields.carAge.name];
  return formValue;
};

export const prepareCreateRenewalQuoteData = (formData: FormikValues) =>
  // renewal api accept satang values
  ({
    insurer: `insurers/${formData[packageFields.insuranceCompanyId.name]}`,
    lastPolicyNumber: formData[packageFields.lastPolicyNumber.name],
    lastPolicyExpirationDate: new Date(
      formData[packageFields.expirationDate.name]
    ).toISOString(),
    oicCode: `TYPE_${formData[packageFields.oicCode.name]}`,
    numberOfClaims: Number(formData[packageFields.claimNumber.name]),
    claimValue: bahtToSatang(Number(formData[packageFields.claimValue.name])),
    noClaimBonus: bahtToSatang(
      Number(formData[packageFields.noClaimBonus.name])
    ),
    carInsuranceType: formData[packageFields.carInsuranceType.name]
      .replace(/ /g, '_')
      .replace('+', '_PLUS')
      .toUpperCase(),
    carRepairType: formData[packageFields.carRepairType.name].toUpperCase(),
    sumCoverage: bahtToSatang(
      Number(formData[packageFields.sumCoverageMax.name])
    ),
    grossPremium: bahtToSatang(Number(formData[packageFields.price.name])),
    liabilityPropertyCoverage: bahtToSatang(
      Number(formData[packageFields.liabilityPropertyCoverage.name])
    ),
    liabilityPerPersonCoverage: bahtToSatang(
      Number(formData[packageFields.liabilityPerPersonCoverage.name])
    ),
    liabilityPerAccidentCoverage: bahtToSatang(
      Number(formData[packageFields.liabilityPerAccidentCoverage.name])
    ),
    floodCoverage:
      formData[packageFields.floodCoverage.name] === 'Yes'
        ? bahtToSatang(Number(formData[packageFields.floodCoverageValue.name]))
        : bahtToSatang(
            floodAndTheftCoverageDefaultValue(
              formData[packageFields.carInsuranceType.name],
              Number(formData[packageFields.sumCoverageMax.name])
            )
          ),
    fireTheftCoverage:
      formData[packageFields.fireTheftCoverage.name] === 'Yes'
        ? bahtToSatang(
            Number(formData[packageFields.fireTheftCoverageValue.name])
          )
        : bahtToSatang(
            floodAndTheftCoverageDefaultValue(
              formData[packageFields.carInsuranceType.name],
              Number(formData[packageFields.sumCoverageMax.name])
            )
          ),
    personalAccidentCoverage: bahtToSatang(
      Number(formData[packageFields.personalAccidentCoverage.name])
    ),
    personalAccidentCoverageNo: Number(
      formData[packageFields.personalAccidentCoverageNo.name]
    ),
    medicalExpensesCoverage: bahtToSatang(
      Number(formData[packageFields.medicalExpensesCoverage.name])
    ),
    medicalExpensesCoverageNo: Number(
      formData[packageFields.medicalExpensesCoverageNo.name]
    ),
    bailBondCoverage: bahtToSatang(
      Number(formData[packageFields.bailBondCoverage.name])
    ),
    deductibleAmount: bahtToSatang(
      Number(formData[packageFields.deductibleAmount.name])
    ),
  });

export const validationSchema = () =>
  yup.object().shape({
    // INFO:Renewal Validation
    [packageFields.chassisNo.name]: yup.string().when(packageFields.type.name, {
      is: (value: string) => value === 'RENEWAL',
      then: (schema) => schema.required(YUP_REQUIRED_MSG),
    }),
    [packageFields.claimValue.name]: yup
      .number()
      .when([packageFields.type.name, packageFields.claimNumber.name], {
        is: (type: string, claimNumber: number) =>
          type === 'RENEWAL' && claimNumber > 0,
        then: () => yup.number().required(YUP_REQUIRED_MSG),
      }),
    // INFO:Package Validation
    [packageFields.name.name]: yup.string().required(YUP_REQUIRED_MSG),
    [packageFields.type.name]: yup.string().required(YUP_REQUIRED_MSG),
    [packageFields.startDate.name]: yup
      .date()
      .required(YUP_REQUIRED_MSG)
      .nullable()
      .typeError(YUP_DATETYPE_ERROR)
      .min(YESTERDAY_DATE, YUP_DATE_STARTDATE_MIN_MSG),
    [packageFields.expirationDate.name]: yup
      .date()
      .when(packageFields.startDate.name, ([value]) => {
        if (value && !Number.isNaN(value.getTime())) {
          return yup
            .date()
            .required(YUP_REQUIRED_MSG)
            .nullable()
            .typeError(YUP_DATETYPE_ERROR)
            .min(value, YUP_DATE_MIN_MSG);
        }
        return yup
          .date()
          .required(YUP_REQUIRED_MSG)
          .nullable()
          .typeError(YUP_DATETYPE_ERROR);
      }),
    [packageFields.insuranceCompanyId.name]: yup
      .string()
      .required(YUP_REQUIRED_MSG),
    [packageFields.carInsuranceType.name]: yup
      .string()
      .required(YUP_REQUIRED_MSG),
    [packageFields.oicCode.name]: yup.string().required(YUP_REQUIRED_MSG),
    // INFO: Car And Sumred Validation
    [packageFields.carAge.name]: yup.number().required(YUP_REQUIRED_MSG),
    [packageFields.sumCoverageMax.name]: (
      yup.number().required(YUP_REQUIRED_MSG) as any
    ).isValidStep(undefined, 1000),
    [packageFields.deductibleAmount.name]: yup
      .number()
      .required(YUP_REQUIRED_MSG),
    [packageFields.fireTheftCoverageValue.name]: (yup.number() as any).when(
      packageFields.fireTheftCoverage.name,
      (value: any) => {
        if (value === 'Yes') {
          return (yup.number() as any).isValidStep(undefined, 1000);
        }
        return yup.number();
      }
    ),
    [packageFields.floodCoverageValue.name]: (yup.number() as any).when(
      packageFields.floodCoverage.name,
      (value: any) => {
        if (value === 'Yes') {
          return (yup.number() as any).isValidStep(undefined, 1000);
        }
        return yup.number();
      }
    ),

    [packageFields.price.name]: yup.number().required(YUP_REQUIRED_MSG),

    // INFO: Car And Sumred Schema
    [packageFields.liabilityPerPersonCoverage.name]: (
      yup.number().required(YUP_REQUIRED_MSG) as any
    ).isValidStep(),
    [packageFields.liabilityPerAccidentCoverage.name]: (
      yup.number().required(YUP_REQUIRED_MSG) as any
    ).isValidStep(),
    [packageFields.liabilityPropertyCoverage.name]: (
      yup.number().required(YUP_REQUIRED_MSG) as any
    ).isValidStep(),
    [packageFields.personalAccidentCoverage.name]: (
      yup.number().required(YUP_REQUIRED_MSG) as any
    ).isValidStep(),
    [packageFields.personalAccidentCoverageNo.name]: yup
      .string()
      .required(YUP_REQUIRED_MSG),
    [packageFields.medicalExpensesCoverage.name]: (
      yup.number().required(YUP_REQUIRED_MSG) as any
    ).isValidStep(),
    [packageFields.medicalExpensesCoverageNo.name]: yup
      .string()
      .required(YUP_REQUIRED_MSG),
    [packageFields.bailBondCoverage.name]: yup
      .number()
      .required(YUP_REQUIRED_MSG),
  });

export const addSelectInsurersCompanyOptions = (
  data: IInputProps[],
  objName: string,
  newOptions: ISelectOptions[]
) =>
  data.map((item) => {
    const temp = { ...item };
    if (temp.name === objName) {
      temp.options = newOptions;
    }
    return temp;
  });
export const cookInsuranceCompanyCollection = (data: IInsurerItem[]) => {
  if (data?.length) {
    const customDataCollection = data.map((row: IInsurerItem) => ({
      id: row.id,
      title: row.displayName,
      value: row.name,
    }));
    return customDataCollection;
  }
  return selectCollection();
};
export const customSelectInsurersCompany = (data: IInsurerFromApi) => {
  const selectInsurersCompanyData = data?.insurers?.length
    ? JSON.parse(JSON.stringify(data.insurers))
    : [];
  return cookInsuranceCompanyCollection(
    sortPreferedInsurers(selectInsurersCompanyData)
  );
};

export const getCarSubModel = (data: any) => {
  let carSubModel;
  if (data.name) {
    carSubModel = data.name.substring(
      data.name.indexOf('/submodels'),
      data.name.length
    );
    carSubModel = carSubModel.substring(
      carSubModel.lastIndexOf('/') + 1,
      carSubModel.length
    );
    carSubModel = Number(carSubModel);
    return carSubModel;
  }
  return 0;
};

export const getTitle = (schema: any[]) =>
  schema.map((item) => {
    const temp = { ...item };
    temp.title = getString(`package.${item.name}`);
    return temp;
  });

export const initialCustomQuoteFormData = {
  // INFO: renewal package
  chassisNo: '',
  lastPolicyNumber: '',
  claimNumber: '',
  claimValue: '',
  noClaimBonus: '',
  // INFO: Package
  name: '',
  package_type: '',
  start_date: new Date(),
  expiration_date: null,
  insurance_company_id: '',
  car_insurance_type: '',
  oic_code: 110,
  car_repair_type: 'Dealer',
  modified_car_accepted: 'Yes',
  has_cctv_discount: 'Yes',

  // INFO: Car And Sum Insured
  car_age: '',
  sum_coverage_min: '',
  sum_coverage_max: '',
  deductible_amount: '',
  price: '',
  fire_theft_coverage: 'No',
  flood_coverage: 'No',
  car_submodels: '',

  // INFO: Coverage
  liability_per_person_coverage: '',
  liability_per_accident_coverage: '',
  liability_property_coverage: '',
  personal_accident_coverage: '',
  personal_accident_coverage_no: '',
  medical_expenses_coverage: '',
  medical_expenses_coverage_no: '',
  bail_bond_coverage: '',
  fixedDriver: '',
  firstDriverDOB: '',
  secondDriverDOB: '',
};

export type CustomQuoteFormType = typeof initialCustomQuoteFormData;

// Use for sample validate
export const mockCustomQuoteFormData = {
  // Info
  name: 'Duy nt 1',
  start_date: '2022-01-02',
  expiration_date: '2022-01-03',
  insurance_company_id: 1,
  car_insurance_type: 'Type 1',
  oic_code: 110,
  car_repair_type: 'Dealer',
  modified_car_accepted: 'Yes',
  has_cctv_discount: 'Yes',
  // Car
  car_age: 3,
  sum_coverage_min: 1,
  sum_coverage_max: 1,
  deductible_amount: 100,
  price: 1,
  fire_theft_coverage: 'No',
  flood_coverage: 'No',
  car_submodels: '',
  // Coverage
  liability_per_person_coverage: 20000,
  liability_per_accident_coverage: 30000,
  liability_property_coverage: 10000,
  personal_accident_coverage: 10000,
  personal_accident_coverage_no: 1,
  medical_expenses_coverage: 10000,
  medical_expenses_coverage_no: 10000,
  bail_bond_coverage: 10000,
};

export const getCarAgeAndSubModel = (res: any) => {
  const subModel = res.name.substring(0, res.name.indexOf('/years'));
  return customForkJoin(LeadDetail.getCarSubModel(subModel), of(res));
};
