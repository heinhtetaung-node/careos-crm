import { HttpResponse, http } from 'msw';
import React from 'react';
import * as Redux from 'react-redux';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';

import CallSummarySection from './CallSummarySection';

const leadId = 'leads/f6f09f02-77c5-4003-9a55-d03bbe91fda0';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: React.PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);
const mockStore = configureMockStore();

jest.mock('data/slices/leadDetails/callSummarySlice', () => ({
  useLazyGetCallSummaryQuery: jest.fn().mockReturnValue([
    jest.fn().mockReturnValue({
      isUninitialized: false,
      isSuccess: true,
      data: {
        callSummary: {
          attempts: 1,
          connects: 2,
          totalDuration: 3,
        },
      },
    }),
  ]),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue([
    {
      phone: '+92310231332',
    },
  ]),
}));

const initialState = {
  leadsDetailReducer: {
    callReducer: {
      data: { callStatus: CallStatus.End },
    },
  },
};

const store = mockStore(initialState);

describe('<CallSummarySection Component/>', () => {
  it('will be mounted correctly', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/gff/v1alpha1/FakeLeadId/callStats`,
        () =>
          HttpResponse.json({
            callSummary: {
              attempts: 1,
              connects: 2,
              totalDuration: 3,
            },
          })
      )
    );

    render(
      <Redux.Provider store={store as any}>
        <CallSummarySection id={leadId} />
      </Redux.Provider>,
      { wrapper }
    );
    await waitFor(() => {
      expect(screen.getByText('text.totalCall')).toBeInTheDocument();
    });
  });
});
