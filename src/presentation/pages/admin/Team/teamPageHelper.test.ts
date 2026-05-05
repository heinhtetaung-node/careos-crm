import { getFilterFields, getFilterPanelQueryString } from './teamPageHelper';

describe('getFilterField', () => {
  it('should pass in teamName search fn', async () => {
    const mockFn = jest.fn().mockResolvedValue({
      data: { teams: [{ name: 'name', displayName: 'displayName' }] },
    });
    const config: any = getFilterFields({
      teamNameSearch: mockFn,
    });
    const result = await config[1].inputProps.searchFn('test query');
    expect(mockFn).toHaveBeenCalledWith('test query');
    expect(result).toEqual([
      {
        displayName: 'displayName',
        id: 'name',
        value: 'name',
      },
    ]);
    await config[1].inputProps.onFocusFn();
    expect(mockFn).toHaveBeenCalledWith('');
  });
  it('should pass in manager search fn', async () => {
    const mockFn = jest.fn().mockResolvedValue({
      data: { users: [{ name: 'name', displayName: 'displayName' }] },
    });
    const config: any = getFilterFields({
      managerSearch: mockFn,
    });
    const result = await config[4].inputProps.searchFn('test query');
    expect(mockFn).toHaveBeenCalledWith('test query');
    expect(result).toEqual([
      {
        fullName: 'displayName',
        id: 'name',
        value: 'name',
      },
    ]);
    await config[4].inputProps.onFocusFn();
    expect(mockFn).toHaveBeenCalledWith('');
  });
  it('should pass in supervisor search fn', async () => {
    const mockFn = jest.fn().mockResolvedValue({
      data: { users: [{ name: 'name', displayName: 'displayName' }] },
    });
    const config: any = getFilterFields({
      supervisorSearch: mockFn,
    });
    const result = await config[5].inputProps.searchFn('test query');
    expect(mockFn).toHaveBeenCalledWith('test query');
    expect(result).toEqual([
      {
        fullName: 'displayName',
        id: 'name',
        value: 'name',
      },
    ]);
    await config[5].inputProps.onFocusFn();
    expect(mockFn).toHaveBeenCalledWith('');
  });
  it('should pass in createby search fn', async () => {
    const mockFn = jest.fn().mockResolvedValue({
      data: { users: [{ name: 'name', displayName: 'displayName' }] },
    });
    const config: any = getFilterFields({
      createBySearch: mockFn,
    });
    const result = await config[7].inputProps.searchFn('test query');
    expect(mockFn).toHaveBeenCalledWith('test query');
    expect(result).toEqual([
      {
        fullName: 'displayName',
        id: 'name',
        value: 'name',
      },
    ]);
    await config[7].inputProps.onFocusFn();
    expect(mockFn).toHaveBeenCalledWith('');
  });
  test('field mapper', () => {
    const string = getFilterPanelQueryString({
      filters: {
        // humanId: { humanId: 'humanId' },
        productType: [{ value: 'product/product' }],
        supervisor: [{ value: 'supervisorname' }],
        manager: [{ value: 'managername' }],
        displayName: [{ value: 'teamname' }],
        leadType: [{ value: 'leadType' }],
        createBy: { id: 'userid', value: 'users/name' },
      },
    });
    expect(string).toBe(
      'team.createBy="users/name" team.name in ("teamname") team.leadType in ("leadType") team.manager in ("managername") team.productType.keyword in ("product/product") team.supervisor in ("supervisorname")'
    );
  });
});
