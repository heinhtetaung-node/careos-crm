import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import userEvent from '@testing-library/user-event';
import { differenceInYears } from 'date-fns';
import { http, HttpResponse } from 'msw';
import * as React from 'react';

import { server } from '__mocks__/server';
import {
  screen,
  waitFor,
  within,
  cleanup,
  render,
} from '__tests__/rtl-test-utils';
import mockLeadDetail from 'mock-data/LeadDetail.mock';

import CustomQuotePage from '.';

var mockFormData: any;
var mockShowSnackbar: jest.Mock;
var mockPushFn: jest.Mock;

jest.mock('react-router-dom', () => {
  mockPushFn = jest.fn();
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: mockPushFn,
    useParams: jest
      .fn()
      .mockReturnValue({ id: '00000000-0000-0000-0000-000000000000' }),
  };
});

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  Trans: jest.fn().mockImplementation(({ defaults }) => defaults),
}));

jest.mock('./customQuote.helper', () => {
  const currentDate = new Date();
  const expiryDate = new Date();
  expiryDate.setDate(currentDate.getDate() + 1);
  mockFormData = {
    chassisNo: 'CN-1234',
    lastPolicyNumber: '123',
    claimNumber: '0',
    claimValue: '',
    noClaimBonus: '',
    name: 'name',
    package_type: 'STANDARD',
    start_date: currentDate,
    expiration_date: expiryDate,
    insurance_company_id: '7',
    car_insurance_type: 'Type 1',
    oic_code: 110,
    car_repair_type: 'Dealer',
    modified_car_accepted: 'Yes',
    has_cctv_discount: 'Yes',
    car_age: '',
    sum_coverage_min: '120000',
    sum_coverage_max: '',
    deductible_amount: '120000',
    price: '120000',
    fire_theft_coverage: 'No',
    flood_coverage: 'No',
    car_submodels: 'G',
    liability_per_person_coverage: '120000',
    liability_per_accident_coverage: '120000',
    liability_property_coverage: '120000',
    personal_accident_coverage: '120000',
    personal_accident_coverage_no: '1',
    medical_expenses_coverage: '120000',
    medical_expenses_coverage_no: '1',
    bail_bond_coverage: '120000',
    fixedDriver: '',
    firstDriverDOB: '',
    secondDriverDOB: '',
  };
  return {
    ...jest.requireActual('./customQuote.helper'),
    initialCustomQuoteFormData: mockFormData,
  };
});

jest.mock('presentation/redux/actions/ui', () => {
  mockShowSnackbar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockShowSnackbar,
  };
});

describe.skip('CustomQuotePage Component', () => {
  const savedLocation = window.location;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global.window.location;
    global.window.location = {
      href: '/leads/00000000-0000-0000-0000-000000000000/custom-quote',
    } as any;

    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CustomQuotePage />
      </MuiPickersUtilsProvider>
    );
  });

  afterEach(() => {
    window.location = savedLocation;
  });

  it('CustomQuotePage component', () => {
    expect(screen.getByTestId('custom-quote-wrapper')).toBeInTheDocument();
  });

  it('CustomQuotePage component handle change', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
        () =>
          HttpResponse.json({
            insurers: [
              {
                name: 'insurers/42',
                displayName: 'FPG Insurance',
                shortnameEn: '',
                shortnameTh: '',
                rating: 0,
                order: 0,
              },
              {
                name: 'insurers/40',
                displayName: 'Chubb Samaggi Insurance Co. (PLC)',
                shortnameEn: '',
                shortnameTh: '',
                rating: 0,
                order: 0,
              },
              {
                name: 'insurers/38',
                displayName: 'Roojai Insurance',
                shortnameEn: '',
                shortnameTh: '',
                rating: 0,
                order: 0,
              },
              {
                name: 'insurers/37',
                displayName: 'AIG Insurance (Thailand) Public Company Limited',
                shortnameEn: '',
                shortnameTh: '',
                rating: 0,
                order: 18,
              },
              {
                name: 'insurers/36',
                displayName:
                  'Sri Ayudhaya General Insurance Public Company Limited',
                shortnameEn: '',
                shortnameTh: '',
                rating: 0,
                order: 0,
              },
            ],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:leadId`,
        () => HttpResponse.json(mockLeadDetail)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/-/models/-/submodels/-/years/46444`,
        () =>
          HttpResponse.json({
            name: 'brands/24/models/183/submodels/12237/years/46444',
            year: 2020,
            sumInsuredMin: 0,
            sumInsuredMax: 0,
            fuelType: '',
            month: 0,
            redbookId: '',
            migratedAsCurated: true,
            price: '0',
          })
      )
    );

    const textbox = within(
      screen.getByTestId('input-sum_coverage_max')
    ).getByRole('textbox');

    await userEvent.type(textbox, '1');
    await userEvent.tab();

    await waitFor(() => {
      expect(textbox).toHaveValue('1');
    });
  });

  it('should show package Type column if flag is enabled', async () => {
    cleanup();
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CustomQuotePage />
      </MuiPickersUtilsProvider>
    );
    await waitFor(() =>
      expect(screen.getByText('package.packageTypeTitle')).toBeInTheDocument()
    );
  });

  // TODO: Fix incorrect test
  it('should create package with bff endpoint if package is standard', async () => {
    const mockCreateCustomPackageHandler = jest.fn((body) => ({ body }));
    server.use(
      http.post(
        `${process.env.VITE_GATEWAY_ENDPOINT}/api/leads/00000000-0000-0000-0000-000000000000/package`,
        async ({ request }) =>
          HttpResponse.json(
            mockCreateCustomPackageHandler(await request.json())
          )
      )
    );
    cleanup();
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CustomQuotePage />
      </MuiPickersUtilsProvider>
    );
    const textbox = within(
      screen.getByTestId('input-sum_coverage_max')
    ).getByRole('textbox');

    userEvent.type(textbox, '120000');
    userEvent.tab();

    userEvent.click(
      screen.getByRole('button', { name: 'package.saveAndSendPackageButton' })
    );
    await waitFor(() =>
      expect(mockCreateCustomPackageHandler).toHaveBeenCalled()
    );
    await waitFor(() => expect(mockPushFn).toHaveBeenCalled());
  });

  // TODO: Fix incorrect test
  it('it should call service directly if package is renewal', async () => {
    const mockCreateRenewalPackageHandler = jest.fn((body) => ({ body }));
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/-/models/-/submodels/-/years/46444`,
        () =>
          HttpResponse.json({
            cabType: '',
            carBadge: '',
            description: '',
            displayName: 'G',
            doors: 4,
            engineDescription: 0,
            engineSize: 1600,
            name: 'brands/54/models/613/submodels/12375',
            responseTimes: 144,
            secondaryBadgeDescription: '',
            transmissionType: '',
            type: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/24/models/183/submodels/12237`,
        () => HttpResponse.json({})
      ),
      http.get(`${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/`, () =>
        HttpResponse.json({
          name: 'brands/24/models/183/submodels/12237/years/46444',
          year: 2020,
          sumInsuredMin: 0,
          sumInsuredMax: 0,
          fuelType: '',
          month: 0,
          redbookId: '',
          migratedAsCurated: true,
          price: '0',
        })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/car-package/v1alpha1/leads/00000000-0000-0000-0000-000000000000/renewalPackages:upsert`,
        async ({ request }) =>
          HttpResponse.json(
            mockCreateRenewalPackageHandler(await request.json()),
            { status: 500 }
          )
      )
    );
    cleanup();
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CustomQuotePage />
      </MuiPickersUtilsProvider>,
      {
        initialState: {
          leadsDetailReducer: {
            lead: {
              payload: {
                data: {
                  chassisNumber: '1234',
                  carSubModelYear: '46444',
                },
                type: 'LEAD_TYPE_RENEWAL',
              },
            },
          },
        },
      }
    );
    const textbox = within(
      screen.getByTestId('input-sum_coverage_max')
    ).getByRole('textbox');

    userEvent.type(textbox, '120000');
    userEvent.tab();
    userEvent.click(
      screen.getByRole('button', { name: 'package.saveAndSendPackageButton' })
    );
    await waitFor(() =>
      expect(mockCreateRenewalPackageHandler).toHaveBeenCalled()
    );
    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalled());
  });

  // TODO: fix test
  it('it should call new api service directly if feature flag is on and agent tries to create a manual package', async () => {
    const mockCreateManualPackageHandler = jest.fn((body) => ({ body }));
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/-/models/-/submodels/-/years/46444`,
        () =>
          HttpResponse.json({
            name: 'brands/24/models/183/submodels/12237/years/46444',
            year: 2020,
            sumInsuredMin: 0,
            sumInsuredMax: 0,
            fuelType: '',
            month: 0,
            redbookId: '',
            migratedAsCurated: true,
            price: '0',
            displayName: 'Honda City 2020 1500 CC (4 Doors) e:HEV RS (HYBRID) ',
            engineSize: 0,
            isEnabled: true,
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/brands/24/models/183/submodels/12237`,
        () =>
          HttpResponse.json({
            name: 'brands/24/models/183/submodels/12237',
            displayName: 'e:HEV RS (HYBRID)',
            engineSize: 1500,
            engineDescription: 0,
            transmissionType: '',
            cabType: '',
            doors: 4,
            description: '',
            carBadge: '',
            secondaryBadgeDescription: '',
            type: '',
          })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/car-package/v1alpha1/leads/00000000-0000-0000-0000-000000000000/manualPackage`,
        async ({ request }) =>
          HttpResponse.json(
            mockCreateManualPackageHandler(await request.json()),
            { status: 500 }
          )
      )
    );
    cleanup();
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CustomQuotePage />
      </MuiPickersUtilsProvider>,
      {
        initialState: {
          leadsDetailReducer: {
            lead: {
              payload: {
                data: {
                  chassisNumber: '1234',
                  carSubModelYear: '46444',
                },
                type: 'LEAD_TYPE_NEW',
              },
            },
          },
        },
      }
    );
    const textbox = within(
      screen.getByTestId('input-sum_coverage_max')
    ).getByRole('textbox');

    userEvent.type(textbox, '120000');
    userEvent.tab();
    await waitFor(
      () =>
        expect(
          within(screen.getByTestId('car_submodels')).getByRole('textbox')
        ).toHaveValue('e:HEV RS (HYBRID)'),
      { timeout: 4000 }
    );

    userEvent.click(
      screen.getByRole('button', { name: 'package.saveAndSendPackageButton' })
    );

    await waitFor(() =>
      expect(mockCreateManualPackageHandler.mock.calls[0][0]).toEqual({
        package: expect.objectContaining({
          carAgeMax: differenceInYears(new Date(), new Date('01-01-2020')),
          carAgeMin: differenceInYears(new Date(), new Date('01-01-2020')),
          carInsuranceType: 'TYPE_1',
          carRepairType: 'DEALER',
          carSubmodels: ['brands/-/models/-/submodels/12237'],
          deductibleAmount: '12000000',
          displayName: 'name',
          fireTheftCoverage: '12000000',
          floodCoverage: '12000000',
          hasCctvDiscount: true,
          insurer: 'insurers/7',
          liabilityPerAccidentCoverage: '12000000',
          liabilityPerPersonCoverage: '12000000',
          liabilityPropertyCoverage: '12000000',
          medicalExpensesCoverage: '12000000',
          medicalExpensesCoverageNo: 1,
          modifiedCarAccepted: true,
          oicCode: 'TYPE_110',
          personalAccidentCoverage: '12000000',
          personalAccidentCoverageNo: 1,
          price: '12000000',
          provinces: null,
          source: 'MANUAL',
          sumCoverageMax: '12000000',
          sumCoverageMin: '12000000',
          termsEn: '',
          termsTh: '',
        }),
      })
    );
    await waitFor(() => expect(mockShowSnackbar).toHaveBeenCalled());
  });
});
