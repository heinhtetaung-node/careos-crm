import { renderHook } from '__tests__/rtl-test-utils';
import _omit from 'lodash/omit';

import { CAR_ROWS } from './interface';
import useUpdateCarData, {
  getValue,
  toggleRelatedField,
  formatCarData,
} from './useUpdateCarData';

const carData = {
  brand: 6,
  cabType: '',
  carColor: ['white'],
  carDashCam: false,
  carLicensePlate: '1กพ 1234',
  carModified: false,
  carRegisteredSeats: 7,
  carSubModelYear: 36003,
  carUsageType: 'personal' as const,
  chassisNumber: '12345AD',
  engineSize: 2300,
  fuelType: 'Petrol',
  isVan: true,
  model: 430,
  noOfDoors: 3,
  redPlate: false,
  registeredProvince: 100000,
  subModel: 9823,
  transmission: 'Automatic',
  vehicleIdNumber: '23MHVK876764V',
  year: 2004,
};

describe('getValue', () => {
  it('returns true when "true" is passed', () => {
    expect(getValue('true')).toBe(true);
  });
  it('returns true when "yes" is passed', () => {
    expect(getValue('yes')).toBe(true);
  });
  it('returns false when "false" is passed', () => {
    expect(getValue('false')).toBe(false);
  });
  it('returns false when "no" is passed', () => {
    expect(getValue('no')).toBe(false);
  });
  it('returns the text passed', () => {
    expect(getValue('manual')).toBe('manual');
  });
});

describe('toggleRelatedField', () => {
  it('returns', () => {
    const relatedFields: CAR_ROWS[] = [
      CAR_ROWS.FUEL_TYPE,
      CAR_ROWS.TRANSMISSION_GEAR,
      CAR_ROWS.ENGINE_SIZE,
      CAR_ROWS.NUMBER_DOORS,
      CAR_ROWS.CAB_TYPE,
    ];
    const toggleFields = toggleRelatedField(relatedFields, 'isReadOnly', false);
    expect(toggleFields).toEqual([
      { field: 'isReadOnly', name: 'fuelType', response: false },
      { field: 'isReadOnly', name: 'transmission', response: false },
      { field: 'isReadOnly', name: 'engineSize', response: false },
      { field: 'isReadOnly', name: 'noOfDoors', response: false },
      { field: 'isReadOnly', name: 'cabType', response: false },
    ]);
  });
});

describe('formatCarData', () => {
  const formattedCarData = {
    brand: 6,
    cabType: '',
    carColor: ['white'],
    carDashCam: false,
    carLicensePlate: '1กพ 1234',
    carModified: false,
    carRegisteredSeats: 7,
    carSubModelYear: 36003,
    carUsageType: 'personal',
    chassisNumber: '12345AD',
    engineSize: 2300,
    fuelType: 'Petrol',
    isVan: true,
    model: 430,
    noOfDoors: 3,
    redPlate: false,
    registeredProvince: 100000,
    subModel: 9823,
    transmission: 'Automatic',
    vehicleIdNumber: '23MHVK876764V',
    year: 2004,
  };

  it('returns formatted car data', () => {
    const formatResponse = formatCarData(carData, '1กพ 1234');
    expect(formatResponse).toEqual(formattedCarData);
  });

  it('returns formatted car data with proper license plate', () => {
    const formattedCarDataNew = {
      ...formattedCarData,
      carLicensePlate: '1กพ-1234 สป',
    };

    const formatResponse = formatCarData(carData, '1กพ-1234 สป');
    expect(formatResponse).toEqual(formattedCarDataNew);
  });

  it('returns formatted car data when license plate is empty string', () => {
    const newCarData = {
      ...carData,
      carLicensePlate: '',
    };

    const formattedCarDataNew = {
      ...formattedCarData,
      carLicensePlate: undefined,
      redPlate: false,
    };

    const formatResponse = formatCarData(newCarData, undefined);
    expect(formatResponse).toEqual(formattedCarDataNew);
  });

  it('returns formatted car data with no license plate field', () => {
    const newCarData = _omit(carData, ['carLicensePlate', 'redPlate']);
    const newformattedCarData = _omit(formattedCarData, [
      'carLicensePlate',
      'redPlate',
    ]);

    const formatResponse = formatCarData(newCarData, undefined);
    expect(formatResponse).toEqual(newformattedCarData);
  });

  it('returns formatted car data when carLicensePlate is redplate', () => {
    const newCarDate = {
      ...carData,
      carLicensePlate: 'redplate',
      redPlate: true,
    };

    const newformattedCarData = {
      ...formattedCarData,
      carLicensePlate: '',
      redPlate: true,
    };

    const formatResponse = formatCarData(newCarDate, '');
    expect(formatResponse).toEqual(newformattedCarData);
  });
});

describe('useUpdateCarData', () => {
  test('handleRadioChange.withNonApiCallField', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleRadioChange(
      { target: { value: 'val' } },
      'carYear'
    );
    expect(mockSaveFn).not.toHaveBeenCalled();
  });

  test('handleRadioChange.withApiCallField', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleRadioChange(
      { target: { value: 'val' } },
      'carSubModelYear'
    );
    expect(mockSaveFn).toHaveBeenCalledWith('/carSubModelYear', 'val');
  });

  test('handleRadioChange should remove carRegisteredSet', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleRadioChange(
      { target: { value: 'commercial' } },
      'carUsageType'
    );
    expect(mockSaveFn).toHaveBeenCalledWith(
      '/carRegisteredSeats',
      '',
      'remove'
    );
  });

  test('handleRadioChange.redPlate', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleRadioChange(
      { target: { value: true } },
      'redPlate'
    );
    expect(mockSaveFn).toHaveBeenCalledWith('/carLicensePlate', 'redplate');
  });

  test('handleRadioChange.registeredSeat', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleRadioChange(
      { target: { value: '3' } },
      'carRegisteredSeats'
    );
    expect(mockSaveFn).toHaveBeenCalledWith('/carRegisteredSeats', 3);
  });

  test('handleAutoComplete.carColor value shoud be array', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleAutocompleteChange(
      { selections: { value: 'red' } },
      'carColor'
    );
    expect(mockSaveFn).toHaveBeenCalledWith('/carColor', ['red']);
  });

  test('handleAutoComplete.registeredProvince should remove license plate', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleAutocompleteChange(
      { selections: { value: 'provece' } },
      'registeredProvince'
    );
    expect(mockSaveFn).toHaveBeenCalledWith('/carLicensePlate', null, 'remove');
  });

  test('handleAutoComplete', () => {
    const mockSaveFn = jest.fn();
    const { result } = renderHook(() => useUpdateCarData(carData, mockSaveFn));
    (result.current as any).handleAutocompleteChange(
      { selections: { value: '123' } },
      'chassisNumber'
    );
    expect(mockSaveFn).toHaveBeenCalledWith('/chassisNumber', '123');
  });
});
