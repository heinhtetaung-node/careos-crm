import {
  transformUrlQueryMultiSelect,
  transformUrlQuerySearch,
  transformUrlQuerySearchTrueFalse,
} from 'presentation/pages/car-insurance/CarePay/Contracts/helper';
import {
  isDatabaseTeam,
  predefinedFilter,
  predefinedFilterOptions,
  transformUrlRejectedLead,
} from './helper';
import { UserRoles } from 'config/constant';
import FeatureFlags from 'config/flagsmithConfig';

jest.mock('presentation/pages/car-insurance/CarePay/Contracts/helper', () => ({
  transformUrlQuerySearch: jest.fn(),
  transformUrlQuerySearchTrueFalse: jest.fn(),
  transformUrlQueryMultiSelect: jest.fn(),
}));

// Mock flagsmith feature flag - return true for the feature flag
jest.mock('flagsmith/react', () => ({
  useFlags: () => ({
    [FeatureFlags.BROK_3805_PRE_DEFINED_FILTERS_HEALTHLEAD_20251107_TEMP]: {
      enabled: true,
    },
  }),
}));

const mockTransformUrlQuerySearch = transformUrlQuerySearch as any;
const mockTransformUrlQuerySearchTrueFalse =
  transformUrlQuerySearchTrueFalse as jest.MockedFunction<
    typeof transformUrlQuerySearchTrueFalse
  >;
const mockTransformUrlQueryMultiSelect =
  transformUrlQueryMultiSelect as jest.MockedFunction<
    typeof transformUrlQueryMultiSelect
  >;
const mockEmptyUrl = '';
const mockUrl = 'baseUrl';
const mockResult = ' lead.isRejected="true"';
describe('transformUrlRejectedLead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('when rejectedLead is "true"', () => {
    it('should call transformUrlQuerySearchTrueFalse with correct parameters', () => {
      mockTransformUrlQuerySearchTrueFalse.mockReturnValue(mockResult);
      const result = transformUrlRejectedLead(mockUrl, 'true');
      expect(mockTransformUrlQuerySearchTrueFalse).toHaveBeenCalledWith(
        mockUrl,
        { selectValue: 'lead.isRejected', inputValue: 'true' },
        '='
      );
      expect(result).toBe(mockUrl + mockResult);
    });
  });
  describe('when rejectedLead is "all"', () => {
    it('should call transformUrlQueryMultiSelect with true and false values', () => {
      const mockResult = ' lead.isRejected in ("true","false")';
      mockTransformUrlQueryMultiSelect.mockReturnValue(mockResult);
      const result = transformUrlRejectedLead(mockUrl, 'all');
      expect(mockTransformUrlQueryMultiSelect).toHaveBeenCalledWith(
        mockUrl,
        [{ value: 'true' }, { value: 'false' }],
        'lead.isRejected'
      );
      expect(result).toBe(mockUrl + mockResult);
    });
  });
});
describe('predefinedFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('when selectedListView is "activeFreshLead"', () => {
    it('should apply all active fresh lead filters', () => {
      const mockUserName = 'Test User';
      let callCount = 0;
      mockTransformUrlQuerySearch.mockImplementation((url: string) => {
        callCount++;
        if (callCount === 1) {
          return ' lead.type!="LEAD_TYPE_RETAINER"';
        }
        if (callCount === 2) {
          return ' lead.type!="LEAD_TYPE_RETAINER" lead.status!="LEAD_STATUS_PURCHASED"';
        }
        return url + ` filter${callCount}`;
      });
      mockTransformUrlQuerySearchTrueFalse.mockReturnValue(
        ' lead.isRejected!="true"'
      );
      const result = predefinedFilter(
        'activeFreshLead',
        mockUserName,
        mockEmptyUrl
      );
      // Team filter was removed (10 calls), so now: 1 (lead.type) + 1 (lead.status) + 4 (source filters) = 6
      expect(mockTransformUrlQuerySearch).toHaveBeenCalledTimes(6);
      expect(mockTransformUrlQuerySearch).toHaveBeenNthCalledWith(
        1,
        mockEmptyUrl,
        {
          selectValue: 'lead.type',
          inputValue: 'LEAD_TYPE_RETAINER',
        },
        '!='
      );
      expect(mockTransformUrlQuerySearch).toHaveBeenNthCalledWith(
        2,
        ' lead.type!="LEAD_TYPE_RETAINER"',
        {
          selectValue: 'lead.status',
          inputValue: 'LEAD_STATUS_PURCHASED',
        },
        '!='
      );
      expect(mockTransformUrlQuerySearchTrueFalse).toHaveBeenCalledTimes(1);
      expect(mockTransformUrlQuerySearchTrueFalse).toHaveBeenCalledWith(
        expect.stringContaining('lead.status'),
        { selectValue: 'lead.isRejected', inputValue: true },
        '!=',
        true
      );
      expect(result).toBeTruthy();
    });
  });
  describe('when selectedListView is retainer leads', () => {
    it('should use = operator for lead.type when activeRetainerLead (line 218)', () => {
      const mockUserName = 'Test User';
      let callCount = 0;
      mockTransformUrlQuerySearch.mockImplementation((url: string) => {
        callCount++;
        if (callCount === 1) {
          return url + ' lead.type="LEAD_TYPE_RETAINER"';
        }
        if (callCount === 2) {
          return (
            url +
            ' lead.type="LEAD_TYPE_RETAINER" lead.status!="LEAD_STATUS_PURCHASED"'
          );
        }
        return url + ` filter${callCount}`;
      });
      mockTransformUrlQuerySearchTrueFalse.mockReturnValue(
        ' lead.isRejected!="true"'
      );
      predefinedFilter('activeRetainerLead', mockUserName, mockEmptyUrl);
      // For activeRetainerLead: lead.type should use '=' operator (line 218)
      expect(mockTransformUrlQuerySearch).toHaveBeenCalledWith(
        mockEmptyUrl,
        {
          selectValue: 'lead.type',
          inputValue: 'LEAD_TYPE_RETAINER',
        },
        '=' // Line 218: retainerLeadsViews.includes(selectedListView) ? '=' : '!='
      );
    });

    it('should use = operator for lead.type when myActiveRetainerLead (line 218)', () => {
      const mockUserName = 'Test User';
      let callCount = 0;
      mockTransformUrlQuerySearch.mockImplementation((url: string) => {
        callCount++;
        if (callCount === 1) {
          return url + ' lead.type="LEAD_TYPE_RETAINER"';
        }
        if (callCount === 2) {
          return (
            url +
            ' lead.type="LEAD_TYPE_RETAINER" lead.status!="LEAD_STATUS_PURCHASED"'
          );
        }
        if (callCount === 3) {
          return url + ' assigned.name="Test User"';
        }
        return url + ` filter${callCount}`;
      });
      mockTransformUrlQuerySearchTrueFalse.mockReturnValue(
        ' lead.isRejected!="true"'
      );
      predefinedFilter('myActiveRetainerLead', mockUserName, mockEmptyUrl);
      // For myActiveRetainerLead: lead.type should use '=' operator (line 218)
      expect(mockTransformUrlQuerySearch).toHaveBeenNthCalledWith(
        1,
        mockEmptyUrl,
        {
          selectValue: 'lead.type',
          inputValue: 'LEAD_TYPE_RETAINER',
        },
        '=' // Line 218: retainerLeadsViews.includes(selectedListView) ? '=' : '!='
      );
    });
  });
  describe('when selectedListView is database leads', () => {
    it('should use = operator for lead.type and != operator for lead.status when myActiveDatabaseLead', () => {
      const mockUserName = 'Test User';
      mockTransformUrlQuerySearchTrueFalse.mockReturnValue(
        ' lead.isRejected!="true"'
      );
      mockTransformUrlQueryMultiSelect.mockReturnValue(
        ' lead.source in ("source1","source2")'
      );
      let callCount = 0;
      mockTransformUrlQuerySearch.mockImplementation((url: string) => {
        callCount++;
        if (callCount === 1) {
          return url + ' lead.status!="LEAD_STATUS_PURCHASED"';
        }
        if (callCount === 2) {
          return url + ' assigned.name="Test User"';
        }
        return url;
      });
      predefinedFilter('myActiveDatabaseLead', mockUserName, mockEmptyUrl);
      // For myActiveDatabaseLead: lead.type is NOT added (only for retainerLeadsViews or activeLeadsViews)
      // Only lead.status and assigned.name are added via transformUrlQuerySearch
      expect(mockTransformUrlQuerySearch).toHaveBeenCalledTimes(2);
      expect(mockTransformUrlQuerySearch).toHaveBeenNthCalledWith(
        1,
        mockEmptyUrl,
        { selectValue: 'lead.status', inputValue: 'LEAD_STATUS_PURCHASED' },
        '!='
      );
      expect(mockTransformUrlQuerySearch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('lead.status'),
        { selectValue: 'assigned.name', inputValue: mockUserName },
        '='
      );
      expect(mockTransformUrlQuerySearchTrueFalse).toHaveBeenCalledTimes(1);
      expect(mockTransformUrlQueryMultiSelect).toHaveBeenCalledTimes(1);
    });
  });
  describe('edge cases', () => {
    // cover 194 yellow can remove later
    it('should use default empty string when url parameter is not provided', () => {
      const mockUserName = 'Test User';
      let callCount = 0;
      mockTransformUrlQuerySearch.mockImplementation((url: string) => {
        callCount++;
        if (callCount === 1) {
          // First call: assigned.name filter
          return ' assigned.name="Test User"';
        }
        if (callCount === 2) {
          // Second call: lead.status filter (from addNotPurchaseAndNotRejectedFilter)
          return ' assigned.name="Test User" lead.status!="LEAD_STATUS_PURCHASED"';
        }
        return url;
      });
      mockTransformUrlQuerySearchTrueFalse.mockReturnValue(
        ' assigned.name="Test User" lead.status!="LEAD_STATUS_PURCHASED" lead.isRejected!="true"'
      );
      const result = predefinedFilter('myLeads', mockUserName);
      // Should be called twice: once for assigned.name, once for lead.status
      expect(mockTransformUrlQuerySearch).toHaveBeenCalledTimes(2);
      expect(mockTransformUrlQuerySearch).toHaveBeenNthCalledWith(
        1,
        '',
        { selectValue: 'assigned.name', inputValue: mockUserName },
        '='
      );
      expect(mockTransformUrlQuerySearch).toHaveBeenNthCalledWith(
        2,
        ' assigned.name="Test User"',
        { selectValue: 'lead.status', inputValue: 'LEAD_STATUS_PURCHASED' },
        '!='
      );
      expect(mockTransformUrlQuerySearchTrueFalse).toHaveBeenCalledTimes(1);
      expect(mockTransformUrlQuerySearchTrueFalse).toHaveBeenCalledWith(
        expect.stringContaining('lead.status'),
        { selectValue: 'lead.isRejected', inputValue: true },
        '!=',
        true
      );
      // Result should include all filters: assigned.name, lead.status, and lead.isRejected
      expect(result).toContain('assigned.name="Test User"');
      expect(result).toContain('lead.status!="LEAD_STATUS_PURCHASED"');
      expect(result).toContain('lead.isRejected!="true"');
    });
  });
});
describe('isDatabaseTeam', () => {
  it('should return true when team contains "database", "non", and "motor" (case-sensitive)', () => {
    expect(isDatabaseTeam('database non motor')).toBe(true);
    expect(isDatabaseTeam('some-database-team-non-motor')).toBe(true);
    expect(isDatabaseTeam('database-non-motor-team')).toBe(true);
    expect(isDatabaseTeam('team-database-non-motor')).toBe(true);
  });

  it('should return false when team does not contain all three required strings', () => {
    expect(isDatabaseTeam('database non')).toBe(false);
    expect(isDatabaseTeam('database motor')).toBe(false);
    expect(isDatabaseTeam('non motor')).toBe(false);
    expect(isDatabaseTeam('database')).toBe(false);
    expect(isDatabaseTeam('non')).toBe(false);
    expect(isDatabaseTeam('motor')).toBe(false);
    expect(isDatabaseTeam('')).toBe(false);
    expect(isDatabaseTeam('some other team')).toBe(false);
  });

  it('should return false when team is empty string', () => {
    expect(isDatabaseTeam('')).toBe(false);
  });

  it('should be case-sensitive and return false for uppercase strings', () => {
    expect(isDatabaseTeam('DATABASE NON MOTOR')).toBe(false);
    expect(isDatabaseTeam('Database Non Motor')).toBe(false);
    expect(isDatabaseTeam('database NON motor')).toBe(false);
  });
});
describe('predefinedFilterOptions', () => {
  const mockSetSelectedListView = jest.fn();
  const mockGetString = jest.fn((key: string) => key);
  const mockSearchIcon = null;
  beforeEach(() => jest.clearAllMocks());
  it('should return all-lead and my-lead options when predefined filters flag disabled and role is not sales', () => {
    const result = predefinedFilterOptions(
      'activeFreshLead',
      { role: UserRoles.ADMIN_ROLE },
      mockSetSelectedListView,
      mockGetString,
      mockSearchIcon,
      false
    );
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('all-lead');
    expect(result[1].id).toBe('my-lead');
    expect(result[0].onClick).toBeDefined();
    expect(result[1].onClick).toBeDefined();
  });
  // cover line 297 yellow maybe can remove later
  it('should return five options when activeFreshLead and role in activeFreshLeadUserRoles', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'activeFreshLead',
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      expect(result).toHaveLength(7);
      expect(result[0].id).toBe('all-lead');
      expect(result[1].id).toBe('my-lead');
      expect(result[2].id).toBe('my-active-fresh-lead');
      expect(result[3].id).toBe('active-database-lead');
      expect(result[4].id).toBe('active-retainer-lead');
      expect(result[5].id).toBe('my-active-database-lead');
      expect(result[6].id).toBe('my-active-retainer-lead');
    });
  });
  // cover line 304 red maybe can remove later
  it('should return four options when activeFreshLead and role not in activeFreshLeadUserRoles', () => {
    const result = predefinedFilterOptions(
      'activeFreshLead',
      { role: UserRoles.SALE_ROLE },
      mockSetSelectedListView,
      mockGetString,
      mockSearchIcon,
      true
    );
    expect(result).toHaveLength(4);
    expect(result[0].id).toBe('my-lead'); // all-lead not shown for sales role
    expect(result[1].id).toBe('my-active-fresh-lead');
    expect(result[2].id).toBe('my-active-database-lead');
    expect(result[3].id).toBe('my-active-retainer-lead');
    result[1].onClick();
    expect(mockSetSelectedListView).toHaveBeenCalledWith('myActiveFreshLead');
  });
  // cover line 398 yellow maybe can remove later
  it('should return correct options when myActiveFreshLead and role in activeFreshLeadUserRoles or SALE_ROLE', () => {
    [
      { role: UserRoles.ADMIN_ROLE, expectedLength: 7 },
      { role: UserRoles.SUPER_ADMIN_ROLE, expectedLength: 7 },
      { role: UserRoles.SUPERVISOR_ROLE, expectedLength: 7 },
      { role: UserRoles.MANAGER_ROLE, expectedLength: 7 },
      { role: UserRoles.SALE_ROLE, expectedLength: 3 }, // all-lead not shown for sales role, myActiveFreshLead is selected so it's not shown
    ].forEach(({ role, expectedLength }) => {
      const result = predefinedFilterOptions(
        'myActiveFreshLead',
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      expect(result).toHaveLength(expectedLength);
      if (role === UserRoles.SALE_ROLE) {
        expect(result[0].id).toBe('my-lead');
        expect(result[1].id).toBe('my-active-database-lead');
        expect(result[2].id).toBe('my-active-retainer-lead');
      } else {
        expect(result[0].id).toBe('all-lead');
        expect(result[1].id).toBe('my-lead');
        expect(result[2].id).toBe('active-fresh-lead');
        expect(result[3].id).toBe('active-database-lead');
        expect(result[4].id).toBe('active-retainer-lead');
        expect(result[5].id).toBe('my-active-database-lead');
        expect(result[6].id).toBe('my-active-retainer-lead');
      }
    });
  });
  // cover line 317 red maybe can remove later
  it('should return two options when myActiveFreshLead and role not in activeFreshLeadUserRoles or SALE_ROLE', () => {
    const result = predefinedFilterOptions(
      'myActiveFreshLead',
      { role: UserRoles.INBOUND_ROLE },
      mockSetSelectedListView,
      mockGetString,
      mockSearchIcon,
      true
    );
    // Only all-lead and my-lead are shown because:
    // - active-fresh-lead: not shown (role not in activeFreshLeadUserRoles)
    // - my-active-fresh-lead: not shown (selectedListView === 'myActiveFreshLead')
    // - active-database-lead: not shown (role not in activeFreshLeadUserRoles)
    // - my-active-database-lead: not shown (role not in activeFreshLeadUserRoles or SALE_ROLE)
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('all-lead');
    expect(result[1].id).toBe('my-lead');
    result[0].onClick();
    expect(mockSetSelectedListView).toHaveBeenCalledWith('allLeads');
  });
  // cover line 321 yellow maybe can remove later
  it('should return five options when activeDatabaseLead and role in activeFreshLeadUserRoles', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'activeDatabaseLead',
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      expect(result).toHaveLength(7);
      expect(result[0].id).toBe('all-lead');
      expect(result[1].id).toBe('my-lead');
      expect(result[2].id).toBe('active-fresh-lead');
      expect(result[3].id).toBe('my-active-fresh-lead');
      expect(result[4].id).toBe('active-retainer-lead');
      expect(result[5].id).toBe('my-active-database-lead');
      expect(result[6].id).toBe('my-active-retainer-lead');
    });
  });
  // cover line 328 red maybe can remove later
  it('should return three options when activeDatabaseLead and role not in activeFreshLeadUserRoles', () => {
    const result = predefinedFilterOptions(
      'activeDatabaseLead',
      { role: UserRoles.SALE_ROLE },
      mockSetSelectedListView,
      mockGetString,
      mockSearchIcon,
      true
    );
    expect(result).toHaveLength(4);
    expect(result[0].id).toBe('my-lead'); // all-lead not shown for sales role
    expect(result[1].id).toBe('my-active-fresh-lead');
    expect(result[2].id).toBe('my-active-database-lead');
    expect(result[3].id).toBe('my-active-retainer-lead');
    result[2].onClick();
    expect(mockSetSelectedListView).toHaveBeenCalledWith(
      'myActiveDatabaseLead'
    );
  });
  // cover line 332 yellow maybe can remove later
  it('should return correct options when myActiveDatabaseLead and role in activeFreshLeadUserRoles or SALE_ROLE', () => {
    [
      { role: UserRoles.ADMIN_ROLE, expectedLength: 7 },
      { role: UserRoles.SUPER_ADMIN_ROLE, expectedLength: 7 },
      { role: UserRoles.SUPERVISOR_ROLE, expectedLength: 7 },
      { role: UserRoles.MANAGER_ROLE, expectedLength: 7 },
      { role: UserRoles.SALE_ROLE, expectedLength: 3 }, // all-lead not shown for sales role, and myActiveDatabaseLead is selected so it's not shown
    ].forEach(({ role, expectedLength }) => {
      const result = predefinedFilterOptions(
        'myActiveDatabaseLead',
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      expect(result).toHaveLength(expectedLength);
      if (role === UserRoles.SALE_ROLE) {
        expect(result[0].id).toBe('my-lead');
        expect(result[1].id).toBe('my-active-fresh-lead');
        expect(result[2].id).toBe('my-active-retainer-lead');
      } else {
        expect(result[0].id).toBe('all-lead');
        expect(result[1].id).toBe('my-lead');
        expect(result[2].id).toBe('active-fresh-lead');
        expect(result[3].id).toBe('my-active-fresh-lead');
        expect(result[4].id).toBe('active-database-lead');
        expect(result[5].id).toBe('active-retainer-lead');
        expect(result[6].id).toBe('my-active-retainer-lead');
      }
    });
  });
  it('should return two options when myActiveDatabaseLead and role not in activeFreshLeadUserRoles or SALE_ROLE', () => {
    const result = predefinedFilterOptions(
      'myActiveDatabaseLead',
      { role: UserRoles.INBOUND_ROLE },
      mockSetSelectedListView,
      mockGetString,
      mockSearchIcon,
      true
    );
    // Only all-lead and my-lead are shown because:
    // - active-fresh-lead: not shown (role not in activeFreshLeadUserRoles)
    // - my-active-fresh-lead: not shown (role not in activeFreshLeadUserRoles or SALE_ROLE)
    // - active-database-lead: not shown (role not in activeFreshLeadUserRoles)
    // - my-active-database-lead: not shown (selectedListView === 'myActiveDatabaseLead')
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('all-lead');
    expect(result[1].id).toBe('my-lead');
    result[0].onClick();
    expect(mockSetSelectedListView).toHaveBeenCalledWith('allLeads');
  });
  // cover lines 302-313: active-fresh-lead option when selectedListView !== 'activeFreshLead' and role in activeFreshLeadUserRoles
  it('should show active-fresh-lead option when not on activeFreshLead view and role in activeFreshLeadUserRoles', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'allLeads', // Not 'activeFreshLead'
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      const activeFreshLeadOption = result.find(
        (opt) => opt.id === 'active-fresh-lead'
      );
      expect(activeFreshLeadOption).toBeDefined();
      expect(activeFreshLeadOption?.name).toBe('healthLead.activeFreshLead');
      activeFreshLeadOption?.onClick();
      expect(mockSetSelectedListView).toHaveBeenCalledWith('activeFreshLead');
      jest.clearAllMocks();
    });
  });
  // cover line 337: active-database-lead option when selectedListView !== 'activeDatabaseLead' and role in activeFreshLeadUserRoles
  it('should show active-database-lead option when not on activeDatabaseLead view and role in activeFreshLeadUserRoles', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'allLeads', // Not 'activeDatabaseLead'
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      const activeDatabaseLeadOption = result.find(
        (opt) => opt.id === 'active-database-lead'
      );
      expect(activeDatabaseLeadOption).toBeDefined();
      expect(activeDatabaseLeadOption?.name).toBe(
        'healthLead.activeDatabaseLead'
      );
      activeDatabaseLeadOption?.onClick();
      expect(mockSetSelectedListView).toHaveBeenCalledWith(
        'activeDatabaseLead'
      );
      jest.clearAllMocks();
    });
  });
  // cover line 411: active-retainer-lead option when selectedListView !== 'activeRetainerLead' and role in activeFreshLeadUserRoles
  it('should show active-retainer-lead option when not on activeRetainerLead view and role in activeFreshLeadUserRoles', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'allLeads', // Not 'activeRetainerLead'
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      const activeRetainerLeadOption = result.find(
        (opt) => opt.id === 'active-retainer-lead'
      );
      expect(activeRetainerLeadOption).toBeDefined();
      expect(activeRetainerLeadOption?.name).toBe(
        'healthLead.activeRetainerLead'
      );
      activeRetainerLeadOption?.onClick(); // Line 411
      expect(mockSetSelectedListView).toHaveBeenCalledWith(
        'activeRetainerLead'
      );
      jest.clearAllMocks();
    });
  });
  // cover line 405: should not include active-retainer-lead option when selectedListView is activeRetainerLead
  it('should not include active-retainer-lead option when selectedListView is activeRetainerLead (line 405)', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'activeRetainerLead', // selectedListView === 'activeRetainerLead', so active-retainer-lead option should not be included
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      const activeRetainerLeadOption = result.find(
        (opt) => opt.id === 'active-retainer-lead'
      );
      expect(activeRetainerLeadOption).toBeUndefined(); // Line 405: should return empty array when selectedListView === 'activeRetainerLead'
      jest.clearAllMocks();
    });
  });
  // cover line 437: my-active-retainer-lead option when selectedListView !== 'myActiveRetainerLead' and role in activeFreshLeadUserRoles or SALE_ROLE
  it('should show my-active-retainer-lead option when not on myActiveRetainerLead view and role in activeFreshLeadUserRoles or SALE_ROLE', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
      UserRoles.SALE_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'allLeads', // Not 'myActiveRetainerLead'
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      const myActiveRetainerLeadOption = result.find(
        (opt) => opt.id === 'my-active-retainer-lead'
      );
      expect(myActiveRetainerLeadOption).toBeDefined();
      expect(myActiveRetainerLeadOption?.name).toBe(
        'healthLead.myActiveRetainerLead'
      );
      myActiveRetainerLeadOption?.onClick(); // Line 437
      expect(mockSetSelectedListView).toHaveBeenCalledWith(
        'myActiveRetainerLead'
      );
      jest.clearAllMocks();
    });
  });
  // cover line 431: should not include my-active-retainer-lead option when selectedListView is myActiveRetainerLead
  it('should not include my-active-retainer-lead option when selectedListView is myActiveRetainerLead (line 431)', () => {
    [
      UserRoles.ADMIN_ROLE,
      UserRoles.SUPER_ADMIN_ROLE,
      UserRoles.SUPERVISOR_ROLE,
      UserRoles.MANAGER_ROLE,
      UserRoles.SALE_ROLE,
    ].forEach((role) => {
      const result = predefinedFilterOptions(
        'myActiveRetainerLead', // selectedListView === 'myActiveRetainerLead', so my-active-retainer-lead option should not be included
        { role },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        true
      );
      const myActiveRetainerLeadOption = result.find(
        (opt) => opt.id === 'my-active-retainer-lead'
      );
      expect(myActiveRetainerLeadOption).toBeUndefined(); // Line 431: should return empty array when selectedListView === 'myActiveRetainerLead'
      jest.clearAllMocks();
    });
  });
  // cover line 302: onClick handler for my-lead option
  it('should call setSelectedListView with myLeads when my-lead option onClick is triggered', () => {
    const result = predefinedFilterOptions(
      'allLeads', // Not 'myLeads', so my-lead option will be included
      { role: UserRoles.ADMIN_ROLE },
      mockSetSelectedListView,
      mockGetString,
      mockSearchIcon,
      true
    );
    const myLeadOption = result.find((opt) => opt.id === 'my-lead');
    expect(myLeadOption).toBeDefined();
    myLeadOption?.onClick(); // This executes line 302
    expect(mockSetSelectedListView).toHaveBeenCalledWith('myLeads');
  });
  // cover line 296: condition when selectedListView === 'myLeads'
  it('should not include my-lead option when selectedListView is myLeads', () => {
    const result = predefinedFilterOptions(
      'myLeads', // selectedListView === 'myLeads', so my-lead option should not be included
      { role: UserRoles.ADMIN_ROLE },
      mockSetSelectedListView,
      mockGetString,
      mockSearchIcon,
      true
    );
    const myLeadOption = result.find((opt) => opt.id === 'my-lead');
    expect(myLeadOption).toBeUndefined(); // my-lead option should not be in the result
  });

  // Cover lines 301-322: When flag is disabled
  describe('when predefined filters flag is disabled', () => {
    it('should return all-lead and my-lead when selectedListView is not allLeads or myLeads and role is not sales', () => {
      const result = predefinedFilterOptions(
        'activeFreshLead', // Not 'allLeads' or 'myLeads'
        { role: UserRoles.ADMIN_ROLE },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        false
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('all-lead');
      expect(result[0].name).toBe('healthLead.allLeads');
      expect(result[0].actionElem).toBe(mockSearchIcon);
      result[0].onClick(); // Line 301
      expect(mockSetSelectedListView).toHaveBeenCalledWith('allLeads');

      expect(result[1].id).toBe('my-lead');
      expect(result[1].name).toBe('healthLead.myLeads');
      expect(result[1].actionElem).toBe(mockSearchIcon);
      result[1].onClick(); // Line 311
      expect(mockSetSelectedListView).toHaveBeenCalledWith('myLeads');
    });

    it('should return only my-lead when selectedListView is allLeads and role is not sales', () => {
      const result = predefinedFilterOptions(
        'allLeads', // selectedListView === 'allLeads', so all-lead option should not be included
        { role: UserRoles.ADMIN_ROLE },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        false
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('my-lead');
      expect(result[0].name).toBe('healthLead.myLeads');
      expect(result[0].actionElem).toBe(mockSearchIcon);
      result[0].onClick(); // Line 311
      expect(mockSetSelectedListView).toHaveBeenCalledWith('myLeads');
    });

    it('should return only all-lead when selectedListView is myLeads and role is not sales', () => {
      const result = predefinedFilterOptions(
        'myLeads', // selectedListView === 'myLeads', so my-lead option should not be included
        { role: UserRoles.ADMIN_ROLE },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        false
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('all-lead');
      expect(result[0].name).toBe('healthLead.allLeads');
      expect(result[0].actionElem).toBe(mockSearchIcon);
      result[0].onClick(); // Line 301
      expect(mockSetSelectedListView).toHaveBeenCalledWith('allLeads');
    });

    it('should return empty array when selectedListView is both allLeads and myLeads (edge case)', () => {
      // This shouldn't happen in practice, but testing the logic
      const result = predefinedFilterOptions(
        'allLeads',
        { role: UserRoles.ADMIN_ROLE },
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        false
      );
      // When allLeads is selected, only my-lead should be shown
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('my-lead');
    });

    it('should return only my-lead when role is sales and flag is disabled', () => {
      const result = predefinedFilterOptions(
        'activeFreshLead',
        { role: UserRoles.SALE_ROLE }, // roles/sales
        mockSetSelectedListView,
        mockGetString,
        mockSearchIcon,
        false
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('my-lead');
      expect(result[0].name).toBe('healthLead.myLeads');
      expect(result[0].actionElem).toBe(mockSearchIcon);
      result[0].onClick(); // Line 322
      expect(mockSetSelectedListView).toHaveBeenCalledWith('myLeads');
    });
  });
});
