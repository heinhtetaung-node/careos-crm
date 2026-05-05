import _get from 'lodash/get';
import _has from 'lodash/has';
import { useEffect } from 'react';

import {
  useAddMemberToTeamMutation,
  useLazyGetTeamMembersQuery,
  useMoveMemberToTeamMutation,
  useDeleteMemberFromTeamMutation,
} from 'data/slices/teamSlice';
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUnDeleteUserMutation,
} from 'data/slices/userSlice';
import useSnackbar from 'utils/snackbar';

import { getErrorOrSuccessMessage, transformValuesForUserAPI } from './helper';

const useUserModalLogics = ({
  RolesWithTeamsField,
  RolesWithAllFields,
  RolesWithLicenseField,
  onClose,
  setShouldFetch,
  userData,
}: {
  RolesWithTeamsField: string[];
  RolesWithAllFields: string[];
  RolesWithLicenseField: string[];
  onClose?: () => void;
  setShouldFetch?: (value: boolean) => void;
  userData?: any;
}) => {
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const [getTeamMembers] = useLazyGetTeamMembersQuery();

  const [
    createUser,
    {
      isLoading: isAddingUserLoading,
      isError: addingUserError,
      error: addingUserErrorData,
      isSuccess: addingUserSuccess,
    },
  ] = useCreateUserMutation();

  const [
    updateUser,
    {
      isLoading: isUpdateUserLoading,
      isError: updateUserError,
      error: updatingUserErrorData,
      isSuccess: updateUserSuccess,
    },
  ] = useUpdateUserMutation();

  const [
    deleteUser,
    {
      isLoading: isDeleteUserLoading,
      isError: deleteUserError,
      isSuccess: deleteUserSuccess,
    },
  ] = useDeleteUserMutation();

  const [
    unDeleteUser,
    {
      isLoading: isUnDeleteUserLoading,
      isError: unDeleteUserError,
      isSuccess: unDeleteUserSuccess,
    },
  ] = useUnDeleteUserMutation();

  const [addMemberToTeam, { isError: addMemberToTeamError }] =
    useAddMemberToTeamMutation();

  const [moveMemberToTeam, { isError: moveMemberToTeamError }] =
    useMoveMemberToTeamMutation();

  const [deleteMemberFromTeam, { isError: deleteMemberFromTeamError }] =
    useDeleteMemberFromTeamMutation();

  useEffect(() => {
    if (addingUserSuccess) {
      showSuccessSnackbar(getErrorOrSuccessMessage('addUser', 'success'));
      onClose?.();
      setShouldFetch?.(true);
    }

    if (updateUserSuccess) {
      showSuccessSnackbar(getErrorOrSuccessMessage('updateUser', 'success'));
      onClose?.();
      setShouldFetch?.(true);
    }

    if (deleteUserSuccess) {
      showSuccessSnackbar(getErrorOrSuccessMessage('deleteUser', 'success'));
      onClose?.();
      setShouldFetch?.(true);
    }

    if (unDeleteUserSuccess) {
      showSuccessSnackbar(getErrorOrSuccessMessage('unDeleteUser', 'success'));
      onClose?.();
      setShouldFetch?.(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addingUserSuccess,
    updateUserSuccess,
    deleteUserSuccess,
    unDeleteUserSuccess,
  ]);

  useEffect(() => {
    if (addingUserError) {
      showErrorSnackbar(
        getErrorOrSuccessMessage(
          'addUser',
          'error',
          _get(addingUserErrorData, 'data.message', '')
        )
      );
    }
    if (updateUserError) {
      showErrorSnackbar(
        getErrorOrSuccessMessage(
          'updateUser',
          'error',
          _get(updatingUserErrorData, 'data.message', '')
        )
      );
    }
    if (deleteUserError) {
      showErrorSnackbar(getErrorOrSuccessMessage('deleteUser', 'error'));
    }
    if (unDeleteUserError) {
      showErrorSnackbar(getErrorOrSuccessMessage('unDeleteUser', 'error'));
    }
    if (moveMemberToTeamError) {
      showErrorSnackbar(getErrorOrSuccessMessage('moveMember', 'error'));
    }
    if (addMemberToTeamError) {
      showErrorSnackbar(getErrorOrSuccessMessage('addMember', 'error'));
    }
    if (deleteMemberFromTeamError) {
      showErrorSnackbar(getErrorOrSuccessMessage('deleteMember', 'error'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    addingUserError,
    updateUserError,
    deleteUserError,
    unDeleteUserError,
    moveMemberToTeamError,
    addMemberToTeamError,
    deleteMemberFromTeamError,
  ]);

  // HANDLE SUBMIT LOGIC
  // if not edit then check if role has team.
  // if has team, call add user api, get the user resource and then call the add member to team api. everything successful show the snackbar and refetch the listing data.
  // if no team data, call add user api and show the snackbar and refetch the listing data.
  // if edit check if team has changed.
  // if team has changed first fetch the current team member id of the user using the api, use the move api to move user to new team. and update the user api. if success show the snackbar and refetch the listing data.
  // if team has not changed then just call the update user api, if success show the snackbar and refetch the listing data.
  // if user change the role, then check which fields and required and remove the ones that are not.
  // if user change the role, and new role has team, then add user to the new team.
  // if user change the role and new team doesnt have team then use delete member from the old team.
  // move api is called only when the role is same?
  const handleSubmitClick = async (
    isEdit: boolean,
    originalTeam: string,
    values: {
      firstName: string;
      lastName: string;
      humanId: string;
      role: { name: string };
      language: { value: string };
      agentScore?: { value: string };
      team?: { name: string };
      dailyLimit?: number;
      totalLimit?: number;
      licenseNo?: string;
      licenseIssueDate?: string;
      licenseExpiryDate?: string;
    }
  ) => {
    const transformedValuesUserAPI = transformValuesForUserAPI(
      values,
      RolesWithAllFields.includes(values.role.name),
      RolesWithLicenseField.includes(values.role.name)
    );

    if (!isEdit) {
      if (values?.team?.name) {
        const createApiResponse = await createUser(transformedValuesUserAPI);
        const userData =
          'data' in createApiResponse ? createApiResponse.data : undefined;
        addMemberToTeam({
          teamId: values.team.name ?? '',
          userData: {
            user: _has(userData, 'name')
              ? _get(userData, 'name', undefined)
              : undefined,
          },
        });
      } else {
        await createUser(transformedValuesUserAPI);
      }
      return;
    }

    // if there is team but current select role doesnt have team then delete the user from the team.
    if (
      values?.role?.name &&
      !RolesWithTeamsField.includes(values.role.name) &&
      originalTeam
    ) {
      const teamMembers = await getTeamMembers({
        filter: `user="${userData.name}"`,
      });
      const memberData = teamMembers.data;
      deleteMemberFromTeam({
        fullMemberResource: _has(memberData, 'name')
          ? _get(memberData, 'name', '')
          : '',
      });
    } else if (originalTeam && values?.team?.name !== originalTeam) {
      const teamMembers = await getTeamMembers({
        filter: `user="${userData.name}"`,
      });
      const memberData = teamMembers.data;
      moveMemberToTeam({
        fullMemberResource: _has(memberData, 'name')
          ? _get(memberData, 'name', '')
          : '',
        moveData: {
          parent: values?.team?.name ?? '',
        },
      });
    } else if (!originalTeam && values?.team?.name) {
      addMemberToTeam({
        teamId: values?.team?.name ?? '',
        userData: {
          user: userData.name,
        },
      });
    }

    // If edit always update user data.
    updateUser({
      userId: userData.name,
      userData: transformedValuesUserAPI,
    });
  };

  const handleDeleteUserButton = () => {
    if (userData?.deleteTime !== null) {
      unDeleteUser(userData.name);
    } else {
      deleteUser(userData.name);
    }
  };

  return {
    apiStatuses: {
      isAddingUserLoading,
      isUpdateUserLoading,
      isDeleteUserLoading,
      isUnDeleteUserLoading,
    },
    handleDeleteUserButton,
    handleSubmitClick,
  };
};

export default useUserModalLogics;
