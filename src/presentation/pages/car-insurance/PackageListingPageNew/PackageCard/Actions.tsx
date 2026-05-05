import { Button } from '@alphafounders/ui';
import { CheckCircleIcon, AddCircleIcon } from '@alphafounders/icons';
import { CircularProgress } from '@material-ui/core';
import React from 'react';

import { getString } from 'presentation/theme/localization';

interface ActionsProps {
  isSelected: boolean;
  isSelectedForCompare: boolean;
  isSelectLoading: boolean;
  disabled?: boolean;
  enableSelect?: boolean;
  onSelectClick: () => void;
  onCompareClick: () => void;
  noCompare?: boolean;
}

function Actions({
  isSelected,
  isSelectedForCompare,
  isSelectLoading,
  disabled,
  enableSelect,
  onSelectClick,
  onCompareClick,
  noCompare,
}: ActionsProps) {
  const selectText = isSelected
    ? getString('packageListing.selected')
    : getString('text.select');

  const handleSelect = () => {
    if (!isSelected) {
      onSelectClick();
    }
  };

  return (
    <>
      {!noCompare && (
        <Button
          text={getString('packageListing.compare')}
          onClick={onCompareClick}
          icon={
            isSelectedForCompare ? (
              <CheckCircleIcon className="w-[13px] h-[13px] bg-success text-white rounded-full p-1 mr-2" />
            ) : (
              <AddCircleIcon className="mr-2" />
            )
          }
          variant="secondary"
          stopPropagating
          className="my-3 w-[143px] h-[35px] text-[14px] mx-auto hover:bg-primary-light"
          disabled={disabled}
        />
      )}
      <Button
        text={
          isSelectLoading ? (
            <CircularProgress color="inherit" size={20} />
          ) : (
            selectText
          )
        }
        onClick={handleSelect}
        disabled={isSelectLoading || disabled || !enableSelect}
        icon={
          isSelected && !isSelectLoading ? (
            <CheckCircleIcon className="w-[13px] h-[13px] bg-success rounded-full p-1 mr-2" />
          ) : undefined
        }
        variant="primary"
        stopPropagating
        className="my-3 w-[143px] h-[35px] text-[14px] mx-auto"
      />
    </>
  );
}

export default Actions;
