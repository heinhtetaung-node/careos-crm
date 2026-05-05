import LeadSearchResponse from 'mock-data/LeadSearch.mock';

import {
  customTrueFalse,
  customerGender,
  customerLeadStatus,
  customerLeadType,
  customerPolicyType,
  findLongInsurerName,
  findShortInsurerName,
  formatOneLead,
  getEmailAddresses,
  getPhoneNumber,
} from './index';

const leadApiResponse = {
  lead: {
    name: 'leads/6b020c28-b423-4340-8c30-5c59a1d03f64',
    createTime: '',
    updateTime: '',
    deleteTime: null,
    createBy: '',
    product: 'products/car-insurance',
    schema: 'schemas/efce3390-8da6-44b3-9e4c-2c7b78ca2c9d',
    data: {
      carDashCam: true,
      carLicensePlate: 'kkkk',
      carModified: false,
      carSubModelYear: 18887,
      carUsageType: 'personal',
      currentInsurer: 27,
      customerDOB: '',
      customerEmail: ['test@test.com'],
      customerFirstName: 'Test',
      customerGender: 'm',
      customerLastName: 'Test',
      customerPhoneNumber: [
        { phone: '+66999999999', status: 'unverified' },
        { phone: '+66123456789', status: 'unverified' },
      ],
      customerPolicyAddress: [
        {
          address: 'số 9, ngõ 29, trần phú',
          addressType: 'personal',
          district: 110200,
          firstName: 'test',
          lastName: 'test',
          postCode: 10560,
          province: 110000,
          subDistrict: 110203,
        },
      ],
      customerShippingAddress: [
        {
          address: 'số 9, ngõ 29, trần phú',
          addressType: 'personal',
          district: 110200,
          firstName: 'Vu',
          lastName: 'Thuy',
          postCode: 10560,
          province: 110000,
          subDistrict: 110203,
        },
      ],
      insuranceKind: 'both',
      locale: 'th-en',
      marketingConsent: false,
      policyHolderFirstName: 'John',
      policyHolderLastName: '',
      policyStartDate: '',
      registeredProvince: 100000,
      utm: { lead_source: 'rabbit.co.th' },
      voluntaryInsuranceType: ['type_2+', 'type_3+'],
    },
    source: 'sources/9dc888b0-1676-4359-9186-2b368fcfe93f',
    important: false,
    assignedTo: '',
    status: 'LEAD_STATUS_NEW',
    humanId: 'L62015',
    root: '',
    type: 'LEAD_TYPE_NEW',
    isRejected: false,
  },
  source: {
    name: 'sources/9dc888b0-1676-4359-9186-2b368fcfe93f',
    createTime: '',
    updateTime: '',
    deleteTime: null,
    createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
    updateBy: 'users/60644dcf-1aa6-4565-9d04-124e155641c2',
    product: 'products/car-insurance',
    online: true,
    hidden: false,
    source: '72rf-sales-flow-api',
    medium: 'hydra',
    campaign: 'hydra dummy',
  },
  customer: null,
  team: null,
  insuree: {
    age: 21,
    dateOfBirth: '',
    email: ['test@test.com'],
    firstName: 'Test',
    fullName: 'Test Test',
    gender: 'm',
    lastName: 'Test',
    phone: ['+66123456789'],
  },
  car: {
    brand: 'Honda',
    brandId: 24,
    dashcam: true,
    engineSize: 1497,
    licensePlate: 'kkkk',
    model: 'City',
    modelId: 183,
    modified: false,
    registeredProvince: 'Bangkok',
    registeredProvinceId: 100000,
    submodelId: 5691,
    transmission: 'Automatic',
    usage: 'personal',
    year: 2017,
    yearsId: 18887,
  },
  insurance: {
    currentInsurer: 'Viriyah Insurance',
    currentInsurerId: 27,
    policyStartDate: '',
    voluntaryInsuranceType: ['type_2+', 'type_3+'],
  },
  assigned: null,
  appointments: [
    {
      name: 'calendars/9f48cd36-bad9-430b-8964-ee590c341583/events/da818437-286d-45f1-bd43-9a6d3959daef',
      createTime: '',
      updateTime: '',
      deleteTime: null,
      createBy: 'users/9f48cd36-bad9-430b-8964-ee590c341583',
      startTime: '',
      endTime: '',
      appointment: {
        lead: 'leads/6b020c28-b423-4340-8c30-5c59a1d03f64',
        appointmentType: 'agreed',
        payment: false,
        subject: 'Call test',
      },
    },
    {
      name: 'calendars/9f48cd36-bad9-430b-8964-ee590c341583/events/3a9b4c25-842a-44ff-9396-a4be777cb8d3',
      createTime: '',
      updateTime: '',
      deleteTime: null,
      createBy: 'users/9f48cd36-bad9-430b-8964-ee590c341583',
      startTime: '',
      endTime: '',
      appointment: {
        lead: 'leads/6b020c28-b423-4340-8c30-5c59a1d03f64',
        appointmentType: 'agreed',
        payment: false,
        subject: 'KL',
      },
    },
  ],
  rejections: [
    {
      name: 'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/rejections/c787d33b-d0e3-494d-8848-6c1ab428bf45',
      createTime: '2022-09-23T14:18:31.396383436Z',
      updateTime: '2022-09-23T14:18:31.396383436Z',
      deleteTime: null,
      createBy: 'users/fec79494-ab64-42f8-809d-aac20c68fa9a',
      reason: 'cant_contact',
      comment:
        'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/comments/7b26a516-8d62-487a-a24f-87b3bb8aceb4',
      decideTime: null,
      decideBy: '',
      approved: false,
    },
  ],
  attributes: {
    isDuplicate: true,
  },
};

describe('Test customTrueFalse', () => {
  it('Should be return empty if input is not boolean', () => {
    expect(customTrueFalse('' as any)).toEqual('');
  });
  it('Should be return Yes if input is true', () => {
    expect(customTrueFalse(true)).toEqual('customTrueFalse.yes');
  });
  it('Should be return No if input is false', () => {
    expect(customTrueFalse(false)).toEqual('customTrueFalse.no');
  });
});

describe('Test customGender', () => {
  it('Should be return empty if input is empty', () => {
    expect(customerGender('' as any)).toEqual('');
  });
  it('Should be return "Male" if input is is "m"', () => {
    expect(customerGender('m')).toEqual('Male');
  });
  it('Should be return "Female" if input is false', () => {
    expect(customerGender('f')).toEqual('Female');
  });
});

describe('Test customerLeadStatus', () => {
  it('Should be return empty if status not found', () => {
    expect(customerLeadStatus('')).toEqual('');
  });
  it('Should be return lead title status', () => {
    expect(customerLeadStatus('LEAD_STATUS_NEW')).toEqual('leadStatus.new');
  });
});

describe('Test customerLeadType', () => {
  it('Should be return empty if not found lead type', () => {
    expect(customerLeadType('')).toEqual('');
  });
  it('Should be return lead type', () => {
    expect(customerLeadType('LEAD_TYPE_NEW')).toEqual('leadTypeFilter.new');
  });
});

describe('Test customerPolicyType', () => {
  it('Should be return null if input is empty array', () => {
    expect(customerPolicyType([])).toEqual('');
  });
  it('Should be return combine string of policy type', () => {
    expect(customerPolicyType(['type_1', 'type_2'])).toEqual('Type 1, Type 2');
  });
});

describe('Test formatOneLead', () => {
  it('returns empty object when passed null', () => {
    expect(formatOneLead(null)).toEqual({});
  });

  it('returns last number in insuree.phone when there is no primary index', () => {
    expect(formatOneLead(leadApiResponse)).toEqual({
      age: 21,
      appointmentDate: '',
      assignedOn: '',
      assignmentResourceName: undefined,
      carBrand: 'Honda',
      carDashcam: 'customTrueFalse.yes',
      carEngineSize: '1497 CC',
      carModel: 'City',
      carModification: 'customTrueFalse.no',
      carRegisteredProvince: 'Bangkok',
      carTransmission: 'Automatic',
      carUsage: 'personal',
      carYear: 2017,
      commentId:
        'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/comments/7b26a516-8d62-487a-a24f-87b3bb8aceb4',
      connectDials: '',
      createdOn: '',
      currentInsurer: 'shortInsurers.27',
      customerId: '',
      dob: '',
      duplicateLead: 'customTrueFalse.yes',
      email: 'te**@test.com',
      expiryDate: '',
      failedDials: '',
      gender: 'Male',
      isChecked: false,
      isRejected: false,
      lastInsurer: '',
      lastVisitedOn: '',
      leadDetailId: '6b020c28-b423-4340-8c30-5c59a1d03f64',
      leadId: 'L62015',
      leadScore: '',
      leadSource: '72rf-sales-flow-api',
      leadStatus: 'leadStatus.new',
      leadSubStatus: '',
      leadType: 'leadTypeFilter.new',
      licensePlate: 'kkkk',
      marketingConsent: 'customTrueFalse.no',
      name: 'Test Test',
      paymentDate: '',
      phoneNumber: '012345****',
      policyPreferredType: 'Type 2+, Type 3+',
      policyStartDate: '',
      referralId: '',
      rejectedDate: '23/09/2022 (09:18:31 PM)',
      rejectionComment: '',
      rejectionId:
        'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/rejections/c787d33b-d0e3-494d-8848-6c1ab428bf45',
      rejectionReason: 'rejectReason.cantContact',
      rejections: [
        {
          approved: false,
          comment:
            'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/comments/7b26a516-8d62-487a-a24f-87b3bb8aceb4',
          createBy: 'users/fec79494-ab64-42f8-809d-aac20c68fa9a',
          createTime: '2022-09-23T14:18:31.396383436Z',
          decideBy: '',
          decideTime: null,
          deleteTime: null,
          name: 'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/rejections/c787d33b-d0e3-494d-8848-6c1ab428bf45',
          reason: 'cant_contact',
          updateTime: '2022-09-23T14:18:31.396383436Z',
        },
      ],
      renewalId: '',
      renewalPackageStatus: '',
      sumInsured: '',
      sundayContactable: '',
      teamName: '',
      totalDials: '',
      updatedOn: '',
      user: ' ',
      optOutCalls: undefined,
      callAttempts: '0',
      lastCallDate: '',
      daysSinceLastCall: '',
    });
  });

  it('returns unmasked phone and email is user role is admin', () => {
    expect(formatOneLead(leadApiResponse, 'roles/admin')).toEqual({
      age: 21,
      appointmentDate: '',
      assignedOn: '',
      assignmentResourceName: undefined,
      carBrand: 'Honda',
      carDashcam: 'customTrueFalse.yes',
      carEngineSize: '1497 CC',
      carModel: 'City',
      carModification: 'customTrueFalse.no',
      carRegisteredProvince: 'Bangkok',
      carTransmission: 'Automatic',
      carUsage: 'personal',
      carYear: 2017,
      commentId:
        'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/comments/7b26a516-8d62-487a-a24f-87b3bb8aceb4',
      connectDials: '',
      createdOn: '',
      currentInsurer: 'shortInsurers.27',
      customerId: '',
      dob: '',
      duplicateLead: 'customTrueFalse.yes',
      email: 'test@test.com',
      expiryDate: '',
      failedDials: '',
      gender: 'Male',
      isChecked: false,
      isRejected: false,
      lastInsurer: '',
      lastVisitedOn: '',
      leadDetailId: '6b020c28-b423-4340-8c30-5c59a1d03f64',
      leadId: 'L62015',
      leadScore: '',
      leadSource: '72rf-sales-flow-api',
      leadStatus: 'leadStatus.new',
      leadSubStatus: '',
      leadType: 'leadTypeFilter.new',
      licensePlate: 'kkkk',
      marketingConsent: 'customTrueFalse.no',
      name: 'Test Test',
      paymentDate: '',
      phoneNumber: '+66123456789',
      policyPreferredType: 'Type 2+, Type 3+',
      policyStartDate: '',
      referralId: '',
      rejectedDate: '23/09/2022 (09:18:31 PM)',
      rejectionComment: '',
      rejectionId:
        'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/rejections/c787d33b-d0e3-494d-8848-6c1ab428bf45',
      rejectionReason: 'rejectReason.cantContact',
      rejections: [
        {
          approved: false,
          comment:
            'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/comments/7b26a516-8d62-487a-a24f-87b3bb8aceb4',
          createBy: 'users/fec79494-ab64-42f8-809d-aac20c68fa9a',
          createTime: '2022-09-23T14:18:31.396383436Z',
          decideBy: '',
          decideTime: null,
          deleteTime: null,
          name: 'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/rejections/c787d33b-d0e3-494d-8848-6c1ab428bf45',
          reason: 'cant_contact',
          updateTime: '2022-09-23T14:18:31.396383436Z',
        },
      ],
      renewalId: '',
      renewalPackageStatus: '',
      sumInsured: '',
      sundayContactable: '',
      teamName: '',
      totalDials: '',
      updatedOn: '',
      user: ' ',
      optOutCalls: undefined,
      callAttempts: '0',
      lastCallDate: '',
      daysSinceLastCall: '',
    });
  });

  it('returns masked phone and email is user role is not admin', () => {
    expect(formatOneLead(leadApiResponse, 'roles/sales')).toEqual({
      age: 21,
      appointmentDate: '',
      assignedOn: '',
      assignmentResourceName: undefined,
      carBrand: 'Honda',
      carDashcam: 'customTrueFalse.yes',
      carEngineSize: '1497 CC',
      carModel: 'City',
      carModification: 'customTrueFalse.no',
      carRegisteredProvince: 'Bangkok',
      carTransmission: 'Automatic',
      carUsage: 'personal',
      carYear: 2017,
      commentId:
        'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/comments/7b26a516-8d62-487a-a24f-87b3bb8aceb4',
      connectDials: '',
      createdOn: '',
      currentInsurer: 'shortInsurers.27',
      customerId: '',
      dob: '',
      duplicateLead: 'customTrueFalse.yes',
      email: 'te**@test.com',
      expiryDate: '',
      failedDials: '',
      gender: 'Male',
      isChecked: false,
      isRejected: false,
      lastInsurer: '',
      lastVisitedOn: '',
      leadDetailId: '6b020c28-b423-4340-8c30-5c59a1d03f64',
      leadId: 'L62015',
      leadScore: '',
      leadSource: '72rf-sales-flow-api',
      leadStatus: 'leadStatus.new',
      leadSubStatus: '',
      leadType: 'leadTypeFilter.new',
      licensePlate: 'kkkk',
      marketingConsent: 'customTrueFalse.no',
      name: 'Test Test',
      paymentDate: '',
      phoneNumber: '012345****',
      policyPreferredType: 'Type 2+, Type 3+',
      policyStartDate: '',
      referralId: '',
      rejectedDate: '23/09/2022 (09:18:31 PM)',
      rejectionComment: '',
      rejectionId:
        'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/rejections/c787d33b-d0e3-494d-8848-6c1ab428bf45',
      rejectionReason: 'rejectReason.cantContact',
      rejections: [
        {
          approved: false,
          comment:
            'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/comments/7b26a516-8d62-487a-a24f-87b3bb8aceb4',
          createBy: 'users/fec79494-ab64-42f8-809d-aac20c68fa9a',
          createTime: '2022-09-23T14:18:31.396383436Z',
          decideBy: '',
          decideTime: null,
          deleteTime: null,
          name: 'leads/3cbbb7c8-7997-47fd-aa8e-683c07c258fb/rejections/c787d33b-d0e3-494d-8848-6c1ab428bf45',
          reason: 'cant_contact',
          updateTime: '2022-09-23T14:18:31.396383436Z',
        },
      ],
      renewalId: '',
      renewalPackageStatus: '',
      sumInsured: '',
      sundayContactable: '',
      teamName: '',
      totalDials: '',
      updatedOn: '',
      user: ' ',
      optOutCalls: undefined,
      callAttempts: '0',
      lastCallDate: '',
      daysSinceLastCall: '',
    });
  });

  it('returns the rejection reason when isRejected is true', () => {
    expect(formatOneLead(LeadSearchResponse, 'roles/admin')).toEqual({
      age: '',
      appointmentDate: '',
      assignedOn: '',
      assignmentResourceName: undefined,
      carBrand: '',
      carDashcam: '',
      carEngineSize: '',
      carModel: '',
      carModification: '',
      carRegisteredProvince: '',
      carTransmission: '',
      carUsage: '',
      carYear: '',
      commentId:
        'leads/a48bfa7a-eac9-4341-b686-b3a439a4c1c3/comments/aed63ce4-a1c8-4d88-ac77-6645204c677a',
      connectDials: '',
      createdOn: '19/10/2023 (03:17:18 PM)',
      currentInsurer: '',
      customerId: '',
      dob: '',
      duplicateLead: 'customTrueFalse.yes',
      email: '',
      expiryDate: '28/10/2023',
      failedDials: '',
      gender: '',
      isChecked: false,
      isRejected: true,
      lastInsurer: '',
      lastVisitedOn: '',
      leadDetailId: 'a48bfa7a-eac9-4341-b686-b3a439a4c1c3',
      leadId: 'L9907480',
      leadScore: '',
      leadSource: 'Import source 5971',
      leadStatus: 'leadStatus.new',
      leadSubStatus: '',
      leadType: 'leadTypeFilter.new',
      licensePlate: '',
      marketingConsent: '',
      name: 'Oriol test',
      paymentDate: '',
      phoneNumber: '+66999999999',
      policyPreferredType: '',
      policyStartDate: '',
      referralId: '',
      rejectedDate: '19/10/2023 (03:20:30 PM)',
      rejectionComment: '',
      rejectionId:
        'leads/a48bfa7a-eac9-4341-b686-b3a439a4c1c3/rejections/9ccf7982-3c3f-4949-aa7b-f6fe657dfa46',
      rejectionReason: 'rejectReason.purchasedFromOthersDuringSalesProcess',
      rejections: [
        {
          approved: true,
          comment:
            'leads/a48bfa7a-eac9-4341-b686-b3a439a4c1c3/comments/aed63ce4-a1c8-4d88-ac77-6645204c677a',
          createBy: 'users/89a8f358-7ff5-4dc5-ad33-76a8086a85b5',
          createTime: '2023-10-19T08:20:30.743313Z',
          decideBy: 'users/89a8f358-7ff5-4dc5-ad33-76a8086a85b5',
          decideTime: '2023-10-19T08:22:16.096243Z',
          deleteTime: null,
          name: 'leads/a48bfa7a-eac9-4341-b686-b3a439a4c1c3/rejections/9ccf7982-3c3f-4949-aa7b-f6fe657dfa46',
          reason: 'purchased_from_others_during_sales_process',
          updateTime: '2023-10-19T08:22:16.099Z',
        },
        {
          approved: false,
          comment:
            'leads/a48bfa7a-eac9-4341-b686-b3a439a4c1c3/comments/adbc23ca-6bd4-44c2-aadb-0dd1152eaedb',
          createBy: 'users/89a8f358-7ff5-4dc5-ad33-76a8086a85b5',
          createTime: '2023-10-19T08:18:33.617838Z',
          decideBy: 'users/89a8f358-7ff5-4dc5-ad33-76a8086a85b5',
          decideTime: '2023-10-19T08:18:48.889087Z',
          deleteTime: null,
          name: 'leads/a48bfa7a-eac9-4341-b686-b3a439a4c1c3/rejections/4e98352b-7d69-49e7-8b26-6a4344f6d835',
          reason: 'purchased_from_others_during_sales_process',
          updateTime: '2023-10-19T08:18:48.891857Z',
        },
      ],
      renewalId: '',
      renewalPackageStatus: '',
      sumInsured: '',
      sundayContactable: 'genericOption.no',
      teamName: '',
      totalDials: '',
      updatedOn: '19/10/2023 (03:22:16 PM)',
      user: ' ',
      optOutCalls: undefined,
      callAttempts: '0',
      lastCallDate: '',
      daysSinceLastCall: '',
    });
  });
});

describe('Test findLongInsurerName', () => {
  it('Should return null if input empty', () => {
    expect(findLongInsurerName('')).toEqual('');
  });

  it('Should return default value if language is english', () => {
    localStorage.setItem('LOCALE', 'en');
    expect(findLongInsurerName('test', 'default')).toEqual('default');
  });

  it('Should return long insurer name if input has id', () => {
    localStorage.clear();
    expect(findLongInsurerName('name/1', '')).toEqual('longInsurers.1');
  });
});

describe('Test findShortInsurerName', () => {
  it('Should return null if input empty', () => {
    expect(findShortInsurerName('')).toEqual('');
  });

  it('Should return default value if language is english', () => {
    localStorage.setItem('LOCALE', 'en');
    expect(findShortInsurerName('test', 'default')).toEqual('default');
  });

  it('Should return short insurer name if input has id', () => {
    localStorage.clear();
    expect(findShortInsurerName('1', '')).toEqual('shortInsurers.1');
  });
});

interface fakeData {
  insuree: any;
  lead?: any;
}

describe('getPhoneNumber', () => {
  const fakeItemData: fakeData = {
    insuree: { phone: ['+66999999999', '+66888888888'] },
    lead: {
      data: { primaryPhoneIndex: 0 },
    },
  };

  it('Should return null if item passed is empty', () => {
    expect(getPhoneNumber({})).toEqual('');
  });

  it('Should return the phone number that matches primaryPhoneIndex', () => {
    expect(getPhoneNumber(fakeItemData)).toEqual('+66999999999');
  });

  it('Should return the phone number that is in last index of insuree.phone', () => {
    delete fakeItemData.lead.data.primaryPhoneIndex;
    expect(getPhoneNumber(fakeItemData)).toEqual('+66888888888');
  });
});

describe('getEmailAddresses', () => {
  const fakeItemData: fakeData = {
    insuree: {
      email: [
        'mattanapornp@rabbit.co.th',
        'first@email.com',
        'alexandera@rabbit.co.th',
        'test@gmail.com',
        'mithleshmeghwal0@gmail.com',
      ],
    },
  };

  it('Should return null if item passed is empty', () => {
    expect(getEmailAddresses({})).toEqual('');
  });

  it('Should return the last email from the list', () => {
    expect(getEmailAddresses(fakeItemData)).toEqual(
      'mithleshmeghwal0@gmail.com'
    );
  });

  it('Should return the masked email if maskData is set to true', () => {
    expect(getEmailAddresses(fakeItemData, true)).toEqual(
      'mi**************@gmail.com'
    );
  });
});
