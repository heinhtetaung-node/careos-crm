import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InsurerWithPackagesState {
  selectedInsurersWithPackages: string[];
}

const initialState: InsurerWithPackagesState = {
  selectedInsurersWithPackages: [],
};

const insurerWithPackagesSlice = createSlice({
  name: 'insurerWithPackages',
  initialState,
  reducers: {
    setSelectedInsurersWithPackages(state, action: PayloadAction<string[]>) {
      state.selectedInsurersWithPackages = action.payload;
    },
  },
});

export const { setSelectedInsurersWithPackages } =
  insurerWithPackagesSlice.actions;
export default insurerWithPackagesSlice.reducer;
