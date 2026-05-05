import { Observable } from 'rxjs';

import ResponseModel from 'models/response';

import Type from '../../type';
import BaseApi from '../baseApi';

/**
 * An API Class for the lead service.
 * {@link https://test.sabye-songkran.com/openapi/mailer.html}
 */
export default class MailerApi extends BaseApi {
  readonly baseUrl = '/api/mailer/v1alpha1/';

  updateMailInformation(
    mailId: string,
    payload: {
      true: boolean;
    }
  ): Observable<ResponseModel<any>> {
    return this.apiGateway.doPatchAjaxRequest(
      {
        Type: Type.Public,
        Path: `${this.baseUrl}/${mailId}`,
      },
      payload
    );
  }

  getUnreadMailCount(leadId: string): Observable<ResponseModel<any>> {
    return this.apiGateway.doGetAjaxRequest({
      Type: Type.Public,
      Path: `${this.baseUrl}leads/${leadId}/mails:count?filter=unread`,
    });
  }
}
