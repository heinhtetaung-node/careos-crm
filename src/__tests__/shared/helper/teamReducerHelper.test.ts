import { formatTeamList } from 'presentation/redux/reducers/admin/team/teamReducer.helper';
import { ITeam } from 'shared/interfaces/common/admin/team';

const teamsList: ITeam[] = [
  {
    name: 'teams/52735283-0a19-4597-b12d-2df3c2cb938d',
    createTime: '2020-12-16T10:41:30.167662Z',
    updateTime: '2020-12-16T10:41:30.167662Z',
    deleteTime: null,
    createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
    displayName: 'Vu1',
    productType: 'products/car-insurance',
    leadType: 'retainer',
    manager: 'users/ebab2769-95ba-47ca-ae3b-0a613da60a5c',
    supervisor: 'users/04c73a7b-40bd-43a2-8032-f7f448a09777',
    createByFirstName: 'f2',
    createByLastName: 'l2',
    createByFullName: 'f2 l2',
    managerFirstName: 'vu',
    managerLastName: 'pham 2k',
    managerFullName: 'vu pham 2k',
    supervisorFirstName: 'hoang',
    supervisorLastName: 'test',
    supervisorFullName: 'hoang test',
    memberCount: 0,
  },
];

const teamsListResult = [
  {
    name: 'teams/52735283-0a19-4597-b12d-2df3c2cb938d',
    createTime: '12/16/2020',
    updateTime: '12/16/2020',
    deleteTime: null,
    createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
    displayName: 'Vu1',
    productType: 'products/car-insurance',
    leadType: 'Retainer',
    manager: 'users/ebab2769-95ba-47ca-ae3b-0a613da60a5c',
    supervisor: 'users/04c73a7b-40bd-43a2-8032-f7f448a09777',
    createByFirstName: 'f2',
    createByLastName: 'l2',
    createByFullName: 'f2 l2',
    managerFirstName: 'vu',
    managerLastName: 'pham 2k',
    productName: 'Car Insurance',
    managerFullName: 'vu pham 2k',
    supervisorFirstName: 'hoang',
    supervisorLastName: 'test',
    supervisorFullName: 'hoang test',
    memberCount: 0,
  },
];

test('Valid format Team list data.', () => {
  expect(formatTeamList(teamsList)).toEqual(teamsListResult);
});
