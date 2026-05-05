import { has } from 'lodash';
import { useMemo, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import WebSocketGateway from 'data/gateway/websocket';
import {
  addMoreActivities,
  useGetAllLeadActivities,
  addActivity,
  resetActivities,
} from 'data/slices/leadDetails/activitySlice';
import { useLazyGetActivitiesQuery } from 'data/slices/leadDetails/activitySlice/api';
import { useLazyGetUserByUserIdQuery } from 'data/slices/userSlice';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getLeadIdFromPath } from 'shared/helper/utilities';

export default function useGetActivity(leadId = getLeadIdFromPath()) {
  const leadResource = `leads/${leadId}`;
  const dispatch = useDispatch();

  const { nextPageToken } = useGetAllLeadActivities();

  const [getUser] = useLazyGetUserByUserIdQuery();

  const [
    getActivities,
    { isLoading: isFetchingActivities, error: fetchError },
  ] = useLazyGetActivitiesQuery();

  const hasMore = useMemo(() => nextPageToken !== '', [nextPageToken]);

  const dispatchAddActivity = useCallback(
    (response: any) => {
      dispatch(
        addMoreActivities({
          activities: response.data?.activities,
          nextPageToken: response.data?.nextPageToken,
        })
      );
    },
    [dispatch]
  );

  const transformData = useCallback(
    async (eventData: any, type: 'comment' | 'script' | 'remark') => {
      let user;
      if (eventData?.body?.createBy) {
        const response = await getUser(eventData.body.createBy).unwrap();
        user = `${response.firstName} ${response.lastName}`;
      }

      return {
        ...(type === 'comment' && { comment: { ...eventData.body } }),
        ...(type === 'script' && { script: { ...eventData.body } }),
        ...(type === 'remark' && {
          remark: eventData.body?.annotations?.remark,
        }),
        createBy: user || '',
        type,
      };
    },
    [getUser]
  );

  const handleWebSocketUpdates = useCallback(
    async (resp: any, type: 'comment' | 'script' | 'remark') => {
      const activity: any = await transformData(resp, type);
      dispatch(
        addActivity({
          activity,
        })
      );
    },
    [dispatch, transformData]
  );

  useEffect(() => {
    async function fetchResponse() {
      const response = await getActivities({
        leadId: leadResource,
        allActivityParams: { pageToken: nextPageToken, pageSize: 5 },
      });

      if (response && has(response, 'data')) {
        dispatchAddActivity(response);
      }
    }
    fetchResponse();
    return () => {
      dispatch(resetActivities());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNext = async (pageToken: string) => {
    const response = await getActivities({
      leadId: leadResource,
      allActivityParams: { pageToken, pageSize: 5 },
    });

    if (response && has(response, 'data')) {
      dispatchAddActivity(response);
    }
  };

  const loadMore = async () => {
    if (hasMore) {
      await getNext(nextPageToken);
    }
  };

  useEffect(() => {
    if (fetchError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.fetchingActivitiesFailed'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError]);

  // websocket subscription
  useEffect(() => {
    const commentsPattern = new RegExp(
      `lead/v1alpha2/${leadResource}/comments/.*`
    );
    const scriptsPattern = new RegExp(
      `lead/v1alpha2/${leadResource}/scripts/.*`
    );
    const ws = WebSocketGateway.getInstance().subscribe(
      `lead/v1alpha2/${leadResource}`
    );
    const subscription = ws?.subscribe(async (resp: any) => {
      if (resp?.body) {
        if (commentsPattern.test(resp?.name)) {
          handleWebSocketUpdates(resp, 'comment');
        } else if (scriptsPattern.test(resp?.name)) {
          handleWebSocketUpdates(resp, 'script');
        } else if (resp?.body?.annotations?.remark) {
          handleWebSocketUpdates(resp, 'remark');
        }
      }
    });
    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loadMore,
    hasMore,
    isLoading: isFetchingActivities,
  };
}
