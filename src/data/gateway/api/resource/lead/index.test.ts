import Type from '../../type';

import Lead, { getLeadAssignment } from '.';

describe('getLeadAssignment', () => {
  it('returns correct type and path according to body', () => {
    const body = {
      assignToTeam: [],
      assignToUser: [],
      carBrand: [],
      currentPage: 1,
      date: {
        startDate: {
          criteria: '',
          range: {
            startDate: null,
            endDate: null,
          },
        },
        endDate: {
          criteria: '',
          range: {
            startDate: null,
            endDate: null,
          },
        },
      },
      duplicateLead: '',
      lastPremium: [0, 0],
      leadStatus: [],
      leadType: [],
      orderBy: 'order_by=lead.createTime desc',
      pageSize: 15,
      rejectionReasons: [
        { id: 3, value: 'no_car', title: 'Does not have a car' },
        { id: 2, value: 'cant_contact', title: 'Phone number not working' },
      ],
      score: [],
      search: { key: '', value: '' },
      source: [],
      sumInsured: [0, 0],
      tableType: 'LEAD_ALL',
    };
    const productName = 'products/car-insurance';

    expect(getLeadAssignment(body, productName)).toEqual({
      Type: Type.Public,
      Path: `/api/lead-search/v1alpha1/search?product=car-insurance&page_size=15&filter=attributes.rejectedReason in ("no_car","cant_contact")&order_by=lead.createTime desc`,
    });
  });
});

describe('assignLeadWithLog', () => {
  it('returns correct type and path according to args', () => {
    expect(Lead.assignLeadWithLog('leads/lead_id')).toEqual({
      Type: Type.Public,
      Path: '/api/assign/v1alpha1/leads/lead_id/assignments',
    });
  });
});
