import { format } from 'date-fns';
import getApiEndpoint from 'utils/endpointHelper';

import {
  IntegrationResultTransformResponse,
  IntegrationResultPayload,
  IntegrationResultResponse,
} from './types';

import { apiSlice } from '../apiSlice';

const insurerIntegrations = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getIntegrationResult: build.query<
      IntegrationResultTransformResponse,
      IntegrationResultPayload
    >({
      query: ({ policy }) => ({
        url: getApiEndpoint(
          `api/insurer-integrations/v1alpha1/${policy}/submissions`
        ),
      }),
      transformResponse(resp: IntegrationResultResponse) {
        const submissions = resp.submissions.map((submission, idx) => {
          let dumpMessage;
          try {
            dumpMessage = JSON.stringify(JSON.parse(submission.result));
          } catch (e) {
            dumpMessage = submission.result;
          }
          const formattedDate = format(
            new Date(submission.updateTime),
            'dd/MM/yyyy'
          ); // for now, submission.updateTime was used for both request date and response date
          const formattedTime = format(new Date(submission.updateTime), 'pp');
          return {
            no: idx + 1,
            name: submission.name,
            requestDate: formattedDate,
            requestTime: formattedTime,
            action: submission?.action ?? '-',
            status: submission?.status ?? '-',
            responseMessage: dumpMessage,
            responseMessageRaw: submission.result,
            responseDate: formattedDate,
            responseTime: formattedTime,
          };
        });
        return { submissions };
      },
    }),
  }),
});

export const {
  useGetIntegrationResultQuery,
  useLazyGetIntegrationResultQuery,
} = insurerIntegrations;
