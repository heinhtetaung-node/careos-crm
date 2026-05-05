import { handleUserData } from './LeadDashBoard.helper';

const mockUserResponse = {
  users: [
    { name: 'fake/1', displayName: 'Fake Display Name 1' },
    { name: 'fake/2', displayName: 'Fake Display Name 2' },
  ],
};

describe('handleUserData', () => {
  it('should return empty array when data is undefined and includeUnassigned is set to false', () => {
    expect(handleUserData(undefined, false)).toEqual([]);
  });

  it('should return unassigned when data is undefined and includeUnassigned is set to true', () => {
    const result = handleUserData(undefined, true);

    expect(result).toHaveLength(1);
    expect(result).toEqual([
      { id: '', value: '', fullName: '(text.unassigned)', name: '' },
    ]);
  });

  it('should return formatted user data when data is passed and includeUnassigned is set to false', () => {
    const result = handleUserData(mockUserResponse, false);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        id: 'fake/1',
        name: 'fake/1',
        value: 'fake/1',
        fullName: 'Fake Display Name 1',
      },
      {
        id: 'fake/2',
        name: 'fake/2',
        value: 'fake/2',
        fullName: 'Fake Display Name 2',
      },
    ]);
  });

  it('should return formatted user data when data is passed and includeUnassigned is set to true', () => {
    const result = handleUserData(mockUserResponse, true);

    expect(result).toHaveLength(3);
    expect(result).toEqual([
      { id: '', fullName: '(text.unassigned)', value: '', name: '' },
      {
        id: 'fake/1',
        name: 'fake/1',
        value: 'fake/1',
        fullName: 'Fake Display Name 1',
      },
      {
        id: 'fake/2',
        name: 'fake/2',
        value: 'fake/2',
        fullName: 'Fake Display Name 2',
      },
    ]);
  });
});
