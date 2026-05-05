import React from 'react';

import { fireEvent, render, screen } from '__tests__/rtl-test-utils';

import DocumentPreviewButton from './DocumentPreviewButton';
import { documents } from './ShipmentDocumentSection.test';

const handleOpenCloseDialog = jest.fn();

it('Test DocumentPreviewButton renders', () => {
  render(
    <DocumentPreviewButton
      field={{
        document: {
          file: 'documents/29f325a2-9262-4f89-93f1-7e71ddfca330',
          documentType: 'DOCUMENT_TYPE_ENDORSEMENT',
          fileName: 'endorsement-Studio Ghibli Wallpaper 74 Pictures.jpeg',
        },
        isRequired: true,
        label: 'endorsement',
        title: 'Endorsement',
        value: 'DOCUMENT_TYPE_ENDORSEMENT',
      }}
      uploadedDocs={documents}
      handleOpenCloseDialog={handleOpenCloseDialog}
    />
  );
  const btn = screen.getByRole('button');
  expect(btn).toBeInTheDocument();
  fireEvent.click(btn);
  expect(handleOpenCloseDialog).toHaveBeenCalled();
});
it('Test DocumentPreviewButton renders for Policy certificate with tooltip', async () => {
  jest.useFakeTimers();
  render(
    <DocumentPreviewButton
      field={{
        document: {
          file: 'documents/29f325a2-9262-4f89-93f1-7e71ddfca330',
          documentType: 'DOCUMENT_TYPE_POLICY',
          fileName:
            'policyCertificate-Studio Ghibli Wallpaper 74 Pictures.jpeg',
        },
        isRequired: true,
        label: 'policyCertificate',
        title: 'Policy',
        value: 'DOCUMENT_TYPE_POLICY',
      }}
      uploadedDocs={[
        ...documents,
        {
          name: 'orders/5d2df7d2-6f27-47cd-9bc2-118d2e525b6c/documents/0f14edea-f95d-4871-9c7e-7ceecf6b6cbb',
          createTime: '2021-12-15T07:46:47.004453690Z',
          updateTime: '2021-12-15T07:46:47.004453690Z',
          deleteTime: null,
          createBy: 'Test',
          document: 'documents/29f325a2-9262-4f89-93f1-7e71ddfca330',
          type: 'DOCUMENT_TYPE_POLICY',
          label: 'policyCertificate-Studio Ghibli Wallpaper 74 Pictures.jpeg',
          responseTimes: 590,
        },
      ]}
      handleOpenCloseDialog={handleOpenCloseDialog}
    />
  );
  const btn = screen.getByRole('button');
  expect(btn).toHaveAttribute('title');
});
