import { BehaviorSubject } from 'rxjs';

export const isScrollTop$ = new BehaviorSubject(false);
export const isScrollTop = isScrollTop$.asObservable();
