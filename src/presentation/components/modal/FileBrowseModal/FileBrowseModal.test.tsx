import documents from '@alphafounders/mock-data/json/uploadedCustomerDocuments.json';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import FileBrowseModal from '.';

const handleCloseDialog = jest.fn();
const handleDeleteDocument = jest.fn();
var mockDownloadFromBlobURL: jest.Mock;

jest.mock('shared/helper/downloadDocumentHelper.ts', () => {
  mockDownloadFromBlobURL = jest.fn();
  return {
    ...jest.requireActual('shared/helper/downloadDocumentHelper.ts'),
    downloadFileFromBlobURL: mockDownloadFromBlobURL,
  };
});

test('should <FileBrowseModal/> show image and pdf preview accordingly', () => {
  // firstNamedDriverLicense is pdf and should show pdf preview
  const { rerender } = render(
    <FileBrowseModal
      openDialog
      label="firstNamedDriverLicense"
      handleCloseDialog={handleCloseDialog}
      documents={documents.documents}
    />
  );
  expect(screen.getByText('fileBrowseModal.viewDocument')).toBeInTheDocument();
  expect(screen.getByTestId('pdf-preview')).toBeInTheDocument();

  // secondNamedDriverLicense is image and should show image preview
  rerender(
    <FileBrowseModal
      openDialog
      label="secondNamedDriverLicense"
      handleCloseDialog={handleCloseDialog}
      documents={documents.documents}
    />
  );

  expect(screen.getByTestId('image-preview')).toBeInTheDocument();
});

test('should <FileBrowseModal/> show drop file zone when user click unuploaded document section', async () => {
  render(
    <FileBrowseModal
      openDialog
      label="firstNamedDriverLicense"
      handleCloseDialog={handleCloseDialog}
      documents={documents.documents}
    />
  );

  const previewBtn = screen.getAllByTestId('preview-add-btn')[0];
  await userEvent.click(previewBtn);

  expect(screen.getByText('text.dragAndDropFile')).toBeInTheDocument();
});

test('should <FileBrowseModal/> allow to download and deleted the uploaded document', async () => {
  render(
    <FileBrowseModal
      openDialog
      label="firstNamedDriverLicense"
      handleDeleteDocument={handleDeleteDocument}
      handleCloseDialog={handleCloseDialog}
      documents={documents.documents}
    />
  );

  const deleteBtn = screen.getAllByTestId('delete-btn')[1];
  await userEvent.click(deleteBtn);

  const confirmBtn = screen.getByText('text.confirmButton');

  await userEvent.click(confirmBtn);
  expect(handleDeleteDocument).toHaveBeenCalled();

  const downloadBtn = screen.getAllByTestId('download-btn')[1];
  await userEvent.click(downloadBtn);
  expect(mockDownloadFromBlobURL).toHaveBeenCalled();
});

test('should <FileBrowseModal/> preview custom fields(aka others) files', async () => {
  render(
    <FileBrowseModal
      openDialog
      label="firstNamedDriverLicense"
      handleCloseDialog={handleCloseDialog}
      documents={documents.documents}
    />
  );

  expect(screen.getByTestId('pdf-preview')).toBeInTheDocument();

  const previewBtn = screen.getAllByTestId('preview-custom-field-btn')[0];
  expect(previewBtn).toBeInTheDocument();

  await userEvent.click(previewBtn);
  expect(screen.getByTestId('image-preview')).toBeInTheDocument();
});

test('should <FileBrowseModal/> preview lastly uploaded file', () => {
  const otherFile = documents.documents[0];
  render(
    <FileBrowseModal
      openDialog
      label="firstNamedDriverLicense"
      handleCloseDialog={handleCloseDialog}
      documents={documents.documents}
      isOtherDocuments
      listFiles={[
        {
          file: otherFile.name,
          fileName: otherFile.label,
          label: otherFile.label.split('-')[0],
          documentType: 'DOCUMENT_TYPE_OTHERS',
        },
      ]}
    />
  );

  expect(screen.getByText('Other')).toBeInTheDocument();
});
test('should <FileBrowseModal/> preview loader', () => {
  render(
    <FileBrowseModal
      openDialog
      label="firstNamedDriverLicense"
      handleCloseDialog={handleCloseDialog}
      documents={[]}
      isOtherDocuments
      isLoading
    />
  );

  expect(screen.getByTestId('file-loading')).toBeInTheDocument();
});
