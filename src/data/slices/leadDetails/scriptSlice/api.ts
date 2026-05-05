import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import has from 'lodash/has';

import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import userSlice from 'data/slices/userSlice';
import generateQueryParams from 'shared/helper/QueryParams';
import { buildUrl } from 'utils/url';

import {
  ScriptResponse,
  ScriptResponseType,
  SaveScriptRequestPayload,
  FetchScriptRequestProps,
  FetchScriptResponsePayload,
} from './interface';

const scriptSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateScript: builder.mutation<ScriptResponse, string>({
      query: (leadId) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/${leadId}:generateScriptWithPricing`,
        }),
        method: 'GET',
        params: {
          includeCustomQuote: true,
        },
      }),
    }),
    saveScript: builder.mutation<ScriptResponseType, SaveScriptRequestPayload>({
      query: ({ text, leadId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/lead/v1alpha2/${leadId}/scripts`,
        }),
        method: 'POST',
        body: { text },
      }),
    }),
    fetchScripts: builder.query<
      FetchScriptResponsePayload,
      FetchScriptRequestProps
    >({
      async queryFn(_args, _queryApi, _extraOptions, fetchWithBQ) {
        const { leadId, scriptParams } = _args;

        const scripts = await fetchWithBQ(
          buildUrl(baseUrls.salesFlow, {
            path: `/api/lead/v1alpha2/${leadId}/scripts?${generateQueryParams(
              scriptParams
            )}`,
          })
        );

        if (has(scripts, 'error')) {
          return { error: scripts.error as FetchBaseQueryError };
        }

        const data = scripts.data as FetchScriptResponsePayload;

        if (data?.scripts?.length) {
          try {
            const scriptsWithName = data.scripts.map(
              async (script: ScriptResponseType) => {
                let createBy = '';
                if (script.createBy !== '') {
                  try {
                    const userName = await _queryApi
                      .dispatch(
                        userSlice.endpoints.getUserByUserId.initiate(
                          script.createBy as string
                        )
                      )
                      .unwrap();
                    createBy = `${userName.firstName} ${userName.lastName}`;
                  } catch (e) {
                    const err = e as Error;
                    newrelic?.noticeError?.(err);
                    createBy = '-';
                  }
                }

                return {
                  ...script,
                  createBy,
                };
              }
            );

            const scriptsWithUserName: any = await Promise.all(scriptsWithName);

            return {
              data: {
                scripts: [...scriptsWithUserName],
                nextPageToken: data.nextPageToken,
              },
            };
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
        }

        return {
          data: {
            scripts: data.scripts,
            nextPageToken: data.nextPageToken,
          },
        };
      },
    }),
  }),
});

export const {
  useGenerateScriptMutation,
  useSaveScriptMutation,
  useLazyFetchScriptsQuery,
} = scriptSlice;
