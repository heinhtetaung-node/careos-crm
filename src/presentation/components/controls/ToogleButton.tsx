import { makeStyles } from '@material-ui/core';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import React from 'react';

interface IToogleButton {
  id: string | number;
  value: string | number;
  title: string | number;
}

interface IProps {
  value: string | number;
  onChange: (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    value: any
  ) => void;
  toogleButtonArray: IToogleButton[];
  exclusive?: boolean;
}

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.common.white,
    color: theme.palette.common.black,
    borderRadius: '4px',
    border: '1px solid',
    width: 'calc(50% - 3px)',
    justifyContent: 'center',
    padding: '5px',
    '&:last-child': {
      borderLeft: `1px solid ${theme.palette.common.black}`,
    },
  },
  rootGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  selected: {
    background: `${theme.palette.info.main} !important`,
    color: `${theme.palette.common.black} !important`,
    border: '2px solid',
    borderColor: theme.palette.primary.main,
    '&:last-child': {
      borderLeft: `2px solid ${theme.palette.primary.main}`,
    },
  },
  groupedHorizontal: {
    '&:not(:last-child)': {
      borderRadius: '4px',
    },
    '&:not(:first-child)': {
      borderRadius: '4px',
    },
  },
}));

const ToogleButton: React.FC<IProps> = ({
  value,
  onChange,
  toogleButtonArray,
  exclusive,
}) => {
  const classes = useStyles();
  return (
    <ToggleButtonGroup
      value={value}
      exclusive={exclusive}
      onChange={onChange}
      classes={{
        root: classes.rootGroup,
        groupedHorizontal: classes.groupedHorizontal,
      }}
    >
      {toogleButtonArray.map((item: IToogleButton) => (
        <ToggleButton
          key={item.id}
          value={item.value}
          classes={{
            root: classes.root,
            selected: classes.selected,
          }}
        >
          {item.title}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ToogleButton;
