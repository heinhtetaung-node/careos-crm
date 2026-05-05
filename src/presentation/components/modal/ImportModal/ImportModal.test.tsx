import user from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, fireEvent, waitFor } from '__tests__/rtl-test-utils';
import { ImportType } from 'shared/constants/importFile';
import { addDays, format } from 'utils/datetime';
import ImportModal from './index';

var mockShowSnackBar: jest.Mock;

const validFile = new File(
  ['column1, column2\nentry1, entry2'],
  'textFile.csv',
  { type: 'application/csv' }
);
var mockShowSnackBar: jest.Mock;
File.prototype.text = () => Promise.resolve('column1, column2\nentry1, entry2');

jest.mock('presentation/redux/actions/ui', () => {
  mockShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockShowSnackBar,
  };
});

describe('<ImportModal />', () => {
  beforeEach(() => mockShowSnackBar.mockClear());

  it('should show default title if title prop is not provided', () => {
    render(
      <ImportModal
        name="mandatory"
        showModal
        onClose={jest.fn()}
        validationProps={{ template: [], requiredColumns: [] }}
        importModalType={ImportType.Package}
        progressMessage="text.importPackagesProgress"
      />
    );
    expect(screen.getByText('Import')).toBeInTheDocument();
  });

  it('should show title if title prop is passed', () => {
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

  it('should show date picker if type "autoAssignImport" is pass to props', () => {
    render(
      <ImportModal
        name="mandatory"
        showModal
        importModalType={ImportType.AutoAssignLeadConfig}
        title="modal title"
        onClose={jest.fn()}
        validationProps={{ template: [], requiredColumns: [] }}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show error if date is invalid, if type is "autoAssignImport" ', async () => {
    render(
      <ImportModal
        name="mandatory"
        showModal
        importModalType={ImportType.AutoAssignLeadConfig}
        title="modal title"
        onClose={jest.fn()}
        validationProps={{ template: [], requiredColumns: [] }}
      />
    );

    const dateElem = screen.getByRole('textbox');
    expect(dateElem).toBeInTheDocument();

    await user.type(dateElem, '10/10/2022');

    expect(
      dateElem.parentElement?.parentElement?.lastElementChild?.innerHTML as any
    ).toBe('errors.invalidEffectiveDate');
  });

  it('should not show error if date is valid, if type is "autoAssignImport" ', async () => {
    render(
      <ImportModal
        name="mandatory"
        showModal
        importModalType={ImportType.AutoAssignLeadConfig}
        title="modal title"
        onClose={jest.fn()}
        validationProps={{ template: [], requiredColumns: [] }}
      />
    );

    const dateElem = screen.getByRole('textbox');
    expect(dateElem).toBeInTheDocument();

    const tmrDate = format(addDays(new Date(), 1), 'dd/MM/yyyy');
    await user.type(dateElem, tmrDate);
    const dropZone = screen.getByTestId('file-drop-input');
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url');
    Object.defineProperty(dropZone, 'files', {
      value: [validFile],
    });
    fireEvent.drop(dropZone);
    expect(await screen.findByText('text.fileName')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.confirmImport' })
    ).not.toBeDisabled();
  });

  it('should enable confirm btn if valid file passed', async () => {
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
    const dropZone = screen.getByTestId('file-drop-input');
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url');
    Object.defineProperty(dropZone, 'files', {
      value: [validFile],
    });
    fireEvent.drop(dropZone);
    expect(await screen.findByText('text.fileName')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.confirmImport' })
    ).not.toBeDisabled();
  });

  it('should disable the confirm btn if invalid file passed', async () => {
    render(
      <ImportModal
        name="mandatory"
        showModal
        title="modal title"
        onClose={jest.fn()}
        validationProps={{
          template: ['unexist_column'],
          requiredColumns: ['unexist_column'],
        }}
        importModalType={ImportType.Package}
        progressMessage="text.importPackagesProgress"
      />
    );
    const dropZone = screen.getByTestId('file-drop-input');
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url');
    Object.defineProperty(dropZone, 'files', {
      value: [validFile],
    });
    fireEvent.drop(dropZone);
    expect(await screen.findByText('errors.errorReasons')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'text.confirmImport' })
    ).toBeDisabled();
  });

  it('should show importing in progress if upload success', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports`,
        () => HttpResponse.json({ name: 'name/import-name' })
      ),
      http.put(
        `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports/import-name:generateUploadUrl`,
        () => HttpResponse.json({ headers: {}, url: 'uploadUrl' })
      ),
      http.put(`http://localhost/uploadUrl`, () => HttpResponse.json({}))
    );
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
    const dropZone = screen.getByTestId('file-drop-input');
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url');
    Object.defineProperty(dropZone, 'files', {
      value: [validFile],
    });
    fireEvent.drop(dropZone);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'text.confirmImport' })
      ).not.toBeDisabled()
    );
    await user.click(
      screen.getByRole('button', { name: 'text.confirmImport' })
    );
    await waitFor(() =>
      expect(
        screen.getByText('text.importPackagesProgress')
      ).toBeInTheDocument()
    );
  });

  it('should show error snackbar if upload fail', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports`,
        () => HttpResponse.json({}, { status: 500 })
      )
    );
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
    const dropZone = screen.getByTestId('file-drop-input');
    window.URL.createObjectURL = jest.fn().mockImplementation(() => 'url');
    Object.defineProperty(dropZone, 'files', {
      value: [validFile],
    });
    fireEvent.drop(dropZone);
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'text.confirmImport' })
      ).not.toBeDisabled()
    );
    await user.click(
      screen.getByRole('button', { name: 'text.confirmImport' })
    );
    await waitFor(() =>
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'Create upload fail!',
        status: 'error',
      })
    );
  });
});
