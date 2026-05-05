import { HttpResponse, http } from 'msw';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import getEndpoint from 'utils/endpointHelper';

import { updateLeadSlice, updateLeadJsonSlice } from './updateLeadSlice';

var mockedFn: jest.Mock = jest.fn(() => ({
  type: 'mockAction',
  payload: {},
}));

jest.mock('presentation/redux/actions/ui', () => ({
  showSnackBar: mockedFn,
}));

describe('updateLeadSlice', () => {
  const storeRef = setupApiStore(updateLeadSlice);

  test('should call api correctly when patchType is passed', () => {
    server.use(
      http.patch(
        getEndpoint(`/api/lead/v1alpha2/leads/FakeLeadId:fakePatchType`),
        async ({ request }) => new HttpResponse(request.body)
      )
    );
    return (storeRef.store as any)
      .dispatch(
        updateLeadSlice.endpoints.updateLeadStatus.initiate({
          leadId: 'leads/FakeLeadId',
          payload: {
            status: 'fakeStatus',
            comment: 'fakeCommentResponse',
          },
          patchType: 'fakePatchType',
        })
      )
      .then((action: any) => {
        expect(action.data).toStrictEqual({
          comment: 'fakeCommentResponse',
          status: 'fakeStatus',
        });
      });
  });

  test('should call api correctly when patchType is not passed', () => {
    server.use(
      http.patch(
        getEndpoint('/api/lead/v1alpha2/leads/FakeLeadId'),
        async ({ request }) => new HttpResponse(request.body)
      )
    );
    return (storeRef.store as any)
      .dispatch(
        updateLeadSlice.endpoints.updateLeadStatus.initiate({
          leadId: 'leads/FakeLeadId',
          payload: {
            status: 'fakeStatus',
            comment: 'fakeCommentResponse',
          },
        })
      )
      .then((action: any) => {
        expect(action.data).toStrictEqual({
          comment: 'fakeCommentResponse',
          status: 'fakeStatus',
        });
      });
  });
});

describe('updateLeadJsonSlice', () => {
  const storeRef = setupApiStore(updateLeadJsonSlice);

  test('should call api correctly', () => {
    server.use(
      http.patch(
        getEndpoint('/api/lead/v1alpha2/leads/leadId:patchData'),
        async ({ request }) => new HttpResponse(request.body)
      )
    );
    return (storeRef.store as any)
      .dispatch(
        updateLeadJsonSlice.endpoints.updateLeadJson.initiate({
          leadId: 'leadId',
          payload: [{ op: 'add', path: 'path', value: 'value' }],
        })
      )
      .then((action: any) => {
        expect(action.data).toStrictEqual([
          { op: 'add', path: 'path', value: 'value' },
        ]);
      });
  });
});
