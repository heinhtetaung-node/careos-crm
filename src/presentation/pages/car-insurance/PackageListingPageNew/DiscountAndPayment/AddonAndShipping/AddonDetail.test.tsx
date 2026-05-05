import { screen, render } from '__tests__/rtl-test-utils';
import React from 'react';

import AddonDetail, { DetailTooltip } from './AddonDetail';

var mockUseTranslation: jest.Mock;

jest.mock('react-i18next', () => {
  mockUseTranslation = jest.fn().mockReturnValue({ i18n: { language: 'en' } });
  return {
    ...jest.requireActual('react-i18next'),
    useTranslation: mockUseTranslation,
  };
});

const mockAddon = {
  name: 'addons/roadsideAssistance',
  displayName: 'Roadside Assitance',
  price: '29900',
  addonType: 'roadside-assistance',
  scopes: [
    {
      displayNameEn: 'Roadside emergency towing',
      displayNameTh: 'บริการขนส่งยานพาหนะ',
      term: '5 times/year',
    },
  ],
  coverages: {
    coverage: [
      {
        displayNameEn: 'In-car asset theft coverage',
        displayNameTh:
          'การประกันภัยโจรกรรมสำหรับทรัพย์สินส่วนบุคคลที่อยู่ภายในรถยนต์ (จ่ายตามจริงไม่เกิน)',
        price: '2000000',
      },
    ],
  },
  termsAndConditions: {
    en: ['term and condition 1', 'term and condition 2'],
    th: ['term and condition 1th', 'term and condition 2th'],
  },
  provider: {
    displayNameEn: 'Inter Partner Assistance (IPA)',
    displayNameTh: 'บริษัท อินเตอร์ พาร์ทเนอร์ แอสซิสแต้นซ์ จำกัด',
  },
};

describe('AddonDetail', () => {
  it('should display Addon detail', () => {
    render(<AddonDetail addon={mockAddon} />);
    expect(screen.getByText('Roadside Assitance')).toBeInTheDocument();
  });

  it('should display correct translated addon detail in tooltip', () => {
    render(<DetailTooltip addon={mockAddon} />);
    expect(screen.getByText('Roadside emergency towing')).toBeInTheDocument();
    expect(screen.getByText('In-car asset theft coverage')).toBeInTheDocument();
    expect(
      screen.getByText('Inter Partner Assistance (IPA)')
    ).toBeInTheDocument();
  });

  it('should display correct translated addon detail in tooltip', () => {
    mockUseTranslation.mockReturnValue({ i18n: { language: 'th' } });
    render(<DetailTooltip addon={mockAddon} />);
    expect(screen.getByText('บริการขนส่งยานพาหนะ')).toBeInTheDocument();
    expect(
      screen.getByText(
        'การประกันภัยโจรกรรมสำหรับทรัพย์สินส่วนบุคคลที่อยู่ภายในรถยนต์ (จ่ายตามจริงไม่เกิน)'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('บริษัท อินเตอร์ พาร์ทเนอร์ แอสซิสแต้นซ์ จำกัด')
    ).toBeInTheDocument();
  });
});
