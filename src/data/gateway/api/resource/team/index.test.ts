import team from '.';

test('Test getTeamOrder with default pageSize 100', () => {
  expect(team.getTeamsOrder({ role: 'roles/sales' })).toMatchObject({
    Path: `/api/team/v1alpha1/teams?filter=role="${encodeURIComponent(
      'roles/sales'
    )}"&pageSize=100&orderBy=displayName`,
  });
});

test('Test getTeamOrder with specify pageSize', () => {
  expect(
    team.getTeamsOrder({ role: 'roles/sales', pageSize: 500 })
  ).toMatchObject({
    Path: `/api/team/v1alpha1/teams?filter=role="${encodeURIComponent(
      'roles/sales'
    )}"&pageSize=500&orderBy=displayName`,
  });
});

test('Test getTeamOrder with empty payload', () => {
  expect(team.getTeamsOrder({})).toMatchObject({
    Path: `/api/team/v1alpha1/teams?filter=`,
  });
});
