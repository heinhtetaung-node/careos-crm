import { Formik } from 'formik';
import React from 'react';

import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import useManualQuoteRestrictionByInsurerEnabled from 'presentation/hooks/useManualQuoteRestrictionByInsurerEnabled';
import { useGetUserSelector } from 'presentation/redux/selectors/user';

import PackageType from './index';

var mockShowSnackbar: jest.Mock;

jest.mock('presentation/redux/actions/ui', () => {
  mockShowSnackbar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockShowSnackbar,
  };
});

jest.mock(
  'presentation/hooks/useManualQuoteRestrictionByInsurerEnabled',
  () => ({
    __esModule: true,
    default: jest.fn(() => false),
  })
);

jest.mock('presentation/redux/selectors/user', () => ({
  useGetUserSelector: jest.fn(() => ({ role: 'roles/admin' })),
}));

const mockUseManualQuoteRestriction =
  useManualQuoteRestrictionByInsurerEnabled as jest.Mock;
const mockUseGetUserSelector = useGetUserSelector as jest.Mock;

const initialState = {
  leadsDetailReducer: {
    lead: {
      payload: {
        data: {
          chassisNumber: '1234',
        },
        type: 'LEAD_TYPE_NEW',
      },
    },
  },
};

describe('<PackageType />', () => {
  beforeEach(() => {
    mockUseManualQuoteRestriction.mockReturnValue(false);
    mockUseGetUserSelector.mockReturnValue({ role: 'roles/admin' });
  });

  it('it should render', () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PackageType classes={{}} handleChangePackageType={jest.fn()} />
      </Formik>,
      { initialState }
    );
    expect(screen.getByText('package.packageTypeTitle')).toBeInTheDocument();
  });

  it('should set chassis number if exist in the lead', () => {
    const newInitialState = JSON.parse(JSON.stringify(initialState));
    newInitialState.leadsDetailReducer.lead.payload.type = 'LEAD_TYPE_RENEWAL';
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PackageType classes={{}} handleChangePackageType={jest.fn()} />
      </Formik>,
      { initialState: newInitialState }
    );
    const chassisNo = screen.getByTestId('chassisNo');
    expect(within(chassisNo).getByRole('textbox')).toHaveValue('1234');
  });

  it('should show error snackbar if chassis number does not exist', () => {
    const newInitialState = JSON.parse(JSON.stringify(initialState));
    newInitialState.leadsDetailReducer.lead.payload.type = 'LEAD_TYPE_RENEWAL';
    newInitialState.leadsDetailReducer.lead.payload.data.chassisNumber =
      undefined;
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PackageType classes={{}} handleChangePackageType={jest.fn()} />
      </Formik>,
      { initialState: newInitialState }
    );
    expect(mockShowSnackbar).toHaveBeenCalled();
  });

  it('should not show renew package type if lead type is not renewal', () => {
    render(
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <PackageType classes={{}} handleChangePackageType={jest.fn()} />
      </Formik>,
      { initialState }
    );
    expect(
      screen.queryByRole('radio', { name: 'customQuote.packageTypes.renewal' })
    ).not.toBeInTheDocument();
  });

  it('should reset package_type to the first available option when current selection is not in options', async () => {
    mockUseManualQuoteRestriction.mockReturnValue(true);
    mockUseGetUserSelector.mockReturnValue({ role: 'roles/sales' });

    const mockHandleChangePackageType = jest.fn();

    render(
      <Formik
        initialValues={{ package_type: 'STANDARD' }}
        onSubmit={jest.fn()}
      >
        <PackageType
          classes={{}}
          handleChangePackageType={mockHandleChangePackageType}
        />
      </Formik>,
      { initialState }
    );

    await waitFor(() => {
      expect(mockHandleChangePackageType).toHaveBeenCalledWith('TRANSFER_CODE');
    });
  });
});
