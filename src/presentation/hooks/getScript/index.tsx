import { has } from 'lodash';
import { useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { map } from 'rxjs/operators';

import WebSocketGateway from 'data/gateway/websocket';
import {
  addMoreScripts,
  useGetAllLeadScripts,
  useLazyFetchScriptsQuery,
} from 'data/slices/leadDetails/scriptSlice';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

export default function useGetScript(leadId: string) {
  const dispatch = useDispatch();

  const { nextPageToken } = useGetAllLeadScripts();

  const [fetchScripts, { isLoading: isFetchingScripts, error: fetchError }] =
    useLazyFetchScriptsQuery();

  const hasMore = useMemo(() => nextPageToken !== '', [nextPageToken]);

  const dispatchAddScript = (response: any) => {
    dispatch(
      addMoreScripts({
        scripts: response.data?.scripts,
        nextPageToken: response.data?.nextPageToken,
      })
    );
  };

  useEffect(() => {
    async function fetchResponse() {
      if (leadId === undefined) {
        return;
      }
      const response = await fetchScripts({
        leadId: `leads/${leadId}`,
        scriptParams: { pageToken: nextPageToken, pageSize: 2 },
      });

      if (response && has(response, 'data')) {
        dispatchAddScript(response);
      }
    }

    fetchResponse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNext = async (pageToken: string) => {
    const response = await fetchScripts({
      leadId: `leads/${leadId}`,
      scriptParams: { pageToken, pageSize: 2 },
    });

    if (response && has(response, 'data')) {
      dispatchAddScript(response);
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
          message: getString('text.fetchingScriptFailed'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchError]);

  useEffect(() => {
    if (!leadId) {
      return () => null;
    }
    const ws = WebSocketGateway.getInstance()
      .subscribe(`lead/v1alpha2/leads/${leadId}/scripts/*`)
      ?.pipe(map((event) => event.body));

    const subscription = ws?.subscribe(async (resp: any) => {
      if (resp) {
        dispatchAddScript(resp);
      }
    });
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    loadMore,
    hasMore,
    isLoading: isFetchingScripts,
  };
}
