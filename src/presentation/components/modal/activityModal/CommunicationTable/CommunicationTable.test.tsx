import userEvent from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';

import CommunicationTable from '.';

const mockErrorShow = jest.fn();
const mockSuccessShow = jest.fn();

jest.mock('utils/snackbar', () =>
  jest.fn().mockImplementation(() => ({
    showErrorSnackbar: mockErrorShow,
    showSuccessSnackbar: mockSuccessShow,
  }))
);

jest.mock('data/slices/authSlice', () => {
  const originalModule = jest.requireActual('data/slices/authSlice');
  return {
    __esModule: true,
    ...originalModule,
    useGetAuthenticateQuery: () => ({
      data: {
        role: 'roles/admin',
      },
      isLoading: false,
    }),
  };
});

global.URL.createObjectURL = jest
  .fn()
  .mockReturnValue('https://www.google.com');
global.URL.revokeObjectURL = jest.fn();

const mockedCommunicationResponse = {
  data: [
    {
      type: 'email',
      communication: {
        name: 'leads/68fb1d17-4a93-49db-9734-48df02091373/mails/98d30cfa-5060-4b00-bfc4-4670c83cea2c',
        createTime: '2022-03-30T10:57:36.390139Z',
        createBy: 'users/c8d01c06-3e2a-4faa-a719-decf701125ab',
        updateTime: null,
        deleteTime: null,
      },
    },
    {
      type: 'call',
      communication: {
        name: 'calls/6e178e83-010d-41f2-979d-2460beafe53f',
        createTime: '2022-03-30T05:26:05.854228Z',
        createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
        updateTime: '2022-03-30T05:26:05.854228Z',
        deleteTime: '2022-03-30T05:26:19.356002Z',
      },
    },
  ],
};

describe('<CommunicationTable />', () => {
  beforeEach(() => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/bff/api/users/lookup`,
        () =>
          HttpResponse.json([
            {
              key: 'users/e52fd0c1-aee8-41f9-9d45-336a7049db76',
              value: 'Admin Support',
            },
            {
              key: 'users/c8d01c06-3e2a-4faa-a719-decf701125ab',
              value: 'Admin Training',
            },
            {
              key: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
              value: 'Alex Stansfield',
            },
          ])
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/mailer/v1alpha1/leads/leadId/mails`,
        () =>
          HttpResponse.json({
            mails: [
              {
                body: 'body',
                bodyText: 'body text',
                cc: [],
                createTime: '2022-05-30T06:29:15.911080Z',
                createdBy: '',
                deleteTime: null,
                emailAddress: 'danielb@rabbit.co.th',
                emailIndex: -1,
                name: 'leads/cb10cf6a-b115-4f89-b864-1c39eb6a8b2c/mails/aa0bcee5-4658-4b65-b893-e131477b9b3a',
                parentId: '0f7bd800-3c98-4109-8674-e1efb36be6a4',
                read: true,
                subject:
                  'Re:Rabbit Care - Thank you for Intehttped in the Insurance Products L9860798',
                type: 'INBOUND',
                updateTime: null,
              },
            ],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/sms/v1alpha1/leads/leadId/smses`,
        () =>
          HttpResponse.json({
            smses: [
              {
                createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
                createTime: '2022-05-25T05:26:16.890163Z',
                message: 'haha',
                name: 'leads/000335da-2194-4786-a717-3d4e7eb473c2/sms/49ab2ca4-8197-4409-a785-9e66df32625a',
                phone: '+66999999999',
                phoneIndex: 0,
                status: 'PENDING',
                title: 'test 2',
              },
              {
                createBy: '',
                createTime: '2022-05-25T05:26:16.890163Z',
                message: 'haha',
                name: 'leads/000335da-2194-4786-a717-3d4e7eb473c2/sms/49ab2ca4-8197-4409-a785-9e66df32625a',
                phone: '+66999999999',
                phoneIndex: 0,
                status: 'PENDING',
                title: 'test 3',
              },
            ],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/calls/-/participants`,
        () =>
          HttpResponse.json({
            participants: [],
          })
      )
    );
  });

  test('renders CommunicationTable successfully', () => {
    // mock the lookup api calls
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/bff/api/users/lookup`,
        () =>
          HttpResponse.json([
            {
              key: 'users/e52fd0c1-aee8-41f9-9d45-336a7049db76',
              value: 'Admin Support',
            },
            {
              key: 'users/c8d01c06-3e2a-4faa-a719-decf701125ab',
              value: 'Admin Training',
            },
            {
              key: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
              value: 'Alex Stansfield',
            },
          ])
      )
    );

    const { getByTestId } = render(<CommunicationTable id="xyz" />);

    expect(getByTestId('communication-table')).toBeTruthy();
    expect(getByTestId('communication-table-headerName').children.length).toBe(
      8
    );
    expect(
      getByTestId('communication-table-headerName-text.noDots')
    ).toBeTruthy();
    expect(
      getByTestId('communication-table-headerName-text.date')
    ).toBeTruthy();
    expect(
      getByTestId('communication-table-headerName-text.name')
    ).toBeTruthy();
    expect(
      getByTestId('communication-table-headerName-text.type')
    ).toBeTruthy();
    expect(getByTestId('communication-table-headerName-text.to')).toBeTruthy();
    expect(
      getByTestId('communication-table-headerName-text.callDuration')
    ).toBeTruthy();
    expect(
      getByTestId('communication-table-headerName-text.voiceFile')
    ).toBeTruthy();
  });

  test('render spinner while loading', () => {
    server.use(
      http.get(
        `${process.env.VITE_GATEWAY_ENDPOINT}/api/leads/leadId/communication`,
        async () => {
          await delay(300);
          return HttpResponse.json(mockedCommunicationResponse);
        }
      )
    );
    render(<CommunicationTable id="leadId" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should show no data if empty result is return', async () => {
    server.use(
      http.get(
        `${process.env.VITE_GATEWAY_ENDPOINT}/api/leads/leadId/communication`,
        () => HttpResponse.json([])
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/mailer/v1alpha1/leads/leadId/mails`,
        () =>
          HttpResponse.json({
            mails: [],
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/sms/v1alpha1/leads/leadId/smses`,
        () =>
          HttpResponse.json({
            smses: [],
          })
      )
    );
    render(<CommunicationTable id="leadId" />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    expect(screen.getByText('text.noData')).toBeInTheDocument();
  });

  test('should show pagination if data is present', async () => {
    render(<CommunicationTable id="leadId" />);
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    expect(screen.getByText('text.entries')).toBeInTheDocument();
  });

  describe('tc-745 feature flag is on', () => {
    beforeEach(() => {
      server.use(
        http.get(
          `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId/callHistory`,
          () =>
            HttpResponse.json({
              participants: [
                {
                  name: 'calls/b8a85480-481d-49d9-bb18-8bf1e7420279/participants/0581e094-9446-4b5f-a774-13189d07a44d',
                  createTime: '2022-01-11T09:57:02.580705Z',
                  updateTime: '2022-01-11T09:57:11.330450Z',
                  deleteTime: null,
                  createBy: 'users/3f56b291-39cc-4d60-8a80-e203d9cff641',
                  destination: {
                    lead: {
                      lead: 'leads/0d533ba0-a7bf-4f30-b0b8-6b178ff63835',
                      phoneIndex: 1,
                    },
                  },
                  outgoing: true,
                  phone: '+66869117638',
                  joinTime: '2022-01-11T09:57:11.304377Z',
                  state: 'JOINED',
                },
                {
                  name: 'calls/b8a85480-481d-49d9-bb18-8bf1e7420279/participants/0581e094-9446-4b5f-a774-13189d07a44d',
                  createTime: '2022-01-11T09:57:02.580705Z',
                  updateTime: '2022-01-11T09:57:11.330450Z',
                  deleteTime: null,
                  createBy: 'users/3f56b291-39cc-4d60-8a80-e203d9cff641',
                  destination: {
                    lead: {
                      lead: 'leads/0d533ba0-a7bf-4f30-b0b8-6b178ff63835',
                      phoneIndex: 1,
                    },
                  },
                  outgoing: true,
                  phone: '+66869117638',
                  joinTime: '2022-01-11T09:57:11.304377Z',
                  state: 'JOINED',
                },
              ],
            })
        ),
        http.get(
          `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/calls/:callId`,
          () =>
            HttpResponse.json({
              name: 'calls/511712d3-c017-42d4-b5a6-9052328332b5',
              createTime: '2022-01-11T09:55:17.449229Z',
              updateTime: '2022-01-11T09:55:17.449229Z',
              deleteTime: '2022-01-11T09:55:57.874449Z',
              createBy: 'users/3f56b291-39cc-4d60-8a80-e203d9cff641',
            })
        ),
        http.get(
          `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/:callId`,
          () =>
            HttpResponse.json({
              name: 'users/3f56b291-39cc-4d60-8a80-e203d9cff641',
              createTime: '2022-01-07T12:41:53.706275Z',
              updateTime: '2022-01-12T09:08:28.307976Z',
              deleteTime: null,
              createBy: 'users/6f35b998-c1e0-4dea-bd0b-ee3a008242f9',
              humanId: 'kannaporna@rabbit.co.th',
              role: 'roles/sales',
              firstName: 'Kannaporn',
              lastName: 'Adulpravitchai',
              annotations: {},
              loginTime: '2022-01-12T09:08:28.305275Z',
            })
        ),
        http.get(
          `${process.env.VITE_API_ENDPOINT}/api/call/v1alpha1/calls/:callId/recording`,
          () => {
            const testAudioFile = new File(['hello'], 'audio.wav', {
              type: 'audio/x-wav',
            });
            const response = new HttpResponse(testAudioFile);
            response.headers.set('Content-Type', 'audio/x-wav');
            return response;
          }
        )
      );
    });

    it.skip('should call the callHistory endpoint and can download the file', async () => {
      render(<CommunicationTable id="leadId" />);

      await waitFor(() => {
        expect(screen.queryAllByText('Kannaporn Adulpravitchai'));
      });
      expect(screen.queryAllByTestId('voice-download-button'));

      await userEvent.click(
        screen.queryAllByTestId('voice-download-button')[0]
      );

      await waitFor(() => {
        expect(mockSuccessShow).toHaveBeenCalled();
      });
    });

    it('should download all files', async () => {
      const finishDownload = jest.fn();
      render(
        <CommunicationTable
          id="leadId"
          downlaodAllRecordings
          handleFinishDownload={finishDownload}
        />
      );

      await waitFor(() => {
        expect(screen.queryAllByText('Kannaporn Adulpravitchai'));
      });
      expect(screen.queryAllByTestId('voice-download-button'));

      await waitFor(() => {
        expect(finishDownload).toHaveBeenCalled();
      });
    });
  });
});
