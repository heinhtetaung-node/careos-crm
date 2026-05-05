import getFormattedURL from './helper';

describe('getFormattedURL', () => {
  test('with query param', () => {
    const url = getFormattedURL({
      queryParams: {
        pageSize: 15,
        filter: 'filter',
        orderBy: 'name',
        currentPage: 1,
      },
    });
    expect(url?.toString()).toBe('pageSize=15&orderBy=name&filter=filter');
  });
  test('without query param', () => {
    const url = getFormattedURL({
      queryParams: {} as never,
    });
    expect(url?.toString()).toBe('pageSize=15');
  });
});
