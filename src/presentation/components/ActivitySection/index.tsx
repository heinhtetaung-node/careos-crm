import { Paper as MuiPaper, withTheme } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import ActivityTabContainer from './ActivityTab';
import ButtonRowContainer from './ButtonRow';

import CommentTextBox from '../CommentTextBox/CommentTextBox';
import './ActivitySection.scss';

const Paper = withTheme(styled(MuiPaper)`
  &&& {
    background: white;
    border: 1px solid ${({ theme }) => theme.border.color};
    border-radius: 6px;

    .MuiButton-outlinedPrimary {
      border: 1px solid ${({ theme }) => theme.palette.info.main};
    }
  }
`);

interface ActivitySectionProps {
  isFieldDisabled?: boolean;
}

export default function ActivitySection({
  isFieldDisabled = false,
}: ActivitySectionProps) {
  return (
    <Paper elevation={3} component="div" className="activity-section">
      <ButtonRowContainer isPurchased={isFieldDisabled} />
      <CommentTextBox isFieldDisabled={isFieldDisabled} />
      <ActivityTabContainer />
    </Paper>
  );
}

export { ButtonRowContainer, CommentTextBox };
