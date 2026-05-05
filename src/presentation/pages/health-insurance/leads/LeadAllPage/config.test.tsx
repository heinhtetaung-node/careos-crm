import React from 'react';
import Controls from 'presentation/components/controls/Control';
import { getFields } from './config';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
}));

const mockGetString = jest.fn((key: string) => key);
const mockGetLanguage = jest.fn(() => 'en');
jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => mockGetString(key),
  getLanguage: () => mockGetLanguage(),
}));
jest.mock('presentation/components/controls/MultiDateRangeWithType', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));
jest.mock(
  'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper',
  () => ({
    RejectedLead: [
      {
        id: 1,
        value: 'all',
        title: 'genericOption.all',
      },
      {
        id: 2,
        value: 'true',
        title: 'genericOption.yes',
      },
      {
        id: 3,
        value: 'false',
        title: 'genericOption.no',
      },
    ],
    trueFalseOptions: [],
  })
);
jest.mock('presentation/components/controls/Control', () => ({
  __esModule: true,
  default: {
    Select: jest.fn(),
    Autocomplete: jest.fn(),
    Slider: jest.fn(),
    MultiSelect: jest.fn(),
  },
}));
jest.mock(
  'presentation/pages/car-insurance/leads/LeadSourcePage/leadSourceHelper',
  () => ({
    getSourceOptions: jest.fn((sources, type, includeAll) => []),
  })
);
jest.mock('shared/helper/selectOptions', () => ({
  genderOptions: [],
  languageOptions: [],
}));
jest.mock('../PackageListingPage/filterConfig', () => ({
  productCategory: jest.fn(() => []),
  productSubCategory: jest.fn(() => []),
}));
jest.mock('../leadDetailsPage/helper', () => ({
  UnderwritingStatusOption: jest.fn(() => []),
}));
jest.mock('./helper', () => ({
  LeadStatusOptions: [],
}));
jest.mock('presentation/pages/car-insurance/leads/LeadDashBoard', () => ({
  localeLeadType: [],
}));
jest.mock('config/constant', () => ({
  assignAbleUser: ['roles/admin', 'roles/sales'],
  discountAbleUser: [],
  exportAbleUser: [],
  importAbleUser: [],
  rejectAbleUser: [],
  underwritingAbleUser: [],
  appointmentAbleUser: [],
}));
describe('config.tsx - rejectedLead filter field (lines 531-549)', () => {
  const mockSearchAssignedUser = jest.fn();
  const mockSourceInfo = {
    sourceLoading: false,
    sources: [],
    agentList: { users: [] },
    insurers: [],
    role: 'roles/admin',
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should include rejectedLead field in getFields return array', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(rejectedLeadField).toBeDefined();
  });
  it('should have InputComponent as Controls.Select for rejectedLead (line 532)', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(rejectedLeadField?.InputComponent).toBe(Controls.Select);
  });
  it('should have correct name property for rejectedLead (line 534)', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(rejectedLeadField?.inputProps?.name).toBe('rejectedLead');
  });
  it('should call getString for label (line 535)', () => {
    mockGetString.mockClear();
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(mockGetString).toHaveBeenCalledWith('lead.rejectedLead');
    expect(rejectedLeadField?.inputProps?.label).toBe('lead.rejectedLead');
  });
  it('should map RejectedLead options and call getString for each title (lines 536-539)', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    const options = rejectedLeadField?.inputProps?.options;
    expect(options).toHaveLength(3);
    expect(options).toEqual([
      {
        id: 1,
        value: 'all',
        title: 'genericOption.all',
      },
      {
        id: 2,
        value: 'true',
        title: 'genericOption.yes',
      },
      {
        id: 3,
        value: 'false',
        title: 'genericOption.no',
      },
    ]);
    expect(mockGetString).toHaveBeenCalledWith('genericOption.all');
    expect(mockGetString).toHaveBeenCalledWith('genericOption.yes');
    expect(mockGetString).toHaveBeenCalledWith('genericOption.no');
  });
  it('should have selectField set to "value" (line 540)', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(rejectedLeadField?.inputProps?.selectField).toBe('value');
  });
  it('should have fixedLabel set to true (line 541)', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(rejectedLeadField?.inputProps?.fixedLabel).toBe(true);
  });
  it('should have filterType set to "summary" (line 542)', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(rejectedLeadField?.inputProps?.filterType).toBe('summary');
  });
  it('should call getString for placeholder (line 543)', () => {
    mockGetString.mockClear();
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(mockGetString).toHaveBeenCalledWith('text.select');
    expect(rejectedLeadField?.inputProps?.placeholder).toBe('text.select');
  });
  it('should have all required properties for rejectedLead field configuration', () => {
    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const rejectedLeadField = fields.find(
      (field) => field.inputProps?.name === 'rejectedLead'
    );
    expect(rejectedLeadField).toMatchObject({
      InputComponent: Controls.Select,
      inputProps: {
        name: 'rejectedLead',
        label: 'lead.rejectedLead',
        options: expect.arrayContaining([
          expect.objectContaining({ value: 'all' }),
          expect.objectContaining({ value: 'true' }),
          expect.objectContaining({ value: 'false' }),
        ]),
        selectField: 'value',
        fixedLabel: true,
        filterType: 'summary',
        placeholder: 'text.select',
        responsive: {
          xs: 6,
          md: 4,
        },
      },
    });
  });
});

describe('config.tsx - getInsurerNameLocale function (lines 134-135)', () => {
  const mockSearchAssignedUser = jest.fn();
  const mockInsurers = [
    {
      name: 'insurers/test-insurer-1',
      shortnameEn: 'Test Insurer EN',
      shortnameTh: 'บริษัทประกันทดสอบ',
    },
    {
      name: 'insurers/test-insurer-2',
      shortnameEn: 'Another Insurer EN',
      shortnameTh: 'บริษัทประกันอีกแห่ง',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLanguage.mockReturnValue('en');
  });

  it('should return shortnameEn when language is "en" (line 135)', () => {
    mockGetLanguage.mockReturnValue('en');
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );
    const preferredInsurerField = fields.find(
      (field) => field.inputProps?.name === 'preferredInsurer'
    );

    // Check currentInsurer options
    expect(currentInsurerField?.inputProps?.options).toEqual([
      {
        title: 'Test Insurer EN',
        value: 'test-insurer-1',
        label: 'Test Insurer EN',
      },
      {
        title: 'Another Insurer EN',
        value: 'test-insurer-2',
        label: 'Another Insurer EN',
      },
    ]);

    // Check preferredInsurer options
    expect(preferredInsurerField?.inputProps?.options).toEqual([
      {
        title: 'Test Insurer EN',
        value: 'test-insurer-1',
        label: 'Test Insurer EN',
      },
      {
        title: 'Another Insurer EN',
        value: 'test-insurer-2',
        label: 'Another Insurer EN',
      },
    ]);
  });

  it('should return shortnameTh when language is "th" (line 135)', () => {
    mockGetLanguage.mockReturnValue('th');
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );
    const preferredInsurerField = fields.find(
      (field) => field.inputProps?.name === 'preferredInsurer'
    );

    // Check currentInsurer options
    expect(currentInsurerField?.inputProps?.options).toEqual([
      {
        title: 'บริษัทประกันทดสอบ',
        value: 'test-insurer-1',
        label: 'บริษัทประกันทดสอบ',
      },
      {
        title: 'บริษัทประกันอีกแห่ง',
        value: 'test-insurer-2',
        label: 'บริษัทประกันอีกแห่ง',
      },
    ]);

    // Check preferredInsurer options
    expect(preferredInsurerField?.inputProps?.options).toEqual([
      {
        title: 'บริษัทประกันทดสอบ',
        value: 'test-insurer-1',
        label: 'บริษัทประกันทดสอบ',
      },
      {
        title: 'บริษัทประกันอีกแห่ง',
        value: 'test-insurer-2',
        label: 'บริษัทประกันอีกแห่ง',
      },
    ]);
  });

  it('should call getLanguage to determine locale (line 135)', () => {
    mockGetLanguage.mockClear();
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    getFields(mockSearchAssignedUser, mockSourceInfo);

    // getLanguage should be called multiple times (once per insurer option)
    expect(mockGetLanguage).toHaveBeenCalled();
  });
});

describe('config.tsx - insurer fields mapping (line 405)', () => {
  const mockSearchAssignedUser = jest.fn();
  const mockInsurers = [
    {
      name: 'insurers/insurer-a',
      shortnameEn: 'Insurer A EN',
      shortnameTh: 'บริษัทประกัน A',
    },
    {
      name: 'insurers/insurer-b',
      shortnameEn: 'Insurer B EN',
      shortnameTh: 'บริษัทประกัน B',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetLanguage.mockReturnValue('en');
  });

  it('should create both currentInsurer and preferredInsurer fields (line 400)', () => {
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);

    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );
    const preferredInsurerField = fields.find(
      (field) => field.inputProps?.name === 'preferredInsurer'
    );

    expect(currentInsurerField).toBeDefined();
    expect(preferredInsurerField).toBeDefined();
  });

  it('should map insurers to options using getInsurerNameLocale (line 405)', () => {
    mockGetLanguage.mockReturnValue('en');
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );

    expect(currentInsurerField?.inputProps?.options).toHaveLength(2);
    expect(currentInsurerField?.inputProps?.options?.[0]).toEqual({
      title: 'Insurer A EN',
      value: 'insurer-a',
      label: 'Insurer A EN',
    });
    expect(currentInsurerField?.inputProps?.options?.[1]).toEqual({
      title: 'Insurer B EN',
      value: 'insurer-b',
      label: 'Insurer B EN',
    });
  });

  it('should extract value from insurer.name by splitting on "/" (line 407)', () => {
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: [
        {
          name: 'insurers/complex/insurer-name',
          shortnameEn: 'Complex Name',
          shortnameTh: 'ชื่อซับซ้อน',
        },
      ],
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );

    expect(currentInsurerField?.inputProps?.options?.[0]?.value).toBe(
      'complex'
    );
  });

  it('should handle empty insurers array (line 405)', () => {
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: [],
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );
    const preferredInsurerField = fields.find(
      (field) => field.inputProps?.name === 'preferredInsurer'
    );

    expect(currentInsurerField?.inputProps?.options).toEqual([]);
    expect(preferredInsurerField?.inputProps?.options).toEqual([]);
  });

  it('should handle undefined insurers (line 405)', () => {
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: undefined,
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );

    expect(currentInsurerField?.inputProps?.options).toBeUndefined();
  });

  it('should use getInsurerNameLocale for both title and label (lines 406, 408)', () => {
    mockGetLanguage.mockReturnValue('th');
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );

    const firstOption = currentInsurerField?.inputProps?.options?.[0];
    expect(firstOption?.title).toBe('บริษัทประกัน A');
    expect(firstOption?.label).toBe('บริษัทประกัน A');
    expect(firstOption?.title).toBe(firstOption?.label);
  });

  it('should have correct field properties for insurer fields (lines 400-418)', () => {
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    const fields = getFields(mockSearchAssignedUser, mockSourceInfo);
    const currentInsurerField = fields.find(
      (field) => field.inputProps?.name === 'currentInsurer'
    );
    const preferredInsurerField = fields.find(
      (field) => field.inputProps?.name === 'preferredInsurer'
    );

    expect(currentInsurerField?.InputComponent).toBe(Controls.Autocomplete);
    expect(currentInsurerField?.inputProps?.filterType).toBe('summary');
    expect(currentInsurerField?.inputProps?.hasSelectAll).toBe(true);
    expect(currentInsurerField?.inputProps?.fixedLabel).toBe(true);
    expect(currentInsurerField?.inputProps?.responsive).toEqual({
      xs: 6,
      md: 4,
    });

    expect(preferredInsurerField?.InputComponent).toBe(Controls.Autocomplete);
    expect(preferredInsurerField?.inputProps?.filterType).toBe('summary');
    expect(preferredInsurerField?.inputProps?.hasSelectAll).toBe(true);
    expect(preferredInsurerField?.inputProps?.fixedLabel).toBe(true);
    expect(preferredInsurerField?.inputProps?.responsive).toEqual({
      xs: 6,
      md: 4,
    });
  });

  it('should call getString for labels with correct keys (line 404)', () => {
    mockGetString.mockClear();
    const mockSourceInfo = {
      sourceLoading: false,
      sources: [],
      agentList: { users: [] },
      insurers: mockInsurers,
      role: 'roles/admin',
    };

    getFields(mockSearchAssignedUser, mockSourceInfo);

    expect(mockGetString).toHaveBeenCalledWith('healthLead.currentInsurer');
    expect(mockGetString).toHaveBeenCalledWith('healthLead.preferredInsurer');
  });
});
