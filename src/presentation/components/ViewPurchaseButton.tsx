import { FileIcon as DocumentIcon } from '@alphafounders/icons';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Zoom from '@material-ui/core/Zoom';
import clsx from 'clsx';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getPackageDetailUrl } from 'presentation/routes/Urls';
import { getString } from 'presentation/theme/localization';

import Controls from './controls/Control';
import { checkIsLeadInvalidForViewPackage } from './ViewPurchaseButton.helper';
import { isHealthLead } from 'presentation/pages/health-insurance/leads/leadDetailsPage/helper';

interface ViewPurchaseBtnProps {
  packageId: string | undefined;
  tooltipKey?: string | null;
}

const useStylesBootstrap = makeStyles((theme) => ({
  disabled: {
    pointerEvents: 'none',
  },
  icon: {
    marginTop: '3px',
  },
  arrow: {
    color: theme.palette.common.blueNormal,
    width: '1.5em',
    height: '0.9em',
    marginBottom: '-0.9em !important',
    '&:before': {
      border: `1px solid ${theme.palette.common.white}`,
    },
  },
  tooltip: {
    padding: '16px',
    backgroundColor: theme.palette.common.blueNormal,
    borderRadius: '10px',
    border: `1px solid ${theme.palette.common.white}`,
  },
}));

function ViewPurchaseButton({ packageId, tooltipKey }: ViewPurchaseBtnProps) {
  const classes = useStylesBootstrap();

  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const lead = useGetLeadSelector();

  const isDisabled =
    !packageId ||
    (checkIsLeadInvalidForViewPackage(lead) && !isHealthLead(lead));

  const formComponent = (
    <Controls.Button
      color="primary"
      icon={<DocumentIcon className={classes.icon} />}
      disabled={isDisabled}
      variant="contained"
      className={clsx('button-view-quotes', isDisabled && classes.disabled)}
      data-testid="btn-view-selected-package"
      onClick={() =>
        navigate(
          getPackageDetailUrl({
            leadId: id,
            isHealth: isHealthLead(lead),
          })
        )
      }
    >
      {getString('text.viewSelectedPackage')}
    </Controls.Button>
  );

  if (tooltipKey && !isDisabled) {
    return (
      <Tooltip
        disableFocusListener
        arrow
        title={tooltipKey}
        classes={classes}
        placement="top"
        TransitionComponent={Zoom}
      >
        <div>{formComponent}</div>
      </Tooltip>
    );
  }

  return formComponent;
}

export default ViewPurchaseButton;
