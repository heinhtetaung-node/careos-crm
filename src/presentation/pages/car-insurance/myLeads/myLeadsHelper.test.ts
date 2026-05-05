import { sub } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import {
  changeSortStatus,
  checkRowImportant,
  formatMyLeads,
  getMyLeadsApi,
  getTeamId,
  SORT_TABLE_TYPE,
} from './myLeadsHelper';

const Product = 'products/car-insurance';
const PageState = {
  currentPage: 1,
  pageSize: 15,
  pageToken: '',
  showDeleted: true,
  orderBy: '',
  filter: '',
  assignedTo: 'users/1f407bb7-7968-475d-9b75-47065472cdb7',
};

const countAdd1 = 1;
const countRemove1 = 1;

const countAdd2 = 1;
const countRemove2 = 0;

const countAdd3 = 0;
const countRemove3 = 1;

const countAdd4 = 0;
const countRemove4 = 0;

const DateResult1 = {
  addStar: false,
  removeStar: false,
};

const DateResult2 = {
  addStar: false,
  removeStar: true,
};

const DateResult3 = {
  addStar: true,
  removeStar: false,
};

const DateResult4 = {
  addStar: true,
  removeStar: true,
};

jest.mock('flagsmith', () => ({
  ...jest.requireActual('flagsmith'),
  getAllFlags: jest.fn().mockReturnValue({}),
}));

test('Check row Important Case1', () => {
  expect(checkRowImportant(countAdd1, countRemove1)).toEqual(DateResult1);
});

test('Check row Important Case2', () => {
  expect(checkRowImportant(countAdd2, countRemove2)).toEqual(DateResult2);
});

test('Check row Important Case3', () => {
  expect(checkRowImportant(countAdd3, countRemove3)).toEqual(DateResult3);
});

test('Check row Important Case4', () => {
  expect(checkRowImportant(countAdd4, countRemove4)).toEqual(DateResult4);
});

test('Test getMyLeadsApi get lead api', () => {
  getMyLeadsApi('', { perPage: 20, assignedTo: '' }, 1000).subscribe(
    (result) => {
      expect(typeof result).toEqual('object');
    }
  );
});

test('Test getMyLeadsApi get lead api product null', () => {
  let vari: any;
  getMyLeadsApi(vari, PageState, 0).subscribe((result) => {
    expect(result).toEqual(false);
  });
});

test('Test getMyLeadsApi get lead api product', () => {
  getMyLeadsApi(Product, PageState, 0).subscribe((result) => {
    expect(result).toEqual(false);
  });
});

test('Test getMyLeadsApi get lead api no input time', () => {
  getMyLeadsApi(Product, PageState).subscribe((result) => {
    expect(result).toEqual(false);
  });
});

test('Test getMyLeadsApi get lead api no input time', () => {
  const newPageState = {
    ...PageState,
    date: {
      criteria: 'appointmentTime',
      range: {
        startDate: utcToZonedTime(sub(new Date(), { days: 20 }), 'UTC'),
        endDate: utcToZonedTime(sub(new Date(), { days: 10 }), 'UTC'),
      },
    },
    date2: {
      criteria: 'assignedTime',
      range: {
        startDate: utcToZonedTime(sub(new Date(), { days: 2 }), 'UTC'),
        endDate: utcToZonedTime(new Date(), 'UTC'),
      },
    },
  };
  getMyLeadsApi(Product, newPageState).subscribe((result) => {
    expect(result).toEqual(false);
  });
});

describe('changeSortStatus', () => {
  it('When sort is none', () => {
    const status = changeSortStatus(SORT_TABLE_TYPE.NONE);
    expect(status).toBe(SORT_TABLE_TYPE.ASC);
  });

  it('When sort is desc', () => {
    const status = changeSortStatus(SORT_TABLE_TYPE.DESC);
    expect(status).toBe(SORT_TABLE_TYPE.NONE);
  });

  it('When sort is asc', () => {
    const status = changeSortStatus(SORT_TABLE_TYPE.ASC);
    expect(status).toBe(SORT_TABLE_TYPE.DESC);
  });
});

const mockedLeadData = [
  {
    lead: {
      name: 'leads/c7efaff4-024a-4356-9f0d-b21bb5544d8b',
      annotations: {
        remark: '',
      },
      createTime: '12/01/2022 (01:18:30 PM)',
      updateTime: '12/01/2022 (05:18:30 PM)',
      isRejected: true,
      important: true,
      status: 'LEAD_STATUS_PENDING_PAYMENT',
      type: 'LEAD_TYPE_RENEWAL',
      humanId: 'L132002',
    },
    team: {
      displayName: 'New Team Name',
    },
    customer: {
      humanId: 'humanId',
    },
    car: {
      brand: 'Mazda',
      model: 'CX-3',
      year: 2018,
      licensePlate: 'redplate',
    },
    insurance: {
      policyStartDate: '2021-05-18',
      sumInsured: '',
    },
    assigned: {
      createTime: '03/01/2022 (01:18:30 PM)',
    },
    appointments: [
      {
        name: 'calendars/6f35b998-c1e0-4dea-bd0b-ee3a008242f9/events/de16097e-5239-4259-9509-c05b1e19cc53',
        createTime: '2021-07-16T02:40:11.857331047Z',
        updateTime: '2021-07-16T02:40:11.857331047Z',
        deleteTime: null,
        createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
        startTime: '2021-07-16T13:30:00Z',
        endTime: '2021-07-16T13:33:00Z',
        appointment: {
          lead: 'leads/e3692b40-d791-44a2-953a-9a78bb7901f1',
          appointmentType: 'agreed',
          payment: false,
          subject: 'Call back',
        },
      },
    ],
    rejections: [
      {
        name: 'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/rejections/88f4be40-d9c1-4d6b-ac3f-265054a9020c',
        createTime: '2021-07-20T04:54:50.714828Z',
        updateTime: '2021-07-23T04:02:18.223578Z',
        deleteTime: null,
        createBy: 'users/382bd655-a62c-497f-a24a-da6e4ed6967e',
        reason: 'not_expiring',
        comment:
          'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/comments/a60ef001-2abd-4b5c-83b4-6e61ef7356d6',
        decideTime: '2021-07-23T04:02:18.220311Z',
        decideBy: 'users/9a6bc452-e0ad-4604-ab5e-9c7bf924801e',
        approved: false,
      },
    ],
    attributes: {
      unreadEmailCount: '12',
    },
  },
  {
    lead: {
      annotations: {
        remark: '',
      },
      createTime: '12/01/2022 (01:18:30 PM)',
      updateTime: '12/01/2022 (05:18:30 PM)',
      isRejected: true,
      important: true,
      status: 'LEAD_STATUS_PENDING_PAYMENT',
      type: 'LEAD_TYPE_NEW',
      humanId: 'L132002',
    },
    team: {
      displayName: 'New Team Name',
    },
    customer: {
      humanId: 'humanId',
    },
    car: {
      brand: 'Mazda',
      model: 'CX-3',
      year: 2018,
      licensePlate: 'redplate',
    },
    insurance: {
      policyStartDate: '2021-05-18',
      sumInsured: '',
    },
    assigned: {
      createTime: '03/01/2022 (01:18:30 PM)',
    },
    appointments: [
      {
        name: 'calendars/6f35b998-c1e0-4dea-bd0b-ee3a008242f9/events/de16097e-5239-4259-9509-c05b1e19cc53',
        createTime: '2021-07-16T02:40:11.857331047Z',
        updateTime: '2021-07-16T02:40:11.857331047Z',
        deleteTime: null,
        createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
        startTime: '2021-07-16T13:30:00Z',
        endTime: '2021-07-16T13:33:00Z',
        appointment: {
          lead: 'leads/e3692b40-d791-44a2-953a-9a78bb7901f1',
          appointmentType: 'agreed',
          payment: false,
          subject: 'Call back',
        },
      },
    ],
    rejections: [
      {
        name: 'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/rejections/88f4be40-d9c1-4d6b-ac3f-265054a9020c',
        createTime: '2021-07-20T04:54:50.714828Z',
        updateTime: '2021-07-23T04:02:18.223578Z',
        deleteTime: null,
        createBy: 'users/382bd655-a62c-497f-a24a-da6e4ed6967e',
        reason: 'not_expiring',
        comment:
          'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/comments/a60ef001-2abd-4b5c-83b4-6e61ef7356d6',
        decideTime: '2021-07-23T04:02:18.220311Z',
        decideBy: 'users/9a6bc452-e0ad-4604-ab5e-9c7bf924801e',
        approved: false,
      },
    ],
    attributes: {
      unreadEmailCount: '12',
    },
  },
  {
    lead: {},
    team: {},
    car: {},
    insurance: {},
    assigned: {},
    appointments: null,
    rejections: null,
    attributes: {},
  },
  {
    attributes: {},
  },
];

const formattedMockLeadData: any = [
  {
    id: 'leads/c7efaff4-024a-4356-9f0d-b21bb5544d8b',
    unreadMessage: '12',
    leadDetailId: 'c7efaff4-024a-4356-9f0d-b21bb5544d8b',
    highlightColor: null,
    fullLeadId: 'leads/c7efaff4-024a-4356-9f0d-b21bb5544d8b',
    paymentCall: '',
    remark: '',
    name: ' ',
    leadStatus: 'leadStatus.pendingPayment',
    leadType: 'leadTypeFilter.renewal',
    createdOn: '01/12/2022 (12:00:00 AM)',
    updatedOn: '01/12/2022 (12:00:00 AM)',
    assignedOn: '01/03/2022 (12:00:00 AM)',
    policyStartDate: '18/05/2021',
    renewalPackageStatus: '',
    teamName: 'New Team Name',
    sumInsured: '',
    sundayContactable: '',
    appointmentDate: '16/07/2021 (01:30:00 PM)',
    leadId: 'L132002',
    licensePlate: 'redplate',
    customerId: 'humanId',
    carBrand: 'Mazda',
    carModel: 'CX-3',
    carYear: 2018,
    isChecked: false,
    isRejected: true,
    failedDials: '',
    connectedDials: '',
    totalDials: '',
    renewalId: '',
    lastVisitedOn: '',
    important: true,
    rejections: [
      {
        name: 'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/rejections/88f4be40-d9c1-4d6b-ac3f-265054a9020c',
        createTime: '2021-07-20T04:54:50.714828Z',
        updateTime: '2021-07-23T04:02:18.223578Z',
        deleteTime: null,
        createBy: 'users/382bd655-a62c-497f-a24a-da6e4ed6967e',
        reason: 'not_expiring',
        comment:
          'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/comments/a60ef001-2abd-4b5c-83b4-6e61ef7356d6',
        decideTime: '2021-07-23T04:02:18.220311Z',
        decideBy: 'users/9a6bc452-e0ad-4604-ab5e-9c7bf924801e',
        approved: false,
      },
    ],
    callAttempts: '0',
    lastCallDate: '',
    daysSinceLastCall: '',
  },
  {
    id: undefined,
    highlightColor: null,
    unreadMessage: '12',
    leadDetailId: '',
    fullLeadId: '',
    paymentCall: '',
    remark: '',
    name: ' ',
    leadStatus: 'leadStatus.pendingPayment',
    leadType: 'leadTypeFilter.new',
    createdOn: '01/12/2022 (12:00:00 AM)',
    updatedOn: '01/12/2022 (12:00:00 AM)',
    assignedOn: '01/03/2022 (12:00:00 AM)',
    policyStartDate: '18/05/2021',
    renewalPackageStatus: '',
    teamName: 'New Team Name',
    sumInsured: '',
    sundayContactable: '',
    appointmentDate: '16/07/2021 (01:30:00 PM)',
    leadId: 'L132002',
    licensePlate: 'redplate',
    customerId: 'humanId',
    carBrand: 'Mazda',
    carModel: 'CX-3',
    carYear: 2018,
    isChecked: false,
    isRejected: true,
    failedDials: '',
    connectedDials: '',
    totalDials: '',
    renewalId: '',
    lastVisitedOn: '',
    important: true,
    rejections: [
      {
        name: 'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/rejections/88f4be40-d9c1-4d6b-ac3f-265054a9020c',
        createTime: '2021-07-20T04:54:50.714828Z',
        updateTime: '2021-07-23T04:02:18.223578Z',
        deleteTime: null,
        createBy: 'users/382bd655-a62c-497f-a24a-da6e4ed6967e',
        reason: 'not_expiring',
        comment:
          'leads/e3692b40-d791-44a2-953a-9a78bb7901f1/comments/a60ef001-2abd-4b5c-83b4-6e61ef7356d6',
        decideTime: '2021-07-23T04:02:18.220311Z',
        decideBy: 'users/9a6bc452-e0ad-4604-ab5e-9c7bf924801e',
        approved: false,
      },
    ],
    callAttempts: '0',
    lastCallDate: '',
    daysSinceLastCall: '',
  },
  {
    id: undefined,
    highlightColor: null,
    unreadMessage: 0,
    leadDetailId: '',
    fullLeadId: '',
    paymentCall: '',
    remark: '',
    name: ' ',
    leadStatus: '',
    leadType: '',
    createdOn: '',
    updatedOn: '',
    assignedOn: '',
    policyStartDate: '',
    renewalPackageStatus: '',
    teamName: '',
    sumInsured: '',
    sundayContactable: '',
    appointmentDate: '',
    leadId: '',
    licensePlate: '',
    customerId: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    isChecked: false,
    isRejected: undefined,
    failedDials: '',
    connectedDials: '',
    totalDials: '',
    renewalId: '',
    lastVisitedOn: '',
    important: false,
    rejections: [],
    callAttempts: '0',
    lastCallDate: '',
    daysSinceLastCall: '',
  },
  {
    id: undefined,
    highlightColor: null,
    unreadMessage: 0,
    leadDetailId: '',
    fullLeadId: '',
    paymentCall: '',
    remark: '',
    name: ' ',
    leadStatus: '',
    leadType: '',
    createdOn: '',
    updatedOn: '',
    assignedOn: '',
    policyStartDate: '',
    renewalPackageStatus: '',
    teamName: '',
    sumInsured: '',
    sundayContactable: '',
    appointmentDate: '',
    leadId: '',
    licensePlate: '',
    customerId: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    isChecked: false,
    isRejected: undefined,
    failedDials: '',
    connectedDials: '',
    totalDials: '',
    renewalId: '',
    lastVisitedOn: '',
    important: false,
    rejections: [],
    callAttempts: '0',
    lastCallDate: '',
    daysSinceLastCall: '',
  },
];

test('Test formatMyLeads', () => {
  const result = formatMyLeads(mockedLeadData);
  expect(result).toEqual(formattedMockLeadData);
});

test('Test getTeamId return no id', () => {
  const result = getTeamId({
    members: [],
  });
  expect(result).toEqual('');
});

test('Test getTeamId return id', () => {
  const data = {
    members: [
      {
        name: 'idTeam/members/user',
      },
    ],
  };
  const result = getTeamId(data);
  expect(result).toEqual('idTeam');
});
