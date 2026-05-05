import { CustomQuoteActionTypes } from 'presentation/redux/actions/leadDetail/customQuote';
import { IAction } from 'shared/interfaces/common';

interface ICustomQuoteReducer {
  isBackHistory: boolean;
}

const initialState: ICustomQuoteReducer = {
  isBackHistory: false,
};

function customQuoteInitReducer(
  state = initialState,
  action: IAction<any>
): any {
  switch (action.type) {
    case CustomQuoteActionTypes.CREATE_CUSTOM_QUOTE_BACK:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
}

export default customQuoteInitReducer;
