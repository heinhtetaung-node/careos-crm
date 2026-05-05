import { http, HttpResponse } from 'msw';
import { act } from 'react-dom/test-utils';

import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';
import mockLeadAddComments from 'mock-data/LeadAddComments.mock';
import mockLeadComments from 'mock-data/LeadComments.mock';
import mockUserData from 'mock-data/UserData.mock';

import useUpdateSummaryModal from './useUpdateSummaryModal';

var mockedShowSnackBar: jest.Mock;
var mockedHideModal: jest.Mock;

jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  mockedHideModal = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
    hideModal: mockedHideModal,
  };
});

describe('useAddEmail', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should show success snackbar if all the api is successful', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments`,
        () => HttpResponse.json(mockLeadAddComments)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments`,
        () => HttpResponse.json(mockLeadComments)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha2/:userId`,
        () => HttpResponse.json(mockUserData)
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000:updateStatus`,
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/reject/v1alpha1/leads/00000000-0000-0000-0000-000000000000/rejections`,
        () => HttpResponse.json(null, { status: 200 })
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/reject/v1alpha1/leads/00000000-0000-0000-0000-000000000000/rejections`,
        () => HttpResponse.json({ rejections: [], nextPageToken: '' })
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000:patchData`,
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      )
    );

    const { result }: any = renderHook(useUpdateSummaryModal);
    await act(async () => {
      await result.current[0](
        '00000000-0000-0000-0000-000000000000',
        'LEAD_STATUS_NEW',

        {
          comment: 'Fake Comment',
          approved: true,
          reason: 'already_purchased',
          status: 'LEAD_STATUS_CONTACTED',
          policyExpiryDate: new Date(),
        },
        jest.fn()
      );
    });

    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.summaryModalUpdateSuccessful',
      status: 'success',
    });
  });

  test('should show error snackbar if one of the api fails', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments`,
        () => HttpResponse.json(mockLeadAddComments)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments`,
        () => HttpResponse.json(mockLeadComments)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha2/:userId`,
        () => HttpResponse.json(mockUserData)
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000:updateStatus`,
        () =>
          HttpResponse.json(
            {
              code: 3,
              message: 'lead status is not allowed',
              details: [],
            },
            { status: 400 }
          )
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/reject/v1alpha1/leads/00000000-0000-0000-0000-000000000000/rejections`,
        () =>
          HttpResponse.json(
            {
              code: 6,
              message:
                'lead already has either a non-decided or a decided and approved rejection request',
              details: [],
            },
            { status: 409 }
          )
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/reject/v1alpha1/leads/00000000-0000-0000-0000-000000000000/rejections`,
        () => HttpResponse.json({ rejections: [], nextPageToken: '' })
      ),
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000:patchData`,
        () =>
          HttpResponse.json(
            {
              code: 6,
              message:
                'lead already has either a non-decided or a decided and approved rejection request',
              details: [],
            },
            { status: 409 }
          )
      )
    );

    const { result }: any = renderHook(useUpdateSummaryModal);

    await act(async () => {
      await result.current[0](
        '00000000-0000-0000-0000-000000000000',
        'LEAD_STATUS_NEW',
        {
          comment: 'Fake Comment',
          approved: true,
          reason: 'already_purchased',
          status: 'LEAD_STATUS_CONTACTED',
          policyExpiryDate: new Date(),
        },
        jest.fn()
      );
    });

    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.summaryModalUpdateFailure',
      status: 'error',
    });
  });

  test('should not call the remaining api and should show error snackbar if comment api faile', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments`,
        () =>
          HttpResponse.json(
            {
              message: 'Internal server error',
            },
            { status: 503 }
          )
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000/comments`,
        () => HttpResponse.json(mockLeadComments)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha2/:userId`,
        () => HttpResponse.json(mockUserData)
      )
    );

    const { result }: any = renderHook(useUpdateSummaryModal);

    await act(async () => {
      await result.current[0](
        '00000000-0000-0000-0000-000000000000',
        'LEAD_STATUS_NEW',
        {
          comment: 'Fake Comment',
          approved: true,
          reason: 'already_purchased',
          status: 'LEAD_STATUS_NEW',
          policyExpiryDate: new Date(),
        },
        jest.fn()
      );
    });

    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.summaryModalUpdateFailure',
      status: 'error',
    });
  });
});
