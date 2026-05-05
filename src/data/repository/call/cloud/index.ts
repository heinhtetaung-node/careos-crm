import { Observable, of, throwError, timer } from 'rxjs';
import { pluck, concatMap, delay, retryWhen, mergeMap } from 'rxjs/operators';

import { websocketEnabled } from 'config/feature-flags';
import ApiGateway from 'data/gateway/api';
import { RabbitResource } from 'data/gateway/api/resource';
import WebSocketGateway from 'data/gateway/websocket';
import getConfig from 'data/setting';
import ResponseModel from 'models/response';

type IAnswer = { type: string; sdp: string };

const apiGateway = ApiGateway.createAPIConnection(getConfig());

let callName: string;
let callParticipantName: string;
let sdpAnswer: IAnswer;

const createParticipant = (
  _callName: string,
  options: any
): Observable<ResponseModel<any>> => {
  const participantsResource = RabbitResource.Call.CreateCallPath(
    `${_callName}/participants`
  );
  return apiGateway.doPostAjaxRequest(participantsResource, options);
};

const createCall = ({
  peerConnection,
  phoneIndex,
  userName,
  leadName,
}: {
  peerConnection: RTCPeerConnection;
  phoneIndex: number;
  userName: string;
  leadName: string;
}): Observable<ResponseModel<any>> =>
  // To create a call between Agent and Lead need following these steps
  // 1. Post create call to register leads/xxxx to call service
  // 2. Add Agent as participant and update the SDP
  // 3. Wait until SDP negotiate ready before adding Lead to participant.
  // 4. Add Lead as participant
  // api/call/v1alpha1/calls/f2f037c2-31a3-4ad8-b6df-743f4c7cc01b/participants   METHOD: POST
  apiGateway
    .doPostAjaxRequest(RabbitResource.Call.CreateCallPath('calls'))
    .pipe(
      pluck('data'),
      concatMap((data: { name: string; createBy: string }) => {
        callName = data.name;

        const options = {
          destination: {
            user: {
              user: userName,
            },
          },
          outgoing: false,
        };

        return createParticipant(callName, options);
      }),
      pluck('data'),
      delay(2000),
      concatMap((data: { name: string }) => {
        callParticipantName = data.name;

        return of({
          data: {
            callName,
            callParticipantName,
            peerConnection,
            phoneIndex,
            leadName,
          },
        });
      })
    );
interface ICallParticipant {
  callServerName: string;
  callParticipantName: string;
  peerConnection: {
    localDescription: RTCSessionDescription;
  };
  leadName: string;
  phoneIndex: number;
}

const callParticipant = ({
  callParticipantName: _callParticipantName,
  peerConnection,
  leadName,
  phoneIndex,
}: ICallParticipant): Observable<ResponseModel<any>> =>
  apiGateway
    .doPutAjaxRequest(
      RabbitResource.Call.CreateCallPath(`${_callParticipantName}/sdps/offer`),
      JSON.stringify(peerConnection.localDescription.sdp)
    )
    .pipe(
      delay(2000), // wait for 2 seconds before next line execute
      concatMap(() =>
        apiGateway
          .doGetAjaxRequest(
            RabbitResource.Call.CreateCallPath(
              `${_callParticipantName}/sdps/answer`
            )
          )
          .pipe(
            pluck('data'),
            concatMap((answer: IAnswer) => {
              sdpAnswer = answer;
              if (!sdpAnswer.sdp) {
                throw new Error('There is no sdp answer from the server');
              }

              const options = {
                destination: {
                  lead: {
                    lead: leadName,
                    phoneIndex,
                  },
                },
                outgoing: true,
              };

              return createParticipant(callName, options);
            }),
            retryWhen((errors) =>
              errors.pipe(
                mergeMap((error, i) => {
                  const maxRetryAttempts = 4;
                  const retryAttempt = i + 1;
                  // if maximum number of retries have been met, throw error
                  if (retryAttempt > maxRetryAttempts) {
                    newrelic?.noticeError?.(error);
                    return throwError(error);
                  }
                  // retry after 2s
                  return timer(2000);
                })
              )
            )
          )
      ),
      concatMap(() =>
        of({
          data: {
            callName,
            sdpAnswer,
          },
        })
      )
    );

const endCall = (
  callServerName: string,
  sdpAnswerResource: string
): Observable<ResponseModel<any>> => {
  // Unsubscribe call name, also it will include participant name
  if (websocketEnabled && callServerName) {
    WebSocketGateway.getInstance().unsubscribe(
      `call/v1alpha1/${callServerName}`
    );
    WebSocketGateway.getInstance().unsubscribe(
      `call/v1alpha1/${callServerName}/participants/*`
    );
    if (sdpAnswerResource && sdpAnswerResource !== '') {
      WebSocketGateway.getInstance().unsubscribe(sdpAnswerResource);
    }
  }

  return apiGateway.doDeleteAjaxRequest(
    RabbitResource.Call.CreateCallPath(callServerName)
  );
};

export default {
  createCall,
  endCall,
  callParticipant,
};
