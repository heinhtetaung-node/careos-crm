import overrideIcon from './icon';
import overrideTable from './table';

import { Color } from '../variants';

const overrides = {
  MuiCardHeader: {
    action: {
      marginTop: '-4px',
      marginRight: '-4px',
    },
  },
  MuiButton: {
    root: {
      borderRadius: '6px',
    },
    textSecondary: {
      color: Color.GREY_LIGHT,
      '&:hover': {
        backgroundColor: Color.BLUE_WHITE,
      },
    },
  },
  MuiPickersDay: {
    day: {
      fontWeight: '300',
    },
    daySelected: {
      backgroundColor: `${Color.BLUE_BOLD} !important`,
    },
  },
  MuiPickersYear: {
    root: {
      height: '64px',
    },
  },
  MuiPickersCalendar: {
    transitionContainer: {
      marginTop: '6px',
    },
  },
  MuiPickersCalendarHeader: {
    iconButton: {
      backgroundColor: 'transparent',
      '& > *': {
        backgroundColor: 'transparent',
      },
    },
    switchHeader: {
      marginTop: '2px',
      marginBottom: '4px',
    },
  },
  MuiPickersClock: {
    container: {
      margin: '32px 0 4px',
    },
  },
  MuiPickersClockNumber: {
    clockNumber: {
      left: 'calc(50% - 16px)',
      width: '32px',
      height: '32px',
    },
  },
  MuiPickerDTHeader: {
    dateHeader: {
      '& h4': {
        fontSize: '2.125rem',
        fontWeight: 400,
      },
    },
    timeHeader: {
      '& h3': {
        fontSize: '3rem',
        fontWeight: 400,
      },
    },
  },
  MuiPickersTimePicker: {
    hourMinuteLabel: {
      '& h2': {
        fontSize: '3.75rem',
        fontWeight: 300,
      },
    },
  },
  MuiPickersToolbar: {
    toolbar: {
      '& h4': {
        fontSize: '2.125rem',
        fontWeight: 400,
      },
    },
  },

  /**
   * Customize Material UI theme to match with design guideline on Figma
   * Please check
   * {@link https://www.figma.com/file/kjjCnJ2l1a6P9GNcGFNEya/Design-Guidelines}
   * {@link https://www.figma.com/file/3J4vMV7Nexkpr39z9Bkgr4/Design-Guideline-for-Backend?node-id=288%3A4009}
   */
  ...overrideTable,
  ...overrideIcon,
};

export default overrides;
