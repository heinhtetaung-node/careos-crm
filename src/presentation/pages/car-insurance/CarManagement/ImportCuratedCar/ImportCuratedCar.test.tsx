import userEvent from '@testing-library/user-event';
import * as flagsmith from 'flagsmith/react';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';
import ImportModal from 'presentation/components/modal/ImportModal';
import { ImportType } from 'shared/constants/importFile';

import ImportCuratedCar from '.';

const flags = jest.spyOn(flagsmith, 'useFlags');

describe.skip('<ImportCuratedCarPage>', () => {
  test('Curated Car Import Component loads', async () => {
    render(<ImportCuratedCar />);
    const container = await screen.findByTestId('curated-car-import');
    expect(container).toBeInTheDocument();
  });

  test('Curated Car Import Component handle click', async () => {
    render(<ImportCuratedCar />);
    const btn = await screen.findByRole('button', {
      name: 'curatedCar.importCuratedCar',
    });
    userEvent.click(btn);
    const modal = await screen.findByRole('dialog', {
      name: 'curatedCar.importCuratedCar',
    });
    expect(modal).toBeInTheDocument();
  });

  test('should show Import Modal if showModal is true', async () => {
    render(<ImportCuratedCar />);
    const btn = await screen.findByRole('button', {
      name: 'curatedCar.importCuratedCar',
    });
    userEvent.click(btn);
    const modal = await screen.findByRole('dialog', {
      name: 'curatedCar.importCuratedCar',
    });
    expect(modal).toBeInTheDocument();
    render(
      <ImportModal
        name="mandatory"
        showModal
        title="modal title"
        onClose={jest.fn()}
        validationProps={{ template: [], requiredColumns: [] }}
        importModalType={ImportType.Package}
        progressMessage="text.importPackagesProgress"
      />
    );
    expect(screen.getByText('modal title')).toBeInTheDocument();
  });

  test('should close Import Modal if closed btn is clicked', async () => {
    render(<ImportCuratedCar />);
    const btn = await screen.findByRole('button', {
      name: 'curatedCar.importCuratedCar',
    });
    userEvent.click(btn);
    userEvent.click(screen.getByTestId('close-button'));
    expect(screen.queryByText('modal title')).not.toBeInTheDocument();
  });

  it('should change translation if carManagement flag is on', () => {
    flags.mockReturnValue({
      'lead-3041_update-the-car-management-menu_20230113_temp': {
        enabled: true,
      } as any,
    });
    render(<ImportCuratedCar />);
    expect(screen.getByText('curatedCar.subModel')).toBeInTheDocument();
  });
});
