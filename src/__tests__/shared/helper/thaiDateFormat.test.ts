import { thaiDateFormat, thaiDateFormatV2 } from 'shared/helper/thaiDateFormat';

const ISODate = '2025-11-16';

const DateResult = '16/11/2025 (2568)';

describe('Test thaiDateFormat', () => {
  it('Should be return thai date', () => {
    expect(thaiDateFormat(ISODate)).toEqual(DateResult);
  });
  it('Should be return empty if input is empty', () => {
    expect(thaiDateFormat('')).toEqual('');
  });
});

describe('Test thaiDateFormatV2', () => {
  it('Should be return thai date', () => {
    expect(thaiDateFormatV2('04/04/2022')).toEqual('04/04/2022(2565)');
  });
  it('Should be return empty if input is empty', () => {
    expect(thaiDateFormatV2('')).toEqual('');
  });
});
