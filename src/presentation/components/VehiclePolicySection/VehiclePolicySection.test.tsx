import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { act } from 'react-dom/test-utils';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import themes from 'presentation/theme';
import FeatureFlags from 'config/flagsmithConfig';
import { UserRoles } from 'config/constant';
import { apiSlice } from 'data/slices/apiSlice';
import { useGetOrderPolicyItemsQuery } from 'data/slices/orderSlice';

import VehiclePolicySection, {
  formatOicCodeForOrder,
  parseOicCodeForSelect,
} from './VehiclePolicySection';

const updateOrderActionMock = jest.fn((payload) => ({
  type: '[Order] UPDATE_ORDER',
  payload,
}));
const syncVehicleOrderFieldToLeadMock = jest.fn(() => Promise.resolve());

jest.mock('presentation/redux/actions/order', () => {
  const actual = jest.requireActual('presentation/redux/actions/order');
  return {
    ...actual,
    updateOrder: (payload: any) => updateOrderActionMock(payload),
  };
});

jest.mock('shared/helper/vehicleOrderLeadSync', () => {
  const actual = jest.requireActual('shared/helper/vehicleOrderLeadSync');
  return {
    ...actual,
    syncVehicleOrderFieldToLead: (...args: any[]) =>
      syncVehicleOrderFieldToLeadMock(...args),
  };
});

jest.mock('data/slices/orderSlice', () => {
  const actual = jest.requireActual('data/slices/orderSlice');
  return {
    ...actual,
    useGetOrderPolicyItemsQuery: jest.fn(() => ({
      data: [
        {
          approvalStatus: 'ITEM_APPROVAL_STATUS_PENDING',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_DRAFT',
        },
      ],
      isLoading: false,
      isFetching: false,
      isSuccess: true,
    })),
  };
});

describe('formatOicCodeForOrder / parseOicCodeForSelect (lines 50-58)', () => {
  it('formatOicCodeForOrder returns empty string for falsy raw (line 51)', () => {
    expect(formatOicCodeForOrder('')).toBe('');
  });

  it('formatOicCodeForOrder maps E11 to TYPE_E11 and other codes to TYPE_<raw> (line 52)', () => {
    expect(formatOicCodeForOrder('E11')).toBe('TYPE_E11');
    expect(formatOicCodeForOrder('110')).toBe('TYPE_110');
  });

  it('parseOicCodeForSelect returns empty for null, undefined, or empty string (line 57)', () => {
    expect(parseOicCodeForSelect(null)).toBe('');
    expect(parseOicCodeForSelect(undefined)).toBe('');
    expect(parseOicCodeForSelect('')).toBe('');
  });

  it('parseOicCodeForSelect strips TYPE_ prefix for select display (line 58)', () => {
    expect(parseOicCodeForSelect('TYPE_110')).toBe('110');
    expect(parseOicCodeForSelect('TYPE_E11')).toBe('E11');
  });
});

afterEach(() => {
  mockVehicleUpdateWithinOrderEnabled = false;
  updateOrderActionMock.mockClear();
  syncVehicleOrderFieldToLeadMock.mockClear();
  jest.mocked(useGetOrderPolicyItemsQuery).mockReturnValue({
    data: [
      {
        approvalStatus: 'ITEM_APPROVAL_STATUS_PENDING',
        submissionStatus: 'ITEM_SUBMISSION_STATUS_DRAFT',
      },
    ],
    isLoading: false,
    isFetching: false,
    isSuccess: true,
  });
});

const defaultMockStoreState = {
  authReducer: {
    data: { user: { role: UserRoles.ADMIN_ROLE } },
  },
};

/** @param {Record<string, unknown>} preloadedState */
const createMockStore = (preloadedState) => {
  const merged = { ...defaultMockStoreState, ...preloadedState };
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      order: (state = merged.order) => state,
      authReducer: (state = merged.authReducer) => state,
      carDetailReducer: (state = merged.carDetailReducer) => state,
      provinceDetailReducer: (state = merged.provinceDetailReducer) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }).concat(apiSlice.middleware),
  });
};

// Mock localization to return keys directly for stable queries
jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

// Mock lead selector with mutable data per test
let mockLeadData: any = {
  name: 'leads/1',
  data: {
    numberOfFixedDriver: 1,
    firstDriverFirstName: 'John',
    firstDriverLastName: 'Doe',
    firstDriverDOB: '2000-01-01',
  },
};
jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: () => ({
    ...(mockLeadData || {}),
    data: { ...((mockLeadData && mockLeadData.data) || {}) },
  }),
}));

// Mock lead updater hook used to update numberOfFixedDriver
const updateLeadMock = jest.fn();
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    default: () => ({ updateLead: updateLeadMock }),
  })
);

// Mock RTK query for cars data
jest.mock('data/slices/carSlice', () => ({
  useLazyGetCarsDataQuery: () => [jest.fn(), { data: undefined }],
}));

// Mock RTK query for address/provinces (must mock before component uses it)
jest.mock('data/slices/addressSlice', () => ({
  __esModule: true,
  useGetAddressDataQuery: jest.fn(() => ({
    data: [
      { name: 'provinces/100000', nameEn: 'Bangkok', nameTh: 'กรุงเทพมหานคร' },
      { name: 'provinces/130000', nameEn: 'Pathum Thani', nameTh: 'ปทุมธานี' },
    ],
  })),
  useLazyGetAddressDataQuery: jest.fn(() => [jest.fn(), {}]),
}));

// Control flagsmith feature flag per test
let mockFlagEnabled = true;
/** BROK-4710: when false, OIC row is hidden; province dropdown uses same flag in component. */
let mockVehicleUpdateWithinOrderEnabled = false;
jest.mock('flagsmith/react', () => ({
  useFlags: () => ({
    [FeatureFlags.BROK_3694_ALLOW_EDIT_CARINFO_ORDER_DETAIL_20251103]: {
      enabled: mockFlagEnabled,
    },
    [FeatureFlags.BROK_3011_ENABLE_E11_OIC_CODE_FOR_EV_20260213_TEMP]: {
      enabled: false,
    },
    [FeatureFlags.BROK_4710_VEHICLE_UPDATE_WITHIN_ORDER_20260330_TEMP]: {
      enabled: mockVehicleUpdateWithinOrderEnabled,
    },
  }),
}));

describe('VehiclePolicySection - renders fixed driver section (lines 301-335)', () => {
  it('renders No. of fixed driver select and first driver name block when numberOfFixedDriver > 0', async () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 1,
        firstDriverFirstName: 'John',
        firstDriverLastName: 'Doe',
        firstDriverDOB: '2000-01-01',
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            firstDriverName: 'John Doe',
            firstDriverDOB: '2000-01-01',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    // Line ~301: label for number of fixed drivers
    expect(screen.getByText('leadFilter.noFixedDriver')).toBeInTheDocument();

    // Lines ~322-335: first driver name block appears when numberOfFixedDriver > 0
    expect(
      screen.getByText('leadDetailFields.firstDriverName')
    ).toBeInTheDocument();

    // The concatenated name should be present as an input/display value
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('updates numberOfFixedDriver via Select onChange and opens FixedDriverModal (covers 305-307)', async () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };
    const store = createMockStore({
      order: {
        payload: { name: 'orders/1', data: {} },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    // Find the select trigger (MUI Select renders a button with the selected value)
    const selectTrigger = screen.getByRole('button', { name: '0' });
    fireEvent.mouseDown(selectTrigger);

    // Click on option "1"
    const optionOne = screen.getByRole('option', { name: '1' });
    fireEvent.click(optionOne);

    await waitFor(() => {
      expect(
        screen.getByText('leadDetailFields.fixedDriver')
      ).toBeInTheDocument();
    });
  });

  it('updates province and rewrites license plate abbreviation when province changes', async () => {
    mockVehicleUpdateWithinOrderEnabled = true;
    updateLeadMock.mockClear();
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          humanId: 'ORD-1',
          data: {
            registeredProvince: 100000,
            carLicensePlate: '1กพ1234 กท',
            isRedPlate: false,
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: {
        data: { nameEn: 'Bangkok', nameTh: 'กรุงเทพมหานคร' },
      },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: /Bangkok|กรุงเทพมหานคร/ }));
    const provinceOptions = await screen.findAllByRole('option');
    fireEvent.click(provinceOptions[provinceOptions.length - 1]);

    await waitFor(() => {
      expect(updateLeadMock).toHaveBeenCalledWith('/registeredProvince', 130000);
      expect(updateLeadMock).toHaveBeenCalledWith('/carLicensePlate', '1กพ1234 ปท');
    });
  });

  it('renders dash cam and custom vehicle as read-only text (no edit)', () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            carDashCam: true,
            carModified: false,
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const dashCamRow =
      screen.getByText('leadDetailFields.dashCam').closest('[data-testid="field"]') ||
      document.body;
    const customRow =
      screen.getByText('text.customVehicle').closest('[data-testid="field"]') ||
      document.body;
    expect(within(dashCamRow).queryByRole('radiogroup')).toBeNull();
    expect(within(customRow).queryByRole('radiogroup')).toBeNull();
    expect(within(dashCamRow).getByText('text.yes')).toBeInTheDocument();
    expect(within(customRow).getByText('text.no')).toBeInTheDocument();
  });

  it('onUpdateOrder passes through non-boolean fields without transformer (lines 279-280)', async () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          humanId: 'ORD-1',
          data: {
            carUsageType: 'personal',
            chassisNumber: 'CHASSIS-OLD',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const chassisField =
      screen
        .getByText('text.chassisNumber')
        .closest('[data-testid="field"]') || document.body;
    const chassisInput = within(chassisField).getByRole('textbox');
    fireEvent.click(chassisInput);
    fireEvent.change(chassisInput, { target: { value: 'CHASSIS-NEW-999' } });
    fireEvent.blur(chassisInput);

    await waitFor(() => {
      expect(updateOrderActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'orders/1',
          data: expect.objectContaining({
            chassisNumber: 'CHASSIS-NEW-999',
          }),
        })
      );
    });
  });

  it('onUpdateOrder applies isRedPlate transformer (lines 273-280)', async () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            isRedPlate: false,
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const redPlateField =
      screen
        .getByText('leadDetailFields.redPlate')
        .closest('[data-testid="field"]') || document.body;
    fireEvent.click(within(redPlateField).getByLabelText('Yes'));

    await waitFor(() => {
      expect(updateOrderActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'orders/1',
          data: expect.objectContaining({
            isRedPlate: expect.any(Boolean),
          }),
        })
      );
    });
  });

  it('does not render OIC code when BROK-4710 vehicle update flag is off', () => {
    mockVehicleUpdateWithinOrderEnabled = false;
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          humanId: 'ORD-1',
          data: {
            carUsageType: 'personal',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    expect(screen.queryByTestId('vehicle-oic-code-select')).toBeNull();
    expect(screen.queryByText('newPackageListing.oicCode')).toBeNull();
    expect(screen.queryByTestId('vehicle-driving-purpose-select')).toBeNull();
    const dashCamRow =
      screen.getByText('leadDetailFields.dashCam').closest('[data-testid="field"]') ||
      document.body;
    expect(within(dashCamRow).queryByRole('radiogroup')).toBeNull();
  });

  it('calls onUpdateOrder when OIC code select changes (lines 652-654)', async () => {
    mockVehicleUpdateWithinOrderEnabled = true;
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          humanId: 'ORD-1',
          data: {
            carUsageType: 'personal',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    fireEvent.mouseDown(
      within(screen.getByTestId('vehicle-oic-code-select')).getByRole('button')
    );
    fireEvent.click(await screen.findByRole('option', { name: '110' }));

    await waitFor(() => {
      expect(updateOrderActionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'orders/1',
          data: expect.objectContaining({
            oicCode: 'TYPE_110',
          }),
        })
      );
    });
  });

  it('opens FixedDriverModal when clicking edit arrow on first driver name (covers 333)', async () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 1,
        firstDriverFirstName: 'John',
        firstDriverLastName: 'Doe',
        firstDriverDOB: '2000-01-01',
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            firstDriverName: 'John Doe',
            firstDriverDOB: '2000-01-01',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    // Click the edit button within the first driver name field specifically
    const valueInput = screen.getByDisplayValue('John Doe');
    const fieldContainer =
      valueInput.closest('div')?.parentElement?.parentElement || document.body;
    const editArrow =
      (fieldContainer.querySelector('.cursor-pointer') as HTMLElement) ||
      undefined;
    expect(editArrow).toBeTruthy();
    if (editArrow) {
      fireEvent.click(editArrow);
    }

    await waitFor(() => {
      expect(
        screen.getByText('leadDetailFields.fixedDriver')
      ).toBeInTheDocument();
    });
  });

  it('closes FixedDriverModal when clicking cancel (covers 431)', async () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 1,
        firstDriverFirstName: 'John',
        firstDriverLastName: 'Doe',
        firstDriverDOB: '2000-01-01',
      },
    };
    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            firstDriverName: 'John Doe',
            firstDriverDOB: '2000-01-01',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    // Open modal via edit arrow
    const valueInput = screen.getByDisplayValue('John Doe');
    const fieldContainer =
      valueInput.closest('div')?.parentElement?.parentElement || document.body;
    const editArrow =
      (fieldContainer.querySelector('.cursor-pointer') as HTMLElement) ||
      undefined;
    expect(editArrow).toBeTruthy();
    if (editArrow) {
      fireEvent.click(editArrow);
    }

    // Modal appears
    const modal = await screen.findByTestId('fixed-driver-modal');
    expect(modal).toBeInTheDocument();

    // Click cancel button inside modal to trigger handleCloseModal
    const cancelBtn = screen.getByTestId('fixed-driver-modal-cancel');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('fixed-driver-modal')).toBeNull();
    });
  });

  it('updates numberOfFixedDriver when leadData changes (covers 136-138)', () => {
    // Initial lead data with 0 fixed drivers
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 0,
      },
    };

    const store = createMockStore({
      order: {
        payload: { name: 'orders/1', data: {} },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    const { rerender } = render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    // Initially shows 0
    expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument();

    // Change leadData to 2 fixed drivers and re-render to trigger useEffect([leadData])
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 2,
      },
    };

    act(() => {
      rerender(
        <StyledThemeProvider theme={theme}>
          <MuiThemeProvider theme={theme}>
            <Provider store={store}>
              <VehiclePolicySection readOnly={false} />
            </Provider>
          </MuiThemeProvider>
        </StyledThemeProvider>
      );
    });
  });

  it('renders RenderDOB for second driver when editable (covers 369)', async () => {
    // Ensure second driver section is shown
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 2,
      },
    };

    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            secondDriverName: 'Jane Doe',
            secondDriverDOB: '2000-01-01',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    // Asserts second driver section is rendered (block gated by line 369 condition)
    expect(
      screen.getByText('leadDetailFields.secondDriverName')
    ).toBeInTheDocument();
    expect(
      screen.getByText('leadDetailFields.secondDriverDOB')
    ).toBeInTheDocument();
  });

  it('renders second driver name value (covers 376) and opens modal on edit (covers 382)', async () => {
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 2,
        secondDriverFirstName: 'Jane',
        secondDriverLastName: 'Doe',
      },
    };

    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            secondDriverName: 'Jane Doe',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    // Asserts combined name valueText renders (line 376)
    const nameInput = screen.getByDisplayValue('Jane Doe');
    expect(nameInput).toBeInTheDocument();

    // Click the edit arrow for second driver name to open modal (line 382)
    const container = nameInput.closest('[data-testid="text-input-field"]');
    const editArrow = container?.querySelector(
      '.cursor-pointer'
    ) as HTMLElement | null;
    if (editArrow) {
      fireEvent.click(editArrow);
    }

    await waitFor(() => {
      expect(
        screen.getByText('leadDetailFields.fixedDriver')
      ).toBeInTheDocument();
    });
  });
});

describe('VehiclePolicySection - feature flag controlled editability', () => {
  beforeEach(() => {
    mockFlagEnabled = true;
  });

  it('disables No. of fixed driver Select when feature flag is disabled', () => {
    mockFlagEnabled = false;
    mockLeadData = {
      name: 'leads/1',
      data: { numberOfFixedDriver: 0 },
    };

    const store = createMockStore({
      order: {
        payload: { name: 'orders/1', data: {} },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const selectTrigger = screen.getByRole('button', { name: '0' });
    expect(selectTrigger).toHaveAttribute('aria-disabled', 'true');
  });

  it('enables No. of fixed driver Select when feature flag is enabled and readOnly is false', () => {
    mockFlagEnabled = true;
    mockLeadData = {
      name: 'leads/1',
      data: { numberOfFixedDriver: 0 },
    };

    const store = createMockStore({
      order: {
        payload: { name: 'orders/1', data: {} },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const selectTrigger = screen.getByRole('button', { name: '0' });
    expect(selectTrigger).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('hides edit arrow when feature flag is disabled (even if not readOnly)', () => {
    mockFlagEnabled = false;
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 1,
        firstDriverFirstName: 'John',
        firstDriverLastName: 'Doe',
      },
    };

    const store = createMockStore({
      order: {
        payload: {
          name: 'orders/1',
          data: {
            firstDriverName: 'John Doe',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    });
    const theme = (themes as any)[0];
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const valueInput = screen.getByDisplayValue('John Doe');
    const fieldContainer =
      valueInput.closest('div')?.parentElement?.parentElement || document.body;
    const editArrow = fieldContainer.querySelector(
      '.cursor-pointer'
    ) as HTMLElement | null;
    expect(editArrow).toBeNull();
  });

  it('shows edit arrow when feature flag is enabled and policy allows edit', () => {
    mockFlagEnabled = true;
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 1,
        firstDriverFirstName: 'John',
        firstDriverLastName: 'Doe',
      },
    };

    const baseState = {
      order: {
        payload: {
          name: 'orders/1',
          data: {
            firstDriverName: 'John Doe',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    };

    const theme = (themes as any)[0];

    jest.mocked(useGetOrderPolicyItemsQuery).mockReturnValue({
      data: [
        {
          approvalStatus: 'ITEM_APPROVAL_STATUS_PENDING',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_DRAFT',
        },
      ],
      isLoading: false,
      isFetching: false,
      isSuccess: true,
    });

    const store = createMockStore(baseState);
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const valueInput = screen.getByDisplayValue('John Doe');
    const fieldContainer =
      valueInput.closest('div')?.parentElement?.parentElement || document.body;
    const editArrow = fieldContainer.querySelector('.cursor-pointer');
    expect(editArrow).toBeTruthy();
  });

  it('hides edit arrow when policy items are unavailable (read-only)', () => {
    mockVehicleUpdateWithinOrderEnabled = true;
    mockFlagEnabled = true;
    mockLeadData = {
      name: 'leads/1',
      data: {
        numberOfFixedDriver: 1,
        firstDriverFirstName: 'John',
        firstDriverLastName: 'Doe',
      },
    };

    const baseState = {
      order: {
        payload: {
          name: 'orders/1',
          data: {
            firstDriverName: 'John Doe',
          },
        },
        isFetching: false,
      },
      carDetailReducer: { data: { displayName: 'Car X' } },
      provinceDetailReducer: { data: {} },
    };

    const theme = (themes as any)[0];

    jest.mocked(useGetOrderPolicyItemsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isSuccess: false,
    });

    const store = createMockStore(baseState);
    render(
      <StyledThemeProvider theme={theme}>
        <MuiThemeProvider theme={theme}>
          <Provider store={store}>
            <VehiclePolicySection readOnly={false} />
          </Provider>
        </MuiThemeProvider>
      </StyledThemeProvider>
    );

    const valueInput = screen.getByDisplayValue('John Doe');
    const fieldContainer =
      valueInput.closest('div')?.parentElement?.parentElement || document.body;
    const editArrow = fieldContainer.querySelector('.cursor-pointer');
    expect(editArrow).toBeNull();
  });
});
