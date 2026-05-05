/* eslint-disable @typescript-eslint/no-non-null-assertion */
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { MockInsurers } from 'mock-data/Insurers.mock';
import * as CONSTANTS from 'shared/constants';

import DownloadPolicyDocument from '.';

var mockDownloadFromBobUrl: jest.Mock;
var mockSnackBar: jest.Mock;

jest.mock('shared/helper/downloadDocumentHelper', () => {
  mockDownloadFromBobUrl = jest.fn();
  return {
    ...jest.requireActual('shared/helper/downloadDocumentHelper'),
    downloadFileFromBlobURL: mockDownloadFromBobUrl,
  };
});
jest.mock('presentation/redux/actions/ui', () => {
  mockSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockSnackBar,
  };
});

describe('Test <DownloadPolicyDocument/>', () => {
  test('<DownloadPolicyDocument/> button merge and down', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
        () => HttpResponse.json(MockInsurers)
      ),
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/-/documents:merge`,
        () =>
          HttpResponse.json({
            documentName: 'documents/cb1c9778-5a71-4e1a-afb9-81a5614171f7',
          })
      )
    );

    render(<DownloadPolicyDocument />, {
      initialState: {
        ordersReducer: {
          insurersAllReducer: {
            data: [
              {
                name: 'insurers/42',
                displayName: 'FPG Insurance',
                displayNameTh: 'เอฟพีจี ประกันภัย',
              },
              {
                name: 'insurers/40',
                displayName: 'Chubb Samaggi Insurance Co. (PLC)',
                displayNameTh: 'บริษัท ชับบ์สามัคคีประกันภัย จำกัด (มหาชน)',
              },
            ],
          },
        },
        selectionsReducer: {
          selectedPolicies: [
            {
              orderId: 'orders/b3053769-873b-4df7-8299-38da6df52d1d',
              items: [
                'orders/b3053769-873b-4df7-8299-38da6df52d1d/items/d2dcb941-929c-4886-8109-c6cf7b86b2e9',
                'orders/b3053769-873b-4df7-8299-38da6df52d1d/items/ae287fda-70cd-4ba0-98da-a52dc6a76f95',
              ],
              approvalStatuses: ['POLICY_UPLOADED'],
              insurers: ['FPG Insurance'],
              noOfPolicies: 2,
            },
          ],
        },
      },
    });
    const docDownloadBtn = screen.getByRole('button', {
      name: 'order.shipping.downloadPolicyDocs',
    });

    await userEvent.click(docDownloadBtn);

    const dialog = screen.getByRole('presentation');
    const autocompletes = within(dialog).getAllByRole('combobox');
    const insurer = autocompletes[0];
    const docType = autocompletes[1];

    await userEvent.click(insurer.querySelector('input')!);
    const insurerMenu = screen.getAllByRole('presentation')[1];

    let option = await within(insurerMenu).findByText('FPG Insurance');
    await userEvent.click(option);

    await userEvent.click(docType.querySelector('input')!);
    const docMenu = screen.getAllByRole('presentation')[1];

    option = within(docMenu).getByText('Document type policy');
    await userEvent.click(option);

    const submitBtn = within(dialog).getByRole('button', { name: 'Submit' });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockDownloadFromBobUrl).toHaveBeenCalledWith(
        'documents/cb1c9778-5a71-4e1a-afb9-81a5614171f7'
      );
    });
  });

  test('<DownloadPolicyDocument/> show error snackbar', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/car/v1alpha1/insurers`,
        () => HttpResponse.json(MockInsurers)
      ),
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/orders/-/documents:merge`,
        () => HttpResponse.json({ message: 'error' }, { status: 400 })
      )
    );

    render(<DownloadPolicyDocument />, {
      initialState: {
        ordersReducer: {
          insurersAllReducer: {
            data: [
              {
                name: 'insurers/42',
                displayName: 'FPG Insurance',
                displayNameTh: 'เอฟพีจี ประกันภัย',
              },
              {
                name: 'insurers/40',
                displayName: 'Chubb Samaggi Insurance Co. (PLC)',
                displayNameTh: 'บริษัท ชับบ์สามัคคีประกันภัย จำกัด (มหาชน)',
              },
            ],
          },
        },
        selectionsReducer: {
          selectedPolicies: [
            {
              orderId: 'orders/b3053769-873b-4df7-8299-38da6df52d1d',
              items: [
                'orders/b3053769-873b-4df7-8299-38da6df52d1d/items/d2dcb941-929c-4886-8109-c6cf7b86b2e9',
                'orders/b3053769-873b-4df7-8299-38da6df52d1d/items/ae287fda-70cd-4ba0-98da-a52dc6a76f95',
              ],
              approvalStatuses: ['POLICY_UPLOADED'],
              insurers: ['FPG Insurance'],
              noOfPolicies: 2,
            },
          ],
        },
      },
    });

    const docDownloadBtn = screen.getByRole('button', {
      name: 'order.shipping.downloadPolicyDocs',
    });

    await userEvent.click(docDownloadBtn);

    const dialog = screen.getByRole('presentation');
    const autocompletes = within(dialog).getAllByRole('combobox');
    const insurer = autocompletes[0];
    const docType = autocompletes[1];

    await userEvent.click(insurer.querySelector('input')!);
    const insurerMenu = screen.getAllByRole('presentation')[1];
    let option = await within(insurerMenu).findByText('FPG Insurance');
    await userEvent.click(option);

    await userEvent.click(docType.querySelector('input')!);
    const docMenu = screen.getAllByRole('presentation')[1];

    option = within(docMenu).getByText('Document type policy');
    await userEvent.click(option);

    const submitBtn = within(dialog).getByRole('button', { name: 'Submit' });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.errorMessage',
        status: CONSTANTS.snackBarConfig.type.error,
      });
    });
  });
});
