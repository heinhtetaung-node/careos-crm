import React from 'react';

import { render } from '__tests__/rtl-test-utils';

import LeadAllPage from '.';

jest.mock('data/slices/userSlice', () => ({
  ...jest.requireActual('data/slices/userSlice'),
  useGetUsersQuery: jest.fn(() => ({ data: [] })),
}));
describe.skip('<LeadAllPage Component/>', () => {
  it('will be mounted correctly', () => {
    render(
      <LeadAllPage
        setSelectedListView={function (listView: string): void {
          throw new Error('Function not implemented.');
        }}
        selectedListView="allLeads"
        currentUser={{
          role: 'roles/admin',
          name: 'Hein',
        }}
      />
    );
  });
});
