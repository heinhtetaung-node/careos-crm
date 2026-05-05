import Type from '../../type';

import { getComments } from './index';

test('Test getComments return correct value', () => {
  const params = {
    pageSize: 5,
    pageToken: '',
    showDeleted: false,
    filter: '',
    orderBy: '',
  };
  const name = 'sdsdds';
  expect(getComments(params, name)).toEqual({
    Type: Type.Nest,
    Path: `/api/${name}comments?pageSize=5&pageToken=&filter=&orderBy=&showDeleted=false`,
  });
});
