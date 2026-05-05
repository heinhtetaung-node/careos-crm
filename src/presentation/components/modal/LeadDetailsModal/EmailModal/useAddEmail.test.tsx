import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { renderHook } from '__tests__/rtl-test-utils';

import useAddEmail from './useAddEmail';

const mockedLeadStore = {
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/00000000-0000-0000-0000-000000000000',
        data: {
          customerEmail: ['test1@email.com', 'test2@email.com'],
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

describe('useAddEmail', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should call show success snackbar if api success', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      )
    );
    const { result }: any = renderHook(useAddEmail);
    await result.current.addEmail('test@gmail.com');
    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.addEmailSuccess',
      status: 'success',
    });
  });

  test('should call show error snackbar if api is error', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        () => HttpResponse.json({ message: 'error message' }, { status: 500 })
      )
    );
    const { result }: any = renderHook(useAddEmail);
    await result.current.addEmail('test@gmail.com');
    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'error message',
      status: 'error',
    });
  });

  test("should add new email if email doesn't exist yet", async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );
    const { result }: any = renderHook(useAddEmail);
    const response = await result.current.addEmail('test@gmail.com');
    expect(response.data[0].value).toStrictEqual(['test@gmail.com']);
  });

  test('should display error if user tries to add same email again', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/00000000-0000-0000-0000-000000000000:patchData`,
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );
    const { result }: any = renderHook(() => useAddEmail(), {
      initialState: mockedLeadStore,
    });

    await result.current.addEmail('test1@email.com');
    expect(mockedShowSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.emailAlreadyExist',
      status: 'error',
    });
  });
});
