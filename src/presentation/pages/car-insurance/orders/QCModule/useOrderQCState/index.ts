import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

function useOrderQCState() {
  const orderQCs = useAppSelector(
    (state) => state?.ordersReducer?.qcModuleReducer?.data || []
  );

  const isLoading = useAppSelector(
    (state) => state?.ordersReducer?.qcModuleReducer?.isFetching
  );

  const totalItem = useAppSelector(
    (state) => state?.ordersReducer?.qcModuleReducer?.totalItem
  );

  const pageState = useAppSelector(
    (state) => state.ordersReducer?.qcModuleReducer?.pageState
  );

  return { orderQCs, isLoading, totalItem, pageState };
}

export default useOrderQCState;
