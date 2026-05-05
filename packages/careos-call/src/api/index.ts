import { commonFetch } from '@careos/utils';

import {
  AddAgentToCall,
  AddLeadToCall,
  CallResponse,
  SDPDescription,
} from './types';

type Options = {
  baseApiUrl: string;
};

export default class Api {
  headers: Record<string, string>;

  apiUrl: string;

  constructor(options: Options) {
    this.apiUrl = options.baseApiUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  createCall(): Promise<{ name: string }> {
    return commonFetch(`${this.apiUrl}/api/call/v1alpha1/calls`, {
      method: 'POST',
      headers: this.headers,
      credentials: 'include',
    });
  }

  deleteCall(callName: string) {
    return commonFetch(`${this.apiUrl}/api/call/v1alpha1/${callName}`, {
      method: 'DELETE',
      headers: this.headers,
      credentials: 'include',
    });
  }

  getParticipants(callName: string) {
    return commonFetch(
      `${this.apiUrl}/api/call/v1alpha1/${callName}/participants`,
      {
        method: 'GET',
        headers: this.headers,
        credentials: 'include',
      }
    );
  }

  getCallStatus(callName: string): Promise<CallResponse> {
    return commonFetch(`${this.apiUrl}/api/call/v1alpha1/${callName}`, {
      method: 'GET',
      headers: this.headers,
      credentials: 'include',
    });
  }

  addAgentToCall(
    request: AddAgentToCall
  ): Promise<{ state: string; name: string }> {
    const body = {
      destination: {
        user: {
          user: request.agentName,
        },
      },
      outgoing: false,
    };
    return commonFetch(
      `${this.apiUrl}/api/call/v1alpha1/${request.callName}/participants`,
      {
        method: 'POST',
        headers: this.headers,
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );
  }

  addLeadToCall(
    request: AddLeadToCall
  ): Promise<{ state: string; name: string }> {
    const body = {
      destination: {
        lead: {
          lead: request.leadName,
          phoneIndex: request.phoneIndex,
        },
      },
      outgoing: true,
    };
    return commonFetch(
      `${this.apiUrl}/api/call/v1alpha1/${request.callName}/participants`,
      {
        method: 'POST',
        headers: this.headers,
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );
  }

  putOffer(participantName: string, offer: string): Promise<SDPDescription> {
    return commonFetch(
      `${this.apiUrl}/api/call/v1alpha1/${participantName}/sdps/offer`,
      {
        method: 'PUT',
        headers: this.headers,
        credentials: 'include',
        body: JSON.stringify(offer),
      }
    );
  }

  getAnswer(participantName: string): Promise<SDPDescription> {
    return commonFetch(
      `${this.apiUrl}/api/call/v1alpha1/${participantName}/sdps/answer`,
      {
        method: 'GET',
        headers: this.headers,
        credentials: 'include',
      }
    );
  }

  getIceServers(): Promise<{ iceServers: RTCIceServer[] }> {
    return commonFetch(`${this.apiUrl}/api/call/v1alpha1/iceServers`, {
      method: 'GET',
      headers: this.headers,
      credentials: 'include',
    });
  }
}
