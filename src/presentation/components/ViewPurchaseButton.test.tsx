import React from 'react';

import { render, screen, fireEvent, waitFor } from '__tests__/rtl-test-utils';

import ViewPurchaseButton from './ViewPurchaseButton';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: 'dummyid',
  }),
}));

const renderComponent = (
  leadData?: Record<string, any>,
  packageId?: string,
  tooltipKey?: string
) => {
  render(<ViewPurchaseButton packageId={packageId} tooltipKey={tooltipKey} />, {
    initialState: {
      leadsDetailReducer: { lead: { payload: { data: leadData } } },
    },
  });
};

describe('<ViewPurchaseButton />', () => {
  it('disable if there is no package id', () => {
    renderComponent({}, '');
    const component = screen.getByRole('button', {
      name: 'text.viewSelectedPackage',
    });
    expect(component).toBeDisabled();
  });

  it('enable if there is package id and insurance type is mandatory', () => {
    renderComponent(
      { insuranceKind: 'mandatory', voluntaryInsuranceType: [] },
      '1'
    );
    const component = screen.getByRole('button', {
      name: 'text.viewSelectedPackage',
    });
    expect(component).not.toBeDisabled();
  });

  it('enable if there is package id and all data is complete', () => {
    renderComponent(
      { insuranceKind: 'voluntary', voluntaryInsuranceType: ['type_1'] },
      '1'
    );
    const component = screen.getByRole('button', {
      name: 'text.viewSelectedPackage',
    });
    expect(component).not.toBeDisabled();
  });

  it('renders tooltip when tooltipKey is present and user hover on top of button', async () => {
    renderComponent(
      { insuranceKind: 'mandatory', voluntaryInsuranceType: [] },
      '1',
      'Fake package name'
    );

    expect(screen.getByTestId('btn-view-selected-package')).toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId('btn-view-selected-package'));

    await waitFor(() => {
      expect(screen.queryByText('Fake package name')).toBeInTheDocument();
    });
  });

  it('Doesnt render tooltip when tooltipKey is missing and user hover on top of button ', async () => {
    renderComponent(
      { insuranceKind: 'mandatory', voluntaryInsuranceType: [] },
      '1'
    );

    expect(screen.getByTestId('btn-view-selected-package')).toBeInTheDocument();

    fireEvent.mouseOver(screen.getByTestId('btn-view-selected-package'));

    await waitFor(() => {
      expect(screen.queryByText('Fake package name')).not.toBeInTheDocument();
    });
  });
});
