import Api from '..';
import { mockFetch } from '../../utils/test-utils';

const option = {
  baseApiUrl: 'baseUrl',
};

const api = new Api(option);

describe('Api', () => {
  it('should create call', async () => {
    const mockFn = mockFetch({ name: 'calls/call-resource' });
    const _ = await api.createCall();
    expect(mockFn).toBeCalledWith('baseUrl/api/call/v1alpha1/calls', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });
  });

  it('should delete call', async () => {
    const mockFn = mockFetch({ name: 'calls/call-name' });
    const _ = await api.deleteCall('calls/call-name');
    expect(mockFn).toBeCalledWith('baseUrl/api/call/v1alpha1/calls/call-name', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'DELETE',
    });
  });

  it('should call get calls', async () => {
    const mockFn = mockFetch({ participants: [] });
    const r = await api.getCallStatus('calls/call-name');
    expect(mockFn).toBeCalledWith('baseUrl/api/call/v1alpha1/calls/call-name', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    expect(r).toEqual({ participants: [] });
  });

  it('should add agent to call', async () => {
    const mockFn = mockFetch({
      name: 'calls/callresource/participants/participantresource',
    });
    const _ = await api.addAgentToCall({
      callName: 'calls/call-resource',
      agentName: 'users/user-resource',
    });
    expect(mockFn).toBeCalledWith(
      'baseUrl/api/call/v1alpha1/calls/call-resource/participants',
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          destination: { user: { user: 'users/user-resource' } },
          outgoing: false,
        }),
      }
    );
  });

  it('should send offer', async () => {
    const mockFn = mockFetch({
      name: 'calls/callresource/participants/participantresource',
    });
    const _ = await api.putOffer(
      'calls/call-res/participants/p-resource',
      'offer'
    );
    expect(mockFn).toBeCalledWith(
      'baseUrl/api/call/v1alpha1/calls/call-res/participants/p-resource/sdps/offer',
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT',
        body: '"offer"',
      }
    );
  });

  it('should get answer', async () => {
    const mockFn = mockFetch({
      sdp: 'sdp',
      type: 'answer',
    });
    const r = await api.getAnswer('calls/call-res/participants/p-resource');
    expect(mockFn).toBeCalledWith(
      'baseUrl/api/call/v1alpha1/calls/call-res/participants/p-resource/sdps/answer',
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'GET',
      }
    );
    expect(r).toEqual({
      sdp: 'sdp',
      type: 'answer',
    });
  });

  it('should add lead to call', async () => {
    const mockFn = mockFetch({
      name: 'calls/callresource/participants/participantresource',
    });
    const _ = await api.addLeadToCall({
      callName: 'calls/call-resource',
      leadName: 'leads/lead-resource',
      phoneIndex: 1,
    });
    expect(mockFn).toBeCalledWith(
      'baseUrl/api/call/v1alpha1/calls/call-resource/participants',
      {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          destination: { lead: { lead: 'leads/lead-resource', phoneIndex: 1 } },
          outgoing: true,
        }),
      }
    );
  });
});
