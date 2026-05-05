import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

// eslint-disable-next-line import/prefer-default-export
export const useGetQcDetail = () =>
  useAppSelector((state) => state.qcDetailReducer);
