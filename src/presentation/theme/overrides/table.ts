import typography from '../typography';
import { Color, rabbitVariant } from '../variants';

const { palette } = rabbitVariant;
const overrideTable = {
  // https://material-ui.com/api/table-cell/#css
  MuiTableCell: {
    root: {
      borderBottomColor: palette.grey[200],
    },
    stickyHeader: {
      backgroundColor: Color.BG_LIGHT,
    },
    head: {
      color: palette.grey[800],
      fontWeight: typography.fontWeightRegular,
      backgroundColor: Color.BG_LIGHT,
    },
  },

  MuiTableRow: {
    root: {
      '&$hover': {
        '&:hover': {
          backgroundColor: Color.BLUE_MEDIUM,
        },
      },
    },
  },
};

export default overrideTable;
