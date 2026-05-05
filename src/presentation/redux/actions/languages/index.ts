import { IAction } from '../../../../shared/interfaces/common';

// Change Language
export const CHANGE_LANGUAGE = '[Language] CHANGE_LANGUAGE';
export const CHANGE_LANGUAGE_SUCCESS = '[Language] CHANGE_LANGUAGE_SUCCESS';
export const CHANGE_LANGUAGE_FAILED = '[Language] CHANGE_LANGUAGE_FAILED';

export const changeLanguage = (payload?: string): IAction<any> => ({
  type: CHANGE_LANGUAGE,
  payload,
});

export const changeLanguageSuccess = (payload: string): IAction<any> => ({
  type: CHANGE_LANGUAGE_SUCCESS,
  payload,
});

export const changeLanguageFailed = (error: any): IAction<any> => ({
  type: CHANGE_LANGUAGE_FAILED,
  error,
});
