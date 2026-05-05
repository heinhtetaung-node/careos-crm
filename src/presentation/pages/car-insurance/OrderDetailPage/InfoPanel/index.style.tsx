import {
  IconButton,
  Input,
  Box,
  Paper as MuiPaper,
  withTheme,
  TextField,
  Container,
  createStyles,
  withStyles,
  Theme,
} from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import styled from 'styled-components';

import { Color } from 'presentation/theme/variants';

const FieldStyles = (theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      padding: '10px 15px',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderBottom: `1px solid ${theme.palette.grey[200]}`,
    },
    hightlight: {
      borderBottom: `1px solid ${Color.FIELD_STYLES_HIGHLIGHT}`,
      backgroundColor: Color.FIELD_STYLES_HIGHLIGHT,
      '& input.MuiInputBase-input:not([readOnly]), & .MuiInputBase-root .MuiSelect-select, .MuiAutocomplete-inputRoot':
        {
          backgroundColor: `${Color.FIELD_STYLES_HIGHLIGHT} !important`,
          '&:hover, &:focus': {
            border: `1px solid ${Color.FIELD_STYLES_HIGHLIGHT} !important`,
          },
          border: `1px solid ${Color.FIELD_STYLES_HIGHLIGHT} !important`,
        },
    },
  });

interface BoxContainerProps {
  showHighlight?: boolean;
  classes?: any;
  children?: any;
}

function BoxContainer(props: BoxContainerProps) {
  const { classes, showHighlight, children, ...newProps } = props;
  return (
    <Box
      {...newProps}
      className={
        showHighlight ? clsx(classes.root, classes.hightlight) : classes.root
      }
    >
      {children}
    </Box>
  );
}

export const Field = withStyles(FieldStyles)(BoxContainer);

export const FieldItem = styled.span`
  &&& {
    width: 50%;
    display: flex;
    align-items: center;

    .MuiOutlinedInput-notchedOutline {
      border: 1px solid #222222;
    }

    .MuiSelect-iconOutlined {
      right: 4px;
    }

    .MuiOutlinedInput-input {
      height: 8px;
      line-height: 0.5em;
    }

    .MuiInputBase-formControl {
      .MuiFormHelperText-filled {
        color: 1px solid 
        ${({ theme }) => theme.palette && theme.palette.danger.main}
    }
  }
`;

export const HeaderTitle = withTheme(styled.div`
  &&& {
    display: inline-block;
    width: 100%;
    color: ${({ theme }) => theme.palette.primary.main};
    background-color: ${({ theme }) => theme.palette.grey[200]};
    border-radius: 6px 6px 0 0;

    b {
      font-size: 16px;
    }

    .header-content {
      padding: 10px 15px;
      margin: auto;
      word-break: break-word;
    }
  }
`);

export const Paper = withTheme(styled(MuiPaper)`
  &&& {
    height: 100%;
    border: 1px solid ${({ theme }) => theme.border.color};
    border-radius: 6px;
  }
`);

export const Colon = styled.span`
  padding-bottom: 6px;
  margin-right: 3px;
`;

export const FieldInput = styled(TextField)`
  &&& {
    margin-right: 10px;
    width: 90%;

    input {
      padding-top: 0px;
    }
  }
`;
export const FieldItemWrapper = styled(Container)`
  width: 60% !important;
  display: flex;
  justify-content: space-between;

  img {
    cursor: pointer;
  }

  .MuiFormControl-root,
  .MuiInputBase-formControl {
    border-left: 0 !important;
    border-right: 0 !important;
  }

  .MuiFormControl-root {
    margin-left: unset;
  }

  & > .MuiButtonBase-root {
    height: 26px;
    padding-top: 5px;
  }

  .date-time {
    input {
      border: 1px solid $bg-color-blue-5;
      border-radius: 6px;
      padding: 3px 8px;
      height: 26px;
    }
  }

  & > span {
    width: 100% !important;
  }

  .MuiFormHelperText-filled {
    margin-left: 5px;
    color: $text-color-pink-3;
  }

  input {
    padding-top: 3px !important;

    &:not([readOnly]) {
      border: 1px solid #e9edf5;
      border-radius: 6px;
      box-sizing: border-box;
      padding: 3px 8px;
      height: 26px;
      background: #fff;
      min-width: 55px;
      margin-left: 5px;

      &:hover,
      &:focus {
        transition: 0.2s;
        border: 1px solid #005098;
        box-shadow: 0 7px 15px 0 $box-shadow-field;
      }
    }
  }

  .field-value {
    margin-left: 10px;
  }

  &.add-top-padding {
    margin-top: 10px;
  }
`;

export const EditButton = styled(IconButton)`
  &&& {
    padding: 1px;
    &.Mui-disabled {
      opacity: 0.5;
    }
  }
`;

export const SubTitleInfo = styled.h3`
  margin: 0;
`;

export const LicenseFieldItem = styled.span`
  &&& {
    position: relative;
    align-items: baseline;
    justify-content: space-around;
    padding-right: 30px;
    width: 50%;
    display: flex;
    align-items: center;

    .MuiOutlinedInput-notchedOutline {
      border: 1px solid #222222;
    }

    .MuiSelect-iconOutlined {
      right: 4px;
    }

    .MuiOutlinedInput-input {
      height: 8px;
      line-height: 0.5em;
    }

    .MuiInputBase-formControl {
      .MuiFormHelperText-filled {
        color: 1px solid 
        ${({ theme }) => theme.palette && theme.palette.danger.main}
    }
  }
`;

export const LeftLicensePlateInput = styled(Input)`
  &&& {
    width: 35%;

    input {
      text-align: center;
    }
  }
`;

export const RightLicensePlateInput = styled(Input)`
  &&& {
    width: 45%;

    input {
      text-align: center;
    }
  }
`;

export const UnitLicensePlate = styled.span`
  padding: 4px;
  background: ${({ theme }) => theme.palette && theme.palette.grey[200]};
`;
