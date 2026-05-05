import { mockUserList, mockUserRoles } from 'mock-data/UserData.mock';

import { UserActionTypes } from '../../../../actions/admin/user';

import usersReducer, { formatUserList } from '.';

test('Should formatUserList work as expected', () => {
  const format = formatUserList(mockUserList as any, mockUserRoles as any);
  expect(format[0]).toHaveProperty('displayRole');
});

test('Should UserActionTypes.GET_USERS work', () => {
  const action = {
    type: UserActionTypes.GET_USERS,
    payload: {
      currentPage: 1,
      pageToken: '',
      pageSize: 100,
      orderBy: 'asc',
      showDeleted: true,
    },
  };
  expect(usersReducer(undefined, action)).toHaveProperty('isFetching');
});

test('Should UserActionTypes.GET_USERS_SUCCESS work', () => {
  const action = {
    type: UserActionTypes.GET_USERS_SUCCESS,
    payload: {
      users: mockUserList,
      pageToken: '',
      roles: mockUserRoles,
    },
  };
  expect(usersReducer(undefined, action)?.data[0]).toHaveProperty(
    'displayRole'
  );
});
