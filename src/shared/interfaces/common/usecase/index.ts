import { Observable } from 'rxjs';

export interface IUseCase {
  execute: (payload: any) => Promise<any> | Array<Promise<any>>;
}

export interface IUseCaseObservable {
  execute: (payload: any) => Observable<any> | Array<Observable<any>>;
}
