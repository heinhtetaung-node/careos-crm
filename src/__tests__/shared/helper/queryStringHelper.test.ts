import {
  queryString,
  IPayLoad,
} from 'data/gateway/api/helper/queryString.helper';

const payload: IPayLoad = {
  currentPage: 1,
  filter: '',
  pageSize: 5,
  pageToken: '',
  showDeleted: true,
};

const result = 'currentPage=1&pageSize=5&showDeleted=true';

test('Valid queryString', () => {
  expect(queryString(payload)).toEqual(result);
});
