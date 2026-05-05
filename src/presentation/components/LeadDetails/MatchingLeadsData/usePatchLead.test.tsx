import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, renderHook, screen, waitFor } from '__tests__/rtl-test-utils';
import getEndpoint from 'utils/endpointHelper';

import usePatchLead from './usePatchLead';

const mockedLeadStore = {
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/00000000-0000-0000-0000-000000000000',
        data: {
          customerEmail: ['existingEmail@gmail.com'],
          customerPhoneNumber: [{ phone: '+66999999999', status: 'valid' }],
          primaryPhoneIndex: 0,
        },
      },
    },
  },
};

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

describe('usePatchLead', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  it('should call api to patch email', async () => {
    server.use(
      http.get(
        getEndpoint(
          'api/lead/v1alpha2/leads/11111111-1111-1111-1111-111111111111'
        ),
        () =>
          HttpResponse.json({
            name: 'leads/11111111-1111-1111-1111-111111111111',
            data: {
              primaryPhoneIndex: 0,
              customerPhoneNumber: [
                {
                  phone: '+66888888888',
                  status: 'valid',
                },
              ],
              customerEmail: ['haakunamatata@gmail.com'],
            },
          })
      ),
      http.patch(
        getEndpoint('api/lead/v1alpha2/leads/:patchData'),
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      )
    );

    const { result }: any = renderHook(usePatchLead, {
      initialState: mockedLeadStore,
    });
    const { PatchLeadButton } = await result.current;

    render(
      <PatchLeadButton
        leadId="leads/11111111-1111-1111-1111-111111111111"
        field="email"
        value="fakeEmail@gmail.com"
        testId="email-patch-button"
        patchLeadDisabled={false}
      />,
      { initialState: mockedLeadStore }
    );

    waitFor(() => {
      expect(
        screen.getByTestId(
          'email-patch-button-leads/11111111-1111-1111-1111-111111111111'
        )
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('patch-lead-button-email'));

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.addEmailSuccess',
        status: 'success',
      });
    });
  });

  it('should display error snackbar when trying to patch email that already exist', async () => {
    server.use(
      http.get(
        getEndpoint(
          'api/lead/v1alpha2/leads/11111111-1111-1111-1111-111111111111'
        ),
        () =>
          HttpResponse.json({
            name: 'leads/11111111-1111-1111-1111-111111111111',
            data: {
              primaryPhoneIndex: 0,
              customerPhoneNumber: [
                {
                  phone: '+66999999999',
                  status: 'valid',
                },
              ],
              customerEmail: ['existingEmail@gmail.com'],
            },
          })
      )
    );

    const { result }: any = renderHook(usePatchLead, {
      initialState: mockedLeadStore,
    });
    const { PatchLeadButton } = await result.current;

    render(
      <PatchLeadButton
        leadId="leads/11111111-1111-1111-1111-111111111111"
        field="email"
        value="existingEmail@gmail.com"
        testId="email-patch-button"
        patchLeadDisabled={false}
      />,
      { initialState: mockedLeadStore }
    );

    waitFor(() => {
      expect(
        screen.getByTestId(
          'email-patch-button-leads/11111111-1111-1111-1111-111111111111'
        )
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('patch-lead-button-email'));

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.emailAlreadyExist',
        status: 'error',
      });
    });
  });

  it('should call api to patch phone', async () => {
    server.use(
      http.get(
        getEndpoint(
          'api/lead/v1alpha2/leads/11111111-1111-1111-1111-111111111111'
        ),
        () =>
          HttpResponse.json({
            name: 'leads/11111111-1111-1111-1111-111111111111',
            data: {
              primaryPhoneIndex: 0,
              customerPhoneNumber: [
                {
                  phone: '+66888888888',
                  status: 'valid',
                },
              ],
              customerEmail: ['haakunamatata@gmail.com'],
            },
          })
      ),
      http.patch(
        getEndpoint('api/lead/v1alpha2/leads/:patchData'),
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      )
    );

    const { result }: any = renderHook(usePatchLead, {
      initialState: mockedLeadStore,
    });
    const { PatchLeadButton } = await result.current;

    render(
      <PatchLeadButton
        leadId="leads/11111111-1111-1111-1111-111111111111"
        field="phone"
        value="0888888888"
        testId="phone-patch-button"
        patchLeadDisabled={false}
      />,
      { initialState: mockedLeadStore }
    );

    waitFor(() => {
      expect(
        screen.getByTestId(
          'phone-patch-button-leads/11111111-1111-1111-1111-111111111111'
        )
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('patch-lead-button-phone'));

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.addPhoneSuccess',
        status: 'success',
      });
    });
  });

  it('should display error snackbar when trying to patch phone that already exist', async () => {
    server.use(
      http.get(
        getEndpoint(
          'api/lead/v1alpha2/leads/11111111-1111-1111-1111-111111111111'
        ),
        () =>
          HttpResponse.json({
            name: 'leads/11111111-1111-1111-1111-111111111111',
            data: {
              primaryPhoneIndex: 0,
              customerPhoneNumber: [
                {
                  phone: '+66999999999',
                  status: 'valid',
                },
              ],
              customerEmail: ['haakunamatata@gmail.com'],
            },
          })
      )
    );

    const { result }: any = renderHook(usePatchLead, {
      initialState: mockedLeadStore,
    });
    const { PatchLeadButton } = await result.current;

    render(
      <PatchLeadButton
        leadId="leads/11111111-1111-1111-1111-111111111111"
        field="phone"
        value="+66999999999"
        testId="phone-patch-button"
        patchLeadDisabled={false}
      />,
      { initialState: mockedLeadStore }
    );

    waitFor(() => {
      expect(
        screen.getByTestId(
          'phone-patch-button-leads/11111111-1111-1111-1111-111111111111'
        )
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('patch-lead-button-phone'));

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.phoneAlreadyExist',
        status: 'error',
      });
    });
  });
});
