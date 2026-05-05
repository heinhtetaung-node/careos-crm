import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { buildUrl } from 'utils/url';

import {
  ExportShipmentListRequest,
  ExportShipmentListResponse,
} from './interface';

import { apiSlice, basePaths, baseUrls } from '../apiSlice';
import userSlice from '../userSlice';

const apiWithTags = apiSlice.enhanceEndpoints({
  addTagTypes: ['SHIPMENT_LIST'],
});

const exportShipment = apiWithTags.injectEndpoints({
  endpoints: (builder) => ({
    exportShipmentList: builder.query<
      ExportShipmentListResponse,
      ExportShipmentListRequest
    >({
      async queryFn(_args, _queryApi, _extraOptions, fetchWithBQ) {
        const { data: shipmentList, error } = await fetchWithBQ({
          url: buildUrl(baseUrls.salesFlow, {
            path: `${basePaths.shipment}/shipmentLabelExports`,
          }),
          method: 'GET',
          params: _args,
        });

        if (shipmentList) {
          const { nextPageToken, exports } =
            shipmentList as ExportShipmentListResponse;

          const exportsWithNamePromises = exports.map(async (exportHistory) => {
            let createByName = '-';
            if (exportHistory.createBy !== '') {
              try {
                const userName = await _queryApi
                  .dispatch(
                    userSlice.endpoints.getUserByUserId.initiate(
                      exportHistory.createBy as string
                    )
                  )
                  .unwrap();
                createByName = `${userName.firstName} ${userName.lastName}`;
              } catch (e) {
                console.warn(e);
              }
            }
            return {
              ...exportHistory,
              createBy: createByName,
            };
          });

          const exportWithUserName = await Promise.all(exportsWithNamePromises);

          return {
            data: {
              exports: exportWithUserName,
              nextPageToken,
            },
          };
        }
        return { error: error as FetchBaseQueryError };
      },
      providesTags: ['SHIPMENT_LIST'],
    }),
    exportShipment: builder.mutation<unknown, void>({
      query: () => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.shipment}/shipmentLabelExports`,
        }),
        method: 'POST',
      }),
      invalidatesTags: ['SHIPMENT_LIST'],
    }),
  }),
});

export const { useExportShipmentListQuery, useExportShipmentMutation } =
  exportShipment;
