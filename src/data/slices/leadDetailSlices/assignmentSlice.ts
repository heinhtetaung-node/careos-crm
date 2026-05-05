import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { baseUrls, apiSlice, basePaths } from 'data/slices/apiSlice';
import has from 'lodash/has';
import { Assignment } from 'shared/types/assignment';
import { buildUrl } from 'utils/url';

import { CommonAPIResponse } from '../types';

type AssignmentRequest = {
  leadId: string;
};

type AssignemntResponse = (Assignment & CommonAPIResponse)[];

const assignmentSlices = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getAssignment: build.query<AssignemntResponse, AssignmentRequest>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        let assignment: any = [];
        let assignmentResponse: any;

        const params: any = {
          pageSize: 10,
        };
        do {
          if (assignmentResponse?.data?.nextPageToken) {
            params.pageToken = assignmentResponse?.data?.nextPageToken;
          }
          try {
            // eslint-disable-next-line no-await-in-loop
            assignmentResponse = await fetchWithBQ({
              url: buildUrl(baseUrls.salesFlow, {
                path: `${basePaths.assignment}/${arg.leadId}/assignments`,
              }),
              method: 'GET',
              params,
            });
          } catch (error) {
            return { error: error as FetchBaseQueryError };
          }
          assignment = assignment.concat(assignmentResponse.data.assignments);
        } while (
          has(assignmentResponse, 'data.nextPageToken') &&
          assignmentResponse.data.nextPageToken !== ''
        );

        // NOTE: This part of the code will be used for the next ticket.
        // BUT this is currently decreasing the test coverage so commenting it out.
        // if (arg.needUserName) {
        //   const uniqueUsers = assignment.reduce(
        //     (allUsers: any, currentUser: any) => {
        //       if (
        //         allUsers &&
        //         !allUsers.filter((all: any) => all.user === currentUser.user)
        //           .length
        //       ) {
        //         return [
        //           ...allUsers,
        //           {
        //             name: currentUser.name,
        //             user: currentUser.user,
        //           },
        //         ];
        //       }
        //       return [...allUsers];
        //     },
        //     []
        //   );

        //   const usersDetails = uniqueUsers.map(async (user: any) => {
        //     const userName: any = await fetchWithBQ(
        //       buildUrl(baseUrls.salesFlow, {
        //         path: `/api/user/v1alpha1/${user.user}`,
        //       })
        //     );

        //     if (userName.error) {
        //       return {
        //         name: user.name,
        //         user: '-',
        //       };
        //     }

        //     if (userName.data) {
        //       return {
        //         name: user.name,
        //         user: `${userName.data.firstName} ${userName.data.lastName}`,
        //       };
        //     }

        //     return {};
        //   });

        //   const assignmentWithUserName: any = await Promise.all(
        //     usersDetails
        //   ).then((res: any) => res);

        //   assignment.forEach((assign: any) => {
        //     assignmentWithUserName.forEach((assignUser: any) => {
        //       if (assign.name === assignUser.name) {
        //         // eslint-disable-next-line no-param-reassign
        //         assign.user = assignUser.user;
        //       }
        //     });
        //   });
        // }

        return {
          data: assignment,
        };
      },
    }),
  }),
});

export const { useGetAssignmentQuery, useLazyGetAssignmentQuery } =
  assignmentSlices;
