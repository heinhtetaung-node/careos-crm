import { User } from 'shared/types/user';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

export function useGetUserSelector() {
  const user = useAppSelector((state) => state.authReducer.data.user ?? '');
  return user as User;
}
