import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

// eslint-disable-next-line import/prefer-default-export
export const useGetAllLeadScripts = () =>
  useAppSelector((state) => ({
    scripts: state.leadScriptsReducer.leadScripts,
    nextPageToken: state.leadScriptsReducer.nextPageToken,
  }));
