import mockPackages from '@alphafounders/mock-data/json/packages.json';
import user from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import { baseUrls } from 'data/slices/apiSlice';

import {
  decodeInsuranceType,
  encodeInsuranceType,
} from './packageFilter.helper';

import FilterPanel from './index';

var mockShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockShowSnackBar,
  };
});

jest.mock('data/slices/leadSlice', () => ({
  ...jest.requireActual('data/slices/leadSlice'),
  useGetLeadByIDQuery: jest.fn().mockReturnValue({
    data: {
      data: {
        insuranceKind: 'both',
        voluntaryInsuranceType: ['type_1'],
        carSubModelYear: '12345',
      },
    },
  }),
}));

const initialState = {
  typeSelectorReducer: {
    globalProductSelectorReducer: {
      data: 'product/motor-insurance',
    },
  },
};

const mockedSetValues = jest.fn();
const mockedSetFieldValue = jest.fn();

const mockFormikProps = {
  values: {},
  setValues: mockedSetValues,
  setFieldValue: mockedSetFieldValue,
};

// FIXME
describe.skip('FilterPanel', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockClear();
    mockedSetValues.mockClear();
    window.localStorage.clear();
    server.use(
      http.get(
        `${baseUrls.salesFlow}/api/car/v1alpha1/years/12345:getSumInsuredRange`,
        () =>
          HttpResponse.json({ sumInsuredMin: 10000, sumInsuredMax: 10000000 })
      ),
      http.get(`${baseUrls.goBff}/v1alpha1/payment-options`, () =>
        HttpResponse.json({ paymentOptions: ['FULL_PAYMENT', 'INSTALLMENT'] })
      ),
      http.get(
        `${baseUrls.goBff}/v1alpha1/payment-options/FULL_PAYMENT/available-plans`,
        () => HttpResponse.json({ availablePlans: [1] })
      ),
      http.get(
        `${baseUrls.goBff}/v1alpha1/payment-options/INSTALLMENT/available-plans`,
        () => HttpResponse.json({ availablePlans: [1, 3, 5, 6] })
      )
    );
  });

  it('should set insurance Types and set default values', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      {
        initialState,
      }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    expect(
      screen.getByRole('checkbox', {
        name: 'leadPackageFilter.possibleValue.insuranceType.type1',
      })
    ).toBeChecked();
  });
  it('should call setValues with updated data if click apply', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    mockedSetValues.mockClear();
    await user.click(
      screen.getByRole('checkbox', {
        name: 'leadPackageFilter.possibleValue.insuranceType.type1',
      })
    );
    await user.click(screen.getByRole('button', { name: 'text.apply' }));
    expect(mockedSetValues).toHaveBeenCalledWith({
      deductible: 'no_deductible',
      insuranceCategory: 'mandatory',
      paymentOption: 'FULL_PAYMENT',
      installment: undefined,
      insuranceType: {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 3+': false,
        'Type 2+': false,
      },
      insurer: {
        'insurer/11': true,
        'insurer/27': true,
        'insurer/33': true,
        'insurer/5': true,
      },
      price: {
        min: 5,
        max: 150,
      },
      repairType: 'both',
      sumInsured: {
        min: 0,
        max: 100000,
      },
      isDefaultSumInsured: true,
    });
  });
  it('should list insurer and select everything as default', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    expect(
      screen.getByRole('checkbox', {
        name: 'Assets Insurance',
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: 'Dhipaya Insurance',
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: 'LMG Insurance',
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: 'The Viriyah Insurance Company Limited',
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: 'Assets Insurance',
      })
    ).toBeChecked();
  });
  it('should preselect both repair type as default', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    expect(
      screen.getByRole('checkbox', {
        name: 'leadPackageFilter.possibleValue.repairType.garage',
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: 'leadPackageFilter.possibleValue.repairType.dealer',
      })
    ).toBeChecked();
  });
  it('should configure max min of price range in filter panal', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    expect(
      screen.getByRole('slider', {
        name: '5 THB',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('slider', {
        name: '150 THB',
      })
    ).toBeInTheDocument();
  });
  it('should select no deductible as default', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    expect(
      screen.getByRole('checkbox', {
        name: 'leadPackageFilter.possibleValue.deductible.noDeductible',
      })
    ).toBeChecked();
  });
  it('should call setValues from filter after default values are calculated', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitFor(() =>
      expect(mockedSetValues).toHaveBeenCalledWith({
        deductible: 'no_deductible',
        insuranceCategory: 'both',
        paymentOption: 'FULL_PAYMENT',
        installment: 1,
        insuranceType: {
          'Type 1': true,
          'Type 2': false,
          'Type 3': false,
          'Type 3+': false,
          'Type 2+': false,
        },
        insurer: {
          'insurer/11': true,
          'insurer/27': true,
          'insurer/33': true,
          'insurer/5': true,
        },
        price: {
          min: 5,
          max: 150,
        },
        repairType: 'both',
        sortBy: 'default',
        sumInsured: {
          min: 0,
          max: 100000,
        },
        isDefaultSumInsured: true,
      })
    );
  });

  it('should call setValues from filter after default values are calculated, (zero sumInsured min disabled)', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitFor(() =>
      expect(mockedSetValues).toHaveBeenCalledWith({
        deductible: 'no_deductible',
        insuranceCategory: 'both',
        paymentOption: 'FULL_PAYMENT',
        installment: 1,
        insuranceType: {
          'Type 1': true,
          'Type 2': false,
          'Type 3': false,
          'Type 3+': false,
          'Type 2+': false,
        },
        insurer: {
          'insurer/11': true,
          'insurer/27': true,
          'insurer/33': true,
          'insurer/5': true,
        },
        price: {
          min: 5,
          max: 150,
        },
        repairType: 'both',
        sortBy: 'default',
        sumInsured: {
          min: 100,
          max: 100000,
        },
        isDefaultSumInsured: true,
      })
    );
  });
  it('should show apply and clear btn if data is modified', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    await user.click(
      screen.getByRole('checkbox', { name: 'Assets Insurance' })
    );
    expect(
      screen.getByRole('button', { name: 'text.reset' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.apply' })
    ).toBeInTheDocument();
  });
  it('should reset the value if reset is clicked', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    await user.click(
      screen.getByRole('checkbox', { name: 'Assets Insurance' }) as any
    );
    await user.click(screen.getByRole('button', { name: 'text.reset' }));
    expect(
      screen.getByRole('checkbox', { name: 'Assets Insurance' })
    ).toBeChecked();
  });
  it('should show installment filter if payment Option is not fulltime', async () => {
    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitForElementToBeRemoved(() => screen.getAllByRole('progressbar'));
    mockedSetValues.mockClear();
    expect(screen.queryByTestId('installment-option')).not.toBeInTheDocument();
    await user.click(
      within(screen.getByTestId('payment-option')).getByRole('button')
    );
    await user.click(
      within(screen.getByRole('presentation')).getAllByRole('option')[1]
    );
    await waitFor(() =>
      expect(screen.queryByTestId('installment-option')).toBeInTheDocument()
    );
  });
});

describe.skip('Filter component with api error', () => {
  beforeEach(() => {
    mockShowSnackBar.mockClear();
  });

  it.skip('should show error snackbar if sumInsured api throws a 404 error', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/years/12345:getSumInsuredRange`,
        () => {
          delay(100);
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        }
      )
    );

    render(
      <FilterPanel
        allPackages={mockPackages as any}
        filter={mockFormikProps as any}
      />,
      { initialState }
    );
    await waitFor(() =>
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'errors.sumInsured',
        status: 'error',
      })
    );
  });
});

describe('encode/decodes', () => {
  test('should return insurance type mandatory and type array', () => {
    const result = encodeInsuranceType(['mandatory', 'Type 1', 'Type 2']);
    expect(result).toStrictEqual([
      'both',
      expect.objectContaining({ 'Type 1': true, 'Type 2': true }),
    ]);
  });
  test('should return insurance type voluntary and type array', () => {
    const result = encodeInsuranceType(['Type 1', 'Type 2']);
    expect(result).toStrictEqual([
      'voluntary',
      expect.objectContaining({ 'Type 1': true, 'Type 2': true }),
    ]);
  });
  test('should return insurance type voluntary and type array', () => {
    const result = encodeInsuranceType(['mandatory']);
    expect(result).toStrictEqual([
      'mandatory',
      {
        'Type 1': false,
        'Type 2': false,
        'Type 3': false,
        'Type 2+': false,
        'Type 3+': false,
      },
    ]);
  });
  test('should include mandatory in the included array', () => {
    const result = decodeInsuranceType({ 'Type 1': true }, 'mandatory');
    expect(result).toStrictEqual(['mandatory']);
  });
  test('should include mandatory in the included array', () => {
    const result = decodeInsuranceType({ 'Type 1': true }, 'both');
    expect(result).toStrictEqual(['Type 1', 'mandatory']);
  });
  test('should not include mandatory in the included array', () => {
    const result = decodeInsuranceType({ 'Type 1': true }, 'voluntary');
    expect(result).toStrictEqual(['Type 1']);
  });
});
