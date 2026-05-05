import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface SelectionItems {
  approvalStatuses: string[];
  insurers: string[];
  items: string[];
  noOfPolicies: number;
  orderId: string;
}

export interface ItemAssignToAgent {
  id: string;
}

const initialState = {
  selectedPolicies: [] as SelectionItems[],
  itemAssignToAgent: [] as ItemAssignToAgent[],
};

const selectionsSlice = createSlice({
  name: 'selectionsSlice',
  initialState,
  reducers: {
    addItemAssign(state, action: PayloadAction<ItemAssignToAgent>) {
      let newListCheckBox = [];
      const { itemAssignToAgent } = state;
      const checkItemExist = itemAssignToAgent.find(
        (e: any) => e.id === action.payload.id
      );

      if (checkItemExist) {
        newListCheckBox = itemAssignToAgent.filter(
          (e: any) => e.id !== action.payload.id
        );
      } else {
        newListCheckBox = [...itemAssignToAgent, action.payload];
      }
      state.itemAssignToAgent = newListCheckBox;
    },
    clearItemAssign(state) {
      state.itemAssignToAgent = [];
    },
    addSelected(state, action: PayloadAction<SelectionItems>) {
      const orderExists = state.selectedPolicies.find(
        (item: SelectionItems) => item.orderId === action.payload.orderId
      );

      if (!orderExists || state.selectedPolicies.length <= 0) {
        state.selectedPolicies = [...state.selectedPolicies, action.payload];
        return;
      }

      const selections = state.selectedPolicies
        .map((selected: SelectionItems) => {
          const { approvalStatuses, insurers, items: policies } = selected;
          if (selected.orderId !== action.payload.orderId) return selected;
          const inputApprovalStatus = action.payload.approvalStatuses[0];
          const inputPolicy = action.payload.items[0];
          const inputInsurer = action.payload.insurers[0];

          const policyIndex = policies.findIndex(
            (policyId) => policyId === inputPolicy
          );
          const policyExists = policyIndex !== -1;
          // If policy exists and only one, remove the whole item
          if (policyExists && policies.length === 1) {
            return undefined;
          }
          // If policy exists and more than 1. Remove that policy, insurers and approval status
          if (policyExists && policies.length > 1) {
            return {
              ...selected,
              approvalStatuses: approvalStatuses.filter(
                (_, i) => i !== policyIndex
              ),
              insurers: insurers.filter((_, i) => i !== policyIndex),
              items: policies.filter((policyId) => policyId !== inputPolicy),
            };
          }

          // if policy is not exists, add that policy
          return {
            ...selected,
            approvalStatuses: [...approvalStatuses, inputApprovalStatus],
            insurers: [...insurers, inputInsurer],
            items: [...policies, inputPolicy],
          };
        })
        .filter((item) => item !== undefined) as SelectionItems[];

      state.selectedPolicies = selections ?? [];
    },
    clearSelected(state) {
      state.selectedPolicies = [];
    },
  },
});

export const { addSelected, clearSelected, addItemAssign, clearItemAssign } =
  selectionsSlice.actions;
export default selectionsSlice.reducer;
