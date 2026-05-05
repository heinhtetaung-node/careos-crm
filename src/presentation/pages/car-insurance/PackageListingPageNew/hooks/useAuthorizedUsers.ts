import { useEffect, useMemo } from 'react';

import { UserRoles } from 'config/constant';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useLazyGetAssignmentQuery } from 'data/slices/leadDetailSlices/assignmentSlice';
import { getUserRoleAccessLead } from 'utils/userRolesAccess';

/* should moved to presentation/hooks */
const useAuthorizedUsers = (leadId?: string) => {
  const { data: user, isLoading: isUserLoading } = useGetAuthenticateQuery();
  const [
    getAssignment,
    { data: assignmentData, isLoading: isAssignmentLoading },
  ] = useLazyGetAssignmentQuery();

  const { viewPackageListingDetailComparison } = getUserRoleAccessLead(
    user?.role as UserRoles
  );

  const userRoleAllowed = useMemo(
    () => !isUserLoading && user && viewPackageListingDetailComparison,
    [isUserLoading, user, viewPackageListingDetailComparison]
  );

  useEffect(() => {
    if (!userRoleAllowed && leadId) {
      getAssignment({
        leadId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRoleAllowed, leadId]);

  const isUserAllowed = useMemo(() => {
    if (!isUserLoading && !isAssignmentLoading) {
      return (
        userRoleAllowed ||
        (assignmentData &&
          user &&
          assignmentData.length > 0 &&
          assignmentData[0].user === user.name)
      );
    }

    return userRoleAllowed || false;
  }, [
    isUserLoading,
    isAssignmentLoading,
    userRoleAllowed,
    assignmentData,
    user,
  ]);

  return {
    isLoading: isUserLoading || isAssignmentLoading,
    isUserAllowed,
  };
};

export default useAuthorizedUsers;
