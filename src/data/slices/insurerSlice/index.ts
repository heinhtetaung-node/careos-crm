/* eslint-disable no-loop-func */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

interface InsurerPayload {
  pageSize?: number;
}

interface Insurer {
  name: string;
  displayName: string;
  displayNameTh: string;
  shortnameEn: string;
  shortnameTh: string;
  rating: number;
  order: number;
  logo: string;
  phone: string;
  website: string;
}

interface InsurerResponse {
  insurers: Insurer[];
  nextPageToken: string;
}

const insurerSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAllInsurersByStreaming: build.query<InsurerResponse, InsurerPayload>({
      query: ({ pageSize = 100 }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.insurers}/insurers?pageSize=${pageSize}`,
        }),
        method: 'GET',
      }),
      async onCacheEntryAdded(
        { pageSize = 100 },
        { updateCachedData, cacheDataLoaded, getCacheEntry }
      ) {
        await cacheDataLoaded;
        let { data: { nextPageToken = '' } = {} } = getCacheEntry();
        let data: InsurerResponse = {} as InsurerResponse;
        do {
          if (nextPageToken) {
            const response = await fetch(
              `${baseUrls.salesFlow}/${basePaths.insurers}/insurers?pageSize=${pageSize}&pageToken=${nextPageToken}`,
              { credentials: 'include' }
            );
            data = await response.json();
            nextPageToken = data.nextPageToken;
            updateCachedData((draft) => {
              draft.insurers = [...draft.insurers, ...data.insurers];
              draft.nextPageToken = nextPageToken;
            });
          }
        } while (nextPageToken);
      },
    }),
  }),
});

export const {
  useGetAllInsurersByStreamingQuery,
  useLazyGetAllInsurersByStreamingQuery,
} = insurerSlice;
