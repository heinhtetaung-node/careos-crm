import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import { PitchChecklist, UpdatePitchChecklistItemPayload } from './interface';

/** Optimistic UI only; `stats` is reconciled from the PATCH response. */
const applyItemCheckedToDraft = (
  draft: PitchChecklist,
  itemKey: string,
  checked: boolean
) => {
  draft.sections?.forEach((section) => {
    const { items } = section;
    if (!items) {
      return;
    }

    for (let i = 0; i < items.length; i += 1) {
      if (items[i].key === itemKey) {
        items[i].checked = checked;
        break;
      }
    }
  });
};

const pitchChecklistSlice = apiSlice
  .enhanceEndpoints({
    addTagTypes: ['PITCH_CHECKLIST'],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getPitchChecklist: builder.query<PitchChecklist, string>({
        query: (leadName) => ({
          url: buildUrl(baseUrls.salesFlow, {
            path: `/api/lead/v1alpha2/${leadName}/pitchChecklist`,
          }),
          method: 'GET',
        }),
        providesTags: (_result, _error, leadName) => [
          {
            type: 'PITCH_CHECKLIST',
            id: leadName,
          },
        ],
      }),
      updatePitchChecklistItem: builder.mutation<
        PitchChecklist,
        UpdatePitchChecklistItemPayload
      >({
        query: ({ leadName, itemKey, checked }) => ({
          url: buildUrl(baseUrls.salesFlow, {
            path: `/api/lead/v1alpha2/${leadName}/pitchChecklist:updateItem`,
          }),
          method: 'PATCH',
          body: {
            itemKey,
            checked,
          },
        }),
        async onQueryStarted(
          { leadName, itemKey, checked },
          { dispatch, queryFulfilled }
        ) {
          const patchResult = dispatch(
            pitchChecklistSlice.util.updateQueryData(
              'getPitchChecklist',
              leadName,
              (draft) => {
                applyItemCheckedToDraft(draft, itemKey, checked);
              }
            )
          );

          try {
            const { data } = await queryFulfilled;

            dispatch(
              pitchChecklistSlice.util.upsertQueryData(
                'getPitchChecklist',
                leadName,
                data
              )
            );
          } catch {
            patchResult.undo();
          }
        },
      }),
    }),
  });

export const {
  useGetPitchChecklistQuery,
  useUpdatePitchChecklistItemMutation,
} = pitchChecklistSlice;

export { pitchChecklistSlice };
