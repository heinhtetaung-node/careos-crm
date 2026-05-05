import { useNewRelic } from '@careos/newrelic';
import { useFlags, useFlagsmith } from 'flagsmith/react';
import React, { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { PRODUCTS } from 'config/TypeFilter';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

import {
  HEALTH_LEAD_URL,
  MY_LEADS_URL,
  PERMISSION_DENIED_URL,
  UserRoleID,
} from './ProtectedRouteHelper';

import FeatureFlags from 'config/flagsmithConfig';
import {
  useGetAuthenticateQuery,
  useUpdateLastLoginMutation,
} from 'data/slices/authSlice';
import { authorizeSuccess } from 'presentation/redux/slices/auth';
import { shouldEnableChatwoot } from 'presentation/routes/helper';
import LocalStorage, { LOCALSTORAGE_KEY } from 'shared/helper/LocalStorage';
import {
  intervalObservable,
  isEnableSSO,
  triggerEventObservable,
} from '../../app.helper';
import { RabbitResource } from '../../data/gateway/api/resource';
import Loading from '../../Loading';
import { updatePresence } from '../redux/actions/presence';
import ChatwootInboxEmbedded from './ChatwootInboxEmbedded';

const localStorage = new LocalStorage();

interface ProtectedRouteProps {
  component: any;
  layout: any;
  permission?: string[];
  path: string;
}

function ProtectedRoute({
  component: Component,
  layout: Layout,
  path,
  permission,
}: ProtectedRouteProps): React.JSX.Element {
  const flagsmith = useFlagsmith();
  const { nrAgent } = useNewRelic();
  const [updateLastLogin] = useUpdateLastLoginMutation();
  const dispatch = useDispatch();

  const { data: user, error, isLoading } = useGetAuthenticateQuery();

  if (!isLoading && error) {
    console.log('Redirecting to login page');
    if (isEnableSSO) {
      window.location.href = `${process.env.VITE_API_ENDPOINT}/oauth2/sign_in?rd=${window.location.href}`;
    } else {
      window.location.replace(RabbitResource.Auth.getLoginUrl());
    }
  }

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const isEnabledChatwootButton = useFlags([
    FeatureFlags.BROK_1710_ENABLE_CHATWOOT_BUTTON_2025_02_03_TEMP,
  ])[FeatureFlags.BROK_1710_ENABLE_CHATWOOT_BUTTON_2025_02_03_TEMP]?.enabled;

  useEffect(() => {
    if (user) {
      dispatch(authorizeSuccess(user));

      let interactTime = new Date().toISOString();
      const interactTimeSubscription = triggerEventObservable().subscribe(
        () => {
          interactTime = new Date().toISOString();
        }
      );
      const intervalTimeSubscription = intervalObservable().subscribe(() => {
        const body = {
          interactTime,
        };
        dispatch(updatePresence(body, user.name));
      });

      flagsmith.identify(user.humanId);

      nrAgent.setUserAttributes({
        humanId: user.humanId,
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user.name,
        role: user.role,
      });

      if (!localStorage.getItemByKey(LOCALSTORAGE_KEY.USER_ID)) {
        updateLastLogin({ name: user.name });
        localStorage.setItemByKey(
          LOCALSTORAGE_KEY.USER_ID,
          user.name.replace(/^users\//, '')
        );
      }

      return () => {
        interactTimeSubscription.unsubscribe();
        intervalTimeSubscription.unsubscribe();
      };
    }
    return () => null;
  }, [dispatch, flagsmith, nrAgent, user, updateLastLogin]);

  if (!user || isLoading) {
    return <Loading />;
  }

  const hasPermission = permission?.includes(user?.role as UserRoleID);
  const enableChatwoot = shouldEnableChatwoot(user?.role as UserRoleID, path);

  // Handle root path redirections
  if (path === '/') {
    if (globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
      return <Navigate to={HEALTH_LEAD_URL} />;
    }

    if (user?.role === UserRoleID.SalesAgent) {
      const salesAgentDefaultUrl =
        user?.product === 'products/health-insurance'
          ? HEALTH_LEAD_URL
          : MY_LEADS_URL;
      return <Navigate to={salesAgentDefaultUrl} />;
    }
  }

  // Handle unauthorized access
  if (!hasPermission) {
    return <Navigate to={PERMISSION_DENIED_URL} />;
  }

  // Render authorized route
  return (
    <Layout>
      {isEnabledChatwootButton && enableChatwoot && <ChatwootInboxEmbedded />}
      <Component authInfo={user} />
    </Layout>
  );
}

export default memo(ProtectedRoute);
