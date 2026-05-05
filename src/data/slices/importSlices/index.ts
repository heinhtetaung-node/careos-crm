import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import _omit from 'lodash/omit';
import { fromFetch } from 'rxjs/fetch';
import { firstValueFrom } from 'rxjs';

import { updateTokenList } from 'data/gateway/api/helper/queryString.helper';
import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import generateQueryParams from 'shared/helper/QueryParams';
import { buildUrl } from 'utils/url';
import { getString } from 'presentation/theme/localization';

import getFormatterFunction, { UnsupportedCharacters } from './helper';
import { Upload } from './interface';

import userSlice from '../userSlice';

const tagAddedSlice = apiSlice.enhanceEndpoints({
  addTagTypes: ['UPLOAD_FILE'],
});

const leadImportSlice = tagAddedSlice.injectEndpoints({
  endpoints: (build) => ({
    getImportHistory: build.query<any, any>({
      async queryFn(_args, _queryApi, _extraOptions, fetchWithBQ) {
        const { queryParams, listPageToken, tableType } = _args;
        const prepareObj = _omit(queryParams, ['currentPage', 'showDeleted']);

        const importHistory: any = await fetchWithBQ(
          buildUrl(baseUrls.salesFlow, {
            path: `${basePaths.import}?${generateQueryParams(prepareObj)}`,
          })
        );

        if (importHistory?.data) {
          const nextPageToken = importHistory.data.nextPageToken || '';
          const formatterFunction = getFormatterFunction(tableType);

          if (importHistory.data.imports.length) {
            try {
              const importHistoryWithName = importHistory.data.imports.map(
                async (history: any) => {
                  if (history.createBy !== '') {
                    try {
                      const userName = await _queryApi
                        .dispatch(
                          userSlice.endpoints.getUserByUserId.initiate(
                            history.createBy
                          )
                        )
                        .unwrap();
                      return {
                        ...history,
                        createBy: `${userName.firstName} ${userName.lastName}`,
                      };
                    } catch (e) {
                      const err = e as Error;
                      newrelic?.noticeError?.(err);
                      return {
                        ...history,
                        createBy: '-',
                      };
                    }
                  }

                  return {
                    ...history,
                    createBy: '',
                  };
                }
              );

              const importHistoryWithUserName: any = await Promise.all(
                importHistoryWithName
              ).then((res: any) => res);

              const formattedHistory = importHistoryWithUserName.length
                ? formatterFunction(importHistoryWithUserName)
                : [];

              return {
                data: {
                  imports: formattedHistory,
                  nextPageToken,
                  pageIndex: queryParams.currentPage,
                  ...queryParams,
                  listPageToken: updateTokenList(
                    queryParams.currentPage + 1,
                    importHistory.data.nextPageToken,
                    listPageToken
                  ),
                },
              };
            } catch (error) {
              return { error: error as FetchBaseQueryError };
            }
          }

          return {
            data: {
              imports: [],
              nextPageToken,
              pageIndex: queryParams.currentPage,
              ...queryParams,
              listPageToken: updateTokenList(
                queryParams.currentPage + 1,
                importHistory.data.nextPageToken,
                listPageToken
              ),
            },
          };
        }
        return { error: importHistory.error as FetchBaseQueryError };
      },
      providesTags: ['UPLOAD_FILE'],
    }),
    importFile: build.mutation<any, Upload>({
      async queryFn(_args, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          if (UnsupportedCharacters.test(_args.file.name)) {
            throw new Error(getString('errors.invalidFilename'));
          }

          const createUpload = (await fetchWithBQ({
            url: buildUrl(baseUrls.salesFlow, { path: basePaths.import }),
            method: 'POST',
            body: {
              filename: _args.file.name,
              importType: _args.importType,
              packageDetails: _args?.packageDetails,
              autoassign_details: _args?.autoAssignDetails,
              agent_discount_rule_details: _args?.agent_discount_rule_details,
              customerDetails: _args?.customerDetails,
              product: _args.product,
              orderStatusDetails: _args?.orderStatusDetails,
              leadDetails: _args?.leadDetails,
            },
          })) as any;

          if (createUpload.error) {
            throw new Error('Create upload fail!');
          }

          const importId = createUpload.data?.name?.split('/')[1];
          const uploadCredentials = (await fetchWithBQ({
            url: buildUrl(baseUrls.salesFlow, {
              path: `${basePaths.import}/${importId}:generateUploadUrl`,
            }),
            method: 'PUT',
          })) as any;

          if (uploadCredentials.error) {
            throw new Error('Getting credentials fail!');
          }

          await firstValueFrom(
            fromFetch(uploadCredentials.data?.url as string, {
              headers: uploadCredentials.data?.headers,
              method: 'PUT',
              body: _args.file,
            })
          );

          return {
            data: {
              message: 'Success',
            },
          } as any;
        } catch (err: any) {
          return {
            error: err.message || 'Something went wrong!',
          };
        }
      },
      invalidatesTags: ['UPLOAD_FILE'],
    }),
  }),
});

export const { useLazyGetImportHistoryQuery, useImportFileMutation } =
  leadImportSlice;
