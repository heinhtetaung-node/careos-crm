import { transformLeadsResponse } from './index';

// Mock dependencies
jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));
jest.mock('presentation/redux/reducers/leads/lead-assignment', () => ({
  customerLeadStatus: (status: string) => status,
  customerLeadType: (type: string) => type,
  customerGender: (gender: string) => gender,
  findShortInsurerName: (id: string, name: string) => name || id,
}));
jest.mock('shared/helper/utilities', () => ({
  modelValidationField: (v: any) => v,
  getAgeByBirthday: () => 30,
  NewDateFormatters: () => ({ DDMMYYYY: (date: string) => date }),
  formatDDMMYYYYHHMMSS: (date: string) => date,
  formatTimeAgo: () => '1 day ago',
  getYesNoOptions: (v: any) => v,
}));
jest.mock('lodash/has', () => () => true);
jest.mock('lodash/get', () => () => true);
const response = {
  leads: [
    {
      lead: {
        name: 'lead1',
        status: 'active',
        type: 'typeA',
        humanId: 'H123',
        data: {
          customer: {
            gender: 'male',
            dob: '1990-01-01',
            emails: ['a@test.com'],
          },
          callAvailability: { day: 'Monday', interval: 'Morning' },
          policyHolder: { locale: 'en-US' },
        },
        reference: 'ref1',
        isRejected: false,
        annotations: { remark: 'remark' },
        createTime: '2023-01-01',
      },
      assigned: { firstName: 'John', lastName: 'Doe' },
      attributes: {
        assignmentResourceName: 'res1',
        sundayContactable: true,
        callAttempts: 2,
        lastCallTimestamp: '2023-01-02',
      },
      source: { source: 'web' },
      rejections: [],
      appointments: [],
      insurance: {},
      insuree: {},
    },
  ],
  total: 1,
};
describe('transformLeadsResponse', () => {
  it('should transform response leads correctly', () => {
    const result = transformLeadsResponse(response);
    if (Array.isArray(result)) {
      // Should not be array for this test
      expect(result).toEqual([]);
    } else {
      expect(result.imports.length).toBe(1);
      expect(result.imports[0].id).toBe('lead1');
      expect(result.imports[0].leadStatus).toBe('active');
      expect(result.imports[0].agentName).toBe('John Doe');
      expect(result.imports[0].customerGender).toBe('male');
      expect(result.imports[0].customerDOB).toBe('1990-01-01');
      expect(result.imports[0].customerEmail).toBe('a@test.com');
      expect(result.total).toBe(1);
    }
  });

  it('should transform response leads for call availability', () => {
    const callAsapResponse = {
      leads: [
        {
          lead: {
            name: 'lead1',
            status: 'active',
            type: 'typeA',
            humanId: 'H123',
            data: {
              customer: {
                gender: 'male',
                dob: '1990-01-01',
                emails: ['a@test.com'],
              },
              callAvailability: { asap: true },
              policyHolder: { locale: 'en-US' },
            },
            reference: 'ref1',
            isRejected: false,
            annotations: { remark: 'remark' },
            createTime: '2023-01-01',
          },
          assigned: { firstName: 'John', lastName: 'Doe' },
          attributes: {
            assignmentResourceName: 'res1',
            sundayContactable: true,
            callAttempts: 2,
            lastCallTimestamp: '2023-01-02',
          },
          source: { source: 'web' },
          rejections: [],
          appointments: [],
          insurance: {},
          insuree: {},
        },
      ],
      total: 1,
    };
    const result = transformLeadsResponse(callAsapResponse);
    if (Array.isArray(result)) {
      // Should not be array for this test
      expect(result).toEqual([]);
    } else {
      expect(result.imports.length).toBe(1);
      expect(result.imports[0].id).toBe('lead1');
      expect(result.imports[0].preferredCallDateTime).toBe('healthLead.asap');
      expect(result.total).toBe(1);
    }
  });

  it('should transform response leads for call availability asap false', () => {
    const callAsapResponse = {
      leads: [
        {
          lead: {
            name: 'lead1',
            status: 'active',
            type: 'typeA',
            humanId: 'H123',
            data: {
              customer: {
                gender: 'male',
                dob: '1990-01-01',
                emails: ['a@test.com'],
              },
              callAvailability: { asap: false },
              policyHolder: { locale: 'en-US' },
            },
            reference: 'ref1',
            isRejected: false,
            annotations: { remark: 'remark' },
            createTime: '2023-01-01',
          },
          assigned: { firstName: 'John', lastName: 'Doe' },
          attributes: {
            assignmentResourceName: 'res1',
            sundayContactable: true,
            callAttempts: 2,
            lastCallTimestamp: '2023-01-02',
          },
          source: { source: 'web' },
          rejections: [],
          appointments: [],
          insurance: {},
          insuree: {},
        },
      ],
      total: 1,
    };
    const result = transformLeadsResponse(callAsapResponse);

    if (Array.isArray(result)) {
      // Should not be array for this test
      expect(result).toEqual([]);
    } else {
      expect(result.imports.length).toBe(1);
      expect(result.imports[0].id).toBe('lead1');
      expect(result.imports[0].preferredCallDateTime).toBe('-');
      expect(result.total).toBe(1);
    }
  });
});
