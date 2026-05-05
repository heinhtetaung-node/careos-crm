import { apiSlice, basePaths } from 'data/slices/apiSlice';
import { IUploadedDocument } from 'presentation/components/ActivityOrderSection/DocumentSection';
import { store } from 'presentation/redux/store';

import userSlice from '../userSlice';

interface Payload {
  orderId: string;
  policyId: string;
}

interface Response {
  documents: (IUploadedDocument | null)[];
  nextPageToken: string;
}

const policyDocsSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getPolicyDocs: build.query<any, Payload>({
      query: ({ orderId, policyId }) => ({
        url: `${basePaths.order}/orders/${orderId}/documents?filter=item="orders/-/items/${policyId}"`,
        method: 'GET',
      }),
      // eslint-disable-next-line consistent-return
      transformResponse: async (response: Response) => {
        if (response?.documents.length) {
          const { documents } = response;
          const policyDoc = documents.find(
            (i) => i?.label.split('-')[0] === 'policyCertificate'
          );
          if (policyDoc) {
            let ownerName = '';
            try {
              const resp = await store
                .dispatch(
                  userSlice.endpoints.getUserByUserId.initiate(
                    policyDoc.createBy
                  ) as any
                )
                .unwrap();
              ownerName = `${resp.firstName} ${resp.lastName}`;
            } catch (e) {
              ownerName = '-';
            }
            policyDoc.createBy = ownerName;
            const rest = response.documents.filter(
              (i) => i?.label.split('-')[0] !== 'policyCertificate'
            );
            return {
              ...response,
              documents: [...rest, policyDoc],
            };
          }
          return response;
        }
      },
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useLazyGetPolicyDocsQuery } = policyDocsSlice;
