import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';

import ShipmentFileBrowseModal from './ShipmentFileBrowseModal';

const docs = [
  {
    name: 'orders/5d2df7d2-6f27-47cd-9bc2-118d2e525b6c/documents/0f14edea-f95d-4871-9c7e-7ceecf6b6cbb',
    createTime: '2021-12-15T07:46:47.004453690Z',
    updateTime: '2021-12-15T07:46:47.004453690Z',
    deleteTime: null,
    createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
    document: 'documents/29f325a2-9262-4f89-93f1-7e71ddfca330',
    type: 'DOCUMENT_TYPE_POLICY',
    label: 'policyCertificate-Studio Ghibli Wallpaper 74 Pictures.jpeg',
    responseTimes: 590,
  },
  {
    name: 'orders/5d2df7d2-6f27-47cd-9bc2-118d2e525b6c/documents/0f14edea-f95d-4871-9c7e-7ceecf6b6cbb',
    createTime: '2021-12-15T07:46:47.004453690Z',
    updateTime: '2021-12-15T07:46:47.004453690Z',
    deleteTime: null,
    createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
    document: 'documents/29f325a2-9262-4f89-93f1-7e71ddfca330',
    type: 'DOCUMENT_TYPE_ID_CARD',
    label: 'idCard-Studio Ghibli Wallpaper 74 Pictures.jpeg',
    responseTimes: 590,
  },
];

function CompleteFileBrowseComponent() {
  return (
    <ShipmentFileBrowseModal
      openDialog
      handleCloseDialog={jest.fn()}
      handleDeleteDocument={jest.fn()}
      label="test"
      fileLink=""
      listFiles={[]}
      documents={docs}
      handleUpdateListFiles={jest.fn()}
      isDisabled={false}
      shipmentDocs={[
        {
          title: 'Card',
          value: DocumentType.DOCUMENT_TYPE_CARD,
          label: 'card',
        },
        {
          title: 'Policy Certificate',
          value: DocumentType.DOCUMENT_TYPE_POLICY,
          label: 'policyCertificate',
        },
      ]}
    />
  );
}

test('<ShipmentFileBrowseModal /> renders', async () => {
  render(<CompleteFileBrowseComponent />);

  const previewButtons = screen.getAllByTestId('preview-doc-btn');
  await userEvent.click(previewButtons[0]);

  expect(screen.getByTestId('shipment-file-browse-modal')).toBeInTheDocument();
  expect(screen.getByTestId('preview-image')).toBeInTheDocument();
});

test('<ShipmentFileBrowseModal /> renders with default values', async () => {
  const file = new File(['file'], 'ping.json', {
    type: 'application/json',
  });
  render(
    <ShipmentFileBrowseModal
      openDialog
      handleCloseDialog={jest.fn()}
      documents={docs}
      shipmentDocs={[
        {
          title: 'Card',
          value: DocumentType.DOCUMENT_TYPE_CARD,
          label: 'card',
        },
        {
          title: 'Policy Certificate',
          value: DocumentType.DOCUMENT_TYPE_POLICY,
          label: 'policyCertificate',
        },
      ]}
    />
  );
  const uploadBtn = screen.getByTestId('drop-input');
  fireEvent.click(uploadBtn);
  Object.defineProperty(uploadBtn, 'files', {
    value: [file],
  });

  fireEvent.drop(uploadBtn as HTMLElement);
  await waitFor(() => {
    expect(screen.queryByText('pine.json')).not.toBeInTheDocument();
  });
});
