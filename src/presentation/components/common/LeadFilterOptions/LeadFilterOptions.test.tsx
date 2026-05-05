import React from 'react';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import LeadFilterOptions from './LeadFilterOptions';
import {
  currentDataMock,
  leadFilterConfigMock,
} from 'mock-data/leadFilterConfigMock';
import userEvent from '@testing-library/user-event';

const mockShowSuccessSnackbar = jest.fn();
const mockShowErrorSnackbar = jest.fn();

// Mock dependencies
jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
}));

jest.mock('utils/snackbar', () =>
  jest.fn(() => ({
    showSuccessSnackbar: mockShowSuccessSnackbar,
    showErrorSnackbar: mockShowErrorSnackbar,
  }))
);

jest.mock('presentation/components/common/FormSection', () => ({
  FormSection: ({ children }: { children: any }) => (
    <div data-testid="form-section">{children}</div>
  ),
}));

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/SelectRegion',
  () => ({
    __esModule: true,
    default: ({
      title,
      value,
      options,
      tooltipHelperText,
      onChange,
      ...rest
    }: any) => (
      <div data-testid="select-region">
        <div data-testid="title">{title}</div>
        <div data-testid="value">{value}</div>
        <div data-testid="options-count">{options?.length || 0}</div>
        <div data-testid="tooltip">{tooltipHelperText}</div>
        <select
          data-testid={rest['data-testid']}
          onChange={(e) => onChange(e.target.value)}
          value={value}
        >
          {options.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    ),
  })
);

jest.mock(
  'presentation/pages/car-insurance/PackageListingPageNew/PackageFilter/controls/CommonRadio',
  () => ({
    __esModule: true,
    default: ({
      title,
      tooltipText,
      selectedValue,
      options,
      setValue,
    }: any) => (
      <div data-testid="common-radio">
        <div data-testid="radio-title">{title}</div>
        <div data-testid="radio-tooltip">{tooltipText}</div>
        <div data-testid="radio-value">{selectedValue}</div>
        <div data-testid="radio-options-count">{options?.length || 0}</div>
        <button
          type="button"
          onClick={() => setValue('new-value')}
          data-testid={`radio-button-${title}`}
        >
          Radio
        </button>
      </div>
    ),
  })
);

jest.mock('presentation/components/controls/DatePickerWithThaiYear', () => ({
  __esModule: true,
  default: ({ value, placeholder, onChangeDate, name }: any) => (
    <div data-testid="date-picker">
      <div data-testid="date-value">
        {value} {name}
      </div>
      <div data-testid="date-placeholder">{placeholder}</div>
      <button
        type="button"
        data-testid="data-select-date"
        onClick={() => onChangeDate(new Date())}
      >
        Select Date
      </button>
    </div>
  ),
}));

jest.mock('presentation/components/controls/Autocomplete/Autocomplete', () => ({
  __esModule: true,
  default: ({
    options,
    onChange,
    'data-testid': dataTestId,
    multiple,
  }: any) => (
    <div data-testid="autocomplete">
      <select
        data-testid={`autocomplete-options-${dataTestId}`}
        onChange={(e: any) =>
          onChange({
            ...e,
            target: {
              ...e.target,
              value: multiple ? [e.target?.value] : e.target?.value,
            },
          })
        }
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

jest.mock(
  'presentation/components/CarInfoSection/EditableCarSection/LicensePlate',
  () => ({
    __esModule: true,
    default: ({
      name,
      title,
      value,
      handleUpdate,
      abbreviation,
      dataTestId,
      isReadOnly,
      isDisabled,
      hideLabel,
    }: any) => (
      <div data-testid="license-plate">
        <div data-testid="license-plate-name">{name}</div>
        <div data-testid="license-plate-title">{title}</div>
        <div data-testid="license-plate-value">
          {value?.carLicensePlate || ''}
        </div>
        <div data-testid="license-plate-abbreviation">{abbreviation}</div>
        <div data-testid="license-plate-test-id">{dataTestId}</div>
        <div data-testid="license-plate-readonly">{isReadOnly?.toString()}</div>
        <div data-testid="license-plate-disabled">{isDisabled?.toString()}</div>
        <div data-testid="license-plate-hide-label">
          {hideLabel?.toString()}
        </div>
        <button
          type="button"
          data-testid="license-plate-update-button"
          onClick={() => handleUpdate({ [name]: 'NEW_LICENSE_PLATE' })}
        >
          Update License Plate
        </button>
        <button
          type="button"
          data-testid="license-plate-update-undefined-button"
          onClick={() => handleUpdate({ [name]: undefined })}
        >
          Update with Undefined
        </button>
      </div>
    ),
  })
);

jest.mock('presentation/components/modal/FixedDriverModal', () => ({
  __esModule: true,
  default: ({ openModal, handleCloseModal }: any) => (
    <div data-testid="fixed-driver-modal">
      <div data-testid="modal-open">{openModal ? 'Open' : 'Closed'}</div>
      <button
        type="button"
        data-testid="modal-close-button"
        onClick={handleCloseModal}
      >
        Close
      </button>
    </div>
  ),
}));

jest.mock('presentation/components/common/StatusDialog', () => ({
  __esModule: true,
  default: ({
    isOpen,
    content,
    title,
    blueTitle,
    setIsOpen,
    actionButton,
  }: any) => (
    <div data-testid="mutation-response-dialog">
      {isOpen && (
        <div data-testid="dialog-content">
          <div data-testid="dialog-title">{title}</div>
          <div data-testid="dialog-blue-title">{blueTitle}</div>
          <div data-testid="dialog-content-text">{content}</div>
          <div data-testid="dialog-action-button">{actionButton}</div>
        </div>
      )}
    </div>
  ),
}));

// Mock the useLeadUpdater hook
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => ({
    __esModule: true,
    default: jest.fn(() => ({
      updateLead: jest.fn(),
      resetCheckout: jest.fn(),
      status: { status: 'fulfilled', fulfilledTimeStamp: Date.now() },
      jsonUpdater: jest.fn(),
    })),
  })
);

describe('LeadFilterOptions', () => {
  const expandLeadInfo = async () => {
    const expandButton = screen.getByTestId('lead-info-toggle');
    expandButton.click();
    await waitFor(() => {
      expect(
        screen.queryByText('leadFilter.vehicleDetails')
      ).toBeInTheDocument();
    });
  };
  const mockConfig = {
    redPlate: {
      title: 'redPlate.title',
      tooltip: 'redPlate.tooltip',
      options: [],
    },
    carLicensePlate: {
      title: 'carLicensePlate.title',
      tooltip: 'carLicensePlate.tooltip',
      options: [],
    },
    chassisNumber: {
      title: 'chassisNumber.title',
      tooltip: 'chassisNumber.tooltip',
      options: [],
    },
    vehicleIdNumber: {
      title: 'vehicleIdNumber.title',
      tooltip: 'vehicleIdNumber.tooltip',
      options: [],
    },
    carColor: {
      title: 'carColor.title',
      tooltip: 'carColor.tooltip',
      options: [],
    },
    currentInsurer: {
      title: 'currentInsurer.title',
      tooltip: 'currentInsurer.tooltip',
      options: [],
    },
    deliveryOption: {
      title: 'deliveryOption.title',
      tooltip: 'deliveryOption.tooltip',
      options: [],
    },
    volunPolicyStartDate: {
      title: 'volunPolicyStartDate.title',
      tooltip: 'volunPolicyStartDate.tooltip',
    },
    compPolicyStartDate: {
      title: 'compPolicyStartDate.title',
      tooltip: 'compPolicyStartDate.tooltip',
    },
    customerFirstName: {
      title: 'customerFirstName.title',
      tooltip: 'customerFirstName.tooltip',
    },
    customerLastName: {
      title: 'customerLastName.title',
      tooltip: 'customerLastName.tooltip',
    },
    customerGender: {
      title: 'customerGender.title',
      tooltip: 'customerGender.tooltip',
      options: [],
    },
    customerDOB: { title: 'customerDOB.title', tooltip: 'customerDOB.tooltip' },
    customerAge: {
      title: 'customerAge.title',
      tooltip: 'customerAge.tooltip',
      options: [],
    },
    customerLanguage: {
      title: 'customerLanguage.title',
      tooltip: 'customerLanguage.tooltip',
      options: [],
    },
    policyTitle: {
      title: 'policyTitle.title',
      tooltip: 'policyTitle.tooltip',
      options: [],
    },
    policyHolderFirstName: {
      title: 'policyHolderFirstName.title',
      tooltip: 'policyHolderFirstName.tooltip',
    },
    policyHolderLastName: {
      title: 'policyHolderLastName.title',
      tooltip: 'policyHolderLastName.tooltip',
    },
    policyHolderNationalId: {
      title: 'policyHolderNationalId.title',
      tooltip: 'policyHolderNationalId.tooltip',
    },
    policyHolderDob: {
      title: 'policyHolderDob.title',
      tooltip: 'policyHolderDob.tooltip',
    },
    numberOfFixedDriver: {
      title: 'numberOfFixedDriver.title',
      tooltip: 'numberOfFixedDriver.tooltip',
      options: [],
    },
    policyHolderAge: {
      title: 'policyHolderAge.title',
      tooltip: 'policyHolderAge.tooltip',
    },
  };
  const mockCurrentData = {
    redPlate: 'true',
    carLicensePlate: 'ABC123',
    chassisNumber: 'CHASSIS001',
    vehicleIdNumber: 'VID001',
    carColor: ['Red'], // Changed to array for multi-select
    currentInsurer: 'AXA',
    deliveryOption: 'Home',
    volunPolicyStartDate: '2024-01-01',
    compPolicyStartDate: '2024-01-01',
    customerFirstName: 'John',
    customerLastName: 'Doe',
    customerGender: 'male',
    customerDOB: '1990-01-01',
    customerAge: '34',
    customerLanguage: 'english',
    policyTitle: 'mr',
    policyHolderFirstName: 'John',
    policyHolderLastName: 'Doe',
    policyHolderNationalId: 'ID123456',
    policyHolderDob: '1990-01-01',
    numberOfFixedDriver: '2',
    policyHolderAge: '34',
  };
  const mockSetCurrentData = jest.fn();
  const mockLeadData = {
    data: {
      registeredProvince: 100000,
    },
  };
  beforeEach(() => {
    jest.clearAllMocks();
    mockShowSuccessSnackbar.mockClear();
    mockShowErrorSnackbar.mockClear();
  });
  it('renders lead filter options with all sections', async () => {
    render(
      <LeadFilterOptions
        config={mockConfig}
        currentData={mockCurrentData}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );
    expect(screen.getByText('leadFilter.leadInfo')).toBeInTheDocument();
    await expandLeadInfo();
    const formSections = screen.getAllByTestId('form-section');
    expect(formSections.length).toBeGreaterThan(0);

    // Check for select regions (dropdowns)
    const selectRegions = screen.getAllByTestId('select-region');
    expect(selectRegions.length).toBeGreaterThan(0);

    // Check for radio components
    const radioComponents = screen.getAllByTestId('common-radio');
    expect(radioComponents.length).toBeGreaterThan(0);

    // Check for text inputs (new design)
    const textInputs = screen.getAllByDisplayValue('John');
    expect(textInputs.length).toBeGreaterThan(0);

    // Check for date pickers
    const datePickers = screen.getAllByTestId('date-picker');
    expect(datePickers.length).toBeGreaterThan(0);
  });

  it('renders with empty data', async () => {
    render(
      <LeadFilterOptions
        config={mockConfig}
        currentData={{}}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );

    expect(screen.getByText('leadFilter.leadInfo')).toBeInTheDocument();
    await expandLeadInfo();
    expect(screen.getAllByTestId('form-section').length).toBeGreaterThan(0);
  });

  it('renders with undefined config properties', async () => {
    const incompleteConfig = {
      redPlate: { title: 'redPlate.title', tooltip: 'redPlate.tooltip' },
      // Missing other properties
    };

    render(
      <LeadFilterOptions
        config={incompleteConfig}
        currentData={mockCurrentData}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );

    expect(screen.getByText('leadFilter.leadInfo')).toBeInTheDocument();
    await expandLeadInfo();
    expect(screen.getAllByTestId('form-section').length).toBeGreaterThan(0);
  });

  it('handles license plate updates correctly', async () => {
    const configWithLicensePlate = {
      ...mockConfig,
      carLicensePlate: {
        title: 'carLicensePlate.title',
        tooltip: 'carLicensePlate.tooltip',
        options: [],
      },
    };

    const currentDataWithLicensePlate = {
      ...mockCurrentData,
      carLicensePlate: 'ABC123',
    };

    render(
      <LeadFilterOptions
        config={configWithLicensePlate}
        currentData={currentDataWithLicensePlate}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );
    await expandLeadInfo();
    const licensePlateComponent = screen.getByTestId('license-plate');
    expect(licensePlateComponent).toBeInTheDocument();

    // Check license plate props are passed correctly
    expect(screen.getByTestId('license-plate-name')).toHaveTextContent(
      'carLicensePlate'
    );
    expect(screen.getByTestId('license-plate-title')).toHaveTextContent(
      'carLicensePlate.title'
    );
    expect(screen.getByTestId('license-plate-value')).toHaveTextContent(
      'ABC123'
    );
    expect(screen.getByTestId('license-plate-abbreviation')).toHaveTextContent(
      'กท'
    );
    expect(screen.getByTestId('license-plate-test-id')).toHaveTextContent(
      'carLicensePlate-license-plate'
    );
    expect(screen.getByTestId('license-plate-readonly')).toHaveTextContent(
      'true'
    );
    expect(screen.getByTestId('license-plate-disabled')).toHaveTextContent(
      'true'
    );
    expect(screen.getByTestId('license-plate-hide-label')).toHaveTextContent(
      'true'
    );

    // Test handleUpdate callback with valid value (covers lines 205-207)
    const updateButton = screen.getByTestId('license-plate-update-button');
    updateButton.click();

    expect(mockSetCurrentData).toHaveBeenCalledWith(
      'carLicensePlate',
      'NEW_LICENSE_PLATE'
    );
  });

  it('handles license plate updates with undefined value', async () => {
    const configWithLicensePlate = {
      ...mockConfig,
      carLicensePlate: {
        title: 'carLicensePlate.title',
        tooltip: 'carLicensePlate.tooltip',
        options: [],
      },
    };

    const currentDataWithLicensePlate = {
      ...mockCurrentData,
      carLicensePlate: 'ABC123',
    };

    render(
      <LeadFilterOptions
        config={configWithLicensePlate}
        currentData={currentDataWithLicensePlate}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );
    await expandLeadInfo();
    const updateUndefinedButton = screen.getByTestId(
      'license-plate-update-undefined-button'
    );
    updateUndefinedButton.click();

    // Should not call setCurrentData when value is undefined
    expect(mockSetCurrentData).not.toHaveBeenCalledWith(
      'carLicensePlate',
      undefined
    );
  });

  it('handle Open Fixed Driver Modal', async () => {
    const configWithFixedDriver = {
      ...mockConfig,
      fixedDriver: {
        title: 'fixedDriver.title',
        tooltip: 'fixedDriver.tooltip',
        options: [],
      },
    };

    render(
      <LeadFilterOptions
        config={configWithFixedDriver}
        currentData={{ ...mockCurrentData, numberOfFixedDriver: 2 }}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );
    await expandLeadInfo();
    const closeModalButton = screen.getByTestId('modal-close-button');

    const fixedDriver1 = screen.getByTestId('fixed-driver-1');
    expect(fixedDriver1).toBeInTheDocument();
    fixedDriver1.click();
    expect(screen.getByTestId('modal-open')).toBeInTheDocument();
    closeModalButton.click();

    const openModalButton = screen.getByTestId('modal-open');
    openModalButton.click();

    expect(closeModalButton).toBeInTheDocument();
    closeModalButton.click();
    expect(openModalButton).toBeInTheDocument();
  });

  it('handle onchange with real config', async () => {
    render(
      <LeadFilterOptions
        config={leadFilterConfigMock}
        currentData={currentDataMock}
        setCurrentData={mockSetCurrentData}
        leadData={mockLeadData}
        setCurrentMultipleData={jest.fn()}
      />
    );
    await expandLeadInfo();
    const container = screen.getAllByTestId('input-chassisNumber')[0];
    const input = within(container).getByRole('textbox') as HTMLInputElement;
    userEvent.type(input, 'CHASSIS123');
    userEvent.selectOptions(
      screen.getByTestId('select-region-customerGender'),
      'text.female'
    );
    await waitFor(() => {
      expect(mockSetCurrentData).toHaveBeenCalled();
    });
    // select-region-numberOfFixedDriver
    userEvent.selectOptions(
      screen.getByTestId('select-region-numberOfFixedDriver'),
      '2'
    );
    await waitFor(() => {
      expect(mockSetCurrentData).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(mockSetCurrentData).toHaveBeenCalled();
    });
    screen.getAllByTestId('data-select-date')[0].click();
    await waitFor(() => {
      expect(mockSetCurrentData).toHaveBeenCalled();
    });
    screen.getByTestId('radio-button-leadFilter.redPlate').click();
    await waitFor(() => {
      expect(mockSetCurrentData).toHaveBeenCalled();
    });
    await userEvent.selectOptions(
      screen.getByTestId('autocomplete-options-autocomplete-carColor'),
      'darkBlue' // car color
    );
    await waitFor(() => {
      expect(mockSetCurrentData).toHaveBeenCalled();
    });
  });

  it('validates firstName and lastName fields correctly', async () => {
    const _mockConfig = {
      leadFilter: {
        firstName: 'First Name',
        lastName: 'Last Name',
        chassisNo: 'Chassis Number',
      },
    };

    const _mockCurrentData = {
      customerFirstName: '',
      customerLastName: '',
      policyHolderFirstName: '',
      policyHolderLastName: '',
      chassisNumber: '',
    };

    const _mockSetCurrentData = jest.fn();
    const mockSetCurrentMultipleData = jest.fn();
    const _mockLeadData = {
      name: 'test-lead',
      data: {
        registeredProvince: '10',
      },
    };

    render(
      <LeadFilterOptions
        config={_mockConfig}
        currentData={{
          ..._mockCurrentData,
          redPlate: 'false',
          carLicensePlate: '12',
        }}
        setCurrentData={_mockSetCurrentData}
        leadData={_mockLeadData}
        setCurrentMultipleData={mockSetCurrentMultipleData}
      />
    );
    await expandLeadInfo();
    const chassisContainer = screen.getAllByTestId('input-chassisNumber')[0];
    expect(chassisContainer).toBeInTheDocument();
    const chassisInputElement = within(chassisContainer).getByRole('textbox');
    expect(chassisInputElement).toBeInTheDocument();
  });

  describe('MutationResponseDialog', () => {
    it('opens dialog when policyHolderType is changed successfully', async () => {
      const mockUpdateLead = jest.fn().mockResolvedValue(true);
      const mockDispatch = jest.fn();

      // Mock the useLeadUpdater hook
      const mockLeadUpdater = jest.requireMock(
        'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater'
      ).default;
      mockLeadUpdater.mockReturnValue({
        updateLead: mockUpdateLead,
        resetCheckout: jest.fn(),
        status: { status: 'fulfilled', fulfilledTimeStamp: Date.now() },
        jsonUpdater: jest.fn(),
      });

      const configWithPolicyHolderType = {
        ...mockConfig,
        policyHolderType: {
          title: 'policyHolderType.title',
          tooltip: 'policyHolderType.tooltip',
          options: [
            { key: 'customer', label: 'Customer', value: 'customer' },
            { key: 'company', label: 'Company', value: 'company' },
          ],
        },
      };

      render(
        <LeadFilterOptions
          config={configWithPolicyHolderType}
          currentData={{
            ...mockCurrentData,
            policyHolderType: 'customer',
          }}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );

      await expandLeadInfo();

      // Find and click the policyHolderType field to change it
      const policyHolderTypeSelect = screen.getByTestId(
        'select-region-policyHolderType'
      );
      await userEvent.selectOptions(policyHolderTypeSelect, 'company');

      // Wait for the dialog to open
      await waitFor(() => {
        expect(
          screen.getByTestId('mutation-response-dialog')
        ).toBeInTheDocument();
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-title')).toHaveTextContent(
          'text.policyHolderInformation'
        );
        expect(screen.getByTestId('dialog-blue-title')).toHaveTextContent(
          'text.updatedInformation'
        );
        expect(screen.getByTestId('dialog-content-text')).toHaveTextContent(
          'text.policyHolderSwitchWarning'
        );
      });

      // Verify that updateLead was called
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/policyHolderType',
        'company'
      );
    });

    it('closes dialog when close button is clicked', async () => {
      const mockUpdateLead = jest.fn().mockResolvedValue(true);
      const mockDispatch = jest.fn();

      // Mock the useLeadUpdater hook
      const mockLeadUpdater = jest.requireMock(
        'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater'
      ).default;
      mockLeadUpdater.mockReturnValue({
        updateLead: mockUpdateLead,
        resetCheckout: jest.fn(),
        status: { status: 'fulfilled', fulfilledTimeStamp: Date.now() },
        jsonUpdater: jest.fn(),
      });

      const configWithPolicyHolderType = {
        ...mockConfig,
        policyHolderType: {
          title: 'policyHolderType.title',
          tooltip: 'policyHolderType.tooltip',
          options: [
            { key: 'customer', label: 'Customer', value: 'customer' },
            { key: 'company', label: 'Company', value: 'company' },
          ],
        },
      };

      render(
        <LeadFilterOptions
          config={configWithPolicyHolderType}
          currentData={{
            ...mockCurrentData,
            policyHolderType: 'customer',
          }}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );

      await expandLeadInfo();

      // Change policyHolderType to trigger dialog
      const policyHolderTypeSelect = screen.getByTestId(
        'select-region-policyHolderType'
      );
      await userEvent.selectOptions(policyHolderTypeSelect, 'company');

      // Wait for dialog to open and find elements
      await waitFor(async () => {
        expect(
          screen.getByTestId('mutation-response-dialog')
        ).toBeInTheDocument();
        expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
        expect(screen.getByTestId('address-btn')).toBeInTheDocument();
      });

      // Click the close button (this should cover line 1097)
      const closeButton = screen.getByTestId('address-btn');
      await userEvent.click(closeButton);

      // Verify dialog is closed
      await waitFor(() => {
        expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument();
      });
    });

    it('shows dialog with correct content and styling', async () => {
      const mockUpdateLead = jest.fn().mockResolvedValue(true);
      const mockDispatch = jest.fn();

      // Mock the useLeadUpdater hook
      const mockLeadUpdater = jest.requireMock(
        'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater'
      ).default;
      mockLeadUpdater.mockReturnValue({
        updateLead: mockUpdateLead,
        resetCheckout: jest.fn(),
        status: { status: 'fulfilled', fulfilledTimeStamp: Date.now() },
        jsonUpdater: jest.fn(),
      });

      const configWithPolicyHolderType = {
        ...mockConfig,
        policyHolderType: {
          title: 'policyHolderType.title',
          tooltip: 'policyHolderType.tooltip',
          options: [
            { key: 'customer', label: 'Customer', value: 'customer' },
            { key: 'company', label: 'Company', value: 'company' },
          ],
        },
      };

      render(
        <LeadFilterOptions
          config={configWithPolicyHolderType}
          currentData={{
            ...mockCurrentData,
            policyHolderType: 'customer',
          }}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );

      await expandLeadInfo();

      // Change policyHolderType to trigger dialog
      const policyHolderTypeSelect = screen.getByTestId(
        'select-region-policyHolderType'
      );
      await userEvent.selectOptions(policyHolderTypeSelect, 'company');

      // Wait for dialog to open
      await waitFor(() => {
        expect(
          screen.getByTestId('mutation-response-dialog')
        ).toBeInTheDocument();
      });

      // Verify dialog content
      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'text.policyHolderInformation'
      );
      expect(screen.getByTestId('dialog-blue-title')).toHaveTextContent(
        'text.updatedInformation'
      );
      expect(screen.getByTestId('dialog-content-text')).toHaveTextContent(
        'text.policyHolderSwitchWarning'
      );

      // Verify action button is present
      expect(screen.getByTestId('address-btn')).toBeInTheDocument();
    });
  });

  describe('insuranceKind change', () => {
    const renderWithInsuranceKind = ({
      mockUpdateLead,
      mockJsonUpdater,
    }: {
      mockUpdateLead: jest.Mock;
      mockJsonUpdater: jest.Mock;
    }) => {
      const mockLeadUpdater = jest.requireMock(
        'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater'
      ).default;
      mockLeadUpdater.mockReturnValue({
        updateLead: mockUpdateLead,
        resetCheckout: jest.fn(),
        status: { status: 'fulfilled', fulfilledTimeStamp: Date.now() },
        jsonUpdater: mockJsonUpdater,
      });

      const configWithInsuranceKind = {
        ...mockConfig,
        insuranceKind: {
          title: 'insuranceKind.title',
          tooltip: 'insuranceKind.tooltip',
          options: [
            { key: 'voluntary', label: 'Voluntary', value: 'voluntary' },
            { key: 'mandatory', label: 'Compulsory', value: 'mandatory' },
            { key: 'both', label: 'Both', value: 'both' },
          ],
        },
      };

      return render(
        <LeadFilterOptions
          config={configWithInsuranceKind}
          currentData={{
            ...mockCurrentData,
            insuranceKind: 'voluntary',
          }}
          setCurrentData={mockSetCurrentData}
          leadData={mockLeadData}
          setCurrentMultipleData={jest.fn()}
        />
      );
    };

    it('batches /insuranceKind and /voluntaryInsuranceType into one PATCH when changed to mandatory', async () => {
      const mockUpdateLead = jest.fn().mockResolvedValue(undefined);
      const mockJsonUpdater = jest.fn().mockResolvedValue({ data: {} });
      renderWithInsuranceKind({ mockUpdateLead, mockJsonUpdater });

      await expandLeadInfo();

      const insuranceKindSelect = screen.getByTestId(
        'select-region-insuranceKind'
      );
      await userEvent.selectOptions(insuranceKindSelect, 'mandatory');

      await waitFor(() => {
        expect(mockJsonUpdater).toHaveBeenCalledWith([
          { path: '/insuranceKind', op: 'add', value: 'mandatory' },
          { path: '/voluntaryInsuranceType', op: 'add', value: [] },
        ]);
      });
      expect(mockJsonUpdater).toHaveBeenCalledTimes(1);
      // Ensure sequential updateLead is NOT used for the insuranceKind path
      // when batching succeeds (unrelated useEffect calls like clearing
      // /carLicensePlate may still happen on mount — those are not the batch).
      expect(mockUpdateLead).not.toHaveBeenCalledWith(
        '/insuranceKind',
        expect.anything()
      );
      expect(mockUpdateLead).not.toHaveBeenCalledWith(
        '/voluntaryInsuranceType',
        expect.anything()
      );
    });

    it('patches only /insuranceKind (no voluntary clear) when changed to voluntary/both', async () => {
      const mockUpdateLead = jest.fn().mockResolvedValue(undefined);
      const mockJsonUpdater = jest.fn().mockResolvedValue({ data: {} });
      renderWithInsuranceKind({ mockUpdateLead, mockJsonUpdater });

      await expandLeadInfo();

      const insuranceKindSelect = screen.getByTestId(
        'select-region-insuranceKind'
      );
      await userEvent.selectOptions(insuranceKindSelect, 'both');

      await waitFor(() => {
        expect(mockJsonUpdater).toHaveBeenCalledWith([
          { path: '/insuranceKind', op: 'add', value: 'both' },
        ]);
      });
      expect(mockJsonUpdater).toHaveBeenCalledTimes(1);
      expect(mockUpdateLead).not.toHaveBeenCalledWith(
        '/insuranceKind',
        expect.anything()
      );
      expect(mockUpdateLead).not.toHaveBeenCalledWith(
        '/voluntaryInsuranceType',
        expect.anything()
      );
    });

    it('shows failure snackbar when insuranceKind batch update fails', async () => {
      const mockUpdateLead = jest.fn().mockResolvedValue(undefined);
      const mockJsonUpdater = jest
        .fn()
        .mockResolvedValue({ error: { message: 'failed' } });
      renderWithInsuranceKind({ mockUpdateLead, mockJsonUpdater });

      await expandLeadInfo();

      const insuranceKindSelect = screen.getByTestId(
        'select-region-insuranceKind'
      );
      await userEvent.selectOptions(insuranceKindSelect, 'mandatory');

      await waitFor(() => {
        expect(mockShowErrorSnackbar).toHaveBeenCalledWith(
          'text.updateLeadFail'
        );
      });
      expect(mockShowSuccessSnackbar).not.toHaveBeenCalled();
    });
  });
});
