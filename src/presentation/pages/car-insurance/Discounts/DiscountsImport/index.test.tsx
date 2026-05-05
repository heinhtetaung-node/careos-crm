import user from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor, fireEvent } from '__tests__/rtl-test-utils';

import DiscountImport from '.';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

const DiscountImportData = `,,,The Viriyah Insurance Company Limited,Bangkok Insurance Public Company Limited,Thaisri Insurance Public Company Limited,Safety Insurance Public Company Limited,"Thanachart Insurance Co., Ltd",Thai Paiboon Insurance,"Thaivivat Insurance Public Co., Ltd.",AXA Insurance Pubilic Company Limited,Dhipaya Insurance Public Company Limited,Assets Insurance Public Company Limited,The South East Insurance Public Company Limited,LMG Insurance Company Limited,Syn Mun Kong Insurance Public Company Limited,The Navakij Insurance Public Company Limited,The Deves Insurance Public Company Limited,AIG Insurance (Thailand) Public Company Limited,Muang Thai Insurance Public Company Limited,Indara Insurance Public Company Limited
Car Brand ID,Car model ID,Repair type,27,7,24,26,28,2,25,6,11,5,19,33,20,31,10,37,17,13
24,181,Garage,8,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0,0,0`;

const PremiumDiscountImportData = `,,The Viriyah Insurance Company Limited,Bangkok Insurance Public Company Limited,Thaisri Insurance Public Company Limited,Safety Insurance Public Company Limited,"Thanachart Insurance Co., Ltd",Thai Paiboon Insurance,"Thaivivat Insurance Public Co., Ltd.",AXA Insurance Pubilic Company Limited,Dhipaya Insurance Public Company Limited,Assets Insurance Public Company Limited,The South East Insurance Public Company Limited,LMG Insurance Company Limited,Syn Mun Kong Insurance Public Company Limited,The Navakij Insurance Public Company Limited,The Deves Insurance Public Company Limited,AIG Insurance (Thailand) Public Company Limited,Muang Thai Insurance Public Company Limited,Indara Insurance Public Company Limited
Premium,Type,27,7,24,26,28,2,25,6,11,5,19,33,20,31,10,37,17,13
0,Fresh,8,8,8,7,7,7,7,7,0,7,7,7,7,7,7,7,0,0`;

describe('<DiscountsImport Component/>', () => {
  beforeEach(() => {
    render(<DiscountImport />);
  });
  it('will be mounted correctly', () => {
    expect(
      screen.getByRole('button', {
        name: 'menu.discounts.importDiscount',
      })
    ).toBeInTheDocument();
  });

  it('should update the table on CSV upload', async () => {
    await user.click(
      screen.getByRole('button', {
        name: 'menu.discounts.importDiscount',
      })
    );

    const input = screen.getByTestId('file-drop-input');
    const blob = new Blob([DiscountImportData]);
    const file = new File([blob], 'demo-file.csv', {
      type: 'text/csv',
    });
    const importBtn = screen.getByRole('button', {
      name: 'text.confirmImport',
    });

    File.prototype.text = jest.fn().mockResolvedValueOnce(DiscountImportData);
    await user.upload(input, file);

    await waitFor(async () => {
      expect(importBtn).toBeInTheDocument();
      await user.click(importBtn);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
  it('should update the table on CSV upload if file type is Premium', async () => {
    await user.click(
      screen.getByRole('button', {
        name: 'menu.discounts.importDiscount',
      })
    );

    const input = screen.getByTestId('file-drop-input');
    const blob = new Blob([PremiumDiscountImportData]);
    const file = new File([blob], 'demo-file.csv', {
      type: 'text/csv',
    });
    const importBtn = screen.getByRole('button', {
      name: 'text.confirmImport',
    });

    File.prototype.text = jest
      .fn()
      .mockResolvedValueOnce(PremiumDiscountImportData);

    await waitFor(() => {
      expect(screen.getByTestId('select-file_type')).toBeEnabled();
      fireEvent.change(screen.getByTestId('select-file_type'), {
        target: { value: '1' },
      });
    });

    await user.upload(input, file);

    await waitFor(async () => {
      expect(importBtn).toBeInTheDocument();
      await user.click(importBtn);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
