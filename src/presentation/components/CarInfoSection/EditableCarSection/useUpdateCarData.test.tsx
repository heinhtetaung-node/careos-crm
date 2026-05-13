import { act, renderHook, waitFor } from '__tests__/rtl-test-utils';
import _omit from 'lodash/omit';

import { CAR_MANUFACTURED_YEAR_QUERY_PARAM } from 'shared/constants';

import { CAR_ROWS } from './interface';
import useUpdateCarData, {
  getValue,
  toggleRelatedField,
  formatCarData,
} from './useUpdateCarData';

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

/* eslint-disable no-var */
/** Stable hook return values avoid effect dependency thrash (infinite setDataSchema). */
var mockGetCarData: jest.Mock;
var stableUseGetCarDataQueryResult: Readonly<{
  data: readonly { year: number }[];
  isLoading: boolean;
}>;
var stableUseGetAddressDataQueryResult: Readonly<{
  data: readonly unknown[];
  isLoading: boolean;
}>;
var stableLeadDetailErrorValue: {
  errors: Record<string, unknown>;
  setFieldTouch: jest.Mock;
};

jest.mock('data/slices/carSlice', () => {
  mockGetCarData = jest.fn();

  const stableManufacturedYears = Object.freeze([
    Object.freeze({ year: 2004 }),
  ]);
  stableUseGetCarDataQueryResult = Object.freeze({
    data: stableManufacturedYears,
    isLoading: false,
  });

  return {
    useLazyGetCarDataQuery: () => [mockGetCarData],
    useGetCarDataQuery: () => stableUseGetCarDataQueryResult,
  };
});

jest.mock('data/slices/addressSlice', () => {
  const emptyProvinces = Object.freeze([] as const);
  stableUseGetAddressDataQueryResult = Object.freeze({
    data: emptyProvinces,
    isLoading: false,
  });

  return {
    __esModule: true,
    useGetAddressDataQuery: () => stableUseGetAddressDataQueryResult,
  };
});

jest.mock('data/slices/errorSlice/leadDetailError', () => {
  stableLeadDetailErrorValue = {
    errors: {},
    setFieldTouch: jest.fn(),
  };

  return {
    useLeadDetailError: () => stableLeadDetailErrorValue,
  };
});
/* eslint-enable no-var */

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
  beforeEach(() => {
    mockGetCarData.mockReset();
    mockGetCarData.mockResolvedValue({
      isError: false as const,
      data: [],
    });
    (
      globalThis as {
        newrelic?: { noticeError: jest.Mock };
      }
    ).newrelic = { noticeError: jest.fn() };
  });

  afterEach(() => {
    delete (
      globalThis as {
        newrelic?: { noticeError: jest.Mock };
      }
    ).newrelic;
  });

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

  describe('hierarchical car options fetch (useEffect)', () => {
    const brandPayload = [{ name: 'brands/101', displayName: 'Beta' }];
    const modelPayload = [
      {
        id: 202,
        name: 'manufacturedYears/2004/brands/6/models/430',
        displayName: 'Model X',
      },
    ];
    const submodelPayload = [
      {
        name: 'years/36003',
        displayName: ' Trim A ',
        engineSize: 2.5,
        doors: 5,
        redbookId: 'rb-1',
      },
      {
        name: 'trail/no-year-suffix',
        displayName: 'NaN suffix',
        engineSize: 1.5,
        doors: 4,
        redbookId: 'rb-2',
      },
    ];

    function mockResponsesForSuccessfulHierarchy() {
      mockGetCarData.mockImplementation(
        async (args: Record<string, unknown>) => {
          const field = args.field as string;
          const pathParam = args.pathParam as string;

          if (field === 'brands') {
            return { isError: false as const, data: brandPayload };
          }
          if (field === 'models') {
            return { isError: false as const, data: modelPayload };
          }
          if (field === 'car' && pathParam.includes(':getUniqueCars')) {
            return {
              isError: false as const,
              data: submodelPayload,
            };
          }
          return { isError: false as const, data: [] };
        }
      );
    }

    it('fetches brands, models and submodels; maps door options', async () => {
      mockResponsesForSuccessfulHierarchy();

      const onSave = jest.fn();
      const { result } = renderHook(() => useUpdateCarData(carData, onSave));

      await waitFor(() => {
        expect(
          mockGetCarData.mock.calls.some(
            (c: unknown[]) =>
              (c[0] as Record<string, string>).field === 'brands' &&
              String((c[0] as Record<string, string>).pathParam).includes(
                String(carData.year)
              )
          )
        ).toBe(true);
      });

      await waitFor(() => {
        expect(
          result.current.dataSchema.brand.inputProps.options.some(
            (o: Record<string, unknown>) =>
              o.value === 101 && o.title === 'Beta'
          )
        ).toBe(true);
      });

      await waitFor(() => {
        expect(
          result.current.dataSchema.model.inputProps.options.some(
            (o: Record<string, unknown>) =>
              o.value === 430 && o.title === 'Model X'
          )
        ).toBe(true);
      });

      await waitFor(() => {
        const subOptions =
          result.current.dataSchema.carSubModelYear.inputProps.options ?? [];
        expect(subOptions.map((r: Record<string, unknown>) => r.value)).toEqual(
          [36003, '']
        );
        expect(
          subOptions.map((r: { title?: string }) =>
            (r.title ?? '').toString().trim()
          )
        ).toEqual(['Trim A', 'NaN suffix']);
      });

      await waitFor(() => {
        const doorOpts =
          result.current.dataSchema.noOfDoors.inputProps.options ?? [];

        expect(doorOpts).toEqual([
          { engineSize: 2.5, doors: 5 },
          { engineSize: 1.5, doors: 4 },
        ]);
      });

      expect(
        mockGetCarData.mock.calls.some((c: unknown[]) => {
          const arg = c[0] as Record<string, unknown>;
          const q = arg.queryParam as Record<string, unknown> | undefined;

          return (
            arg.field === 'car' &&
            String(arg.pathParam).includes(':getUniqueCars') &&
            q?.[CAR_MANUFACTURED_YEAR_QUERY_PARAM] === carData.year
          );
        })
      ).toBe(true);

      await waitFor(() =>
        expect(
          result.current.dataSchema.carSubModelYear.inputProps.fallbackSelectedValueResolver?.()
        ).toEqual({
          id: -1,
          value: -1,
          title: carData.subModel,
        })
      );
    });

    it('loads submodel options when display label subModel is absent', async () => {
      const carWithoutSubmodelLabel = { ...carData, subModel: undefined };

      mockResponsesForSuccessfulHierarchy();

      const { result } = renderHook(() =>
        useUpdateCarData(carWithoutSubmodelLabel as typeof carData, jest.fn())
      );

      await waitFor(() =>
        expect(result.current.carState.subModel).toBeUndefined()
      );

      await waitFor(() =>
        expect(
          (result.current.dataSchema.carSubModelYear.inputProps.options ?? [])
            .length
        ).toBe(2)
      );
    });

    it('notifies New Relic when brand fetch returns an error response', async () => {
      const noticeError = (
        globalThis as { newrelic?: { noticeError: jest.Mock } }
      ).newrelic!.noticeError;

      mockGetCarData.mockImplementation(async (args: Record<string, string>) =>
        args.field === 'brands'
          ? { isError: true as const, data: [] }
          : { isError: false as const, data: [] }
      );

      renderHook(() => useUpdateCarData(carData, jest.fn()));

      await waitFor(() => expect(noticeError).toHaveBeenCalled());
    });

    it('notifies New Relic when submodel fetch returns an error response', async () => {
      const noticeError = (
        globalThis as { newrelic?: { noticeError: jest.Mock } }
      ).newrelic!.noticeError;

      mockGetCarData.mockImplementation(
        async (args: Record<string, string>) => {
          const { field, pathParam } = args;
          if (field === 'brands')
            return { isError: false as const, data: brandPayload };
          if (field === 'models')
            return { isError: false as const, data: modelPayload };
          if (field === 'car' && String(pathParam).includes(':getUniqueCars')) {
            return { isError: true as const, data: [] };
          }
          return { isError: false as const, data: [] };
        }
      );

      renderHook(() => useUpdateCarData(carData, jest.fn()));

      await waitFor(() => expect(noticeError).toHaveBeenCalled());
    });

    it('notifies New Relic when submodel fetch throws', async () => {
      const noticeError = (
        globalThis as { newrelic?: { noticeError: jest.Mock } }
      ).newrelic!.noticeError;

      mockGetCarData.mockImplementation(
        async (args: Record<string, string>) => {
          const { field, pathParam } = args;
          if (field === 'brands')
            return { isError: false as const, data: brandPayload };
          if (field === 'models')
            return { isError: false as const, data: modelPayload };
          if (field === 'car' && String(pathParam).includes(':getUniqueCars')) {
            throw new Error('submodel-network');
          }
          return { isError: false as const, data: [] };
        }
      );

      renderHook(() => useUpdateCarData(carData, jest.fn()));

      await waitFor(() =>
        expect(noticeError).toHaveBeenCalledWith(
          expect.objectContaining({ message: 'submodel-network' })
        )
      );
    });

    it('does not request unique-cars path when model is missing from carState', async () => {
      mockGetCarData.mockClear();

      const withoutModel = { ...carData, model: undefined };

      expect(withoutModel.model).toBeUndefined();

      mockGetCarData.mockImplementation(async () => ({
        isError: false as const,
        data: [],
      }));

      renderHook(() =>
        useUpdateCarData(withoutModel as typeof carData, jest.fn())
      );

      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(
        mockGetCarData.mock.calls.some((c: unknown[]) =>
          String((c[0] as Record<string, string>).pathParam).includes(
            ':getUniqueCars'
          )
        )
      ).toBe(false);
    });
  });
});
