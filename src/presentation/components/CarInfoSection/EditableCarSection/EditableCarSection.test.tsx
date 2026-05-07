import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import CarApiResponse from 'mock-data/CarAPIResponse.mock';
import ProvincesResponse from 'mock-data/Provinces.mock';

import EditableCarSection from '.';

var mockLeadUpdate: jest.Mock;

jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater',
  () => {
    mockLeadUpdate = jest.fn().mockResolvedValue('');
    return jest.fn().mockReturnValue({ updateLead: mockLeadUpdate });
  }
);

const emptyCarData = {
  brand: null,
  model: null,
  year: null,
  subModel: null,
  carSubModelYear: null,
  fuelType: '',
  transmission: '',
  engineSize: null,
  noOfDoors: null,
  cabType: '',
  carModified: undefined,
  carDashCam: undefined,
  carUsageType: undefined,
  carRegisteredSeats: undefined,
  registeredProvince: null,
  redPlate: false,
  carLicensePlate: '',
  chassisNumber: '',
  vehicleIdNumber: '',
  carColor: undefined,
};

const carData = {
  brand: 38,
  model: 1220,
  subModel: 10191,
  year: 2020,
  carSubModelYear: 42636,
  fuelType: 'Electric',
  transmission: null,
  engineSize: null,
  noOfDoors: 4,
  cabType: null,
  carModified: true,
  carDashCam: false,
  carUsageType: 'personal' as any,
  carRegisteredSeats: 7,
  carLicensePlate: undefined,
  redPlate: undefined,
  registeredProvince: 100000,
  chassisNumber: '123ABZ',
  vehicleIdNumber: 'FAKEVEHICLEID',
  carColor: ['green'],
  isVan: true,
};

describe('EditableCarSection', () => {
  it('renders the component correctly', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/manufacturedYears`,
        () => HttpResponse.json(CarApiResponse)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces`,
        () => HttpResponse.json(ProvincesResponse)
      )
    );

    render(
      <EditableCarSection carData={emptyCarData} isFieldDisabled={false} />
    );

    expect(
      screen.getByTestId('editable-car-section-container')
    ).toBeInTheDocument();
  });
});

describe.skip('EditableCarSection component', () => {
  beforeEach(() => {
    mockLeadUpdate.mockClear();

    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/-/models/-/submodels/-/years/-:getUniqueCars`,
        () => HttpResponse.json(CarApiResponse)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/address/v1alpha1/provinces`,
        () => HttpResponse.json(ProvincesResponse)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/38/models/-/submodels/-/years/-:getUniqueCars`,
        () =>
          HttpResponse.json({
            manufacturedYears: [2020],
            uniqueBrands: [
              {
                id: 38,
                name: 'Nissan',
              },
            ],
            uniqueModels: [
              {
                id: 464,
                name: 'Almera',
              },
              {
                id: 474,
                name: 'March',
              },
              {
                id: 1017,
                name: 'Note',
              },
              {
                id: 745,
                name: 'NP 300 Navara',
              },
              {
                id: 487,
                name: 'Teana',
              },
              {
                id: 492,
                name: 'X-Trail',
              },
              {
                id: 1219,
                name: 'GT-R',
              },
              {
                id: 1273,
                name: 'Kicks',
              },
              {
                id: 1220,
                name: 'LEAF',
              },
              {
                id: 1265,
                name: 'Navara',
              },
              {
                id: 486,
                name: 'Sylphy',
              },
              {
                id: 1217,
                name: 'Terra',
              },
              {
                id: 490,
                name: 'Urvan',
              },
            ],
            car: [],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/38/models/1220/submodels/-/years/-:getUniqueCars`,
        () =>
          HttpResponse.json({
            manufacturedYears: [2020],
            uniqueBrands: [
              {
                id: 38,
                name: 'Nissan',
              },
            ],
            uniqueModels: [
              {
                id: 1220,
                name: 'LEAF',
              },
            ],
            car: [
              {
                name: 'brands/38/models/1220/submodels/10191/years/42636',
                year: 2020,
                submodelName:
                  'Hatch 4dr 1sp Reduction Gear Front Wheel Drive (CBU,EV)',
                engineSize: 0,
                engineDescription: 0,
                transmissionType: 'Automatic',
                cabType: '',
                doors: 4,
                sumInsuredMin: 0,
                sumInsuredMax: 918500,
                fuelType: 'Electric',
                month: 4,
                migratedAsCurated: false,
                price: '0',
                displayName:
                  'Apr Hatch 4dr 1sp Reduction Gear Front Wheel Drive (CBU,EV)',
                isEnabled: true,
                isCurated: false,
                isVan: false,
              },
            ],
          })
      )
    );
  });

  it('should remove license plate if registered province is changed', async () => {
    render(
      <EditableCarSection
        carData={{
          brand: 38,
          model: 1220,
          subModel: 10191,
          year: 2020,
          carSubModelYear: 42636,
          fuelType: 'Electric',
          transmission: 'Automatic',
          engineSize: null,
          noOfDoors: 4,
          cabType: '',
          carModified: true,
          carDashCam: false,
          carUsageType: 'personal',
          carRegisteredSeats: 7,
          carLicensePlate: 'redPlate',
          redPlate: true,
          registeredProvince: 100000,
          chassisNumber: 'HE0KJH798',
          vehicleIdNumber: 'KJ97987',
          carColor: ['green'],
        }}
        isFieldDisabled={false}
      />
    );

    await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    const province = within(screen.getByTestId('province-autocomplete'));
    await userEvent.click(province.getByRole('button'));
    const choice = within(screen.getByRole('listbox')).getByText(
      'Samut Prakan'
    );
    await userEvent.click(choice);
    expect(mockLeadUpdate.mock.calls[0]).toEqual([
      '/carLicensePlate',
      null,
      'remove',
    ]);
    expect(mockLeadUpdate.mock.calls[1]).toEqual([
      '/registeredProvince',
      110000,
    ]);
  });

  it('should not remove license plate if registered province is changed but license plate is not set', async () => {
    render(
      <EditableCarSection
        carData={{
          brand: 38,
          model: 1220,
          subModel: 10191,
          year: 2020,
          carSubModelYear: 42636,
          fuelType: 'Electric',
          transmission: 'Automatic',
          engineSize: null,
          noOfDoors: 4,
          cabType: '',
          carModified: true,
          carDashCam: false,
          carUsageType: 'personal',
          carRegisteredSeats: 7,
          carLicensePlate: undefined,
          redPlate: true,
          registeredProvince: 100000,
          chassisNumber: 'HE0KJH798',
          vehicleIdNumber: 'KJ97987',
          carColor: ['green'],
        }}
        isFieldDisabled={false}
      />
    );

    await waitFor(() => {
      const mainContainer = screen.getByTestId(
        'editable-car-section-container'
      );
      expect(mainContainer).toBeInTheDocument();
    });

    const province = within(await screen.findByTestId('province-autocomplete'));
    await userEvent.click(province.getByRole('button'));
    const choice = within(screen.getByRole('listbox')).getByText(
      'Samut Prakan'
    );
    await userEvent.click(choice);
    await waitFor(() => expect(mockLeadUpdate).toHaveBeenCalledTimes(1));
  });

  it('renders the component correctly and fetches the data correctly.', async () => {
    render(
      <EditableCarSection
        carData={{
          brand: 38,
          model: 1220,
          subModel: 10191,
          year: 2020,
          carSubModelYear: 42636,
          fuelType: 'Electric',
          transmission: 'Automatic',
          engineSize: null,
          noOfDoors: 4,
          cabType: '',
          carModified: true,
          carDashCam: false,
          carUsageType: 'personal',
          carRegisteredSeats: 7,
          carLicensePlate: 'redPlate',
          redPlate: true,
          registeredProvince: 100000,
          chassisNumber: 'HE0KJH798',
          vehicleIdNumber: 'KJ97987',
          carColor: ['green'],
        }}
        isFieldDisabled={false}
      />
    );

    // await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    await waitFor(() => {
      const mainContainer = screen.getByTestId(
        'editable-car-section-container'
      );
      expect(mainContainer).toBeInTheDocument();
      expect(
        screen.getByTestId('editable-car-data-container')
      ).toBeInTheDocument();
    });
  });

  it('renders the component correctly and fetches the data correctly and update text area', async () => {
    render(
      <EditableCarSection
        carData={{
          brand: 38,
          model: 1220,
          subModel: 10191,
          year: 2020,
          carSubModelYear: 42636,
          fuelType: 'Electric',
          transmission: null,
          engineSize: null,
          noOfDoors: 4,
          cabType: null,
          carModified: true,
          carDashCam: false,
          carUsageType: 'personal',
          carRegisteredSeats: 7,
          carLicensePlate: 'กท1-1234 สป',
          redPlate: false,
          registeredProvince: 100000,
          chassisNumber: '123ABZ',
          vehicleIdNumber: 'FAKEVEHICLEID',
          carColor: ['green'],
          isVan: true,
        }}
        isFieldDisabled={false}
      />
    );

    await waitFor(async () => {
      const mainContainer = screen.getByTestId(
        'editable-car-section-container'
      );
      expect(mainContainer).toBeInTheDocument();
      expect(
        screen.getByTestId('editable-car-data-container')
      ).toBeInTheDocument();

      const vehicleIdNumberInputArea = screen.getByTestId(
        'vehicle-id-number-input-input'
      ) as HTMLTextAreaElement;

      await userEvent.clear(vehicleIdNumberInputArea);
      await userEvent.type(vehicleIdNumberInputArea, '369{enter}');

      expect(vehicleIdNumberInputArea.value).toBe('369');
      expect(mockLeadUpdate).toHaveBeenCalledWith('/vehicleIdNumber', '369');
    });
  });

  it.skip('renders the component correctly and fetches the data correctly and changes the redplate value', async () => {
    render(<EditableCarSection carData={carData} isFieldDisabled={false} />);

    // await waitForElementToBeRemoved(screen.getByRole('progressbar'));

    await waitFor(async () => {
      const mainContainer = screen.getByTestId(
        'editable-car-section-container'
      );
      expect(mainContainer).toBeInTheDocument();
      expect(
        screen.getByTestId('editable-car-data-container')
      ).toBeInTheDocument();

      expect(
        screen.getByTestId('red-plate-radio-group-radiogroup')
      ).toBeInTheDocument();

      const redPlateSection = screen.getByTestId(
        'red-plate-radio-group-radiogroup'
      );

      const yesOption = within(redPlateSection).getByLabelText('Yes');
      const noOption = within(redPlateSection).getByLabelText('No');
      expect(yesOption).toBeInTheDocument();
      expect(noOption).toBeInTheDocument();

      await userEvent.click(yesOption);

      expect(mockLeadUpdate).toHaveBeenCalledWith(
        'redplate',
        '/carLicensePlate'
      );
      expect(yesOption).toBeChecked();
      expect(noOption).not.toBeChecked();

      await userEvent.click(noOption);
      expect(mockLeadUpdate).toHaveBeenCalledWith('', '/carLicensePlate');
      expect(noOption).toBeChecked();
      expect(yesOption).not.toBeChecked();
    });

    const licensePlateSection = screen.getByTestId('license-plate-input');
    const freeTextLicensePlate = within(licensePlateSection).getByTestId(
      'license-plate-input-freeText-input'
    ) as HTMLTextAreaElement;
    const numericalTextLicensePlate = within(licensePlateSection).getByTestId(
      'license-plate-input-numericalText-input'
    ) as HTMLTextAreaElement;

    await userEvent.type(freeTextLicensePlate, '1นน{enter}');
    await userEvent.type(numericalTextLicensePlate, '1234{enter}');

    expect(freeTextLicensePlate.value).toBe('1นน');
    expect(numericalTextLicensePlate.value).toBe('1234');
    expect(mockLeadUpdate).toHaveBeenCalledWith(
      '1นน-1234 กท',
      '/carLicensePlate'
    );
  });

  it('renders the component correctly and allows user to select multiple car color', async () => {
    render(<EditableCarSection carData={carData} isFieldDisabled={false} />);

    expect(
      await screen.findByTestId('editable-car-section-container')
    ).toBeInTheDocument();

    expect(
      await screen.findByTestId('editable-car-data-container')
    ).toBeInTheDocument();

    expect(
      await screen.findByTestId('vehicle-color-autocomplete')
    ).toBeInTheDocument();

    const carColorDropdown = within(
      screen.getByTestId('vehicle-color-autocomplete')
    ).getByRole('textbox');
    await userEvent.click(carColorDropdown);
    await userEvent.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'order.vehicleColor.black',
      })
    );

    await waitFor(async () => {
      expect(mockLeadUpdate).toHaveBeenCalledWith('/carColor', [
        'green',
        'black',
      ]);
    });
  });
});
