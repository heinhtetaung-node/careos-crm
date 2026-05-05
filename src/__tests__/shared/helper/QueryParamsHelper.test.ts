import generateQueryParams from 'shared/helper/QueryParams';

describe('generateQueryParams', () => {
  it('returns empty object when passed with empty string', () => {
    expect(generateQueryParams({})).toEqual('');
  });

  it('will return required error message when error is REQUIRED type', () => {
    expect(
      generateQueryParams({
        pageToken: 'fakePageToken',
        pageSize: 5,
      })
    ).toEqual('pageToken=fakePageToken&pageSize=5');
  });
});
