import { BehaviorSubject } from 'rxjs';

const isPostRejectionsSuccess$ = new BehaviorSubject(false);

export const updatePostRejectValue = (isRejected: boolean) => {
  isPostRejectionsSuccess$.next(isRejected);
};

export const getPostRejectValue = () => {
  return isPostRejectionsSuccess$.asObservable();
};
