import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { isEmpty } from 'lodash';

import { baseUrls, apiSlice, basePaths } from 'data/slices/apiSlice';
import userSlice from 'data/slices/userSlice';
import { store } from 'presentation/redux/store';
import { intervalToDuration } from 'utils/datetime';
import { buildUrl } from 'utils/url';

import {
  CommunicationHistory,
  EmailResponse,
  ParticipantResponse,
  SmsResponse,
} from './interface';

interface CommunicationHistoryProps {
  leadId?: string;
  // Filters out the results until the latestCreateTime (inclusive).
}

const communicationSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getCommunicationHistory: build.query<
      CommunicationHistory[],
      CommunicationHistoryProps
    >({
      async queryFn({ leadId }, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const emailLogsPromise = (
            fetchWithBQ(
              buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.mailer}/leads/${leadId}/mails?pageSize=1000&filter=body!=""`,
              })
            ) as Promise<EmailResponse>
          ).then((res) =>
            res.data?.mails.map((mail: any) => ({
              name: mail.name,
              createTime: mail.createTime,
              createBy: mail.createdBy,
              updateTime: mail.updateTime,
              deleteTime: mail.deleteTime,
              communicationType: 'email',
              to: mail.emailAddress,
            }))
          );

          const smsLogsPromise = (
            fetchWithBQ(
              buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.sms}/leads/${leadId}/smses?pageSize=1000`,
              })
            ) as Promise<SmsResponse>
          ).then((res) =>
            res.data?.smses.map((sms: any) => ({
              name: sms.name,
              createTime: sms.createTime,
              createBy: sms.createBy,
              updateTime: sms.updateTime,
              deleteTime: sms.deleteTime,
              communicationType: 'sms',
              to: sms.phone,
            }))
          );

          // eslint-disable-next-line func-names
          const callLogsPromise = (async function () {
            const participants = await fetchWithBQ(
              buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.call}/calls/-/participants?showDeleted=true&filter=destination.lead.lead="leads/${leadId}"&pageSize=1000`,
              })
            );
            const callsPromises = (
              participants.data as ParticipantResponse
            )?.participants.map((participant) => ({
              name: participant.name,
              createTime: participant.createTime,
              createBy: participant.createBy,
              updateTime: participant.updateTime,
              deleteTime: participant.deleteTime,
              communicationType: 'call',
              to: participant.phone,
            }));
            const calls = await Promise.all(callsPromises);
            return calls;
          })();

          const resp = await Promise.all([
            emailLogsPromise,
            smsLogsPromise,
            callLogsPromise,
          ]);
          const sortedLogs = Array(...[])
            .concat(...resp)
            .sort((a, b) =>
              new Date(b.createTime).getTime() >
              new Date(a.createTime).getTime()
                ? 1
                : -1
            );

          const communicationHistoryPromises = sortedLogs.map(
            async (communicationHistory: any, index: number) => {
              const newCommunicationHistory = {
                ...communicationHistory,
                id: index + 1,
              };
              if (!isEmpty(communicationHistory.createBy)) {
                try {
                  const response = await store
                    .dispatch(
                      userSlice.endpoints.getUserByUserId.initiate(
                        communicationHistory.createBy
                      ) as any
                    )
                    .unwrap();
                  newCommunicationHistory.createBy = `${response.firstName} ${response.lastName}`;
                } catch (e) {
                  const err = e as Error;
                  newrelic?.noticeError?.(err);
                  newCommunicationHistory.createBy = '-';
                }
              }

              if (communicationHistory.communicationType === 'call') {
                if (communicationHistory.deleteTime) {
                  newCommunicationHistory.duration = intervalToDuration({
                    start: new Date(communicationHistory.createTime),
                    end: new Date(communicationHistory.deleteTime),
                  });
                } else {
                  const response = await fetchWithBQ(
                    buildUrl(baseUrls.salesFlow, {
                      path: `${basePaths.call}/calls/${communicationHistory.name.split('/')?.[1]}?showDeleted=true`,
                    })
                  );
                  const { deleteTime } = response?.data as any;

                  newCommunicationHistory.duration = intervalToDuration({
                    start: new Date(communicationHistory.createTime),
                    end: new Date(deleteTime),
                  });
                }
              }
              return newCommunicationHistory;
            }
          );

          const communicationHistoryWithUserName: any = await Promise.all(
            communicationHistoryPromises
          );

          return {
            data: communicationHistoryWithUserName,
          };
        } catch {
          return {
            error: {
              status: 'FETCH_ERROR',
              error: 'Something went wrong',
            } as FetchBaseQueryError,
          };
        }
      },
    }),
    callTranscribe: build.mutation<any, { callId: string }>({
      query: ({ callId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.careAi}/calls/${callId}:transcribe`,
        }),
        method: 'POST',
        body: {},
      }),
    }),
    callTranslation: build.mutation<any, { transcriptionId: string }>({
      query: ({ transcriptionId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.careAi}/${transcriptionId}:translate`,
        }),
        method: 'POST',
        body: {},
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const {
  useGetCommunicationHistoryQuery,
  useCallTranscribeMutation,
  useCallTranslationMutation,
} = communicationSlice;
