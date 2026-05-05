import SET_THEME from './constants';

// eslint-disable-next-line import/prefer-default-export
export function setTheme(value: any): any {
  return {
    type: SET_THEME,
    payload: value,
  };
}
