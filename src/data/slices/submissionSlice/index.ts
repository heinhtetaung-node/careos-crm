import { basePaths, apiSlice } from 'data/slices/apiSlice';

interface Item {
  status: string;
}

interface Payload {
  orderId: string;
  payload: Item;
}

const apiWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['ORDER', 'ADDON', 'POLICY'],
});
const submissionSlice = apiWithTag.injectEndpoints({
  endpoints: (build) => ({
    updateSubmission: build.mutation<Item, Payload>({
      query: ({ orderId, payload }) => ({
        url: `${basePaths.order}/${orderId}:updateSubmissionStatus`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['ORDER', 'ADDON', 'POLICY'],
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const { useUpdateSubmissionMutation } = submissionSlice;
