import user from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';
import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import FixedDriverModal from './index';
import * as uiActions from 'presentation/redux/actions/ui';

jest.mock('presentation/redux/actions/ui', () => ({
  ...jest.requireActual('presentation/redux/actions/ui'),
  showSnackBar: jest.fn(() => ({ type: '' })),
}));
jest.mock('presentation/redux/selectors/lead', () => ({
  useGetLeadSelector: jest.fn(() => ({
    type: 'LEAD_TYPE_NEW',
    root: 'name/root',
    name: 'name/lead_name',
  })),
}));
describe('<FixedDriverModal />', () => {
  beforeEach(() => {
    if (jest.isMockFunction(uiActions.showSnackBar)) {
      uiActions.showSnackBar.mockClear();
    }
  });

  it('should display the fixed driver modal and show the title', async () => {
    render(
      <FixedDriverModal
        isDisabled={false}
        openModal
        handleCloseModal={jest.fn()}
        title="Add Driver Detail"
        leadData={null}
        onSuccess={jest.fn()}
      />
    );
    expect(screen.getByTestId('fixed-driver-modal')).toBeInTheDocument();

    expect(screen.getByText('Add Driver Detail')).toBeInTheDocument();

    expect(
      screen.getByTestId('input-firstDriverFirstName')
    ).toBeInTheDocument();
    expect(screen.getByTestId('input-firstDriverLastName')).toBeInTheDocument();
    expect(screen.getByTestId('first-driver-dob-picker')).toBeInTheDocument();

    const identificationTypeRadioGroup = screen.getByRole('radiogroup', {
      name: 'firstDriverValidationType',
    });
    expect(identificationTypeRadioGroup).toBeInTheDocument();

    expect(
      screen.queryByTestId('input-firstDriverNationalId')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('input-firstDriverPassport')
    ).not.toBeInTheDocument();

    expect(screen.getByTestId('input-firstDriverLicense')).toBeInTheDocument();

    await user.click(
      within(identificationTypeRadioGroup).getByText(
        'fixedDriverModal.nationalId'
      )
    );
    await waitFor(() => {
      expect(
        screen.queryByTestId('input-firstDriverNationalId')
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId('input-firstDriverPassport')
      ).not.toBeInTheDocument();
    });

    await user.click(
      within(identificationTypeRadioGroup).getByText(
        'fixedDriverModal.passport'
      )
    );
    await waitFor(() => {
      expect(
        screen.queryByTestId('input-firstDriverNationalId')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('input-firstDriverPassport')
      ).toBeInTheDocument();
    });
  });

  it('should prepopulate the existing data', async () => {
    render(
      <FixedDriverModal
        isDisabled={false}
        openModal
        handleCloseModal={jest.fn()}
        title="Add Driver Detail"
        leadData={{
          data: {
            firstDriverDOB: '1992-01-15',
            firstDriverFirstName: 'Hello',
            firstDriverLastName: 'World',
            firstDriverLicense: '12345678',
            firstDriverNationalId: 'FakeNationalId',
            secondtDriverDOB: '1992-01-15',
            secondDriverFirstName: 'Hello',
            secondDriverLastName: 'World',
            secondDriverLicense: '87654321',
            secondDriverPassport: 'FakePassport',
            numberOfFixedDriver: 2,
          },
        }}
        onSuccess={jest.fn()}
      />
    );

    const firstDriverFirstNameInput = screen.getByTestId(
      'input-firstDriverFirstName'
    ).children[0] as HTMLTextAreaElement;
    expect(firstDriverFirstNameInput).toBeInTheDocument();
    expect(firstDriverFirstNameInput.value).toBe('Hello');

    const firstDriverLastNameInput = screen.getByTestId(
      'input-firstDriverLastName'
    ).children[0] as HTMLTextAreaElement;
    expect(firstDriverLastNameInput).toBeInTheDocument();
    expect(firstDriverLastNameInput.value).toBe('World');

    const firstDriverDriverDob = screen.getByTestId('first-driver-dob-picker')
      .children[0] as HTMLTextAreaElement;
    expect(firstDriverDriverDob).toBeInTheDocument();
    expect(firstDriverDriverDob.value).toBe('15/01/1992');

    const firstDriverNationalIdInput = screen.queryByTestId(
      'input-firstDriverNationalId'
    )?.children[0] as HTMLTextAreaElement;
    expect(firstDriverNationalIdInput).toBeInTheDocument();
    expect(firstDriverNationalIdInput.value).toBe('FakeNationalId');

    const firstDriverLicenseInput = screen.queryByTestId(
      'input-firstDriverLicense'
    )?.children[0] as HTMLTextAreaElement;
    expect(firstDriverLicenseInput).toBeInTheDocument();
    expect(firstDriverLicenseInput.value).toBe('12345678');

    const secondDriverFirstNameInput = screen.getByTestId(
      'input-secondDriverFirstName'
    ).children[0] as HTMLTextAreaElement;
    expect(secondDriverFirstNameInput).toBeInTheDocument();
    expect(secondDriverFirstNameInput.value).toBe('Hello');

    const secondDriverLastNameInput = screen.getByTestId(
      'input-secondDriverLastName'
    ).children[0] as HTMLTextAreaElement;
    expect(secondDriverLastNameInput).toBeInTheDocument();
    expect(secondDriverLastNameInput.value).toBe('World');

    const secondDriverDriverDob = screen.getByTestId('first-driver-dob-picker')
      .children[0] as HTMLTextAreaElement;
    expect(secondDriverDriverDob).toBeInTheDocument();
    expect(secondDriverDriverDob.value).toBe('15/01/1992');

    const secondDriverPassportInput = screen.queryByTestId(
      'input-secondDriverPassport'
    )?.children[0] as HTMLTextAreaElement;
    expect(secondDriverPassportInput).toBeInTheDocument();
    expect(secondDriverPassportInput.value).toBe('FakePassport');

    const secondDriverLicenseInput = screen.queryByTestId(
      'input-secondDriverLicense'
    )?.children[0] as HTMLTextAreaElement;
    expect(secondDriverLicenseInput).toBeInTheDocument();
    expect(secondDriverLicenseInput.value).toBe('87654321');
  });

  // FIX ME: This test is not working
  it.skip('should allow user to update data and call API', async () => {
    const mockedLeadUpdateHandler = jest.fn();
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/lead_name:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedLeadUpdateHandler(await request.json()))
      )
    );
    render(
      <FixedDriverModal
        isDisabled={false}
        openModal
        handleCloseModal={jest.fn()}
        title="Add Driver Detail"
        leadData={{
          data: {
            firstDriverDOB: '1992-01-15',
            firstDriverFirstName: 'Hello',
            firstDriverLastName: 'World',
            firstDriverLicense: '12345678',
            firstDriverNationalId: 'FakeNationalId',
            secondtDriverDOB: '1992-01-15',
            secondDriverFirstName: 'Hello',
            secondDriverLastName: 'World',
            secondDriverLicense: '87654321',
            secondDriverPassport: 'FakePassport',
            numberOfFixedDriver: 2,
          },
        }}
        onSuccess={jest.fn()}
      />
    );

    const firstDriverFirstNameInput = screen.getByTestId(
      'input-firstDriverFirstName'
    ).children[0] as HTMLTextAreaElement;
    expect(firstDriverFirstNameInput).toBeInTheDocument();
    await user.clear(firstDriverFirstNameInput);
    await user.type(firstDriverFirstNameInput, 'firstDriverFirstName');

    const firstDriverLastNameInput = screen.getByTestId(
      'input-firstDriverLastName'
    ).children[0] as HTMLTextAreaElement;
    expect(firstDriverLastNameInput).toBeInTheDocument();
    await user.clear(firstDriverLastNameInput);
    await user.type(firstDriverLastNameInput, 'firstDriverLastName');

    const firstDriverDriverDob = screen.getByTestId('first-driver-dob-picker')
      .children[0] as HTMLTextAreaElement;
    expect(firstDriverDriverDob).toBeInTheDocument();
    await user.clear(firstDriverDriverDob);
    await user.type(firstDriverDriverDob, '15/12/1991');

    const firstDriverNationalIdInput = screen.queryByTestId(
      'input-firstDriverNationalId'
    )?.children[0] as HTMLTextAreaElement;
    expect(firstDriverNationalIdInput).toBeInTheDocument();
    await user.clear(firstDriverNationalIdInput);
    await user.type(firstDriverNationalIdInput, 'firstDriverNationalId');

    const firstDriverLicenseInput = screen.queryByTestId(
      'input-firstDriverLicense'
    )?.children[0] as HTMLTextAreaElement;
    expect(firstDriverLicenseInput).toBeInTheDocument();
    await user.clear(firstDriverLicenseInput);
    await user.type(firstDriverLicenseInput, '23456789');

    const secondDriverFirstNameInput = screen.getByTestId(
      'input-secondDriverFirstName'
    ).children[0] as HTMLTextAreaElement;
    expect(secondDriverFirstNameInput).toBeInTheDocument();
    await user.clear(secondDriverFirstNameInput);
    await user.type(secondDriverFirstNameInput, 'secondDriverFirstName');

    const secondDriverLastNameInput = screen.getByTestId(
      'input-secondDriverLastName'
    ).children[0] as HTMLTextAreaElement;
    expect(secondDriverLastNameInput).toBeInTheDocument();
    await user.clear(secondDriverLastNameInput);
    await user.type(secondDriverLastNameInput, 'secondDriverLastName');

    const secondDriverDriverDob = screen.getByTestId('second-driver-dob-picker')
      .children[0] as HTMLTextAreaElement;
    expect(secondDriverDriverDob).toBeInTheDocument();
    await user.clear(secondDriverDriverDob);
    await user.type(secondDriverDriverDob, '02/02/1991');

    const secondDriverValidationTypeOption = screen.getByTestId(
      'second-driver-validation-type'
    );
    const NationalIdOption = within(secondDriverValidationTypeOption).getByText(
      'fixedDriverModal.nationalId'
    );
    await user.click(NationalIdOption);

    await waitFor(async () => {
      const secondDriverNationalIdInput = screen.queryByTestId(
        'input-secondDriverNationalId'
      )?.children[0] as HTMLTextAreaElement;
      expect(secondDriverNationalIdInput).toBeInTheDocument();
      await user.clear(secondDriverNationalIdInput);
      await user.type(secondDriverNationalIdInput, 'secondDriverNationalId');
    });

    const secondDriverLicenseInput = screen.queryByTestId(
      'input-secondDriverLicense'
    )?.children[0] as HTMLTextAreaElement;
    expect(secondDriverLicenseInput).toBeInTheDocument();
    await user.clear(secondDriverLicenseInput);
    await user.type(secondDriverLicenseInput, '888888888');

    const saveButton = screen.getByTestId('fixed-driver-modal-save');
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockedLeadUpdateHandler).toHaveBeenNthCalledWith(1, [
        {
          op: 'add',
          path: '/firstDriverFirstName',
          value: 'firstDriverFirstName',
        },
        {
          op: 'add',
          path: '/firstDriverLastName',
          value: 'firstDriverLastName',
        },
        {
          op: 'add',
          path: '/firstDriverDOB',
          value: '1991-12-15',
        },
        {
          op: 'add',
          path: '/firstDriverLicense',
          value: '23456789',
        },
        {
          op: 'add',
          path: '/secondDriverFirstName',
          value: 'secondDriverFirstName',
        },
        {
          op: 'add',
          path: '/secondDriverLastName',
          value: 'secondDriverLastName',
        },
        {
          op: 'add',
          path: '/secondDriverDOB',
          value: '1991-02-02',
        },
        {
          op: 'add',
          path: '/secondDriverLicense',
          value: '888888888',
        },
        {
          op: 'add',
          path: '/firstDriverNationalId',
          value: 'firstDriverNationalId',
        },
        {
          op: 'add',
          path: '/secondDriverNationalId',
          value: 'secondDriverNationalId',
        },
      ]);
    });
  });
});
