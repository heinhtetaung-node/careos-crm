import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { Activities, Activity } from './interface';

interface ActivitiesState {
  activities: Activities;
  nextPageToken: string;
}

const initialState = {
  activities: [],
  nextPageToken: '',
} as ActivitiesState;

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    addMoreActivities(
      state,
      action: PayloadAction<{
        activities?: Activities;
        nextPageToken?: string;
      }>
    ) {
      if (action?.payload?.activities) {
        state.activities.push(...action.payload.activities);
      }
      state.nextPageToken = action?.payload?.nextPageToken || '';
    },
    addActivity(
      state,
      action: PayloadAction<{
        activity: Activity;
      }>
    ) {
      if (action?.payload?.activity) {
        const remark = state.activities.filter(
          (activity) => activity.type === 'remark'
        );
        if (remark.length && action?.payload?.activity?.type === 'remark') {
          state.activities.splice(0, 1, action?.payload?.activity);
        } else if (remark.length) {
          state.activities.splice(1, 0, action?.payload?.activity);
        } else {
          state.activities.unshift(action.payload.activity);
        }
      }
    },
    resetActivities(state) {
      state.activities = [];
      state.nextPageToken = '';
    },
  },
});

export const { addMoreActivities, resetActivities, addActivity } =
  activitySlice.actions;
export default activitySlice.reducer;
