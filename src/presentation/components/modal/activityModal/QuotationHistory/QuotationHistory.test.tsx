import React from 'react';
import { of } from 'rxjs';

import { render, screen } from '__tests__/rtl-test-utils';

import QuotationHistory from '.';

const mockedResponse = () =>
  of({
    data: {
      code: 200,
      data: [
        {
          name: 'Fake Name',
          link: 'https://staging-finance.rabbitinternet.com/t/FdRThLi9QmCrP59zzzydXA',
          createTime: '2022-01-30T04:12:27.110054Z',
          expireTime: '2023-02-02T04:12:27.110054Z',
          createdBy: '',
          document: 'documents/d5054a9c-d73a-4bc9-abbc-dc526503e932',
        },
        {
          name: 'Fake Name 1',
          link: 'https://staging-finance.rabbitinternet.com/t/JDzMStNMRUqsxMSgqk68kQ',
          createTime: '2022-02-11T01:20:27.110054Z',
          expireTime: '2023-01-14T09:20:27.110054Z',
          createdBy: '',
          document: 'documents/d5054a9c-d73a-4bc9-abbc-dc526503e932',
        },
        {
          name: 'Fake Name 2',
          link: 'https://staging-finance.rabbitinternet.com/t/iKICu5e_RPi8wxdfx6m6mw',
          createTime: '2022-05-20T12:20:27.110054Z',
          expireTime: '2022-06-19T23:20:27.110054Z',
          createdBy: '',
          document: 'documents/d5054a9c-d73a-4bc9-abbc-dc526503e932',
        },
        {
          name: 'Fake Name 3',
          link: null,
          createTime: '2022-01-05T04:12:27.110054Z',
          expireTime: '2023-02-12T04:12:27.110054Z',
          createdBy: '',
          document: 'documents/d5054a9c-d73a-4bc9-abbc-dc526503e932',
        },
      ],
    },
  });

jest.mock('data/gateway/api/services/lead', () => {
  return jest.fn().mockImplementationOnce(() => ({
    getQuotationHistory: mockedResponse,
  }));
});

test('renders QuotationHistory successfully', () => {
  render(<QuotationHistory id="fakeId" />);

  expect(screen.getByTestId('quotation-history-table')).toBeTruthy();
  expect(
    screen.getByTestId('quotation-history-table-headers-row').children.length
  ).toBe(5);
  expect(screen.getByTestId('quotation-history-table-id')).toBeTruthy();
  expect(screen.getByTestId('quotation-history-table-createTime')).toBeTruthy();
  expect(screen.getByTestId('quotation-history-table-link')).toBeTruthy();
  expect(screen.getByTestId('quotation-history-table-expireTime')).toBeTruthy();
});
