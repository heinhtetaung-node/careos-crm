import CarApiResponse from 'mock-data/CarAPIResponse.mock';

import {
  convertMandatory,
  formatCustomerInfo,
  getCustomerSectionTitle,
  getProvinceNameByLanguage,
  getAgentInfo,
  IAgentInformation,
  getOptionsValue,
  getPreferredTypeValue,
  hasPackageSearchRequiredFields,
  checkIsInstallment,
  formatCarInfo,
  customCarData,
  isMotorLead,
} from './leadDetailsPage.helper';

describe('Test helper', () => {
  describe('Test covertMandatory', () => {
    it('Should return yes with mandatory type', () => {
      expect(convertMandatory('mandatory')).toEqual('Yes');
    });

    it('Should return no with voluntary type', () => {
      expect(convertMandatory('voluntary')).toEqual('No');
    });

    it('Should return empty', () => {
      expect(convertMandatory('')).toEqual('');
    });
  });

  it('Test canViewLead', () => {
    expect(
      getProvinceNameByLanguage({
        name: 'provinces/100000',
        nameEn: 'Bangkok',
        nameTh: 'กรุงเทพมหานคร',
        responseTimes: 744,
      } as any)
    ).toEqual('กรุงเทพมหานคร');
  });
});

describe('getAgentInfo', () => {
  const allUsers: IAgentInformation[] = [
    { key: '1', value: 'Agent 0' },
    { key: '12', value: 'Agent 00' },
    { key: '123', value: 'Agent 007' },
  ];

  it('Should return the "-" if name resource is not passed', () => {
    expect(getAgentInfo(allUsers, '')).toEqual('-');
  });

  it('Should return the agent name if it is found', () => {
    expect(getAgentInfo(allUsers, '123')).toEqual('Agent 007');
  });

  it('Should return empty array if agent is not found', () => {
    expect(getAgentInfo([], '123')).toEqual('-');
  });
});

describe('Test getCustomerSectionTitle', () => {
  it('Should return empty if input empty', () => {
    expect(getCustomerSectionTitle('')).toEqual('');
  });

  it('Should return title i18n if input valid', () => {
    expect(getCustomerSectionTitle('car')).toEqual('leadDetailFields.car');
  });
});

describe('Test getOptionsValue', () => {
  it('Should return empty if there is no option', () => {
    expect(getOptionsValue([], 'test text')).toEqual('');
  });

  it('Should return title value if option is valid', () => {
    const mockOptions = [
      {
        id: 1,
        value: 1,
        title: '1 time',
      },
      {
        id: 3,
        value: 3,
        title: '3 times',
      },
      {
        id: 6,
        value: 6,
        title: '6 times',
      },
      {
        id: 10,
        value: 10,
        title: '10 times',
      },
    ];
    expect(getOptionsValue(mockOptions, 6)).toEqual('6 times');
  });
});

describe('Test getPreferredTypeValue', () => {
  it('Should return empty if there is no option', () => {
    expect(getPreferredTypeValue([])).toBe('');
  });

  it('Should return value if option is valid', () => {
    const mockOption = [
      {
        title: 'Type 1',
        value: 'Type 1',
      },
      {
        title: 'Type 2',
        value: 'Type 2',
      },
      {
        title: 'Type 3',
        value: 'Type 3',
      },
      {
        title: 'Type 4',
        value: 'Type 4',
      },
    ];
    expect(getPreferredTypeValue(mockOption)).toBe(
      'Type 1, Type 2, Type 3, Type 4'
    );
  });
});

describe('formatCustomerInfo', () => {
  test('with empty customerInfo', () => {
    const formattedCustomerInfo = formatCustomerInfo({});
    const expectedCustomerInfo = {
      customer: {
        firstDriverDOB: '',
        firstName: '',
        gender: '',
        customerDOB: '',
        lastName: '',
        nationalId: '',
        numberOfFixedDriver: 0,
        secondDriverDOB: '',
        language: undefined,
      },
      lead: {
        age: '',
        customerDOB: '',
        customerFirstName: '',
        customerLastName: '',
        customerReference: '',
        gender: '',
        isRejected: false,
        leadParent: '',
        leadReference: '',
        leadType: '',
        name: '',
        reference: null,
        status: '',
      },
      leadInfo: {
        agentName: '',
        id: '',
        refId: '-',
        type: '',
        sundayContactable: false,
      },
      policyHolder: {
        title: '',
        firstName: '',
        lastName: '',
        companyName: undefined,
        taxId: undefined,
        DOB: '',
        age: '',
        nationalId: '',
        numberOfFixedDriver: 0,
        firstDriverDOB: '',
        secondDriverDOB: '',
      },
    };
    expect(formattedCustomerInfo).toEqual(expectedCustomerInfo);
  });
});

describe('hasPackageSearchRequiredFields', () => {
  it('should return true when all required fields are present', () => {
    expect(
      hasPackageSearchRequiredFields({
        carSubModelYear: 46444,
        registeredProvince: 100000,
        carUsageType: 'personal',
        insuranceKind: 'both',
        voluntaryInsuranceType: ['type1'],
      })
    ).toBeTruthy();
  });

  it('should return false when all required fields are not present', () => {
    expect(
      hasPackageSearchRequiredFields({
        carSubModelYear: 46444,
        registeredProvince: 100000,
        insuranceKind: 'both',
      })
    ).toBeFalsy();
  });

  it('should return false when voluntaryInsuranceType is missing', () => {
    expect(
      hasPackageSearchRequiredFields({
        carSubModelYear: 46444,
        registeredProvince: 100000,
        carUsageType: 'personal',
        insuranceKind: 'both',
      })
    ).toBeFalsy();
  });

  it('should return false when voluntaryInsuranceType is an empty array', () => {
    expect(
      hasPackageSearchRequiredFields({
        carSubModelYear: 46444,
        registeredProvince: 100000,
        carUsageType: 'personal',
        insuranceKind: 'both',
        voluntaryInsuranceType: [],
      })
    ).toBeFalsy();
  });

  it('should return false when passed undefined', () => {
    expect(hasPackageSearchRequiredFields(undefined)).toBeFalsy();
  });
});

describe('checkIsInstallment', () => {
  test('return false if customer select mandatory insurance kind', () => {
    const testCustomerInfo = {
      data: {
        insuranceKind: 'mandatory',
        checkout: {
          installments: 3,
        },
      },
    };
    expect(checkIsInstallment(testCustomerInfo)).toBe(false);
  });

  test('return true if customer select voluntary kind and installment is greater than 1', () => {
    const testCustomerInfo = {
      data: {
        insuranceKind: 'voluntary',
        checkout: {
          installments: 3,
        },
      },
    };
    expect(checkIsInstallment(testCustomerInfo)).toBe(true);
  });

  test('return true if customer select both insurance kind and installment is greater than 1', () => {
    const testCustomerInfo = {
      data: {
        insuranceKind: 'both',
        checkout: {
          installments: 3,
        },
      },
    };
    expect(checkIsInstallment(testCustomerInfo)).toBe(true);
  });

  test('return false if installment is less than or 1', () => {
    const testCustomerInfo = {
      data: {
        insuranceKind: 'both',
        checkout: {
          installments: 1,
        },
      },
    };
    expect(checkIsInstallment(testCustomerInfo)).toBe(false);
  });
});

describe('formatCarInfo', () => {
  it('returns formatted data ', () => {
    const customerInfo = {
      data: {
        carDashCam: true,
        carModified: true,
        carSubModelYear: 46444,
        carUsageType: 'personal',
        locale: 'th-en',
        marketingConsent: false,
        numberOfFixedDriver: 0,
        registeredProvince: 100000,
        carLicensePlate: 'redplate',
      },
    };
    const carInfoGeneral = {
      brand: 24,
      cabType: '',
      carSubModelYear: 46444,
      engineSize: 1500,
      fuelType: '',
      isCurated: true,
      isVan: false,
      model: 183,
      noOfDoor: 4,
      subModel: '1500 CC (4 Doors) e:HEV RS (HYBRID) ',
      sumInsuredMax: 0,
      transmissionType: '',
      year: 2020,
    };

    const formattedData = {
      brand: 24,
      cabType: '',
      carColor: undefined,
      carDashCam: true,
      carLicensePlate: 'redplate',
      carModified: true,
      carRegisteredSeats: undefined,
      carSubModelYear: 46444,
      carUsageType: 'personal',
      chassisNumber: '',
      engineSize: 1500,
      fuelType: '',
      isVan: undefined,
      model: 183,
      noOfDoors: 4,
      redPlate: true,
      redbookId: null,
      registeredProvince: 100000,
      subModel: '1500 CC (4 Doors) e:HEV RS (HYBRID) ',
      transmission: '',
      vehicleIdNumber: '',
      year: 2020,
    };

    expect(formatCarInfo(customerInfo, carInfoGeneral)).toEqual(formattedData);
  });

  it('returns formatted data when passed with all car data', () => {
    const customerInfo = {
      data: {
        carDashCam: false,
        carColor: ['Red'],
        carLicensePlate: '1นน-1234 กท',
        carModified: false,
        carSubModelYear: 46444,
        carUsageType: 'personal',
        chassisNumber: '1234567',
        registeredProvince: 100000,
        vehicleIdNumber: '123ABCDE',
      },
    };

    const carInfoGeneral = {
      brand: 24,
      cabType: 'HATCH_BACK',
      carSubModelYear: 46444,
      engineSize: 1500,
      fuelType: 'Petrol',
      isCurated: true,
      isVan: false,
      model: 183,
      noOfDoor: 4,
      subModel: '1500 CC (4 Doors) e:HEV RS (HYBRID) ',
      sumInsuredMax: 0,
      transmissionType: 'Manual',
      year: 2020,
    };

    const formattedCarInfo = {
      brand: 24,
      cabType: 'HATCH BACK',
      carColor: ['Red'],
      carDashCam: false,
      carLicensePlate: '1นน-1234 กท',
      carModified: false,
      carRegisteredSeats: undefined,
      carSubModelYear: 46444,
      carUsageType: 'personal',
      chassisNumber: '1234567',
      engineSize: 1500,
      fuelType: 'Petrol',
      isVan: undefined,
      model: 183,
      noOfDoors: 4,
      redPlate: false,
      redbookId: null,
      registeredProvince: 100000,
      subModel: '1500 CC (4 Doors) e:HEV RS (HYBRID) ',
      transmission: 'Manual',
      vehicleIdNumber: '123ABCDE',
      year: 2020,
    };
    expect(formatCarInfo(customerInfo, carInfoGeneral)).toEqual(
      formattedCarInfo
    );
  });

  it('returns formatted data when passed with some fields missing', () => {
    const customerInfo = {
      data: {
        carColor: ['Red'],
        carSubModelYear: 46444,
        carUsageType: 'personal',
        chassisNumber: '1234567',
        registeredProvince: 100000,
        vehicleIdNumber: '123ABCDE',
      },
    };
    const carInfoGeneral = {
      brand: 24,
      cabType: 'HATCH_BACK',
      carSubModelYear: 46444,
      engineSize: 0,
      fuelType: 'Petrol',
      isCurated: true,
      isVan: false,
      model: 183,
      noOfDoor: null,
      subModel: '1500 CC (4 Doors) e:HEV RS (HYBRID) ',
      sumInsuredMax: 0,
      transmissionType: 'Manual',
      year: 2020,
    };

    const formattedCarInfo = {
      brand: 24,
      cabType: 'HATCH BACK',
      carColor: ['Red'],
      carDashCam: undefined,
      carLicensePlate: null,
      carModified: undefined,
      carRegisteredSeats: undefined,
      carSubModelYear: 46444,
      carUsageType: 'personal',
      chassisNumber: '1234567',
      engineSize: null,
      fuelType: 'Petrol',
      isVan: undefined,
      model: 183,
      noOfDoors: '',
      redPlate: undefined,
      redbookId: null,
      registeredProvince: 100000,
      subModel: '1500 CC (4 Doors) e:HEV RS (HYBRID) ',
      transmission: 'Manual',
      vehicleIdNumber: '123ABCDE',
      year: 2020,
    };
    expect(formatCarInfo(customerInfo, carInfoGeneral)).toEqual(
      formattedCarInfo
    );
  });
});

describe('customCarData', () => {
  it('returns custom car data ', () => {
    const carSubModelYear = '';
    const customCarDataResponse = {
      brand: 24,
      cabType: '',
      carSubModelYear: '',
      engineSize: 1500,
      fuelType: '',
      isCurated: true,
      isVan: false,
      model: 183,
      noOfDoor: 4,
      redbookId: null,
      subModel: '1500 CC (4 Doors) e:HEV RS (HYBRID) ',
      sumInsuredMax: 0,
      transmissionType: '',
      year: 2020,
    };
    expect(customCarData(CarApiResponse, carSubModelYear)).toEqual(
      customCarDataResponse
    );
  });

  it('returns null custom car data ', () => {
    const emptyApiResponse = {
      manufacturedYears: [],
      uniqueBrands: [],
      uniqueModels: [],
      car: [],
    };
    const carSubModelYear = '';
    const customCarDataResponse = {
      brand: null,
      cabType: null,
      carSubModelYear: '',
      engineSize: null,
      fuelType: null,
      isCurated: null,
      isVan: null,
      model: null,
      noOfDoor: null,
      redbookId: null,
      subModel: null,
      sumInsuredMax: null,
      transmissionType: null,
      year: null,
    };
    expect(customCarData(emptyApiResponse, carSubModelYear)).toEqual(
      customCarDataResponse
    );
  });
});

describe('isMotorLead', () => {
  it('should return check is lead is motor or not', () => {
    const motorResult = isMotorLead({
      product: 'products/car-insurance',
    } as any);
    expect(motorResult).toBe(true);
    const nonMotorResult = isMotorLead({ product: 'product/health' } as any);
    expect(nonMotorResult).toBe(false);
  });

  it('should return true if input data is undefined meaning it is loading(edgecase)', () => {
    const loadingResult = isMotorLead({} as any);
    expect(loadingResult).toBe(true);
  });
});
