import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import ExportShipment from '.';

describe('Export shipment', () => {
  it.skip('should render the return result in the table', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        () =>
          HttpResponse.json({
            exports: [
              {
                createBy: 'name/nameID',
                status: 'SHIPMENT_LABEL_EXPORT_IN_PROGRESS',
              },
              {
                createBy: 'name/nameId',
                status: 'SHIPMENT_LABEL_EXPORT_STATUS_COMPLETE',
              },
            ],
            nextPageToken: '',
          })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/name/nameID`,
        () =>
          HttpResponse.json({ firstName: 'firstName', lastName: 'lastName' })
      )
    );
    render(<ExportShipment />);
    expect(
      screen.getByRole('columnheader', { name: 'Text.srno' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Text.requestedby' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Text.requestedat' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Text.status' })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByText('importFileStatus.inProgress')
      ).toBeInTheDocument();
      expect(screen.getByText('importFileStatus.complete')).toBeInTheDocument();
      expect(screen.getAllByText('firstName lastName').length).toBe(2);
    });
  });

  it('should call the api again if perPage changed', async () => {
    const mockHandler = jest.fn().mockImplementation((pageSize: number) => ({
      exports: [
        {
          createBy: 'name/nameID',
          status: 'SHIPMENT_LABEL_EXPORT_IN_PROGRESS',
        },
      ],
      nextPageToken: 'pageToken',
      pageSize,
    }));
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        ({ request }) => {
          const url = new URL(request.url);
          const pageSize = url.searchParams.get('pageSize');
          return HttpResponse.json(mockHandler(pageSize));
        }
      )
    );
    render(<ExportShipment />);
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
    await waitFor(() => expect(mockHandler).toHaveBeenCalledWith('15'));
    await user.click(
      within(screen.getAllByTestId('muiSelect-pageSizeSelect')[0]).getByRole(
        'button'
      )
    );
    const options = screen.getByRole('presentation');
    await user.click(within(options).getByRole('option', { name: '25' }));
    await waitFor(() => expect(mockHandler).toHaveBeenCalledWith('25'));
  });

  it('should call the api again if page changed', async () => {
    const mockHandler = jest.fn().mockReturnValue({
      exports: [
        {
          createBy: 'name/nameID',
          status: 'SHIPMENT_LABEL_EXPORT_IN_PROGRESS',
        },
      ],
      nextPageToken: 'pageToken',
    });
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        ({ request }) => {
          const url = new URL(request.url);
          const pageToken = url.searchParams.get('pageToken');
          return HttpResponse.json(mockHandler(pageToken));
        }
      )
    );
    render(<ExportShipment />);
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
    await waitFor(() =>
      expect(
        screen.getAllByTestId('pagination-next-page-btn')[0]
      ).not.toBeDisabled()
    );
    await user.click(screen.getAllByTestId('pagination-next-page-btn')[0]);
    const prevBtn = screen.getAllByTestId('pagination-prev-page-btn')[0];
    await waitFor(() => expect(prevBtn).not.toBeDisabled());
    await user.click(prevBtn);
    await waitFor(() => expect(mockHandler).toHaveBeenCalledWith('pageToken'));
  });

  it('should generate and call the api', async () => {
    const mockHandler = jest.fn().mockReturnValue({
      exports: [
        {
          createBy: 'name/nameID',
          status: 'SHIPMENT_LABEL_EXPORT_IN_PROGRESS',
        },
      ],
      nextPageToken: 'pageToken',
    });
    const mockPostHandler = jest.fn();
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        ({ request }) => {
          const url = new URL(request.url);
          const pageToken = url.searchParams.get('pageToken');
          return HttpResponse.json(mockHandler(pageToken));
        }
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        () => HttpResponse.json(mockPostHandler(() => ({ data: 'success)' })))
      )
    );
    render(<ExportShipment />);
    await waitFor(() => expect(mockHandler).toHaveBeenCalled());
    await user.click(screen.getByTestId('export-shipment-btn'));
    const modal = within(screen.getByRole('presentation'));
    await user.click(modal.getByRole('button', { name: 'text.confirmButton' }));
    await waitFor(() => expect(mockPostHandler).toHaveBeenCalled());
  });

  it.skip('should sort the list with createTime', async () => {
    const mockHandler = jest.fn().mockReturnValue({
      exports: [
        {
          createBy: 'name/nameID',
          status: 'SHIPMENT_LABEL_EXPORT_IN_PROGRESS',
        },
      ],
      nextPageToken: 'pageToken',
    });
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/order-shipment/v1alpha1/shipmentLabelExports`,
        ({ request }) => {
          const url = new URL(request.url);
          const orderBy = url.searchParams.get('orderBy');
          return HttpResponse.json(mockHandler(orderBy));
        }
      )
    );
    render(<ExportShipment />);
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith('createTime desc')
    );
    mockHandler.mockClear();
    await user.click(screen.getByRole('button', { name: 'Text.requestedat' }));
    await waitFor(() => expect(mockHandler).toHaveBeenCalledWith(null));
    mockHandler.mockClear();
    await user.click(screen.getByRole('button', { name: 'Text.requestedat' }));
    await waitFor(() => expect(mockHandler).toHaveBeenCalledWith('createTime'));
  });
});
