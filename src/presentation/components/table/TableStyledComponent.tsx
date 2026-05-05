import {
  TableCell,
  withStyles,
  Checkbox as MuiCheckbox,
} from '@material-ui/core';
import MuiTableContainer from '@material-ui/core/TableContainer';
import styled from 'styled-components';

export const StickyTableCell = withStyles((theme) => ({
  head: {
    left: 0,
    position: 'sticky',
    zIndex: theme.zIndex.appBar + 2,
  },
  body: {
    borderBottomColor: theme.palette.common.white,
    backgroundColor: theme.palette.grey[200],
    left: 0,
    position: 'sticky',
    zIndex: theme.zIndex.appBar + 1,
    textAlign: 'center',
  } as any,
}))(TableCell);

export const Checkbox = withStyles((theme) => ({
  root: {
    color: 'transparent',
    '& .MuiSvgIcon-root': {
      fontSize: '1.7rem',
    },
    '&:not($checked):not(.MuiCheckbox-indeterminate) .MuiIconButton-label:after':
      {
        content: '""',
        height: 22,
        width: 22,
        position: 'absolute',
        backgroundColor: theme.palette.common.white,
        zIndex: 0,
        borderRadius: '4px',
      },
  },
  checked: {},
}))(MuiCheckbox);

export const TableContainer = styled(MuiTableContainer)`
  &&& {
    .MuiTableCell-head {
      vertical-align: top;
      padding-top: 8px;
    }
    .MuiTableSortLabel-root {
      vertical-align: top;
    }
    .MuiTableSortLabel-icon {
      margin: 0;
    }
    .MuiTableHead-root {
      .Mui-checked {
        color: ${(props) =>
          props.theme.palette && props.theme.palette.primary.main};
      }
    }
    .MuiTableBody-root {
      .Mui-checked {
        color: ${(props) =>
          props.theme.palette && props.theme.palette.primary.main};
      }
    }
  }
  .MuiCheckbox-root {
    padding: 0;
  }
`;
