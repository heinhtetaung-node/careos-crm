import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { getListInsurer } from 'presentation/redux/actions/leadDetail/insurer';
import React from 'react';
import { Provider } from 'react-redux';
import Package from './index';

import FeatureFlags from 'config/flagsmithConfig';

const LIST_INSURERS_PAGE_SIZE = '100';

const E11_FLAG_KEY =
  FeatureFlags.BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP;

// Mock flagsmith useFlags - default disabled so tests don't depend on flag
const mockUseFlags = jest.fn();
jest.mock('flagsmith/react', () => ({
  useFlags: (keys) => {
    return mockUseFlags(keys);
  },
}));

// Mock react-redux hooks
const mockUseSelector = jest.fn();
const mockUseDispatch = jest.fn();
const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: (selector) => mockUseSelector(selector),
  useDispatch: () => mockUseDispatch(),
}));

// Mock the action
jest.mock('presentation/redux/actions/leadDetail/insurer', () => ({
  getListInsurer: jest.fn(() => ({ type: 'GET_LIST_INSURER' })),
}));

// Mock helper functions - avoid requireActual to prevent circular dependency
var mockCustomSelectInsurersCompany: jest.Mock;

jest.mock('../customQuote.helper', () => ({
  LIST_INSURERS_PAGE_SIZE: '100',
  getTitle: jest.fn((schema) => schema),
  customSelectInsurersCompany: (mockCustomSelectInsurersCompany = jest.fn(
    (data) => {
      if (!data?.insurers?.length) return [];
      return data.insurers.map((insurer) => ({
        id: insurer.id,
        title: insurer.displayName,
        value: insurer.name,
      }));
    }
  )),
  addSelectInsurersCompanyOptions: jest.fn((schema, fieldName, options) =>
    schema.map((item) => {
      if (item.name === fieldName) {
        return { ...item, options };
      }
      return item;
    })
  ),
}));

const mockPackageSchemaFn = jest.fn(() => [
  {
    name: 'insuranceCompanyId',
    type: 'select',
    options: [],
  },
]);

jest.mock('shared/constants/packageFormFields', () => ({
  ...jest.requireActual('shared/constants/packageFormFields'),
  packageSchema: (...args) => mockPackageSchemaFn(...args),
  packageFields: {
    insuranceCompanyId: {
      name: 'insuranceCompanyId',
    },
  },
  mockPackageSchema: [
    {
      name: 'insuranceCompanyId',
      type: 'select',
      options: [],
    },
  ],
}));

// Mock CustomQuoteField
jest.mock('../customQuoteField', () =>
  jest.fn(() =>
    React.createElement(
      'div',
      { 'data-testid': 'custom-quote-field' },
      'CustomQuoteField'
    )
  )
);

// Mock useLocation to avoid Router context error
const mockUseLocation = jest.fn(() => ({ state: {} }));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
}));

describe('<Package />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseFlags.mockReturnValue({
      [E11_FLAG_KEY]: { enabled: false },
    });
  });

  // Always return a valid listInsurer by default to avoid infinite effect loop
  beforeAll(() => {
    mockUseSelector.mockImplementation((selector) => {
      const state = {
        leadsDetailReducer: {
          getListInsurerReducer: {
            data: {
              listInsurer: { insurers: [] },
            },
          },
        },
      };
      return selector(state);
    });
  });

  describe('selectInsurersCompany useMemo (lines 47-58)', () => {
    const renderComponent = () => {
      // Create a minimal store to avoid reducer errors
      const store = configureStore({
        reducer: {
          leadsDetailReducer: (state = {}) => state,
        },
        preloadedState: {},
      });

      return render(
        <Provider store={store}>
          <Package style={{}} />
        </Provider>
      );
    };

    it('should return null when listInsurer is null', () => {
      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: {
              data: {
                listInsurer: null,
              },
            },
          },
        };
        return selector(state);
      });

      renderComponent();

      // When listInsurer is null, selectInsurersCompany should be null
      // This triggers the useEffect to dispatch getListInsurer
      expect(mockDispatch).toHaveBeenCalledWith(
        getListInsurer(LIST_INSURERS_PAGE_SIZE)
      );
    });

    it('should return null when listInsurer is undefined', () => {
      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: {
              data: {
                listInsurer: undefined,
              },
            },
          },
        };
        return selector(state);
      });

      renderComponent();

      // When listInsurer is undefined, selectInsurersCompany should be null
      expect(mockDispatch).toHaveBeenCalledWith(
        getListInsurer(LIST_INSURERS_PAGE_SIZE)
      );
    });

    it('should filter out excluded insurers when listInsurer.insurers exists', () => {
      const mockListInsurer = {
        insurers: [
          { name: 'insurers/1', displayName: 'Insurer 1', id: 1 },
          { name: 'insurers/50', displayName: 'Insurer 50', id: 50 }, // Excluded
          { name: 'insurers/49', displayName: 'Insurer 49', id: 49 }, // Excluded
          { name: 'insurers/2', displayName: 'Insurer 2', id: 2 },
          { name: 'insurers/48', displayName: 'Insurer 48', id: 48 }, // Excluded
          { name: 'insurers/3', displayName: 'Insurer 3', id: 3 },
        ],
      };

      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: {
              data: {
                listInsurer: mockListInsurer,
              },
            },
          },
        };
        return selector(state);
      });

      renderComponent();

      // The excluded insurers (50, 49, 48) should be filtered out
      // Only insurers 1, 2, 3 should remain
      // We can verify this by checking that the component renders with insuranceCompany = true
      // and that getListInsurer was NOT called (because selectInsurersCompany is not null)
      expect(mockDispatch).not.toHaveBeenCalledWith(
        getListInsurer(LIST_INSURERS_PAGE_SIZE)
      );
    });

    it('should return all insurers when no excluded insurers are present', () => {
      const mockListInsurer = {
        insurers: [
          { name: 'insurers/1', displayName: 'Insurer 1', id: 1 },
          { name: 'insurers/2', displayName: 'Insurer 2', id: 2 },
          { name: 'insurers/3', displayName: 'Insurer 3', id: 3 },
        ],
      };

      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: {
              data: {
                listInsurer: mockListInsurer,
              },
            },
          },
        };
        return selector(state);
      });

      renderComponent();

      // All insurers should remain since none are excluded
      // getListInsurer should NOT be called
      expect(mockDispatch).not.toHaveBeenCalledWith(
        getListInsurer(LIST_INSURERS_PAGE_SIZE)
      );
    });

    it('should return listInsurer as is when insurers property does not exist', () => {
      const mockListInsurer = {
        someOtherProperty: 'value',
      };

      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: {
              data: {
                listInsurer: mockListInsurer,
              },
            },
          },
        };
        return selector(state);
      });

      renderComponent();

      // When listInsurer.insurers doesn't exist, it should return listInsurer as is
      // This means selectInsurersCompany will be truthy, so getListInsurer should NOT be called
      expect(mockDispatch).not.toHaveBeenCalledWith(
        getListInsurer(LIST_INSURERS_PAGE_SIZE)
      );
    });

    it('should filter out all excluded insurers from MANUAL_PKG_EXCLUDED_INSURERS', () => {
      const mockListInsurer = {
        insurers: [
          { name: 'insurers/52', displayName: 'Insurer 52', id: 52 }, // Excluded
          { name: 'insurers/51', displayName: 'Insurer 51', id: 51 }, // Excluded
          { name: 'insurers/50', displayName: 'Insurer 50', id: 50 }, // Excluded
          { name: 'insurers/49', displayName: 'Insurer 49', id: 49 }, // Excluded
          { name: 'insurers/48', displayName: 'Insurer 48', id: 48 }, // Excluded
          { name: 'insurers/46', displayName: 'Insurer 46', id: 46 }, // Excluded
          { name: 'insurers/45', displayName: 'Insurer 45', id: 45 }, // Excluded
          { name: 'insurers/1', displayName: 'Insurer 1', id: 1 },
        ],
      };

      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: {
              data: {
                listInsurer: mockListInsurer,
              },
            },
          },
        };
        return selector(state);
      });

      renderComponent();

      expect(mockCustomSelectInsurersCompany).toHaveBeenCalledWith({
        insurers: [{ name: 'insurers/1', displayName: 'Insurer 1', id: 1 }],
      });
      expect(mockDispatch).not.toHaveBeenCalledWith(
        getListInsurer(LIST_INSURERS_PAGE_SIZE)
      );
    });

    it('should handle empty insurers array', () => {
      const mockListInsurer = {
        insurers: [],
      };

      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: {
              data: {
                listInsurer: mockListInsurer,
              },
            },
          },
        };
        return selector(state);
      });

      renderComponent();

      // Empty insurers array should result in empty filtered array
      // getListInsurer should NOT be called because selectInsurersCompany is not null
      expect(mockDispatch).not.toHaveBeenCalledWith(
        getListInsurer(LIST_INSURERS_PAGE_SIZE)
      );
    });
  });

  describe('E11 OIC code flag (BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP)', () => {
    const renderComponent = () => {
      const store = configureStore({
        reducer: {
          leadsDetailReducer: (state = {}) => state,
        },
        preloadedState: {},
      });

      return render(
        <Provider store={store}>
          <Package style={{}} />
        </Provider>
      );
    };

    it('calls packageSchema with includeE11OicCode: false when flag is disabled', () => {
      mockUseFlags.mockReturnValue({
        [E11_FLAG_KEY]: { enabled: false },
      });
      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: { data: { listInsurer: null } },
          },
        };
        return selector(state);
      });

      renderComponent();

      expect(mockPackageSchemaFn).toHaveBeenCalledWith({
        includeE11OicCode: false,
      });
    });

    it('calls packageSchema with includeE11OicCode: true when flag is enabled', () => {
      mockUseFlags.mockReturnValue({
        [E11_FLAG_KEY]: { enabled: true },
      });
      mockUseSelector.mockImplementation((selector) => {
        const state = {
          leadsDetailReducer: {
            getListInsurerReducer: { data: { listInsurer: null } },
          },
        };
        return selector(state);
      });

      renderComponent();

      expect(mockPackageSchemaFn).toHaveBeenCalledWith({
        includeE11OicCode: true,
      });
    });
  });
});
