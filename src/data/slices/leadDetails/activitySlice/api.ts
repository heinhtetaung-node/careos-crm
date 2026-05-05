import { updateTokenList } from 'data/gateway/api/helper/queryString.helper';
import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { transformOrderResponse } from 'data/slices/orderSlice/helper';
import userSlice from 'data/slices/userSlice';
import { store } from 'presentation/redux/store';
import { buildUrl } from 'utils/url';

import {
  Activities,
  Activity,
  ActivityType,
  ResourceHistoryRequest,
  ResponseData,
} from './interface';

const activitySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<any, any>({
      query: (queryParams) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/${queryParams.leadId}/activities`,
        }),
        params: {
          pageSize: queryParams?.allActivityParams?.pageSize,
          pageToken: queryParams?.allActivityParams?.pageToken,
        },
        method: 'GET',
      }),
      // eslint-disable-next-line consistent-return
      transformResponse: async (response: ResponseData) => {
        if (response?.activities.length) {
          const activityWithName = response.activities.map(
            async (activity: Activity) => {
              let userName = '';
              let userId;
              let type: ActivityType | undefined;
              switch (Object.keys(activity).toString()) {
                case 'comment':
                  type = 'comment';
                  userId = activity?.comment?.createBy;
                  break;
                case 'remark':
                  type = 'remark';
                  break;
                case 'script':
                  type = 'script';
                  userId = activity?.script?.createBy;
                  break;
                default:
                  break;
              }
              if (userId) {
                try {
                  const resp = await store
                    .dispatch(
                      userSlice.endpoints.getUserByUserId.initiate(
                        userId
                      ) as any
                    )
                    .unwrap();
                  userName = `${resp.firstName} ${resp.lastName}`;
                } catch (e) {
                  const err = e as Error;
                  newrelic?.noticeError?.(err);
                  userName = '-';
                }
              }
              return {
                ...activity,
                createBy: userName,
                type,
              };
            }
          );
          const activitiesWithUserName: Activities =
            await Promise.all(activityWithName);
          return {
            activities: activitiesWithUserName,
            nextPageToken: response?.nextPageToken,
          };
        }
      },
    }),
    getResourceHistory: builder.query<unknown, ResourceHistoryRequest>({
      query: ({ queryParams }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/${queryParams.leadId}/resourceHistory`,
        }),
        method: 'GET',
        params: {
          pageToken: queryParams.pageToken,
          pageSize: queryParams.pageSize,
        },
      }),
      transformResponse: (
        response: any,
        _meta,
        { queryParams, listPageToken }: any
      ) => ({
        imports: transformOrderResponse(response),
        nextPageToken: response?.nextPageToken,
        pageIndex: queryParams.currentPage,
        listPageToken: updateTokenList(
          queryParams.currentPage + 1,
          response?.nextPageToken,
          listPageToken
        ),
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useLazyGetActivitiesQuery, useLazyGetResourceHistoryQuery } =
  activitySlice;
