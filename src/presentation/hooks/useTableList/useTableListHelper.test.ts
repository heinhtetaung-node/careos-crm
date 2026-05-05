import {
  getOrderByField,
  changeSortStatus,
  prevPageHandle,
  getCustomAction,
  getOrderConfigsOrderBy,
} from './helper';

describe('Test prevPageHandle', () => {
  it('Should be "page 1" if "page 1" is passed', () => {
    expect(prevPageHandle([{ page: 1, token: 'testtest' }], 1)).toEqual({
      page: 1,
      token: 'testtest',
    });
  });

  it('Should be "page 3" if "page 3" is passed', () => {
    expect(prevPageHandle([{ page: 2, token: 'testtest' }], 3)).toEqual(
      undefined
    );
  });
});

describe('Test getOrderByField & getOrderConfigsOrderBy', () => {
  enum SORT_TABLE_TYPE {
    NONE = 'none',
    ASC = 'asc',
    DESC = 'desc',
  }
  it('Should be "NONE" if "NONE" is passed', () => {
    expect(getOrderByField('createTime', SORT_TABLE_TYPE.NONE)).toEqual('');
    expect(getOrderConfigsOrderBy('status', SORT_TABLE_TYPE.NONE)).toEqual('');
  });
  it('Should be "DESC" if "DESC" is passed', () => {
    expect(getOrderByField('createTime', SORT_TABLE_TYPE.DESC)).toEqual(
      'createTime desc'
    );
    expect(getOrderConfigsOrderBy('status', SORT_TABLE_TYPE.DESC)).toEqual(
      'config.absent desc'
    );
  });
  it('Should be "ASC" if "ASC" is passed', () => {
    expect(getOrderByField('createTime', SORT_TABLE_TYPE.ASC)).toEqual(
      'createTime'
    );
    expect(getOrderConfigsOrderBy('status', SORT_TABLE_TYPE.ASC)).toEqual(
      'config.absent'
    );
  });
});

describe('Test changeSortStatus', () => {
  enum SORT_TABLE_TYPE {
    NONE = 'none',
    ASC = 'asc',
    DESC = 'desc',
  }
  it('Should be "none" if "none" is passed', () => {
    expect(changeSortStatus(SORT_TABLE_TYPE.NONE)).toEqual('asc');
  });
  it('Should be "DESC" if "DESC" is passed', () => {
    expect(changeSortStatus(SORT_TABLE_TYPE.DESC)).toEqual('none');
  });
  it('Should be "ASC" if "ASC" is passed', () => {
    expect(changeSortStatus(SORT_TABLE_TYPE.ASC)).toEqual('desc');
  });
});

const tableTypes = [
  'package',
  'leads',
  'carSubModel',
  'customerProfile',
  'curatedCar',
];

describe.each(tableTypes)('getCustomAction', (tableType) => {
  it(`checks is anchor element was appended to the body for tableType: ${tableType}`, () => {
    const createElementSpy = jest.spyOn(window.document, 'createElement');
    const appendChildSpy = jest.spyOn(document.body, 'appendChild');

    getCustomAction('fakeFileName', tableType);

    expect(document.createElement).toHaveBeenNthCalledWith(1, 'a');
    expect(document.body.appendChild).toHaveBeenCalledTimes(1);

    appendChildSpy.mockRestore();
    createElementSpy.mockRestore();
  });
});
