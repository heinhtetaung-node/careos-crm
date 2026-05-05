import { http, HttpResponse } from 'msw';

import { server } from '__mocks__/server';
import { act, renderHook, waitFor, cleanup } from '__tests__/rtl-test-utils';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';

import useUserModalLogics from './useUserModalLogics';

const mockOnClose = jest.fn();
const mockSetShouldFetch = jest.fn();
const mockErrorShow = jest.fn();
const mockSuccessShow = jest.fn();

jest.mock('utils/snackbar', () =>
  jest.fn().mockImplementation(() => ({
    showErrorSnackbar: mockErrorShow,
    showSuccessSnackbar: mockSuccessShow,
  }))
);

describe('useUserModalLogics', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockSetShouldFetch.mockClear();
    mockErrorShow.mockClear();
    mockSuccessShow.mockClear();
  });

  afterEach(async () => {
    await cleanup();
  });

  it('should show error snackbar if delete api fail and keep modal open', async () => {
    server.use(
      http.delete(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/fakeUserId2`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    const { result }: any = renderHook(() =>
      useUserModalLogics({
        RolesWithTeamsField: [
          UserRoleID.SalesAgent,
          UserRoleID.CustomerService,
          UserRoleID.DocumentsCollection,
          UserRoleID.QualityControl,
          UserRoleID.Submission,
        ],
        RolesWithLicenseField: [UserRoleID.SalesAgent, UserRoleID.Supervisor],
        RolesWithAllFields: [UserRoleID.SalesAgent],
        onClose: mockOnClose,
        setShouldFetch: mockSetShouldFetch,
        userData: {
          annotations: {
            daily_limit: '100',
            lang: 'TH',
            score: '3',
            total_limit: '10000',
          },
          createBy: 'users/fakeUserId',
          createByFirstName: 'Udgar',
          createByFullName: 'Udgar Bhasu',
          createByLastName: 'Bhasu',
          createTime: '2024-01-31T09:03:33.924405Z',
          deleteTime: null,
          firstName: 'Test',
          fullName: 'Test Test',
          humanId: 'tester@testing.com',
          lastName: 'Test',
          loginTime: null,
          name: 'users/fakeUserId2',
          role: 'roles/sales',
          teamDisplayName: 'A BC DEF G HI JK',
          teamProduct: 'products/car-insurance',
          updateTime: '2024-01-31T09:27:35.522868Z',
        },
      })
    );

    await act(() => result?.current?.handleDeleteUserButton?.());

    await waitFor(() => {
      expect(mockErrorShow).toHaveBeenCalledWith('text.suspendUserFailed');
    });
  });

  it('should show success snackbar if delete api passes and close modal and fetch list again', async () => {
    server.use(
      http.delete(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/fakeUserId2`,
        () => new HttpResponse(null, { status: 200 })
      )
    );

    const { result }: any = renderHook(() =>
      useUserModalLogics({
        RolesWithTeamsField: [
          UserRoleID.SalesAgent,
          UserRoleID.CustomerService,
          UserRoleID.DocumentsCollection,
          UserRoleID.QualityControl,
          UserRoleID.Submission,
        ],
        RolesWithLicenseField: [UserRoleID.SalesAgent, UserRoleID.Supervisor],
        RolesWithAllFields: [UserRoleID.SalesAgent],
        onClose: mockOnClose,
        setShouldFetch: mockSetShouldFetch,
        userData: {
          annotations: {
            daily_limit: '100',
            lang: 'TH',
            score: '3',
            total_limit: '10000',
          },
          createBy: 'users/fakeUserId',
          createByFirstName: 'Udgar',
          createByFullName: 'Udgar Bhasu',
          createByLastName: 'Bhasu',
          createTime: '2024-01-31T09:03:33.924405Z',
          deleteTime: null,
          firstName: 'Test',
          fullName: 'Test Test',
          humanId: 'tester@testing.com',
          lastName: 'Test',
          loginTime: null,
          name: 'users/fakeUserId2',
          role: 'roles/sales',
          teamDisplayName: 'A BC DEF G HI JK',
          teamProduct: 'products/car-insurance',
          updateTime: '2024-01-31T09:27:35.522868Z',
        },
      })
    );

    await act(() => result?.current?.handleDeleteUserButton?.());

    await waitFor(() => {
      expect(mockSuccessShow).toHaveBeenCalledWith('text.suspendUserSuccess');
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockSetShouldFetch).toHaveBeenCalled();
    });
  });

  it('should show error snackbar if undelete api fail and keep modal open', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/fakeUserId2:undelete`,
        () => new HttpResponse(null, { status: 500 })
      )
    );

    const { result }: any = renderHook(() =>
      useUserModalLogics({
        RolesWithTeamsField: [
          UserRoleID.SalesAgent,
          UserRoleID.CustomerService,
          UserRoleID.DocumentsCollection,
          UserRoleID.QualityControl,
          UserRoleID.Submission,
        ],
        RolesWithLicenseField: [UserRoleID.SalesAgent, UserRoleID.Supervisor],
        RolesWithAllFields: [UserRoleID.SalesAgent],
        onClose: mockOnClose,
        setShouldFetch: mockSetShouldFetch,
        userData: {
          annotations: {
            daily_limit: '100',
            lang: 'TH',
            score: '3',
            total_limit: '10000',
          },
          createBy: 'users/fakeUserId',
          createByFirstName: 'Udgar',
          createByFullName: 'Udgar Bhasu',
          createByLastName: 'Bhasu',
          createTime: '2024-01-31T09:03:33.924405Z',
          deleteTime: '2024-02-29T09:03:33.924405Z',
          firstName: 'Test',
          fullName: 'Test Test',
          humanId: 'tester@testing.com',
          lastName: 'Test',
          loginTime: null,
          name: 'users/fakeUserId2',
          role: 'roles/sales',
          teamDisplayName: 'A BC DEF G HI JK',
          teamProduct: 'products/car-insurance',
          updateTime: '2024-01-31T09:27:35.522868Z',
        },
      })
    );

    await act(() => result?.current?.handleDeleteUserButton?.());
    await waitFor(() => {
      expect(mockErrorShow).toHaveBeenCalledWith('text.activateUserFailed');
    });
  });

  it('should show success snackbar if undelete api passes and close modal and fetch list again', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/user/v1alpha1/users/fakeUserId2:undelete`,
        () => new HttpResponse(null, { status: 200 })
      )
    );

    const { result }: any = renderHook(() =>
      useUserModalLogics({
        RolesWithTeamsField: [
          UserRoleID.SalesAgent,
          UserRoleID.CustomerService,
          UserRoleID.DocumentsCollection,
          UserRoleID.QualityControl,
          UserRoleID.Submission,
        ],
        RolesWithLicenseField: [UserRoleID.SalesAgent, UserRoleID.Supervisor],
        RolesWithAllFields: [UserRoleID.SalesAgent],
        onClose: mockOnClose,
        setShouldFetch: mockSetShouldFetch,
        userData: {
          annotations: {
            daily_limit: '100',
            lang: 'TH',
            score: '3',
            total_limit: '10000',
          },
          createBy: 'users/fakeUserId',
          createByFirstName: 'Udgar',
          createByFullName: 'Udgar Bhasu',
          createByLastName: 'Bhasu',
          createTime: '2024-01-31T09:03:33.924405Z',
          deleteTime: '2024-02-29T09:03:33.924405Z',
          firstName: 'Test',
          fullName: 'Test Test',
          humanId: 'tester@testing.com',
          lastName: 'Test',
          loginTime: null,
          name: 'users/fakeUserId2',
          role: 'roles/sales',
          teamDisplayName: 'A BC DEF G HI JK',
          teamProduct: 'products/car-insurance',
          updateTime: '2024-01-31T09:27:35.522868Z',
        },
      })
    );

    await act(() => result?.current?.handleDeleteUserButton?.());

    await waitFor(() => {
      expect(mockSuccessShow).toHaveBeenCalledWith('text.activateUserSuccess');
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockSetShouldFetch).toHaveBeenCalled();
    });
  });
});
