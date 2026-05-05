import { formatDataListInsurers } from 'presentation/redux/reducers/leadDetail/insurer/insurerHelper';

describe('Test formatDataListInsurer', () => {
  let defaultReturn: any;
  beforeEach(() => {
    defaultReturn = {
      insurers: [],
    };
  });
  it('Should be return default if input is not defined', () => {
    expect(formatDataListInsurers(null)).toEqual(defaultReturn);
    expect(formatDataListInsurers(0)).toEqual(defaultReturn);
    expect(formatDataListInsurers(undefined)).toEqual(defaultReturn);
    expect(formatDataListInsurers('')).toEqual(defaultReturn);
  });
  it('Should be return default if input is empty array', () => {
    expect(formatDataListInsurers([])).toEqual(defaultReturn);
  });
  it('Should be return listInsurer custom ', () => {
    const input = {
      insurers: [
        { name: 'insurers/42', displayName: 'FPG Insurance.', order: 3 },
      ],
      nextPageToken: '',
      responseTimes: 434,
    };
    expect(formatDataListInsurers(input)).toEqual({
      insurers: [
        {
          name: 'insurers/42',
          displayName: 'longInsurers.42',
          order: 3,
          id: 42,
        },
      ],
    });
  });
});
