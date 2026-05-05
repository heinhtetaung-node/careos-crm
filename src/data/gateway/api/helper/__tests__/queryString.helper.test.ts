import { queryStringDynamic } from '../queryString.helper';

it('queryStringDynamic should be run well 1st', () => {
  expect(
    queryStringDynamic({
      teamDisplayName: ['DuyNT', 'Tri Lee'],
    })
  ).not.toEqual('');
});

it('queryStringDynamic should be run well 2nd', () => {
  expect(
    queryStringDynamic({
      teamDisplayName: [],
    })
  ).toEqual('');
});
