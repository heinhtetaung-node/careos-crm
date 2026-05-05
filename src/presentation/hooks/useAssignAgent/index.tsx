import { skipToken } from '@reduxjs/toolkit/query';
import { useGetAssignmentQuery } from 'data/slices/leadDetailSlices/assignmentSlice';
import { useGetUserByUserIdQuery } from 'data/slices/userSlice';

function useGetAssignAgent(leadId?: string) {
  const { data: assignment, isLoading: assignmentLoading } =
    useGetAssignmentQuery(leadId ? { leadId } : skipToken);
  const { data: assignUser, isLoading: assignedUserLoading } =
    useGetUserByUserIdQuery(assignment?.[0]?.user ?? skipToken);

  return {
    isLoading: assignmentLoading || assignedUserLoading,
    assignAgent: assignUser,
  };
}

export default useGetAssignAgent;
