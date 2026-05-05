import * as localization from 'presentation/theme/localization';
import { getGender, Genders, getOptionData } from './leadDetailsPage.helper';

jest.mock('presentation/theme/localization');
const mockedGetString = jest.spyOn(localization, 'getString');

describe('getGender', () => {
  beforeEach(() => {
    mockedGetString.mockClear();
  });
  test('Check for value m', () => {
    getGender(Genders.male);
    expect(mockedGetString).toHaveBeenCalledWith('text.male');
  });
  test('Check for value f', () => {
    getGender(Genders.female);
    expect(mockedGetString).toHaveBeenCalledWith('text.female');
  });
  test('Check for value unspecified_gender', () => {
    expect(getGender(Genders.gender_unspecified)).toEqual('');
  });
});

describe('getOptionData', () => {
  test('Language options', () => {
    expect(getOptionData('Language')).toHaveLength(2);
  });
  test('Type options', () => {
    expect(getOptionData('Type')).toHaveLength(5);
  });
  test('Document type options', () => {
    expect(getOptionData('DocumentType')).toHaveLength(3);
  });
  test('New preferred delivery options', () => {
    expect(getOptionData('newPreferredDeliveryOptions')).toHaveLength(4);
  });
  test('Default options', () => {
    getOptionData('');
    expect(getOptionData('')).toHaveLength(0);
  });
});
