import SET_THEME from '../../actions/theme/constants';

export default function reducer(
  state = { currentTheme: 0 },
  actions: { payload?: any; type: string }
): any {
  switch (actions.type) {
    case SET_THEME:
      return {
        ...state,
        currentTheme: actions.payload,
      };

    default:
      return state;
  }
}
