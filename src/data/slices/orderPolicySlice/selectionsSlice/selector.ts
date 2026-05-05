import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

// eslint-disable-next-line import/prefer-default-export
export const useGetSelections = () =>
  useAppSelector((state) => ({
    selectedPolicies: state.selectionsReducer.selectedPolicies,
  }));

export const useGetItemAssign = () =>
  useAppSelector((state) => ({
    itemAssignToAgent: state.selectionsReducer.itemAssignToAgent.map(
      (policyItem) => policyItem.id
    ),
  }));

export const useGetItemAssignFull = () =>
  useAppSelector((state) => ({
    itemAssignToAgent: state.selectionsReducer.itemAssignToAgent,
  }));
