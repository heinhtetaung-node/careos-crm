import TeamRole from 'shared/constants/teamRole';

import { addFilters, documentsFilters, roleCombination } from './filter.helper';
import {
  assignToUserField,
  userAssignedLeadSearch,
  getPolicyFields,
  salesAgentsField,
  salesAgentsTeamsField,
} from './filterFields';

test('Test addFilters run well 1st', () => {
  expect(addFilters(true, ['Duy'], {})).toEqual({
    currentPage: 1,
    isSearching: true,
  });
});

test('Test addFilters run well 2nd', () => {
  expect(
    addFilters(false, ['Duy'], {
      search: {
        key: 'customerName',
        value: 'mock val',
      },
      date: {
        startDate: 'Start time',
        endDate: 'End time',
      },
    })
  ).toEqual({
    filters: ['Duy'],
  });
});

describe('Test getPolicyFields -', () => {
  it('for policy listing pages', () => {
    expect(getPolicyFields(true)).toHaveLength(2);
  });

  it('for order listing pages', () => {
    expect(getPolicyFields(false)).toHaveLength(0);
  });
});

describe('Test assignToUserField', () => {
  it('Should not show if this is Orders All page', () => {
    expect(assignToUserField(undefined, false)).toHaveLength(0);
  });

  it('Should show if this is not Orders All page', () => {
    expect(assignToUserField(undefined, true)).toHaveLength(1);
    expect(assignToUserField(undefined)).toHaveLength(1);
    expect(assignToUserField('roles/sales' as any, true)).toHaveLength(1);
    expect(assignToUserField('roles/sales' as any)).toHaveLength(1);
  });
});

describe('Test userAssignedLeadSearch', () => {
  it('Should not show if this is Orders All page', () => {
    expect(userAssignedLeadSearch(undefined, false)).toEqual(null);
  });

  it('Should show if this is not Orders All page', () => {
    expect([userAssignedLeadSearch(undefined, true)]).toHaveLength(1);
    expect([userAssignedLeadSearch(undefined)]).toHaveLength(1);
    expect([userAssignedLeadSearch('roles/sales' as any, true)]).toHaveLength(
      1
    );
    expect([userAssignedLeadSearch('roles/sales' as any)]).toHaveLength(1);
  });
});

describe('Test salesAgentsField', () => {
  it('Should not show if this is not Orders All page', () => {
    expect(salesAgentsField(false)).toHaveLength(0);
    expect(salesAgentsField()).toHaveLength(0);
  });

  it('Should show if this is Orders All page', () => {
    expect(salesAgentsField(true)).toHaveLength(1);
  });
});

describe('Test salesAgentsTeamsField', () => {
  test.each([
    [false, 0],
    [true, 1],
    [null, 0],
  ])('Return array length %d when condition %p', (condition, length) => {
    expect(salesAgentsTeamsField(condition)).toHaveLength(length);
  });
});

test('Should document filter work', () => {
  const documentTeamField = documentsFilters(
    TeamRole.DocumentsCollection,
    true
  )?.at(-2);
  expect(documentTeamField?.inputProps).not.toBeNull();
  expect(documentTeamField?.inputProps).toMatchObject({
    name: 'assignToDocumentTeam',
  });
});

test('Should roleCombination function work', () => {
  const roles = [TeamRole.DocumentsCollection, TeamRole.QualityControl];
  expect(roleCombination(roles)).toEqual(`${roles.join('","')}`);
});
