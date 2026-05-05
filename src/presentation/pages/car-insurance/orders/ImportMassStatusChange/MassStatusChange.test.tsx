/* eslint-disable arrow-body-style */
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, within } from '__tests__/rtl-test-utils';
import LeadImportHistory from 'mock-data/LeadImportHistory.mock';

import ImportMassStatusChange from './ImportMassStatusChange';

beforeEach(() => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports`,
      () => {
        return HttpResponse.json(LeadImportHistory);
      }
    )
  );
});

test('should mass status change component should render', async () => {
  render(<ImportMassStatusChange />);
  expect(
    await screen.findByTestId('test-mass-import-page')
  ).toBeInTheDocument();
  const btn = await screen.findByText(
    'order.massAssign.importMassStatusChange'
  );
  expect(btn).toBeInTheDocument();

  // click btn to open ImportModal
  await userEvent.click(btn);
  const importModal = screen.getByRole('dialog');
  expect(importModal).toBeInTheDocument();
  expect(
    within(importModal).getByText('text.cancelButton')
  ).toBeInTheDocument();
  expect(
    within(importModal).getByText('text.confirmImport')
  ).toBeInTheDocument();
});
