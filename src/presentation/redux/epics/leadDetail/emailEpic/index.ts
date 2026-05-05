import { combineEpics, ofType } from 'redux-observable';
import { merge, Observable, of } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  mergeMap,
  pluck,
  switchMap,
  mergeAll,
} from 'rxjs/operators';

import {
  LeadAddEmailActionTypes,
  addEmailFail,
  addEmailSuccess,
} from 'presentation/redux/actions/leadDetail/addEmail';
import {
  LeadActionTypes,
  sendEmailFail,
  sendEmailSuccess,
  getListEmail,
  getListEmailSuccess,
  getListEmailFail,
  getAttachmentFail,
  getAttachmentSuccess,
  uploadAttachmentFail,
  sendEmail,
  updateEmailInformationSuccess,
  updateEmailInformationFailure,
  getMailReadCountSuccess,
  getMailReadCountFailure,
} from 'presentation/redux/actions/leadDetail/email';
import { emailResponseProps } from 'presentation/redux/actions/leadDetail/email/types';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import {
  epicWithoutStateFn,
  epicWithDependencies,
} from 'shared/interfaces/common';

import addAttachmentHelper from './emailHelper';

import LeadDetailUseCase from '../../../../../domain/usecases/leadDetail';

const sendEmailEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActionTypes.SEND_EMAIL),
    switchMap((action) => {
      const { leadId } = action.payload;

      const newPayload = {
        ...action.payload,
        leadId: leadId ?? getLeadIdFromPath(),
      };
      return new LeadDetailUseCase.SendEmailUseCase().execute(newPayload).pipe(
        pluck('data'),
        mergeMap((res) =>
          merge(
            of(getListEmail(undefined, newPayload.leadId)),
            of(sendEmailSuccess(res)),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.sendEmailSuccess'),
                status: 'success',
              })
            )
          )
        ),
        catchError((error) =>
          merge(
            of(sendEmailFail(error)),
            of(
              showSnackBar({
                isOpen: true,
                message: error._message,
                status: 'error',
              })
            )
          )
        )
      );
    })
  );

const getListEmailEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActionTypes.GET_LIST_EMAIL),
    switchMap((action) => {
      const { leadId } = action.payload;

      const newPayload = {
        ...action.payload,
        leadId: leadId ?? getLeadIdFromPath(),
      };

      return new LeadDetailUseCase.GetListEmailUseCase()
        .execute(newPayload)
        .pipe(
          pluck('mails'),
          map((res) => getListEmailSuccess(res)),
          catchError((error) =>
            merge(
              of(getListEmailFail(error)),
              of(
                showSnackBar({
                  isOpen: true,
                  message: error._message,
                  status: 'error',
                })
              )
            )
          )
        );
    })
  );

const getAttachmentEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadActionTypes.GET_ATTACHMENT),
    switchMap((action) =>
      new LeadDetailUseCase.GetAttachmentUseCase().execute(action.payload).pipe(
        pluck('attachements'),
        map((res) => getAttachmentSuccess(res)),
        catchError((error) => merge(of(getAttachmentFail(error))))
      )
    )
  );

const uploadAttachmentEpic = (action$: Observable<any>) =>
  action$.pipe(
    ofType(LeadActionTypes.UPLOAD_ATTACHMENT),
    exhaustMap((action) => {
      const customAttachment = action.payload?.listAttachment;
      return addAttachmentHelper(customAttachment).pipe(
        map(() => sendEmail(action.payload.mailModal)),
        catchError((error) =>
          merge(
            of(uploadAttachmentFail(error)),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.uploadAttachmentFail'),
                status: 'error',
              })
            )
          )
        )
      );
    })
  );

const addEmailEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(LeadAddEmailActionTypes.ADD_EMAIL),
    exhaustMap((action) => {
      const newPayload = {
        ...action.payload,
        leadId: getLeadIdFromPath(),
      };
      return new LeadDetailUseCase.AddEmailUseCase().execute(newPayload).pipe(
        pluck('data'),
        mergeMap((res) =>
          merge(
            of(addEmailSuccess(res)),
            of(
              showSnackBar({
                isOpen: true,
                message: getString('text.addEmailSuccess'),
                status: 'success',
              })
            )
          )
        ),
        catchError((error) =>
          merge(
            of(addEmailFail(error)),
            of(
              showSnackBar({
                isOpen: true,
                message: error._message,
                status: 'error',
              })
            )
          )
        )
      );
    })
  );

const updateEmailInformationEpic: epicWithDependencies = (
  action$,
  _state$,
  { apiServices: { MailerApi } }
) =>
  action$.pipe(
    ofType(LeadActionTypes.UPDATE_EMAIL_INFORMATION),
    switchMap((action) => {
      const mailerApi = new MailerApi();

      return mailerApi
        .updateMailInformation(action.payload.mailId, {
          read: true,
        })
        .pipe(
          pluck('data'),
          map((res: emailResponseProps) =>
            merge(of(updateEmailInformationSuccess(res)))
          ),
          mergeAll(),
          catchError((error) =>
            of(updateEmailInformationFailure(error.toString()))
          )
        );
    })
  );

export const getUnReadMailCountEpic: epicWithDependencies = (
  actions$,
  state$,
  { apiServices: { MailerApi } }
) =>
  actions$.pipe(
    ofType(LeadActionTypes.GET_MAIL_READ_COUNT),
    switchMap((action) => {
      const { orderLeadId } = action.payload;
      const mailerApi = new MailerApi();
      return mailerApi
        .getUnreadMailCount(orderLeadId ?? getLeadIdFromPath())
        .pipe(
          pluck('data'),
          mergeMap((res: any) => of(getMailReadCountSuccess(res))),
          catchError((error) => of(getMailReadCountFailure(error.toString())))
        );
    })
  );

const leadDetailEmailEpic = combineEpics(
  sendEmailEpic,
  getListEmailEpic,
  getAttachmentEpic,
  uploadAttachmentEpic,
  addEmailEpic,
  updateEmailInformationEpic,
  getUnReadMailCountEpic
);

export default leadDetailEmailEpic;
