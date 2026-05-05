import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import SessionStorage, {
  SESSION_STORAGE_KEY,
} from 'shared/helper/SessionStorage';
import { buildUrl } from 'utils/url';

import { basePaths, baseUrls, apiSlice } from '../apiSlice';
import { IAuthUser, IKratosUser } from '../types';
import { PRODUCTS } from 'config/TypeFilter';
import { UserRoles } from 'config/constant';
import { isEnableSSO } from '../../../app.helper';

export interface KratosField {
  name: string;
  type: string;
  required: boolean;
  value?: string;
  messages?: any[];
}

export interface KratosFormConfig {
  action: string;
  method: string;
  fields: KratosField[];
  messages: any[];
}

export interface LoginRequest {
  methods: {
    password: {
      config: KratosFormConfig;
    };
  };
}

const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuthenticate: builder.query<IAuthUser, void>({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        let careosUserID: string;

        if (isEnableSSO) {
          const response = await fetchWithBQ('/oauth2/userinfo');

          if (response.error) {
            return { error: response.error };
          }
          careosUserID = (response.data as any).email;
        } else {
          const authUser = await fetchWithBQ(
            buildUrl(baseUrls.kratos, { path: 'sessions/whoami' })
          );

          if (authUser.error) {
            return { error: authUser.error };
          }
          careosUserID = (authUser.data as IKratosUser).identity.id;
        }

        const result = await fetchWithBQ(
          `${basePaths.user}/users/${careosUserID}?showDeleted=true`
        );

        new SessionStorage().removeItemByKey(SESSION_STORAGE_KEY.SUSPEND);
        const { role: userRole, product: userProduct } = result.data as any;
        return result.data
          ? {
              data: {
                ...result.data,
                product:
                  userProduct ||
                  (userRole !== UserRoles.ADMIN_ROLE &&
                    userRole !== UserRoles.SUPER_ADMIN_ROLE &&
                    PRODUCTS.CAR_PRODUCT_INSURANCE),
              } as IAuthUser,
            }
          : { error: result.error as FetchBaseQueryError };
      },
    }),

    updateLastLogin: builder.mutation<
      IAuthUser,
      Partial<IAuthUser> & Pick<IAuthUser, 'name'>
    >({
      query: ({ name }) => ({
        url: `${basePaths.user}/${name}`,
        method: 'PATCH',
        body: { loginTime: new Date().toISOString() },
      }),
    }),

    getLoginRequest: builder.query<LoginRequest, string>({
      query: (token) =>
        buildUrl(baseUrls.kratos, {
          path: `self-service/login/flows?id=${token}`,
        }),
    }),
  }),
});

export const {
  useGetAuthenticateQuery,
  useGetLoginRequestQuery,
  useUpdateLastLoginMutation,
} = authSlice;
