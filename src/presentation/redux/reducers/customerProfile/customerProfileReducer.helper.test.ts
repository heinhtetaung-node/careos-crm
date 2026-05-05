import { updateTokenList } from './customerProfileReducer.helper';

describe('Test updateTokenList', () => {
  it('Should save new token and page and return it.', () => {
    const response = updateTokenList([], 1, '');

    expect(response).toEqual([{ page: 1, token: '' }]);
  });

  it('Should save new token and page and return it.', () => {
    const response = updateTokenList([{ page: 1, token: '' }], 2, 'fakeToken');

    expect(response).toEqual([
      { page: 1, token: '' },
      { page: 2, token: 'fakeToken' },
    ]);
  });

  it('Should save new token and page and return it.', () => {
    const response = updateTokenList(
      [
        { page: 1, token: '' },
        { page: 2, token: 'fakeToken' },
      ],
      1,
      ''
    );

    expect(response).toEqual([
      { page: 1, token: '' },
      { page: 2, token: 'fakeToken' },
    ]);
  });
});
