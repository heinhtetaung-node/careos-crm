import { PRODUCTS } from 'config/TypeFilter';
import {
  AddressUsage,
  formatInitialFormData,
  formatOrderAddressPayload,
  getAddressSubmitBody,
  getDisableFieldsForPolicyAddress,
  getValueInForm,
  IFormData,
} from 'presentation/components/modal/LeadDetailsModal/AddressModal/helper';
import {
  hasSpecialChar,
  isInvalidCharacters,
  isNotANum,
} from 'shared/helper/utilities';

describe('Test isInvalidCharacters', () => {
  it('Should be return true if input include number', () => {
    expect(isInvalidCharacters('test1')).toEqual(true);
  });
  it('Should return true if input includes special characters', () => {
    expect(isInvalidCharacters(':(')).toEqual(true);
  });
  it('Should return true if input includes emoji', () => {
    expect(isInvalidCharacters('😀')).toEqual(true);
  });
  it('Should return false if input is valid', () => {
    expect(isInvalidCharacters('Test')).toEqual(false);
  });
});

describe('Test hasSpecialChar', () => {
  it('Should return true if input includes special characters', () => {
    expect(hasSpecialChar(':(ow12')).toEqual(true);
  });
  it('Should return true if input includes emoji', () => {
    expect(hasSpecialChar('😀')).toEqual(true);
  });
  it('Should return false if input is valid', () => {
    expect(hasSpecialChar('Test')).toEqual(false);
    expect(hasSpecialChar('test1')).toEqual(false);
  });
});

describe('Test isNotANum', () => {
  it('Should return true if input includes non-numeric characters', () => {
    expect(isNotANum('22!a')).toEqual(true);
    expect(isNotANum('abc')).toEqual(true);
  });
  it('Should return true if input includes emoji', () => {
    expect(isNotANum('😀')).toEqual(true);
  });
  it('Should return false if input is valid', () => {
    expect(isNotANum('1001')).toEqual(false);
  });
});

describe('Test getSubmitBody', () => {
  let context: any = {};

  beforeEach(() => {
    context = {
      province: '',
      district: '',
      postCode: '',
      addressType: 'personal',
      firstName: 'John',
      lastName: 'Wick',
    };
  });

  it('Should return with firstName and lastName', () => {
    const output = getAddressSubmitBody(
      {
        policy: context,
        shipping: context,
        billing: context,
        shipmentAddressIsSame: true,
        billingAddressIsSame: true,
      },
      'leadId'
    );
    const expected = {
      id: 'leadId',
      policy: {
        province: '',
        district: '',
        postCode: '',
        addressType: 'personal',
        firstName: 'John',
        lastName: 'Wick',
      },
      shipping: {
        province: '',
        district: '',
        postCode: '',
        addressType: 'personal',
        firstName: 'John',
        lastName: 'Wick',
      },
      billing: {
        province: '',
        district: '',
        postCode: '',
        addressType: 'personal',
        firstName: 'John',
        lastName: 'Wick',
      },
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    expect(JSON.stringify(output)).toEqual(JSON.stringify(expected));
    expect(output.id).toEqual(expected.id);
    expect(output?.policy?.province).toEqual(expected.policy.province);
    expect(output?.policy?.district).toEqual(expected.policy.district);
    expect(output?.policy?.postCode).toEqual(expected.policy.postCode);
    expect(output?.policy?.addressType).toEqual(expected.policy.addressType);
    expect(output?.policy?.firstName).toEqual(expected.policy.firstName);
    expect(output?.policy?.lastName).toEqual(expected.policy.lastName);
  });

  it('Should return without firstName and lastName', () => {
    const data = {
      ...context,
      addressType: 'company',
    };

    const output = getAddressSubmitBody(
      {
        policy: data,
        shipping: data,
        billing: data,
        shipmentAddressIsSame: true,
        billingAddressIsSame: true,
      },
      'leadId'
    );
    const expected = {
      id: 'leadId',
      policy: {
        province: '',
        district: '',
        postCode: '',
        addressType: 'company',
      },
      shipping: {
        province: '',
        district: '',
        postCode: '',
        addressType: 'company',
      },
      billing: {
        province: '',
        district: '',
        postCode: '',
        addressType: 'company',
      },
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };

    expect(JSON.stringify(output)).toEqual(JSON.stringify(expected));
    expect(output.id).toEqual(expected.id);
    expect(output?.policy?.province).toEqual(expected.policy.province);
    expect(output?.policy?.district).toEqual(expected.policy.district);
    expect(output?.policy?.postCode).toEqual(expected.policy.postCode);
    expect(output?.policy?.addressType).toEqual(expected.policy.addressType);
  });
});

describe('Test getValueInForm', () => {
  let context: any = {};

  beforeEach(() => {
    context = {
      province: '',
      district: '',
      postCode: '',
      addressType: 'personal',
      firstName: 'John',
      lastName: 'Wick',
    };
  });

  it('Should be return data', () => {
    const payload: IFormData = {
      policy: context,
      shipping: context,
      billing: context,
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };

    const output = getValueInForm(payload, AddressUsage.POLICY);
    expect(output.firstName).toBe(context.firstName);
  });
});

describe('formatInitialFormData', () => {
  const currentCustomer = {
    data: {
      customerFirstName: 'customerFirstName',
      customerLastName: 'customerLastName',
      policyHolderFirstName: 'policyHolderFirstName',
      policyHolderLastName: 'policyHolderLastName',
      policyHolderType: 'customer',
    },
  };

  test('should set customerFirstName, lastName and addressType if customer is policyHolder', () => {
    currentCustomer.data.policyHolderType = 'customer';
    const result = getDisableFieldsForPolicyAddress(
      {} as any,
      currentCustomer as any
    );
    expect(result.firstName).toBe('customerFirstName');
    expect(result.lastName).toBe('customerLastName');
    expect(result.addressType).toBe('personal');
  });

  test('should set policyHolderFirstName, lastName and addressType if customer is not policyHolder', () => {
    currentCustomer.data.policyHolderType = 'straw_buyer';
    const result = getDisableFieldsForPolicyAddress(
      {} as any,
      currentCustomer as any
    );
    expect(result.firstName).toBe('policyHolderFirstName');
    expect(result.lastName).toBe('policyHolderLastName');
    expect(result.addressType).toBe('personal');
  });

  test('should set addressType if customer is company', () => {
    currentCustomer.data.policyHolderType = 'company';
    const result = getDisableFieldsForPolicyAddress(
      {} as any,
      currentCustomer as any
    );
    expect(result.firstName).toBe('');
    expect(result.lastName).toBe('');
    expect(result.addressType).toBe('company');
  });
});

describe('Order formatOrderAddressPayload helper - ', () => {
  const mockAddress = () => ({
    addressType: 'personal',
    address: 'Test address',
    province: 100001,
    district: 100100,
    subDistrict: 100101,
    postCode: 10200,
  });
  test("If billing and shipping address same as policy, payload shouldn't have billing and shipping addresses", () => {
    const payload = formatOrderAddressPayload({
      billingAddressIsSame: true,
      shipmentAddressIsSame: true,
      billing: {},
      policy: mockAddress(),
      shipping: {},
    });
    expect(payload).toHaveLength(8); // policy payload shouldn't include fullName when address modal update.
  });

  test("If shipping address same as policy, payload shouldn't have shipping addresses", () => {
    const payload = formatOrderAddressPayload({
      billingAddressIsSame: false,
      shipmentAddressIsSame: true,
      billing: mockAddress(),
      policy: mockAddress(),
      shipping: {},
    });
    expect(
      payload.some((p) =>
        String(p.path).startsWith('data/policyHolder/shippingAddress/')
      )
    ).toBe(false);
  });

  test('If billing and shipping address is not same as policy, motor payload includes shipping fullName', () => {
    const policy = mockAddress();
    const payload = formatOrderAddressPayload(
      {
        billingAddressIsSame: false,
        shipmentAddressIsSame: false,
        billing: mockAddress(),
        policy,
        shipping: mockAddress(),
      },
      PRODUCTS.CAR_PRODUCT_INSURANCE
    );
    expect(
      payload.some(
        (p) => p.path === 'data/policyHolder/shippingAddress/fullName'
      )
    ).toBe(true);
  });

  test('Non-motor order omits shipping fullName patch', () => {
    const policy = mockAddress();
    const payload = formatOrderAddressPayload(
      {
        billingAddressIsSame: false,
        shipmentAddressIsSame: false,
        billing: mockAddress(),
        policy,
        shipping: mockAddress(),
      },
      PRODUCTS.HEALTH_PRODUCT_INSURANCE
    );
    expect(
      payload.some(
        (p) => p.path === 'data/policyHolder/shippingAddress/fullName'
      )
    ).toBe(false);
  });

  test('Unknown product omits shipping fullName patch', () => {
    const policy = mockAddress();
    const payload = formatOrderAddressPayload({
      billingAddressIsSame: false,
      shipmentAddressIsSame: false,
      billing: mockAddress(),
      policy,
      shipping: mockAddress(),
    });
    expect(
      payload.some(
        (p) => p.path === 'data/policyHolder/shippingAddress/fullName'
      )
    ).toBe(false);
  });
});

describe('Test formatInitialFormData', () => {
  test('should render policy, billing and shipping addrress with proper data if the address is available', () => {
    const currentCustomer = {
      important: false,
      name: 'leads/e0d7c7a6-32f3-47f2-83d5-7e5178652983',
      createTime: '2022-10-05T09:41:34.870622Z',
      updateTime: '2022-10-05T11:45:27.044915Z',
      deleteTime: null,
      createBy: '',
      product: 'products/car-insurance',
      schema: 'schemas/efce3390-8da6-44b3-9e4c-2c7b78ca2c9d',
      data: {
        carDashCam: true,
        carModified: true,
        carSubModelYear: 47094,
        carUsageType: 'personal',
        checkout: {
          package: 'packages/1358690',
        },
        compulsoryPolicyStartDate: '2022-10-10',
        currentInsurer: 27,
        customerBillingAddress: [
          {
            address: 'Test',
            addressType: 'personal',
            district: 100100,
            firstName: 'Test Address',
            lastName: 'Test Address',
            postCode: 10200,
            province: 100000,
            subDistrict: 100101,
          },
        ],
        customerDOB: '1998-02-02',
        customerEmail: ['test@gmail.com'],
        customerFirstName: 'Test Address',
        customerGender: 'm',
        customerLastName: 'Test Address',
        customerPhoneNumber: [
          {
            phone: '+66802020202',
            status: 'unverified',
          },
        ],
        customerPolicyAddress: [
          {
            address: 'Test',
            addressType: 'personal',
            district: 100100,
            firstName: 'Test Address',
            lastName: 'Test Address',
            postCode: 10200,
            province: 100000,
            subDistrict: 100101,
          },
        ],
        customerShippingAddress: [
          {
            address: 'Test',
            addressType: 'personal',
            district: 100100,
            firstName: 'Test Address',
            lastName: 'Test Address',
            postCode: 10200,
            province: 100000,
            subDistrict: 100101,
          },
        ],
        insuranceKind: 'both',
        locale: 'th-en',
        marketingConsent: true,
        numberOfFixedDriver: 0,
        policyHolderDOB: '1998-02-02',
        policyHolderFirstName: 'Test Address',
        policyHolderGender: 'm',
        policyHolderLastName: 'Test Address',
        policyHolderType: 'customer',
        policyStartDate: '2022-10-10',
        policyTitle: 'MR',
        primaryPhoneIndex: 0,
        registeredProvince: 100000,
        utm: {
          lead_source: 'rabbit.co.th',
          referrer_url: 'http://localhost:3000/',
        },
        voluntaryInsuranceType: ['type_1', 'type_2+', 'type_3+'],
      },
      source: 'sources/83894936-ac03-4e7d-ba4b-6fc5f3b529b2',
      assignedTo: '',
      status: 'LEAD_STATUS_NEW',
      humanId: 'L9884516',
      root: '',
      type: 'LEAD_TYPE_NEW',
      isRejected: false,
      reference: '',
      annotations: null,
      responseTimes: 576,
    };
    const mockResponseCustomerWithData = {
      policy: {
        addressType: 'personal',
        address: 'Test',
        province: 100000,
        district: 100100,
        postCode: 10200,
        firstName: 'Test Address',
        lastName: 'Test Address',
        taxId: '',
        companyName: '',
        subDistrict: 100101,
      },
      shipping: {
        addressType: 'personal',
        address: 'Test',
        province: 100000,
        district: 100100,
        postCode: 10200,
        firstName: 'Test Address',
        lastName: 'Test Address',
        taxId: '',
        companyName: '',
        subDistrict: 100101,
      },
      billing: {
        addressType: 'personal',
        address: 'Test',
        province: 100000,
        district: 100100,
        postCode: 10200,
        firstName: 'Test Address',
        lastName: 'Test Address',
        taxId: '',
        companyName: '',
        subDistrict: 100101,
      },
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    const result = formatInitialFormData(currentCustomer);
    expect(result).toEqual(mockResponseCustomerWithData);
  });

  test('should render policy, billing and shipping addrress with blank data if the address is not available', () => {
    const currentCustomer = {
      important: false,
      name: 'leads/f83acf5c-3558-44e6-a68b-0067a9d55193',
      createTime: '2022-10-05T12:45:44.872653Z',
      updateTime: '2022-10-05T13:07:39.882914Z',
      deleteTime: null,
      createBy: '',
      product: 'products/car-insurance',
      schema: 'schemas/efce3390-8da6-44b3-9e4c-2c7b78ca2c9d',
      data: {
        carDashCam: true,
        carModified: true,
        carSubModelYear: 47094,
        carUsageType: 'personal',
        checkout: {
          package: 'packages/1368895',
        },
        compulsoryPolicyStartDate: '2022-10-09',
        currentInsurer: 27,
        customerBillingAddress: [],
        customerDOB: '1998-02-02',
        customerEmail: ['tes@gmail.com'],
        customerFirstName: 'Test Policy',
        customerGender: 'm',
        customerLastName: 'Test Policy',
        customerPhoneNumber: [
          {
            phone: '+66802020202',
            status: 'unverified',
          },
        ],
        customerPolicyAddress: [
          {
            address: '',
            addressType: 'personal',
            companyName: '',
            district: -1,
            postCode: -1,
            province: -1,
            subDistrict: -1,
            taxId: '',
          },
        ],
        customerShippingAddress: [],
        insuranceKind: 'both',
        locale: 'th-en',
        marketingConsent: true,
        numberOfFixedDriver: 0,
        policyHolderDOB: '1998-02-02',
        policyHolderFirstName: 'Test Policy',
        policyHolderGender: 'm',
        policyHolderLastName: 'Test Policy',
        policyHolderType: 'customer',
        policyStartDate: '2022-10-09',
        policyTitle: 'MR',
        primaryPhoneIndex: 0,
        registeredProvince: 100000,
        utm: {
          lead_source: 'rabbit.co.th',
          referrer_url: 'http://localhost:3000/',
        },
        voluntaryInsuranceType: ['type_1', 'type_2+', 'type_3+'],
      },
      source: 'sources/83894936-ac03-4e7d-ba4b-6fc5f3b529b2',
      assignedTo: '',
      status: 'LEAD_STATUS_NEW',
      humanId: 'L9884530',
      root: '',
      type: 'LEAD_TYPE_NEW',
      isRejected: false,
      reference: '',
      annotations: null,
      responseTimes: 1852,
    };
    const mockResponseCustomerWithoutData = {
      policy: {
        addressType: 'personal',
        address: '',
        province: -1,
        district: -1,
        postCode: '',
        firstName: '',
        lastName: '',
        taxId: '',
        companyName: '',
        subDistrict: -1,
      },
      shipping: {
        addressType: '',
        address: '',
        province: '',
        district: '',
        postCode: '',
        firstName: '',
        lastName: '',
        taxId: '',
        companyName: '',
        subDistrict: '',
      },
      billing: {
        addressType: '',
        address: '',
        province: '',
        district: '',
        postCode: '',
        firstName: '',
        lastName: '',
        taxId: '',
        companyName: '',
        subDistrict: '',
      },
      shipmentAddressIsSame: true,
      billingAddressIsSame: true,
    };
    const result = formatInitialFormData(currentCustomer);
    expect(result).not.toEqual(mockResponseCustomerWithoutData);
  });
});
