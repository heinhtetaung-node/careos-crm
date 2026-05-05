import {
  transformValuesForUserAPI,
  getErrorOrSuccessMessage,
  createValidationSchema,
  handleRoleChange,
} from './helper';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';

describe('UserModalHelper', () => {
  it('should return formatted values for user API when user is not sales agent', () => {
    const response = transformValuesForUserAPI(
      {
        firstName: 'firstName',
        lastName: 'lastName',
        humanId: 'fakeEmail@wrongone.com',
        role: { name: 'roles/admin' },
        language: { value: 'TH' },
        agentScore: { value: '1' },
        team: { name: 'team' },
        dailyLimit: 50,
        totalLimit: 2000,
      },
      false
    );

    expect(response).toEqual({
      annotations: { lang: 'TH' },
      firstName: 'firstName',
      humanId: 'fakeEmail@wrongone.com',
      lastName: 'lastName',
      role: 'roles/admin',
    });
  });

  it('should return formatted values for user API when user is sales agent', () => {
    const response = transformValuesForUserAPI(
      {
        firstName: 'firstName',
        lastName: 'lastName',
        humanId: 'fakeEmail@wrongone.com',
        role: { name: 'role' },
        language: { value: 'EN' },
        agentScore: { value: '1' },
        team: { name: 'team' },
        dailyLimit: 50,
        totalLimit: 2000,
      },
      true
    );

    expect(response).toEqual({
      annotations: {
        daily_limit: '50',
        lang: 'EN',
        score: '1',
        total_limit: '2000',
      },
      firstName: 'firstName',
      humanId: 'fakeEmail@wrongone.com',
      lastName: 'lastName',
      role: 'role',
    });
  });

  it('should return transformed values for user API when user is licensed broker agent', () => {
    const response = transformValuesForUserAPI(
      {
        firstName: 'firstName',
        lastName: 'lastName',
        humanId: 'fakeEmail@wrongone.com',
        role: { name: 'role' },
        language: { value: 'EN' },
        agentScore: { value: '1' },
        team: { name: 'team' },
        dailyLimit: 50,
        totalLimit: 2000,
        licenseNo: '1234567890',
        licenseIssueDate: '2024/04/01',
        licenseExpiryDate: '2026/04/01',
      },
      true,
      true
    );

    expect(response).toEqual({
      annotations: {
        daily_limit: '50',
        lang: 'EN',
        score: '1',
        total_limit: '2000',
        license_no: '1234567890',
        license_issue_date: '2024/04/01',
        license_expiry_date: '2026/04/01',
      },
      firstName: 'firstName',
      humanId: 'fakeEmail@wrongone.com',
      lastName: 'lastName',
      role: 'role',
    });
  });
});

describe('getErrorOrSuccessMessage', () => {
  const errorArray = [
    { status: 'addUser', expected: 'text.createUserFail' },
    { status: 'updateUser', expected: 'text.updateUserFail' },
    { status: 'deleteUser', expected: 'text.suspendUserFailed' },
    { status: 'unDeleteUser', expected: 'text.activateUserFailed' },
    { status: 'moveMember', expected: 'text.moveUserToTeamFail' },
    { status: 'addMember', expected: 'text.addUserToTeamFail' },
    { status: 'deleteMember', expected: 'text.deleteMemberFromTeamFail' },
    { status: 'default', expected: 'error.oops' },
  ];

  it.each(errorArray)(
    'Test for $status to be $expected',
    ({ status, expected }) => {
      expect(getErrorOrSuccessMessage(status, 'error')).toBe(expected);
    }
  );

  const successfulArray = [
    { status: 'addUser', expected: 'text.createUserSuccessfully' },
    { status: 'updateUser', expected: 'text.updateUserSuccessfully' },
    { status: 'deleteUser', expected: 'text.suspendUserSuccess' },
    { status: 'unDeleteUser', expected: 'text.activateUserSuccess' },
    { status: 'moveMember', expected: 'text.moveUserToTeamSuccess' },
    { status: 'addMember', expected: 'text.addUserToTeamSuccess' },
    { status: 'deleteMember', expected: 'text.deleteMemberFromTeamSuccess' },
    { status: 'default', expected: 'error.oops' },
  ];

  it.each(successfulArray)(
    'Test for $status to be $expected',
    ({ status, expected }) => {
      expect(getErrorOrSuccessMessage(status, 'success')).toBe(expected);
    }
  );
});

describe('createValidationSchema - product validation (lines 92, 94)', () => {
  it('should require product field when role is not in RolesWithoutProduct (line 92 condition true, line 94 then clause)', async () => {
    const schema = createValidationSchema(
      [UserRoleID.SalesAgent],
      UserRoleID.SalesAgent
    );

    // Test with SalesAgent role (NOT in RolesWithoutProduct) and missing product
    // Note: SalesAgent also requires agentScore, dailyLimit, totalLimit, team, but we're testing product requirement
    const invalidData = {
      role: { name: UserRoleID.SalesAgent },
      firstName: 'John',
      lastName: 'Doe',
      humanId: 'john.doe@example.com',
      language: { value: 'EN' },
      team: { name: 'team-1' },
      agentScore: { value: '1' },
      dailyLimit: 100,
      totalLimit: 1000,
      product: {}, // Missing product value - this should trigger the error
    };

    await expect(schema.validate(invalidData)).rejects.toThrow();

    // Verify the error is about product (line 94 then clause executes)
    try {
      await schema.validate(invalidData);
    } catch (error: any) {
      // The error message should indicate product is required
      expect(error.message).toMatch(/product|Product/i);
    }
  });

  it('should not require product field when role is in RolesWithoutProduct (line 92 condition false)', async () => {
    const schema = createValidationSchema(
      [UserRoleID.SalesAgent],
      UserRoleID.SalesAgent
    );

    // Test with Admin role (IS in RolesWithoutProduct) and missing product - should pass
    const validData = {
      role: { name: UserRoleID.Admin },
      firstName: 'John',
      lastName: 'Doe',
      humanId: 'john.doe@example.com',
      language: { value: 'EN' },
      product: {}, // Missing product value but role is in RolesWithoutProduct, so product not required
    };

    await expect(schema.validate(validData)).resolves.toBeDefined();
  });

  it('should pass validation when role is not in RolesWithoutProduct and product is provided (line 92 condition true, line 94 then clause)', async () => {
    const schema = createValidationSchema(
      [UserRoleID.SalesAgent],
      UserRoleID.SalesAgent
    );

    // Test with SalesAgent role (NOT in RolesWithoutProduct) and valid product
    // Include all required fields for SalesAgent
    const validData = {
      role: { name: UserRoleID.SalesAgent },
      firstName: 'John',
      lastName: 'Doe',
      humanId: 'john.doe@example.com',
      language: { value: 'EN' },
      team: { name: 'team-1' }, // Required for SalesAgent
      agentScore: { value: '1' },
      dailyLimit: 100,
      totalLimit: 1000,
      product: { value: 'products/car-insurance' }, // Valid product (line 94 then clause validates this)
    };

    await expect(schema.validate(validData)).resolves.toBeDefined();
  });
});

describe('handleRoleChange', () => {
  it('should reset team field and call handleChange when role changes', () => {
    const mockSetFieldValue = jest.fn();
    const mockHandleChange = jest.fn();
    const mockEvent = {
      target: {
        value: {
          name: UserRoleID.SalesAgent,
        },
      },
    };

    handleRoleChange(mockEvent, mockSetFieldValue, mockHandleChange);

    // Should reset team field
    expect(mockSetFieldValue).toHaveBeenCalledWith('team', {});
    // Should call handleChange with the event
    expect(mockHandleChange).toHaveBeenCalledWith(mockEvent);
    // Should not reset product for SalesAgent (not in RolesWithoutProduct)
    expect(mockSetFieldValue).not.toHaveBeenCalledWith('product', {
      value: '',
    });
  });

  it('should reset product field when role is in RolesWithoutProduct', () => {
    const mockSetFieldValue = jest.fn();
    const mockHandleChange = jest.fn();
    const mockEvent = {
      target: {
        value: {
          name: UserRoleID.Admin, // Admin is in RolesWithoutProduct
        },
      },
    };

    handleRoleChange(mockEvent, mockSetFieldValue, mockHandleChange);

    // Should reset team field
    expect(mockSetFieldValue).toHaveBeenCalledWith('team', {});
    // Should reset product field for Admin role (in RolesWithoutProduct)
    expect(mockSetFieldValue).toHaveBeenCalledWith('product', { value: '' });
    // Should call handleChange with the event
    expect(mockHandleChange).toHaveBeenCalledWith(mockEvent);
  });

  it('should handle role change for QualityControl role (in RolesWithoutProduct)', () => {
    const mockSetFieldValue = jest.fn();
    const mockHandleChange = jest.fn();
    const mockEvent = {
      target: {
        value: {
          name: UserRoleID.QualityControl, // QualityControl is in RolesWithoutProduct
        },
      },
    };

    handleRoleChange(mockEvent, mockSetFieldValue, mockHandleChange);

    // Should reset team field
    expect(mockSetFieldValue).toHaveBeenCalledWith('team', {});
    // Should reset product field for QualityControl role (in RolesWithoutProduct)
    expect(mockSetFieldValue).toHaveBeenCalledWith('product', { value: '' });
    // Should call handleChange with the event
    expect(mockHandleChange).toHaveBeenCalledWith(mockEvent);
  });
});
