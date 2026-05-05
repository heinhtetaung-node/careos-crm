import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

function useOrderSubmissionState() {
  const orderDataSubmission = useAppSelector(
    (state) => state?.ordersReducer?.orderSubmissionReducer?.data || []
  );

  const isLoading = useAppSelector(
    (state) => state?.ordersReducer?.orderSubmissionReducer?.isFetching
  );

  const totalItem = useAppSelector(
    (state) => state?.ordersReducer?.orderSubmissionReducer?.totalItem
  );

  const pageState = useAppSelector(
    (state) => state.ordersReducer?.orderSubmissionReducer?.pageState
  );

  return { orderDataSubmission, isLoading, totalItem, pageState };
}

export default useOrderSubmissionState;
