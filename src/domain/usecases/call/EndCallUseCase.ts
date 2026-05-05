import CallRepository from 'data/repository/call';
import { executeWithPayloadFn } from 'shared/interfaces/common';
import { IUseCaseObservable } from 'shared/interfaces/common/usecase';

export default class EndCallUseCase implements IUseCaseObservable {
  private callRepository: CallRepository;

  constructor() {
    this.callRepository = new CallRepository();
  }

  execute: executeWithPayloadFn = (callName, sdpAnswerResource) =>
    this.callRepository.endCall(callName, sdpAnswerResource);
}
