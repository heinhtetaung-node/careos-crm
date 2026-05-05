import { columnsV2, getFilterPanelQueryString } from './leadSourceHelper';

test('field mapper', () => {
  const string = getFilterPanelQueryString({
    filters: {
      online: { value: true },
      source: [{ value: 'source name' }],
      campaign: [{ value: 'campaign name' }],
      medium: [{ value: 'medium name' }],
      hidden: { value: true },
      score: [{ value: 1 }],
      createBy: { id: 'userid', value: 'username' },
    },
  });
  expect(string).toBe(
    'sourceWithScore.online=true sourceWithScore.source in ("source name") sourceWithScore.campaign in ("campaign name") sourceWithScore.medium in ("medium name") sourceWithScore.hidden=true sourceWithScore.score in ("1") sourceWithScore.createByFullName.keyword="username"'
  );
});

test('columnv2', () => {
  const columns: any = columnsV2();
  expect(columns[0].transform({ online: true })).toBe('Online');
  expect(columns[0].transform({ online: false })).toBe('Offline');
  expect(columns[4].transform({ product: 'products/car-insurance' })).toBe(
    'Car Insurance'
  );
  expect(columns[6].transform({ hidden: true })).toBe('Yes');
  expect(columns[6].transform({ hidden: false })).toBe('No');
  expect(columns[9].transform({ createTime: '2022-02-02' })).toBe('02/02/2022');
  expect(columns[10].transform({ updateTime: '2022-02-02' })).toBe(
    '02/02/2022'
  );
});
