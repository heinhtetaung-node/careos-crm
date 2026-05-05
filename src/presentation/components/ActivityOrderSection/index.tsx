import { Paper as MuiPaper, withTheme } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';

import ActivityTabContainer from './ActivityTab';
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

interface ActivityOrdersectionProps {
  enablePreviewModalDraggable?: boolean;
  isDocPanelDisabled?: boolean;
  isEnabledForReplaceDoc?: boolean;
}

export default function ActivityOrderSection({
  enablePreviewModalDraggable = false,
  isDocPanelDisabled = false,
  isEnabledForReplaceDoc = false,
}: ActivityOrdersectionProps) {
  return (
    <Paper elevation={3} component="div" className="activity-section">
      <ActivityTabContainer
        isDocPanelDisabled={isDocPanelDisabled}
        isEnabledForReplaceDoc={isEnabledForReplaceDoc}
        enablePreviewModalDraggable={enablePreviewModalDraggable}
      />
    </Paper>
  );
}
