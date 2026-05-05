import { IAction } from 'shared/interfaces/common';

import { TeamActionTypes } from '../../../../actions/admin/team';
import {
  formatTeamList,
  initialState,
  updateTokenList,
} from '../teamReducer.helper';

export default function (
  state = initialState,
  { payload, type }: IAction<any>
): any {
  switch (type) {
    case TeamActionTypes.GET_TEAMS_NAME: {
      const { currentPage, pageToken, pageSize, showDeleted } = payload;
      return {
        ...state,
        isFetching: true,
        listPageToken: updateTokenList(
          state.listPageToken,
          currentPage,
          pageToken
        ),
        pageIndex: currentPage,
        pageSize,
        showDeleted,
      };
    }
    case TeamActionTypes.GET_TEAMS_NAME_SUCCESS: {
      const teamList = payload.teams;
      const token = payload.pageToken;
      return {
        ...state,
        data: formatTeamList(teamList),
        isFetching: false,
        pageToken: token,
      };
    }
    case TeamActionTypes.GET_TEAMS_NAME_FAILED: {
      return {
        ...state,
        data: [],
        isFetching: false,
        token: '',
      };
    }
    default:
      return state;
  }
}
