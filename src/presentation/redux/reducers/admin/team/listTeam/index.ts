import { IAction } from 'shared/interfaces/common';

import { TeamActionTypes } from '../../../../actions/admin/team';
import {
  formatTeamList,
  initialState,
  updateTokenList,
} from '../teamReducer.helper';

export default function teamsReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case TeamActionTypes.GET_TEAMS: {
      const { currentPage, pageToken, pageSize, orderBy, showDeleted, filter } =
        action.payload;
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
        orderBy,
        showDeleted,
        filter,
      };
    }
    case TeamActionTypes.GET_TEAMS_SUCCESS: {
      const teamList = action.payload.teams;
      const token = action.payload.pageToken;
      return {
        ...state,
        data: formatTeamList(teamList),
        isFetching: false,
        pageToken: token,
      };
    }
    case TeamActionTypes.GET_TEAMS_FAILED: {
      return {
        ...state,
        data: [],
        isFetching: false,
        token: '',
      };
    }
    case TeamActionTypes.ADD_TEAM_FILTER: {
      return {
        ...state,
        filter: action.payload,
      };
    }

    default:
      return state;
  }
}
