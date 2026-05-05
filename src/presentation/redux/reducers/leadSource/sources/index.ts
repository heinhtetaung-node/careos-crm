import { LeadSourcesActionTypes } from 'presentation/redux/actions/leads/sources';
import { IAction } from 'shared/interfaces/common';

interface LeadSourcesReducer {
  scoreSource: any;
}

const initialState: LeadSourcesReducer = {
  scoreSource: {
    score: 0,
    name: '',
  },
};

export default function sourceReducer(
  state = initialState,
  action: IAction<any>
): LeadSourcesReducer {
  switch (action.type) {
    case LeadSourcesActionTypes.CLEAR_SOURCE_SCORE: {
      const cloneSource = state.scoreSource;
      cloneSource.score = 0;
      cloneSource.name = '';
      return {
        ...state,
        scoreSource: cloneSource,
      };
    }
    case LeadSourcesActionTypes.GET_LEAD_SOURCES_SCORE_SUCCESS: {
      const cloneSource = state.scoreSource;
      cloneSource.score = action.payload.score;
      cloneSource.name = action.payload.name;
      return {
        ...state,
        scoreSource: cloneSource,
      };
    }
    default:
      return state;
  }
}
