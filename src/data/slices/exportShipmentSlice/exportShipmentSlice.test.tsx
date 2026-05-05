import { HttpResponse, http } from 'msw';

import { server } from '__mocks__/server';
import { renderHook, waitFor } from '__tests__/rtl-test-utils';

import { useExportShipmentListQuery } from '.';

describe('ExportShipment', () => {
  it('should call the api and resolve the createBy values', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        () =>
          HttpResponse.json({
            exports: [{ createBy: 'name/nameID' }],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/name/nameID`,
        () =>
          HttpResponse.json({ firstName: 'firstName', lastName: 'lastName' })
      )
    );
    const { result } = renderHook(() =>
      useExportShipmentListQuery({ pageSize: 15, pageToken: '' })
    );
    await waitFor(() =>
      expect((result.current as any).data).toStrictEqual({
        exports: [{ createBy: 'firstName lastName' }],
        nextPageToken: '',
      })
    );
  });

  it.skip('should call api and if name api fail, substitute with', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        () =>
          HttpResponse.json({
            exports: [{ createBy: 'name/nameID' }],
            nextPageToken: '',
          })
      )
    );
    const { result } = renderHook(() =>
      useExportShipmentListQuery({ pageSize: 15, pageToken: '' })
    );
    await waitFor(() =>
      expect((result.current as any).data).toStrictEqual({
        exports: [{ createBy: '-' }],
        nextPageToken: '',
      })
    );
  });
});
