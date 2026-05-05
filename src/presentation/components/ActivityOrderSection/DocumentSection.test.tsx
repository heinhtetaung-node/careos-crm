import { fireEvent } from '@testing-library/react';
import React from 'react';

import { ComponentWithProvider, render } from '__tests__/rtl-test-utils';

import DocumentSection from './DocumentSection';

describe('<DocumentSection/>', () => {
  const documents = [
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
    {
      name: 'orders/5d2df7d2-6f27-47cd-9bc2-118d2e525b6c/documents/9edbae9a-90de-4f45-8e08-2e3cb2fb657a',
      createTime: '2021-12-15T07:48:37.373801617Z',
      updateTime: '2021-12-15T07:48:37.373801617Z',
      deleteTime: null,
      createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
      document: 'documents/7ac2c466-052b-4c16-b36e-e227f33190c7',
      type: 'DOCUMENT_TYPE_FIRST_NAMED_DRIVING_LICENCE',
      label:
        'firstNamedDriverLicense-HD wallpaper_ Spirited Away characters illustration, Studio Ghibli, My Neighbor Totoro.jpeg',
      responseTimes: 359,
    },
    {
      name: 'orders/5d2df7d2-6f27-47cd-9bc2-118d2e525b6c/documents/1cc3f50a-c3f0-4f1a-9f89-7cea979e4af1',
      createTime: '2021-12-15T07:48:54.275067009Z',
      updateTime: '2021-12-15T07:48:54.275067009Z',
      deleteTime: null,
      createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
      document: 'documents/b0c65f25-7c3a-4264-a89e-c0d9d8522935',
      type: 'DOCUMENT_TYPE_SECOND_NAMED_DRIVING_LICENCE',
      label:
        'secondNamedDriverLicense-Chihiro and Haku (Spirited Away) Minimalist by Max028 on DeviantArt.jpeg',
      responseTimes: 350,
    },
  ];
  it('<DocumentSection/> render correctly', () => {
    const { getByTestId } = render(
      <ComponentWithProvider>
        <DocumentSection
          documents={documents}
          handleDeleteDocument={jest.fn()}
          handleUploadDocument={jest.fn()}
        />
      </ComponentWithProvider>
    );

    fireEvent.click(getByTestId('download-all-files'));

    expect(getByTestId('document-section')).toBeTruthy();
  });
});
