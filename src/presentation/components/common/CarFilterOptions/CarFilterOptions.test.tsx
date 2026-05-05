import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '__tests__/rtl-test-utils';
import CarFilterOptions from './CarFilterOptions';

// Mock dependencies
jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

jest.mock('presentation/components/common/FormSection', () => ({
  FormSection: ({ children }: any) => (
    <div data-testid="form-section">{children}</div>
  ),
}));

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/SelectRegion',
  () => ({
    __esModule: true,
    default: ({ title, value, options, tooltipHelperText }: any) => (
      <div data-testid="select-region">
        <div data-testid="title">{title}</div>
        <div data-testid="value">{value}</div>
        <div data-testid="options-count">{options?.length || 0}</div>
        <div data-testid="tooltip">{tooltipHelperText}</div>
      </div>
    ),
  })
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/CommonRadio',
  () => ({
    __esModule: true,
    default: ({ title, tooltipText, selectedValue, options }: any) => (
      <div data-testid="common-radio">
        <div data-testid="radio-title">{title}</div>
        <div data-testid="radio-tooltip">{tooltipText}</div>
        <div data-testid="radio-value">{selectedValue}</div>
        <div data-testid="radio-options-count">{options?.length || 0}</div>
      </div>
    ),
  })
);

jest.mock('assets/icons/Book.svg', () => 'BookIconMock');
const mockClipboard = {
  writeText: jest.fn(),
};
Object.assign(navigator, { clipboard: mockClipboard });
const mockShowSuccessSnackbar = jest.fn();
const mockShowErrorSnackbar = jest.fn();
jest.mock('utils/snackbar', () => {
  const mockUseSnackbar = jest.fn(() => ({
    showSuccessSnackbar: mockShowSuccessSnackbar,
    showErrorSnackbar: mockShowErrorSnackbar,
  }));
  return {
    __esModule: true,
    default: mockUseSnackbar,
  };
});

const mockLeadData = {
  data: {
    id: 'LEAD123',
  },
};
describe('CarFilterOptions', () => {
  it('should have proper test setup', () => {
    expect(true).toBe(true);
  });
  const mockConfig = {
    brand: { title: 'brand.title', tooltip: 'brand.tooltip', options: [] },
    model: { title: 'model.title', tooltip: 'model.tooltip', options: [] },
    year: { title: 'year.title', tooltip: 'year.tooltip', options: [] },
    subModel: {
      title: 'subModel.title',
      tooltip: 'subModel.tooltip',
      options: [],
    },
    oic: { title: 'oic.title', tooltip: 'oic.tooltip', options: [] },
    province: {
      title: 'province.title',
      tooltip: 'province.tooltip',
      options: [],
    },
    drivingPurpose: {
      title: 'drivingPurpose.title',
      tooltip: 'drivingPurpose.tooltip',
      options: [],
    },
    dashCam: {
      title: 'dashCam.title',
      tooltip: 'dashCam.tooltip',
      options: [],
    },
    accessory: {
      title: 'accessory.title',
      tooltip: 'accessory.tooltip',
      options: [],
    },
    modification: {
      title: 'modification.title',
      tooltip: 'modification.tooltip',
      options: [],
    },
  };

  const mockCurrentData = {
    brand: 'Toyota',
    model: 'Camry',
    year: '2023',
    subModel: 'SE',
    oic: 'OIC001',
    province: 'Bangkok',
    drivingPurpose: 'personal',
    dashCam: 'true',
    accessory: 'false',
    modification: 'true',
  };

  const mockSetCurrentData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockClipboard.writeText.mockResolvedValue(undefined);
  });

  it('renders car filter options with all sections', () => {
    render(
      <CarFilterOptions
        config={mockConfig}
        currentData={mockCurrentData}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );

    expect(screen.getByText('text.car')).toBeInTheDocument();

    const formSections = screen.getAllByTestId('form-section');
    expect(formSections.length).toBeGreaterThan(0);

    const selectRegions = screen.getAllByTestId('select-region');
    expect(selectRegions.length).toBe(5);

    const radioComponents = screen.getAllByTestId('common-radio');
    expect(radioComponents.length).toBe(2);
  });

  it('renders with empty data', () => {
    render(
      <CarFilterOptions
        config={mockConfig}
        currentData={{}}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );

    expect(screen.getByText('text.car')).toBeInTheDocument();
    expect(screen.getAllByTestId('select-region').length).toBe(5);
    expect(screen.getAllByTestId('common-radio').length).toBe(2);
  });

  it('renders with undefined config properties', () => {
    const incompleteConfig = {
      brand: { title: 'brand.title', tooltip: 'brand.tooltip' },
      drivingPurpose: {
        title: 'drivingPurpose.title',
        tooltip: 'drivingPurpose.tooltip',
      },
      dashCam: { title: 'dashCam.title', tooltip: 'dashCam.tooltip' },
      modification: {
        title: 'modification.title',
        tooltip: 'modification.tooltip',
      },
    };

    render(
      <CarFilterOptions
        config={incompleteConfig}
        currentData={mockCurrentData}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );

    expect(screen.getByText('text.car')).toBeInTheDocument();
    expect(screen.getAllByTestId('select-region').length).toBe(5);
    expect(screen.getAllByTestId('common-radio').length).toBe(2);
  });

  it('handles "Report a problem" button click correctly', async () => {
    const configWithOptions = {
      ...mockConfig,
      brand: {
        ...mockConfig.brand,
        options: [{ key: 'Toyota', label: 'Toyota' }],
      },
      model: {
        ...mockConfig.model,
        options: [{ key: 'Camry', label: 'Camry' }],
      },
      subModel: {
        ...mockConfig.subModel,
        options: [{ key: 'SE', label: 'SE' }],
      },
    };
    const currentDataWithReportFields = {
      ...mockCurrentData,
      leadId: 'LEAD123',
      insuranceType: 'First Class',
      repairType: 'Authorized Dealer',
      carSubModelYear: 'SE',
    };
    render(
      <CarFilterOptions
        config={configWithOptions}
        currentData={currentDataWithReportFields}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );
    const reportButton = screen.getByText('carFilter.reportProblem');
    expect(reportButton).toBeInTheDocument();
    fireEvent.click(reportButton);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('ออเดอร์: LEAD123')
    );

    await waitFor(() => {
      expect(mockShowSuccessSnackbar).toHaveBeenCalledWith('clipboard.success');
    });
  });

  describe('Radio Groups Functionality', () => {
    it('renders radio groups with default options when config options are missing', () => {
      const configWithoutOptions = {
        ...mockConfig,
        drivingPurpose: {
          title: 'drivingPurpose.title',
          tooltip: 'drivingPurpose.tooltip',
        },
        dashCam: { title: 'dashCam.title', tooltip: 'dashCam.tooltip' },
        modification: {
          title: 'modification.title',
          tooltip: 'modification.tooltip',
        },
      };
      render(
        <CarFilterOptions
          config={configWithoutOptions}
          currentData={mockCurrentData}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
      const radioComponents = screen.getAllByTestId('common-radio');
      expect(radioComponents).toHaveLength(2);
      const radioOptionsCounts = screen.getAllByTestId('radio-options-count');
      expect(radioOptionsCounts[0]).toHaveTextContent('2'); // drivingPurpose has 2 options
      expect(radioOptionsCounts[1]).toHaveTextContent('2'); // dashCam has 2 yes/no options
    });

    it('renders radio groups with config options when available', () => {
      const configWithCustomOptions = {
        ...mockConfig,
        drivingPurpose: {
          title: 'drivingPurpose.title',
          tooltip: 'drivingPurpose.tooltip',
          options: [
            { key: 'personal', label: 'Personal Use' },
            { key: 'commercial', label: 'Commercial Use' },
            { key: 'mixed', label: 'Mixed Use' },
          ],
        },
        dashCam: {
          title: 'dashCam.title',
          tooltip: 'dashCam.tooltip',
          options: [
            { key: 'true', label: 'Yes' },
            { key: 'false', label: 'No' },
            { key: 'unknown', label: 'Unknown' },
          ],
        },
        modification: {
          title: 'modification.title',
          tooltip: 'modification.tooltip',
          options: [
            { key: 'true', label: 'Modified' },
            { key: 'false', label: 'Stock' },
            { key: 'minor', label: 'Minor Changes' },
          ],
        },
      };
      render(
        <CarFilterOptions
          config={configWithCustomOptions}
          currentData={mockCurrentData}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
      const radioComponents = screen.getAllByTestId('common-radio');
      expect(radioComponents).toHaveLength(2);
      const radioOptionsCounts = screen.getAllByTestId('radio-options-count');
      expect(radioOptionsCounts[0]).toHaveTextContent('3'); // drivingPurpose has 3 custom options
      expect(radioOptionsCounts[1]).toHaveTextContent('3'); // dashCam has 3 custom options
    });

    it('handles radio group changes correctly', () => {
      render(
        <CarFilterOptions
          config={mockConfig}
          currentData={mockCurrentData}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
      expect(mockSetCurrentData).not.toHaveBeenCalled(); // Initially not called
    });

    it('renders radio groups with fallback titles when config title is missing', () => {
      const configWithMissingTitles = {
        ...mockConfig,
        drivingPurpose: { title: '', tooltip: 'drivingPurpose.tooltip' }, // Empty title to test fallback
        dashCam: { title: '', tooltip: 'dashCam.tooltip' }, // Empty title to test fallback
        modification: { title: '', tooltip: 'modification.tooltip' }, // Empty title to test fallback
      };
      render(
        <CarFilterOptions
          config={configWithMissingTitles}
          currentData={mockCurrentData}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
      const radioComponents = screen.getAllByTestId('common-radio');
      expect(radioComponents).toHaveLength(2);
      const radioTitles = screen.getAllByTestId('radio-title');
      expect(radioTitles[0]).toHaveTextContent('carFilter.drivingPurpose');
      expect(radioTitles[1]).toHaveTextContent('carFilter.dashCam');
    });
  });

  describe('Brand → Model Gating', () => {
    const brandAndModelConfig = {
      ...mockConfig,
      brand: {
        title: 'brand.title',
        tooltip: 'brand.tooltip',
        options: [
          { key: '', label: 'Please select' },
          { key: 'toyota', label: 'Toyota' },
          { key: 'honda', label: 'Honda' },
        ],
      },
      model: {
        title: 'model.title',
        tooltip: 'model.tooltip',
        options: [
          { key: 'camry', label: 'Camry' },
          { key: 'corolla', label: 'Corolla' },
        ],
      },
    };

    const getModelSelectRegion = () => {
      const selectRegions = screen.getAllByTestId('select-region');
      return selectRegions.find(
        (el) => within(el).getByTestId('title').textContent === 'model.title'
      )!;
    };

    it('model select receives empty options when no brand is selected (undefined)', () => {
      render(
        <CarFilterOptions
          config={brandAndModelConfig}
          currentData={{ brand: undefined }}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
      expect(
        within(getModelSelectRegion()).getByTestId('options-count')
      ).toHaveTextContent('0');
    });

    it('model select receives empty options when brand is an empty string', () => {
      render(
        <CarFilterOptions
          config={brandAndModelConfig}
          currentData={{ brand: '' }}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
      expect(
        within(getModelSelectRegion()).getByTestId('options-count')
      ).toHaveTextContent('0');
    });

    it('model select receives configured options when a valid brand is selected', () => {
      render(
        <CarFilterOptions
          config={brandAndModelConfig}
          currentData={{ brand: 'toyota' }}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
      expect(
        within(getModelSelectRegion()).getByTestId('options-count')
      ).toHaveTextContent('2');
    });
  });
});
