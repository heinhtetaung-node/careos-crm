import { mockUserList } from 'mock-data/UserData.mock';

import {
  columnV2,
  download,
  getFilterPanelQueryString,
} from './userPageHelper';

test('Should download helper function work', () => {
  const createElement = jest.spyOn(document, 'createElement');
  download(mockUserList as any);
  expect(createElement).toHaveBeenCalled();
});

test('field mapper', () => {
  const string = getFilterPanelQueryString({
    filters: {
      humanId: { humanId: 'humanId' },
      userFullName: 'fullname',
      annotations: [{ value: 3 }],
      teamProduct: [{ value: 'product' }],
      teamDisplayName: [{ displayName: 'team' }],
      role: [{ name: 'admin' }],
      createBy: { id: 'userid', name: 'username' },
      dateTime: {
        range: {
          startDate: new Date('2024-05-08'),
          endDate: new Date('2024-05-15'),
        },
        criteria: 'licenseIssueDate',
      },
    },
  });
  expect(string).toBe(
    'user.humanId:"humanId" user.fullName:"fullname" user.annotations.score in ("3") user.annotations.license_issue_date>="2024-05-08T00:00:00.000Z" user.annotations.license_issue_date<="2024-05-15T00:00:00.000Z" user.product in ("product") user.teamDisplayName.keyword in ("team") user.role.keyword in ("admin") user.createBy="userid"'
  );
});

test('columnv2', () => {
  const columns: any = columnV2();
  expect(columns[4].transform({ role: 'roles/admin' })).toBe('roles.admin');
  expect(columns[5].transform({ annotations: { score: 1 } })).toBe(1);
  expect(columns[5].transform({ annotations: {} })).toBe('_');
  expect(columns[6].transform({ deleteTime: '2022-02-02' })).toBe('Suspended');
  expect(columns[6].transform({})).toBe('Active');
  expect(columns[7].transform({ loginTime: '2022-02-02' })).toBe('02/02/2022');
  expect(
    columns[8].transform({ annotations: { license_no: '1491414141' } })
  ).toBe('1491414141');
  expect(columns[8].transform({ annotations: {} })).toBe('_');
  expect(
    columns[9].transform({ annotations: { license_issue_date: '2022-02-02' } })
  ).toBe('02/02/2022');
  expect(columns[9].transform({ annotations: {} })).toBe('_');
  expect(
    columns[10].transform({
      annotations: { license_expiry_date: '2025-02-02' },
    })
  ).toBe('02/02/2025');
  expect(columns[10].transform({ annotations: {} })).toBe('_');

  expect(columns[12].transform({ createTime: '2022-02-02' })).toBe(
    '02/02/2022'
  );
  expect(columns[13].transform({ updateTime: '2022-02-02' })).toBe(
    '02/02/2022'
  );
});
