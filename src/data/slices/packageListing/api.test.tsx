import { HttpResponse, http } from 'msw';
import { Subject } from 'rxjs';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';
import WebSocketGateway from 'data/gateway/websocket';
import getApiEndpoint from 'utils/endpointHelper';

import { useGetPackagesQuery } from './api';

const mockUpdateStream = new Subject();

jest.spyOn(WebSocketGateway, 'getInstance').mockReturnValue({
  subscribe: jest.fn().mockReturnValue(mockUpdateStream),
} as any);

describe('useGetPackagesQuery', () => {
  it('should stream the updates', async () => {
    server.use(
      http.get(
        getApiEndpoint('/v1alpha1/leads/leadId/packages:searchwithPricing'),
        () =>
          HttpResponse.json({
            packages: {
              packages: [
                {
                  name: 'customPackages/id',
                  customPackageStatus: 'APPROVAL_REQUIRED',
                },
              ],
            },
          })
      )
    );
    const { result } = renderHook(() =>
      useGetPackagesQuery({
        leadId: 'leadId',
        productType: 'products/car-insurance',
      })
    );
    await waitFor(() => expect((result.current as any).isLoading).toBe(false));
    expect((result.current as any).data).toStrictEqual({
      packages: [
        { customPackageStatus: 'APPROVAL_REQUIRED', name: 'customPackages/id' },
      ],
    });
    mockUpdateStream.next({
      body: { name: 'customPackages/id', status: 'APPROVED' },
    });
    await waitFor(() =>
      expect((result.current as any).data).toStrictEqual({
        packages: [
          { customPackageStatus: 'APPROVED', name: 'customPackages/id' },
        ],
      })
    );
  });
});
