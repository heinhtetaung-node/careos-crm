import { useSelector } from 'react-redux';

function useOrderApprovalState() {
  const orderDataApproval = useSelector(
    (state: any) => state?.ordersReducer?.orderApprovalReducer?.data || []
  );

  const isLoading = useSelector(
    (state: any) => state?.ordersReducer?.orderApprovalReducer?.isFetching
  );

  const totalItem = useSelector(
    (state: any) => state?.ordersReducer?.orderApprovalReducer?.totalItem
  );

  const pageState = useSelector(
    (state: any) => state.ordersReducer?.orderApprovalReducer?.pageState
  );

  return { orderDataApproval, isLoading, totalItem, pageState };
}

export default useOrderApprovalState;
