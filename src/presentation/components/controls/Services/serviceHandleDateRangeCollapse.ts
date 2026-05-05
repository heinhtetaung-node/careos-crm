import { BehaviorSubject } from 'rxjs';

export const isFocusDateRange$ = new BehaviorSubject(false);
export const isFocusDateRange = isFocusDateRange$.asObservable();
