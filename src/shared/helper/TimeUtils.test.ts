import TimeUtils from './TimeUtils';

describe('TimeUtils', () => {
  it('tests formatCustomOptionDateTime', () => {
    const result = TimeUtils.formatCustomOptionDateTime(
      new Date('2020-10-10T12:00:00Z')
    );
    expect(result).toEqual('10/10/2020 07:00:00');
  });

  it('tests formatCustomOptionDate', () => {
    const result = TimeUtils.formatCustomOptionDate(
      new Date('2020-10-10T12:00:00Z')
    );
    expect(result).toEqual('10/10/2020');
  });

  it('tests formatCustomOptionTime', () => {
    const result = TimeUtils.formatCustomOptionTime(
      new Date('2020-10-10T12:00:00Z')
    );
    expect(result).toEqual('07:00:00');
  });

  it('tests format24', () => {
    const result = TimeUtils.format24('2020-10-10T12:00:00Z');
    expect(result).toEqual('10/10/2020 19:00');
  });

  it('tests fullDate', () => {
    const result = TimeUtils.fullDate('2020-10-10T12:00:00Z');
    expect(result).toEqual('10/10/2020');
  });

  it('tests formatCustomOption', () => {
    const result = TimeUtils.formatCustomOption(
      '2020-10-10T12:00:00Z',
      'dd/MM/yyyy (hh:mm:ss aa)'
    );
    expect(result).toEqual('10/10/2020 (07:00:00 PM)');
  });
});
