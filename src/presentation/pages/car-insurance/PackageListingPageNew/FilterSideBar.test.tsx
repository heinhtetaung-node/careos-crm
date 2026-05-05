import React from 'react';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import FilterSideBar from './FilterSideBar';
import * as leadSlice from 'data/slices/leadSlice';
import useGetInitialPackageValues from './hooks/useGetInitialPackageValues';
import useTransformedPackages from './hooks/useTransformedPackages';

jest.mock('data/slices/leadSlice', () => ({
  useGetLeadByIDQuery: jest.fn().mockReturnValue({
    data: { humanId: 'L123', data: {} },
    isLoading: false,
  }),
}));

jest.mock('shared/helper/utilities', () => ({
  getLeadIdFromPath: jest.fn().mockReturnValue('test-lead-id'),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ id: 'test-id' }),
  useNavigate: jest.fn().mockReturnValue(jest.fn()),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn().mockImplementation((key) => key),
}));

jest.mock('@careos/utils', () => ({
  getAgeByBirthday: jest.fn().mockReturnValue(25),
}));

jest.mock('./hooks/useGetInitialPackageValues', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    sumInsuredMinMax: { min: 100000, max: 1000000 },
    provinces: [],
    years: [],
    models: [],
    subModels: [],
    brands: [],
    carInfo: {},
    noOfDoors: [],
    engineSizes: [],
    lead: {},
    isLoading: false,
  }),
}));

jest.mock('./hooks/useTransformedPackages', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({
    rawPackages: [],
    status: { isLoading: false },
  }),
}));

jest.mock('./PackageFilter/packageFilter.helper', () => ({
  getDefaultValues: jest.fn().mockReturnValue({
    defaultValues: {
      brand: 'test-brand',
      year: 2023,
      model: 'test-model',
      carSubModelYear: 'test-submodel',
      noOfDoors: 4,
      engineSize: 2000,
      province: 'test-province',
      insuranceType: {},
      insurer: {},
      repairType: {},
      deductible: {},
      price: { min: 0, max: 100000 },
      sumInsured: { min: 0, max: 1000000 },
      sortBy: 'default',
      orderBy: 'asc',
    },
  }),
  getFilterConfig: jest.fn().mockReturnValue({
    config: {
      sort: { title: 'Sort', tooltip: 'Sort tooltip', values: [] },
      order: { title: 'Order', tooltip: 'Order tooltip', values: [] },
      insuranceType: {
        title: 'Insurance Type',
        tooltip: 'Insurance tooltip',
        values: [],
      },
      insurer: { title: 'Insurer', tooltip: 'Insurer tooltip', values: [] },
      repairType: {
        title: 'Repair Type',
        tooltip: 'Repair tooltip',
        values: [],
      },
      sumInsured: {
        title: 'Sum Insured',
        tooltip: 'Sum insured tooltip',
        config: { min: 0, max: 1000000, step: 1000 },
      },
      price: {
        title: 'Price',
        tooltip: 'Price tooltip',
        config: { min: 0, max: 100000, step: 1000 },
      },
      deductible: {
        title: 'Deductible',
        tooltip: 'Deductible tooltip',
        values: [],
      },
      // CarFilterOptions specific properties
      brand: {
        title: 'Brand',
        tooltip: 'Brand tooltip',
        options: [],
      },
      model: {
        title: 'Model',
        tooltip: 'Model tooltip',
        options: [],
      },
      year: {
        title: 'Year',
        tooltip: 'Year tooltip',
        options: [],
      },
      subModel: {
        title: 'Sub Model',
        tooltip: 'Sub model tooltip',
        options: [],
      },
      oic: {
        title: 'OIC',
        tooltip: 'OIC tooltip',
        options: [],
      },
      province: {
        title: 'Province',
        tooltip: 'Province tooltip',
        options: [],
      },
      drivingPurpose: {
        title: 'Driving Purpose',
        tooltip: 'Driving purpose tooltip',
        options: [],
      },
      dashCam: {
        title: 'Dash Cam',
        tooltip: 'Dash cam tooltip',
        options: [],
      },
      accessory: {
        title: 'Accessory',
        tooltip: 'Accessory tooltip',
        options: [],
      },
      modification: {
        title: 'Modification',
        tooltip: 'Modification tooltip',
        options: [],
      },
      // LeadFilterOptions specific properties
      redPlate: {
        title: 'Red Plate',
        tooltip: 'Red plate tooltip',
        options: [],
      },
      carLicensePlate: {
        title: 'Car License Plate',
        tooltip: 'Car license plate tooltip',
        options: [],
      },
      chassisNumber: {
        title: 'Chassis Number',
        tooltip: 'Chassis number tooltip',
        options: [],
      },
      vehicleIdNumber: {
        title: 'Vehicle ID Number',
        tooltip: 'Vehicle ID number tooltip',
        options: [],
      },
      carColor: {
        title: 'Car Color',
        tooltip: 'Car color tooltip',
        options: [],
      },
      currentInsurer: {
        title: 'Current Insurer',
        tooltip: 'Current insurer tooltip',
        options: [],
      },
      deliveryOption: {
        title: 'Delivery Option',
        tooltip: 'Delivery option tooltip',
        options: [],
      },
      volunPolicyStartDate: {
        title: 'Volun. Policy Start Date',
        tooltip: 'Volun policy start date tooltip',
      },
      compPolicyStartDate: {
        title: 'Comp. Policy Start Date',
        tooltip: 'Comp policy start date tooltip',
      },
      customerFirstName: {
        title: 'Customer First Name',
        tooltip: 'Customer first name tooltip',
      },
      customerLastName: {
        title: 'Customer Last Name',
        tooltip: 'Customer last name tooltip',
      },
      customerGender: {
        title: 'Customer Gender',
        tooltip: 'Customer gender tooltip',
        options: [],
      },
      customerDOB: {
        title: 'Customer DOB',
        tooltip: 'Customer DOB tooltip',
      },
      customerAge: {
        title: 'Customer Age',
        tooltip: 'Customer age tooltip',
        options: [],
      },
      customerLanguage: {
        title: 'Customer Language',
        tooltip: 'Customer language tooltip',
        options: [],
      },
      policyTitle: {
        title: 'Policy Title',
        tooltip: 'Policy title tooltip',
        options: [],
      },
      policyHolderFirstName: {
        title: 'Policy Holder First Name',
        tooltip: 'Policy holder first name tooltip',
      },
      policyHolderLastName: {
        title: 'Policy Holder Last Name',
        tooltip: 'Policy holder last name tooltip',
      },
      policyHolderNationalId: {
        title: 'Policy Holder National ID',
        tooltip: 'Policy holder national ID tooltip',
      },
      policyHolderDob: {
        title: 'Policy Holder DOB',
        tooltip: 'Policy holder DOB tooltip',
      },
      numberOfFixedDriver: {
        title: 'Number of Fixed Driver',
        tooltip: 'Number of fixed driver tooltip',
        options: [],
      },
      policyHolderAge: {
        title: 'Policy Holder Age',
        tooltip: 'Policy holder age tooltip',
      },
    },
  }),
}));

// Mock the components that are actually being used
jest.mock('presentation/components/common/CarFilterOptions', () => ({
  __esModule: true,
  CarFilterOptions: jest
    .fn()
    .mockReturnValue(
      React.createElement(
        'div',
        { 'data-testid': 'car-filter-options' },
        'Car Filter Options Component'
      )
    ),
}));

jest.mock(
  'presentation/components/common/LeadFilterOptions/LeadFilterOptions',
  () => ({
    __esModule: true,
    default: jest
      .fn()
      .mockImplementation(({ setCurrentData, setCurrentMultipleData }) =>
        React.createElement('div', { 'data-testid': 'lead-filter' }, [
          React.createElement(
            'div',
            { 'data-testid': 'lead-filter-options', key: 'options' },
            'Lead Filter Options Component'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              'data-testid': 'set-current-data',
              onClick: () => setCurrentData('key', 'value'),
              key: 'set-data',
            },
            'Set Current Data'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              'data-testid': 'set-current-multi-data',
              onClick: () =>
                setCurrentMultipleData({ key1: 'value1', key2: 'value2' }),
              key: 'set-multi-data',
            },
            'Set Current Multi Data'
          ),
        ])
      ),
  })
);

jest.mock('./FilterSideBarSkeleton', () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockReturnValue(
      React.createElement(
        'div',
        { 'data-testid': 'filter-sidebar-skeleton' },
        'Filter Sidebar Skeleton'
      )
    ),
}));

describe('FilterSideBar', () => {
  const mockFilter = {
    values: {
      brand: 'test-brand',
      year: 2023,
      model: 'test-model',
      carSubModelYear: 'test-submodel',
      noOfDoors: 4,
      engineSize: 2000,
      province: 'test-province',
      insuranceType: {},
      insurer: {},
      repairType: {},
      deductible: {},
      price: { min: 0, max: 100000 },
      sumInsured: { min: 0, max: 1000000 },
      sortBy: 'default',
      orderBy: 'asc',
    },
    setValues: jest.fn(),
  };

  const mockCurrentData = {
    brand: 'test-brand',
    year: 2023,
    model: 'test-model',
  };

  const mockSetCurrentData = jest.fn();
  const mockSetInitialCar = jest.fn();
  const mockRawPackages = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders CarFilterOptions and LeadFilterOptions components', () => {
    render(
      React.createElement(FilterSideBar, {
        filter: mockFilter,
        currentData: mockCurrentData,
        setCurrentData: mockSetCurrentData,
        rawPackages: mockRawPackages,
        setInitialCar: mockSetInitialCar,
      })
    );
    expect(screen.getByTestId('car-filter-options')).toBeInTheDocument();
    expect(screen.getByTestId('lead-filter-options')).toBeInTheDocument();
  });

  it('shows skeleton loading when data is loading', () => {
    // Mock loading state
    jest.mocked(useGetInitialPackageValues).mockReturnValue({
      sumInsuredMinMax: { min: 100000, max: 1000000 } as any,
      provinces: [],
      years: [],
      models: [],
      subModels: [],
      brands: [],
      carInfo: {},
      noOfDoors: [],
      engineSizes: [],
      lead: {},
      isLoading: true,
      updateCarGeneral: jest.fn(),
      refetchLead: jest.fn(),
    });

    render(
      <FilterSideBar
        filter={mockFilter}
        currentData={mockCurrentData}
        setCurrentData={mockSetCurrentData}
        rawPackages={mockRawPackages}
        setInitialCar={mockSetInitialCar}
      />
    );
    expect(screen.getByTestId('filter-sidebar-skeleton')).toBeInTheDocument();
  });

  it('renders without crashing', async () => {
    // Ensure all loading states are false
    jest.mocked(leadSlice.useGetLeadByIDQuery).mockReturnValue({
      data: { humanId: 'L123', data: {} },
      isLoading: false,
      refetch: jest.fn(),
    });

    jest.mocked(useGetInitialPackageValues).mockReturnValue({
      sumInsuredMinMax: { min: 100000, max: 1000000 } as any,
      provinces: [],
      years: [],
      models: [],
      subModels: [],
      brands: [],
      carInfo: {},
      noOfDoors: [],
      engineSizes: [],
      lead: {
        data: {
          voluntaryInsuranceType: [
            'voluntary_insurance_type_1',
            'voluntary_insurance_type_2',
          ],
          carUsageType: 'personal',
          carDashCam: true,
          carModified: true,
        },
      } as any,
      isLoading: false,
      updateCarGeneral: jest.fn(),
    });

    jest.mocked(useTransformedPackages).mockReturnValue({
      normalPackages: [],
      customPackages: [],
      manualRenewalImportPackages: [],
      rawPackages: [],
      carDetails: {},
      status: { isLoading: false, isFetching: false },
    });

    render(
      <FilterSideBar
        filter={mockFilter}
        currentData={mockCurrentData}
        setCurrentData={mockSetCurrentData}
        rawPackages={mockRawPackages}
        setInitialCar={mockSetInitialCar}
      />
    );
    expect(screen.getByTestId('car-filter-options')).toBeInTheDocument();
    expect(screen.getByTestId('lead-filter-options')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('car-filter-options')).toBeInTheDocument();
    });
  });

  it('hydrates lead car data when current data only has partial filter state', async () => {
    render(
      <FilterSideBar
        filter={mockFilter}
        currentData={{ insuranceKind: 'both' }}
        setCurrentData={mockSetCurrentData}
        rawPackages={mockRawPackages}
        setInitialCar={mockSetInitialCar}
      />
    );

    await waitFor(() => {
      expect(mockFilter.setValues).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: 'test-brand',
          model: 'test-model',
          year: 2023,
        })
      );
      expect(mockSetCurrentData).toHaveBeenCalledWith(expect.any(Function));
    });

    const updateFunction = mockSetCurrentData.mock.calls.find(
      ([argument]) => typeof argument === 'function'
    )?.[0];

    expect(updateFunction({ insuranceKind: 'both' })).toEqual(
      expect.objectContaining({
        insuranceKind: 'both',
        brand: 'test-brand',
        model: 'test-model',
        year: 2023,
      })
    );
  });

  it('does not hydrate lead car data again after the initial pass', async () => {
    const { rerender } = render(
      <FilterSideBar
        filter={mockFilter}
        currentData={{ insuranceKind: 'both' }}
        setCurrentData={mockSetCurrentData}
        rawPackages={mockRawPackages}
        setInitialCar={mockSetInitialCar}
      />
    );

    await waitFor(() => {
      expect(mockFilter.setValues).toHaveBeenCalledTimes(1);
    });

    rerender(
      <FilterSideBar
        filter={mockFilter}
        currentData={{
          insuranceKind: 'both',
          year: 2024,
          brand: '',
          model: '',
        }}
        setCurrentData={mockSetCurrentData}
        rawPackages={mockRawPackages}
        setInitialCar={mockSetInitialCar}
      />
    );

    expect(mockFilter.setValues).toHaveBeenCalledTimes(1);
  });

  it('handles text setting when data is available', () => {
    const mockBrands = [
      { value: 'honda', label: 'Honda', title: 'Honda Motor Co.' },
    ];
    const mockModels = [
      { value: 'civic', label: 'Civic', title: 'Honda Civic' },
    ];
    const mockCarInfo = { brand: 'honda', model: 'civic' };
    const mockCurrentDataWithBrand = {
      ...mockCurrentData,
      brand: 'honda',
      model: 'civic',
    };

    jest.mocked(useGetInitialPackageValues).mockReturnValue({
      sumInsuredMinMax: { min: 100000, max: 1000000 } as any,
      provinces: [],
      years: [],
      models: mockModels,
      subModels: [],
      brands: mockBrands,
      carInfo: mockCarInfo,
      noOfDoors: [],
      engineSizes: [],
      lead: {},
      isLoading: false,
      updateCarGeneral: jest.fn(),
      refetchLead: jest.fn(),
    });

    render(
      <FilterSideBar
        filter={mockFilter}
        currentData={mockCurrentDataWithBrand}
        setCurrentData={mockSetCurrentData}
        rawPackages={mockRawPackages}
        setInitialCar={mockSetInitialCar}
      />
    );
    expect(mockSetCurrentData).toHaveBeenCalledWith(expect.any(Function));
    const updateFunction = mockSetCurrentData.mock.calls[0][0];
    const result = updateFunction({ brand: 'honda' });
    expect(result).toEqual(
      expect.objectContaining({ brandText: 'Honda Motor Co.' })
    );
  });
});
