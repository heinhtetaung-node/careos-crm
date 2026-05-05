const userData = {
  annotations: {},
  createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
  createTime: '2022-01-07T12:41:02.212701Z',
  deleteTime: null,
  firstName: 'Rabbit',
  humanId: 'rabbittesting@rabbitcallcenter.com',
  lastName: 'Testing',
  loginTime: '2022-04-29T05:27:23.969166Z',
  name: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
  role: 'roles/admin',
  updateTime: '2022-04-29T05:27:23.970575Z',
};

export const MockUsersData = {
  users: [
    {
      name: 'users/b676526d-2ce3-465a-9854-62b2143ee806',
      createTime: '2022-05-05T07:41:52.962994Z',
      updateTime: '2022-05-05T07:42:02.691555Z',
      deleteTime: null,
      createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
      humanId: '18007639358195465@cypress.co.th',
      role: 'roles/sales',
      firstName: 'CypressUpd',
      lastName: 'TestUpd',
      annotations: {
        daily_limit: '400',
        score: '3',
        total_limit: '200',
      },
      loginTime: null,
    },
    {
      name: 'users/f5a6467d-6241-4d71-bb04-a2fad1473758',
      createTime: '2022-01-07T12:41:52.251600Z',
      updateTime: '2022-01-07T12:41:52.251600Z',
      deleteTime: null,
      createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
      humanId: 'training16@rabbit.co.th',
      role: 'roles/sales',
      firstName: 'Training16',
      lastName: 'Ojt',
      annotations: {},
      loginTime: null,
    },
  ],
  nextPageToken: '',
};

export const mockSalesWhoami = {
  id: '13384a8d-bd17-4a1d-91b7-93f8364dda4f',
  active: true,
  expires_at: '2022-11-08T07:17:25.286685Z',
  authenticated_at: '2022-11-07T07:17:25.286685Z',
  issued_at: '2022-11-07T07:17:25.286719Z',
  identity: {
    id: 'ee139ec2-5c0d-4877-83d1-174ade5f933e',
    schema_id: 'default',
    schema_url: 'http://localhost:4432/dev/.ory/kratos/public/schemas/default',
    traits: {
      email: 'Salesagent@rabbit.co.th',
    },
    recovery_addresses: [
      {
        id: 'a28d4cc4-f53a-4abd-90dd-dee88e90682e',
        value: 'Salesagent@rabbit.co.th',
        via: 'email',
      },
    ],
  },
};

export const mockSalesUserInfo = {
  email: 'ee139ec2-5c0d-4877-83d1-174ade5f933e',
};

export const mockSalesRole = {
  name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f933e',
  createTime: '2022-01-07T12:42:17.710859Z',
  updateTime: '2022-11-03T08:08:27.425595Z',
  deleteTime: null,
  createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
  humanId: 'Salesagent@rabbit.co.th',
  role: 'roles/sales',
  firstName: 'SalesAgentRole',
  lastName: '-',
  annotations: {
    daily_limit: '2',
    score: '2',
    total_limit: '2',
  },
  loginTime: '2022-11-03T08:08:27.423192Z',
};
export const mockAdminWhoami = {
  ...mockSalesWhoami,
  identity: {
    ...mockSalesWhoami.identity,
    id: 'ee139ec2-5c0d-4877-83d1-174ade5f932e',
  },
};

export const mockAdminUserInfo = {
  email: 'ee139ec2-5c0d-4877-83d1-174ade5f932e',
};
export const mockAdminRole = {
  ...mockSalesRole,
  name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
  role: 'roles/admin',
};

export const mockUserList = [
  {
    name: 'users/ea939505-34cb-442c-95d1-480174683794',
    createTime: '2022-12-19T04:02:20.227931Z',
    updateTime: '2022-12-19T04:02:22.244494Z',
    deleteTime: '2022-12-19T04:02:22.756024Z',
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    humanId: '12321672042441047@cypress.co.th',
    role: 'roles/supervisor',
    firstName: 'Automation PATCH',
    lastName: 'BE Test PATCH',
    fullName: 'Automation PATCH BE Test PATCH',
    annotations: {},
    loginTime: null,
    createByFirstName: 'Daniel Boone',
    createByLastName: '-',
    createByFullName: 'Daniel Boone -',
    teamProduct: '',
    teamDisplayName: '',
  },
  {
    name: 'users/8e6b4b8c-19fb-400f-9925-fe58f5a9829f',
    createTime: '2022-12-16T04:02:00.466816Z',
    updateTime: '2022-12-16T08:31:44.764990Z',
    deleteTime: null,
    createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
    humanId: '7405353004268573@cypress.co.th',
    role: 'roles/supervisor',
    firstName: 'Automation PATCH',
    lastName: 'BE Test PATCH',
    fullName: 'Automation PATCH BE Test PATCH',
    annotations: {
      lang: 'TH',
    },
    loginTime: null,
    createByFirstName: 'Daniel Boone',
    createByLastName: '-',
    createByFullName: 'Daniel Boone -',
    teamProduct: '',
    teamDisplayName: '',
  },
];

export const mockUserRoles = [
  {
    name: 'roles/admin',
    createTime: '2020-08-01T00:00:00Z',
    updateTime: '2020-08-01T00:00:00Z',
    deleteTime: null,
    createBy: 'users/builtin',
    displayName: 'Admin',
  },
  {
    name: 'roles/manager',
    createTime: '2020-08-01T00:00:00Z',
    updateTime: '2020-08-01T00:00:00Z',
    deleteTime: null,
    createBy: 'users/builtin',
    displayName: 'Manager',
  },
];

export default userData;
