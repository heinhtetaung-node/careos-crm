import CallCloud from './cloud';

export default class CallRepository {
  createCall = (payload: any) => CallCloud.createCall(payload);

  endCall = (callName: string, sdpAnswerResource: string) =>
    CallCloud.endCall(callName, sdpAnswerResource);
}
