import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import * as React from 'react';

import { server } from '__mocks__/server';
import { render } from '__tests__/rtl-test-utils';
import mockLeadImportHistoryData from 'mock-data/LeadImportHistory.mock';
import mockUserData from 'mock-data/UserData.mock';

import ImportLeadPage from '.';
import {
  leadImportColumns,
  leadImportOptionalColumns,
  leadImportRequiredColumns,
} from './ImportLeadPageHelper';

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: {
      role: 'roles/admin',
    },
  })),
}));

describe('LeadImportPage', () => {
  it('configures Redbook ID as optional and keeps Remark in the car lead template', () => {
    expect(leadImportColumns).toContain('Remark');
    expect(leadImportColumns).toContain('Redbook ID');
    expect(leadImportRequiredColumns).not.toContain('Redbook ID');
    expect(leadImportOptionalColumns).toContain('Redbook ID');
  });

  it('renders the page correctly', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-import/v1alpha1/imports`,
        async () => HttpResponse.json(mockLeadImportHistoryData)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/fakeUserId`,
        () => HttpResponse.json(mockUserData)
      )
    );
    render(<ImportLeadPage />);
    await Promise.resolve(true);
    await waitForElementToBeRemoved(
      screen.getAllByTestId('data-table-skeleton')
    );

    expect(screen.getByTestId('import-lead-page')).toBeInTheDocument();
    expect(screen.getByTestId('leads-table-component')).toBeInTheDocument();
    expect(
      screen.getByTestId('leads-top-pagination-component')
    ).toBeInTheDocument();
  });
});
