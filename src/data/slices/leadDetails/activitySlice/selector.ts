import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

// eslint-disable-next-line import/prefer-default-export
export const useGetAllLeadActivities = () =>
  useAppSelector((state) => ({
    activities: state.leadActivitiesReducer?.activities,
    nextPageToken: state.leadActivitiesReducer?.nextPageToken,
  }));
