import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface PackageListingState {
  packagesForComparison: string[];
}

const getPackageIdsFromUrl = () =>
  new URLSearchParams(window.location.search).get('id')?.split(',') ?? [];

const initialState = {
  packagesForComparison: getPackageIdsFromUrl(),
} as PackageListingState;

const packageListingSlice = createSlice({
  name: 'packageListing',
  initialState,
  reducers: {
    addToComparison(
      state,
      action: PayloadAction<{ id: string; maxLimit: number }>
    ) {
      const { id, maxLimit } = action.payload;
      if (state.packagesForComparison.includes(id)) {
        return;
      }
      if (state.packagesForComparison.length < maxLimit) {
        state.packagesForComparison.push(id);
      } else {
        state.packagesForComparison[maxLimit - 1] = id;
      }
    },
    removeFromComparison(state, action: PayloadAction<string>) {
      state.packagesForComparison = state.packagesForComparison.filter(
        (id) => id !== action.payload
      );
    },
    resetComparison(state) {
      state.packagesForComparison = [];
    },
  },
});

export const { addToComparison, removeFromComparison, resetComparison } =
  packageListingSlice.actions;
export default packageListingSlice.reducer;
