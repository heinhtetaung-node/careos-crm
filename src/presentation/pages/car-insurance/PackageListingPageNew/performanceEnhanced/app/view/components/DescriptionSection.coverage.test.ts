import React from 'react';
import { render, screen } from '@testing-library/react';
import DescriptionSection from './DescriptionSection';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
  getLanguage: jest.fn(() => 'en'),
}));

jest.mock('../../../helper', () => ({
  formatPriceUnits: jest.fn((units) => `THB ${units}`),
}));

jest.mock('shared/helper/utilities', () => ({
  formatDate: jest.fn(() => '2026-01-01'),
}));

const baseProps = {
  isDetailError: false,
  getInsurerName: () => 'Mock Insurer',
  onQuotation: jest.fn(),
  normalizeInsuranceTypeLabel: (value) => value ?? '',
  repairTypeLabel: 'Garage',
  coverageByType: {
    mandatoryPrice: {
      coverageType: 'mandatoryPrice',
      name: 'mandatoryPrice',
      coverageName: 'Mandatory Price',
      singleValue: { units: '1000' },
    },
    voluntaryPrice: {
      coverageType: 'voluntaryPrice',
      name: 'voluntaryPrice',
      coverageName: 'Voluntary Price',
      singleValue: { units: '5000' },
    },
    dashCam: {
      coverageType: 'dashCam',
      name: 'dashCam',
      coverageName: 'Dash Cam',
      textValue: 'Required',
    },
    oicCode: {
      coverageType: 'oicCode',
      name: 'oicCode',
      coverageName: 'OIC',
      textValue: 'OIC-123',
    },
    insuranceType: {
      coverageType: 'insuranceType',
      name: 'insuranceType',
      coverageName: 'Insurance Type',
      textValue: 'Type 2+ Mandatory',
    },
    deductible: {
      coverageType: 'deductible',
      name: 'deductible',
      coverageName: 'Deductible',
      singleValue: { units: '0' },
    },
  },
  premiumDetail: {
    product: {
      package: {
        packageName: 'Test Package',
        insurer: 'insurers/1',
        validFrom: '2026-01-01',
        validTo: '2026-12-31',
        description: 'T&C',
      },
      coverages: [],
    },
  },
};

describe('DescriptionSection coverage labels', () => {
  it('uses translated coverage key for known coverage labels', () => {
    render(
      React.createElement(DescriptionSection, {
        ...baseProps,
        premiumDetail: {
          product: {
            ...baseProps.premiumDetail.product,
            coverages: [
              {
                coverageType: 'thirdPartyMaxDeath',
                name: 'thirdPartyMaxDeath',
                coverageName: 'Third Party Max Death',
                singleValue: { units: '100000' },
              },
            ],
          },
        },
      })
    );

    expect(
      screen.getByText(/newPackageListing\.coverages\.thirdPartyMaxDeath/)
    ).toBeInTheDocument();
  });

  it('uses translated coverage key for maximum annual coverage', () => {
    render(
      React.createElement(DescriptionSection, {
        ...baseProps,
        premiumDetail: {
          product: {
            ...baseProps.premiumDetail.product,
            coverages: [
              {
                coverageType: 'maximumAnnualCoverage',
                name: 'maximumAnnualCoverage',
                coverageName: 'Maximum Annual Coverage',
                singleValue: { units: '750000' },
              },
            ],
          },
        },
      })
    );

    expect(
      screen.getByText(/newPackageListing\.coverages\.maximumAnnualCoverage/)
    ).toBeInTheDocument();
  });
  it('renders imported coverage rows by coverageType when coverageName wording differs', () => {
    render(
      React.createElement(DescriptionSection, {
        ...baseProps,
        premiumDetail: {
          product: {
            ...baseProps.premiumDetail.product,
            coverages: [
              {
                coverageType: 'personalInjury',
                name: 'personalInjury',
                coverageName: 'Personal Injury',
                singleValue: { units: '100000' },
              },
              {
                coverageType: 'thirdPartyMaxDeath',
                name: 'thirdPartyMaxDeath',
                coverageName: 'Max. Death',
                singleValue: { units: '500000' },
              },
              {
                coverageType: 'ownedCarFlood',
                name: 'ownedCarFlood',
                coverageName: 'Flood Coverage',
                singleValue: { units: '300000' },
              },
              {
                coverageType: 'ownedCarFireTheft',
                name: 'ownedCarFireTheft',
                coverageName: 'Theft and Fire Coverage',
                singleValue: { units: '400000' },
              },
            ],
          },
        },
      })
    );

    expect(
      screen.getByText(/newPackageListing\.coverages\.personalInjuryPerPerson/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/newPackageListing\.coverages\.thirdPartyMaxDeath/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/newPackageListing\.coverages\.flood/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/newPackageListing\.coverages\.fireAndTheft/)
    ).toBeInTheDocument();
    expect(screen.getByText('THB 100000')).toBeInTheDocument();
    expect(screen.getByText('THB 500000')).toBeInTheDocument();
    expect(screen.getByText('THB 300000')).toBeInTheDocument();
    expect(screen.getByText('THB 400000')).toBeInTheDocument();
  });
  it('does not render unknown coverage labels that are not mandatory', () => {
    render(
      React.createElement(DescriptionSection, {
        ...baseProps,
        premiumDetail: {
          product: {
            ...baseProps.premiumDetail.product,
            coverages: [
              {
                coverageType: 'myCustomCoverage',
                name: 'myCustomCoverage',
                coverageName: 'My Custom Coverage',
                singleValue: { units: '100000' },
              },
            ],
          },
        },
      })
    );

    expect(screen.queryByText(/My Custom Coverage/)).not.toBeInTheDocument();
  });
});

describe('DescriptionSection terms and conditions (lines 268-279)', () => {
  it('renders multi-line terms and conditions, filtering empty lines', () => {
    const termsText =
      'First term line\n\nSecond term line\n\n\nThird term line';
    render(
      React.createElement(DescriptionSection, {
        ...baseProps,
        coverageByType: {
          ...baseProps.coverageByType,
          termAndConditionEN: {
            coverageType: 'termAndCondition',
            name: 'termAndConditionEN',
            coverageName: 'Terms EN',
            textValue: termsText,
          },
        },
      })
    );

    expect(screen.getByText('First term line')).toBeInTheDocument();
    expect(screen.getByText('Second term line')).toBeInTheDocument();
    expect(screen.getByText('Third term line')).toBeInTheDocument();
  });

  it('renders terms and conditions when using termsAndConditionsEN key', () => {
    const termsText = 'Single line term';
    render(
      React.createElement(DescriptionSection, {
        ...baseProps,
        coverageByType: {
          ...baseProps.coverageByType,
          termsAndConditionsEN: {
            coverageType: 'termAndCondition',
            name: 'termsAndConditionsEN',
            coverageName: 'Terms EN',
            textValue: termsText,
          },
        },
      })
    );

    expect(screen.getByText('Single line term')).toBeInTheDocument();
  });

  it('renders terms when locale is Thai (termsAndConditionsTH / termAndConditionTH)', () => {
    const { getLanguage } = jest.requireMock('presentation/theme/localization');
    getLanguage.mockReturnValueOnce('th');

    const termsText = 'ข้อกำหนดภาษาไทย';
    render(
      React.createElement(DescriptionSection, {
        ...baseProps,
        coverageByType: {
          ...baseProps.coverageByType,
          termAndConditionTH: {
            coverageType: 'termAndCondition',
            name: 'termAndConditionTH',
            coverageName: 'Terms TH',
            textValue: termsText,
          },
        },
      })
    );

    expect(screen.getByText('ข้อกำหนดภาษาไทย')).toBeInTheDocument();
  });
});
