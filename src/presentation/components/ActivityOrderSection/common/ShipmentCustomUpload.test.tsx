import { FileSearchIcon } from '@alphafounders/icons';
import { Fab as MuiButton } from '@material-ui/core';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ComponentWithProvider, render } from '__tests__/rtl-test-utils';
import { getString } from 'presentation/theme/localization';

import CustomUploadFile from './CustomUploadFile';

import { FilesDownload, IUploadedDocument } from '../DocumentSection';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname:
      '/orders/7e9216af-1e3f-42ea-a5b9-17d1d53926a8g/policies/L9875307-2/printing-and-shipping',
    search: '',
    state: undefined,
    hash: '',
  }),
}));

const document = {
  documentType: 'DOCUMENT_TYPE_CARD',
  file: 'documents/2ccaf61a-659b-4f3b-ac57-4730d93f9882',
  fileName: 'card-Dash Cam Picture_&*.png',
  title: getString('leadDetailFields.vehiclePictureBack'),
  label: '',
};

test('<ShipmentCustomUploadFile/> will show <FileBrowseModal/> when user click preview button', async () => {
  // we have to use baseElement because dialog are render outside of this current wrapper
  const { baseElement, getByTestId } = render(
    <ComponentWithProvider>
      <CustomUploadFile
        title=""
        value=""
        handleUpdateListFiles={jest.fn()}
        handleDeleteDocument={jest.fn()}
        listFiles={[] as FilesDownload[]}
        document={document}
        label=""
        documents={[] as IUploadedDocument[]}
      >
        <CustomUploadFile.PreviewButton>
          {({ handleOpenCloseDialog }: any) => (
            <MuiButton
              data-testid="preview-btn"
              size="small"
              onClick={handleOpenCloseDialog}
            >
              <FileSearchIcon fontSize="small" color="primary" />
            </MuiButton>
          )}
        </CustomUploadFile.PreviewButton>
      </CustomUploadFile>
    </ComponentWithProvider>
  );
  const previewBtn = getByTestId('preview-btn');
  await userEvent.click(previewBtn);
  expect(
    within(baseElement as HTMLElement).getByTestId('shipment-file-browse-modal')
  ).toBeInTheDocument();
});
