import { IAction } from 'shared/interfaces/common';

export enum CustomQuoteActionTypes {
  CREATE_CUSTOM_QUOTE = '[LeadsDetail] CREATE_CUSTOM_QUOTE',
  CREATE_CUSTOM_QUOTE_SUCCESS = '[LeadsDetail] CREATE_CUSTOM_QUOTE_SUCCESS',
  CREATE_CUSTOM_QUOTE_FAIL = '[LeadsDetail] CREATE_CUSTOM_QUOTE_FAIL',
  CREATE_CUSTOM_QUOTE_BACK = '[LeadsDetail] CREATE_CUSTOM_QUOTE_BACK',
}

export const createCustomQuote = (payload: any): IAction<any> => ({
  type: CustomQuoteActionTypes.CREATE_CUSTOM_QUOTE,
  payload,
});

export const createCustomQuoteSuccess = (payload: any): IAction<any> => ({
  type: CustomQuoteActionTypes.CREATE_CUSTOM_QUOTE_SUCCESS,
  payload,
});

export const createCustomQuoteFail = (payload: any): IAction<any> => ({
  type: CustomQuoteActionTypes.CREATE_CUSTOM_QUOTE_FAIL,
  payload,
});

export const createCustomQuoteBack = (payload: any): IAction<any> => ({
  type: CustomQuoteActionTypes.CREATE_CUSTOM_QUOTE_BACK,
  payload,
});
