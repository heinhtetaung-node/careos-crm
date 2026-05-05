import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import Badge from '@material-ui/core/Badge';
import MuiTypography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { makeStyles, withStyles } from '@material-ui/styles';
import clsx from 'clsx';
import * as React from 'react';

import Chip from 'presentation/components/common/Chip';
import { getString } from 'presentation/theme/localization';

const Accordion = withStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey[200]}`,
    boxShadow: 'none',
    overflow: 'hidden',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
}))(MuiAccordion);

const AccordionSummary = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[200],
    marginBottom: -1,
    padding: '0 10px',
    minHeight: 40,
    '&$expanded': {
      minHeight: 40,
    },
    '&.Mui-disabled': {
      opacity: 1,
    },
    '& .MuiBadge-invisible': {
      display: 'none !important',
    },
  },
  content: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '10px 0',
    '&$expanded': {
      margin: '10px 0',
    },
  },
  expanded: {},
  expandIcon: {
    padding: 0,
    marginRight: 0,
  },
}))(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiAccordionDetails);

const useStyles = makeStyles({
  root: {
    '&.MuiAccordionDetails-root': {
      padding: 0,
    },
  },
});

const Typography = withStyles((theme) => ({
  body1: {
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.primary.main,
  },
}))(MuiTypography);

interface Props {
  removePadding?: boolean;
  isCollapsible?: boolean;
  summary: any;
  details: any;
  hideBadge?: boolean;
  label?: string;
  labelColor?: 'default' | 'primary' | 'white' | 'success' | 'danger';
  testId?: string;
  headerTestId?: string;
}

function AccordionSection({
  removePadding = false,
  isCollapsible,
  summary,
  details,
  hideBadge = true,
  label,
  labelColor,
  testId,
  headerTestId,
}: Props) {
  const styles = useStyles();
  return (
    <Accordion
      defaultExpanded
      data-testid={testId}
      className="overflow-visible w-full"
    >
      <AccordionSummary
        expandIcon={
          isCollapsible && <ExpandMoreIcon fontSize="small" color="primary" />
        }
        disabled={!isCollapsible}
      >
        <Badge
          color="error"
          variant="dot"
          invisible={hideBadge}
          overlap="rectangular"
        >
          <Typography variant="body1" data-testid={headerTestId}>
            {getString(summary)}
          </Typography>
        </Badge>
        {label && <Chip text={label} color={labelColor ?? 'success'} />}
      </AccordionSummary>
      <AccordionDetails className={clsx(removePadding && styles.root)}>
        {details}
      </AccordionDetails>
    </Accordion>
  );
}

export default AccordionSection;
