import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import has from 'lodash/has';

import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import {
  leadDetailCarForkJoin,
  customCarGeneral,
} from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { buildUrl } from 'utils/url';

import { getCarDataQueryPath } from './helper';
import { SubCarModalPayload, SubCarModelResponse, CarQuery } from './types';

const carSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getCarData: build.query<any, any>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        const { pathParam, queryParam, field } = _arg;
        let carData: any = [];
        let carServiceResponse: any;

        const params: any = {
          ...queryParam,
        };

        do {
          if (carServiceResponse?.data?.nextPageToken) {
            params.pageToken = carServiceResponse?.data?.nextPageToken;
          }
          try {
            // eslint-disable-next-line no-await-in-loop
            carServiceResponse = await fetchWithBQ({
              url: buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.car}/${pathParam}`,
              }),
              method: 'GET',
              ...(Boolean(Object.keys(params).length > 0) && { params }),
            });
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
          carData = carData.concat(
            field ? carServiceResponse.data[field] : carServiceResponse.data
          );
        } while (
          has(carServiceResponse, 'data.nextPageToken') &&
          carServiceResponse.data.nextPageToken !== ''
        );

        return {
          data: carData,
        };
      },
    }),
    getCarBySubModal: build.query<
      SubCarModelResponse | null,
      SubCarModalPayload
    >({
      query: ({ subModelYear }) => ({
        url: `${basePaths.car}/brands/-/models/-/submodels/-/years/${subModelYear}`,
        method: 'GET',
      }),
      transformResponse: async (response, _meta, { registeredProvince }) => {
        let data = null;
        await leadDetailCarForkJoin(response, registeredProvince.toString())
          .toPromise()
          .then((res: any) => {
            data = customCarGeneral(res);
          });
        return data;
      },
    }),
    getCarsData: build.query<unknown, CarQuery>({
      query: (query) => ({
        url: `${basePaths.car}/${getCarDataQueryPath(query)}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLazyGetCarDataQuery,
  useGetCarDataQuery,
  useGetCarBySubModalQuery,
  useLazyGetCarBySubModalQuery,
  useLazyGetCarsDataQuery,
  useGetCarsDataQuery,
} = carSlice;
