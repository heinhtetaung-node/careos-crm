import { fireEvent, waitFor, within } from '@testing-library/react';
import React, { useMemo } from 'react';
import { act } from 'react-dom/test-utils';

import { ComponentWithProvider, render } from '__tests__/rtl-test-utils';
import { getString } from 'presentation/theme/localization';

import CustomSingleField from './CustomSingleField';
import { ICustomField, CustomFieldsProps } from './helpers';

import { FilesDownload, CustomFieldsContext } from '../DocumentSection';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/orders/7e9216af-1e3f-42ea-a5b9-17d1d53926a8g',
    search: '',
    state: undefined,
    hash: '',
  }),
}));

describe('<CustomSingleField/> show correct description and action buttons behaviour', () => {
  const mockUpdateListFiles = jest.fn();
  const mockRemoveFields = jest.fn();
  const mockDeleteDocument = jest.fn();
  afterEach(() => {
    mockUpdateListFiles.mockClear();
    mockRemoveFields.mockClear();
    mockDeleteDocument.mockClear();
  });
  function ComponentUnderTest({
    index = 0,
    disabledField = false,
    document = { label: 'Description one' } as FilesDownload,
    documents = [] as CustomFieldsProps['documents'],
    customField = { description: 'Description one' } as ICustomField,
    addFields = jest.fn(),
    handleRemoveFields = mockRemoveFields,
    handleInputChange = jest.fn(),
  }) {
    const ctxvalues = useMemo(
      () => ({
        listFiles: [] as (FilesDownload | undefined)[],
        handleDeleteDocument: mockDeleteDocument,
        handleUpdateListFiles: mockUpdateListFiles,
      }),
      []
    );
    return (
      <ComponentWithProvider>
        <CustomFieldsContext.Provider value={ctxvalues}>
          <CustomSingleField
            index={index}
            disabledField={disabledField}
            document={document}
            documents={documents}
            customField={customField}
            addFields={addFields}
            handleRemoveFields={handleRemoveFields}
            handleInputChange={handleInputChange}
          />
        </CustomFieldsContext.Provider>
      </ComponentWithProvider>
    );
  }
  it('<CustomSingleField/> show correct description when document is passed', () => {
    const { getByDisplayValue } = render(<ComponentUnderTest />);
    expect(getByDisplayValue('Description one')).toBeInTheDocument();
  });

  it('<CustomSingleField/> show correct description when no document is passed', async () => {
    const { getByDisplayValue, getByTestId, baseElement } = render(
      <ComponentUnderTest document={null as unknown as FilesDownload} />
    );
    expect(getByDisplayValue('Description one')).toBeInTheDocument();
    await waitFor(() => {
      expect(getByTestId('add-custom-field-btn')).toBeInTheDocument();
    });
    act(() => {
      fireEvent.click(getByTestId('add-custom-field-btn'));
    });
    const fileBrowseModal = baseElement.querySelector(
      "[data-testid='file-browse-modal']"
    );
    expect(fileBrowseModal).not.toBeInTheDocument();
  });

  it('<CustomSingleField/> preview button will show <FileBrowseModal/> when there is document', () => {
    const { getByTestId, baseElement } = render(<ComponentUnderTest />);
    const preivewCustomFieldBtn = getByTestId('preview-custom-field-btn');
    fireEvent.click(preivewCustomFieldBtn);
    const fileBrowseModal = baseElement.querySelector(
      "[data-testid='file-browse-modal']"
    );
    expect(fileBrowseModal).toBeInTheDocument();
  });

  it('<CustomSingleField/> delete button will appear when there is document', () => {
    const { getByTestId, baseElement } = render(
      <ComponentUnderTest
        document={{ fileName: 'test.jpg' } as FilesDownload}
      />
    );
    // to show the delete confirm modal
    const deleteCustomFieldBtn = getByTestId('delete-custom-field-btn');
    fireEvent.click(deleteCustomFieldBtn);

    // now delete confirm modal is in the DOM
    const confirmButton = within(baseElement as HTMLElement).getByText(
      getString('text.confirmButton')
    );

    fireEvent.click(confirmButton as HTMLButtonElement);

    expect(mockUpdateListFiles).toHaveBeenCalled();
    expect(mockDeleteDocument).toHaveBeenCalled();
    expect(mockRemoveFields).toHaveBeenCalled();
  });

  it('<CustomSingleField/> add new description', () => {
    const { getByTestId, getByDisplayValue } = render(<ComponentUnderTest />);
    const textField = getByTestId('text-field');

    fireEvent.change(textField, { target: { value: 'New Description' } });
    expect(getByDisplayValue('New Description')).toBeInTheDocument();
  });

  it('<CustomSingleField/> empty textfield show error message', () => {
    const { getByTestId, getByText, queryByText } = render(
      <ComponentUnderTest />
    );
    const textField = getByTestId('text-field');

    fireEvent.change(textField, { target: { value: '' } });
    fireEvent.keyDown(textField, { key: 'Enter' });

    expect(
      getByText('leadDetailFields.other.descriptionempty')
    ).toBeInTheDocument();

    fireEvent.change(textField, { target: { value: 'New Description' } });
    fireEvent.keyDown(textField, { key: 'Enter' });
    expect(
      queryByText('You cannot leave this field empty')
    ).not.toBeInTheDocument();
  });

  it('Counter show description length of other file', () => {
    const { getByTestId } = render(<ComponentUnderTest />);
    const textField = getByTestId('text-field');

    fireEvent.change(textField, {
      target: { value: 'abcdewsgddddddddddddddddddddddddddddddddddddddddddd' },
    });
    fireEvent.keyDown(textField, { key: 'Enter' });

    expect(getByTestId('counter-description-length')).toBeTruthy();
  });
});
