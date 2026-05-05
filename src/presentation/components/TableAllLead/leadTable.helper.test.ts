import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';

import { getInitialPageState, initialButtonState } from './leadTable.helper';

describe('getInitialPageState', () => {
  test('for lead all page', () => {
    const result = getInitialPageState(TABLE_LEAD_TYPE.LEAD_ALL);
    expect(result).toStrictEqual({
      currentPage: 1,
      pageSize: 15,
      orderBy: 'lead.createTime desc',
    });
  });
  test('for lead assignment page', () => {
    const result = getInitialPageState(TABLE_LEAD_TYPE.LEAD_ASSIGNMENT);
    expect(result).toStrictEqual({
      currentPage: 1,
      pageSize: 15,
      orderBy: 'lead.name',
    });
  });
  test('for lead rejection page', () => {
    const result = getInitialPageState(TABLE_LEAD_TYPE.LEAD_REJECTION);
    expect(result).toStrictEqual({
      currentPage: 1,
      pageSize: 15,
      orderBy: 'attributes.undecidedRejectionCreateTime',
    });
  });
  test('default case', () => {
    const result = getInitialPageState('' as TABLE_LEAD_TYPE);
    expect(result).toStrictEqual({
      currentPage: 1,
      pageSize: 15,
      orderBy: '',
    });
  });
});

test('initial Button State', () => {
  expect(initialButtonState).toStrictEqual([
    { assign: false, ids: [] },
    { unassign: false, ids: [] },
    { approve: null, rejections: [], statuses: [] },
  ]);
});
