import { StarOutlineIcon } from '@alphafounders/icons';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import StarRoundedIcon from '@material-ui/icons/StarRounded';
import clsx from 'clsx';
import capitalize from 'lodash/capitalize';
import React from 'react';

import { IconButtonProps, useStyles } from '../IconButton/IconButton';

const useStarStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
    color: theme.palette.primary.main,
    '&:hover:not([disabled])': {
      color: theme.palette.primary.dark,
    },
    '&:disabled': {
      color: theme.palette.grey[200],
    },
  },
  selected: {
    color: '#FFDB4F',
    '&:hover:not([disabled])': {
      color: '#FFCB05',
    },
  },
}));
interface StarButtonProps
  extends Pick<IconButtonProps, 'iconSize' | 'btnSize'> {
  selected?: boolean;
  disabled?: boolean;
}

function StarButton({
  selected = false,
  disabled = false,
  iconSize = 'm',
  btnSize = 'medium',
}: StarButtonProps) {
  const [isSelected, setIsSelected] = React.useState(selected);

  const classes = useStarStyles();
  const iconBtnClasses = useStyles();

  const classSize =
    iconBtnClasses[
      `${iconSize}IconBtn${capitalize(btnSize)}` as keyof typeof iconBtnClasses
    ];

  const handleClick = () => {
    setIsSelected(!isSelected);
  };

  const getIcon = () => {
    if (disabled) {
      return <StarRoundedIcon data-testid="disabled-star" />;
    }
    return isSelected ? (
      <StarRoundedIcon data-testid="selected-star" />
    ) : (
      <span className="bg-primary rounded-[50%] p-2">
        <StarOutlineIcon fillColor="white" data-testid="unselected-star" />
      </span>
    );
  };

  return (
    <IconButton
      onClick={handleClick}
      className={clsx(classes.root, classSize, isSelected && classes.selected)}
      disabled={disabled}
    >
      {getIcon()}
    </IconButton>
  );
}

export default StarButton;
