import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import { ScriptResponseType } from './interface';

interface PackageListingState {
  leadScripts: ScriptResponseType[];
  nextPageToken: string;
}

const initialState = {
  leadScripts: [],
  nextPageToken: '',
} as PackageListingState;

const scriptSlice = createSlice({
  name: 'packageListing',
  initialState,
  reducers: {
    addMoreScripts(
      state,
      action: PayloadAction<{
        scripts?: ScriptResponseType[];
        nextPageToken?: string;
      }>
    ) {
      if (action?.payload?.scripts) {
        state.leadScripts.push(...action.payload.scripts);
      }
      state.nextPageToken = action?.payload?.nextPageToken || '';
    },
    resetScripts(state) {
      state.leadScripts = [];
      state.nextPageToken = '';
    },
  },
});

export const { addMoreScripts, resetScripts } = scriptSlice.actions;
export default scriptSlice.reducer;
