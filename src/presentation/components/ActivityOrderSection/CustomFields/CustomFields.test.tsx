import React from 'react';

import { render, screen } from '__tests__/rtl-test-utils';

import { filterOtherDocuments } from './helpers';

import CustomFields from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({ orderId: '123' }),
}));

test('renders CustomFields successfully', () => {
  render(<CustomFields documents={[]} />);
  expect(screen.getByTestId('document-upload__custom-fields')).toBeTruthy();
});

test('run filterOtherDocuments successfully', () => {
  const input = [
    {
      type: 'DOCUMENT_TYPE_ID_CARD',
    },
    {
      type: 'DOCUMENT_TYPE_OTHERS',
    },
  ];
  const output = [
    {
      type: 'DOCUMENT_TYPE_OTHERS',
    },
  ];
  expect(filterOtherDocuments(input)).toEqual(output);
});
