import { makeStyles, Theme, IconButton } from '@material-ui/core';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import React from 'react';
import { getString } from 'presentation/theme/localization';
import FieldRow from './FieldRow';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  orderHeader: {
    position: 'relative',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
  },
  orderLabelSection: {
    display: 'flex',
    width: '50%',
    justifyContent: 'space-between',
  },
  orderLabelContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
  },
  orderLabel: {
    fontSize: '0.875rem',
    color: theme.palette.grey[800],
    fontWeight: 400,
  },
  orderColon: {
    display: 'flex',
    alignItems: 'center',
  },
  orderValueSection: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    width: '50%',
    padding: '10px 15px',
  },
  orderIdValue: {
    fontSize: '0.875rem',
    color: theme.palette.grey[800],
    fontWeight: 400,
  },
  infoIcon: {
    padding: 4,
    color: theme.palette.primary.main,
    position: 'absolute',
    right: theme.spacing(1),
    top: '50%',
    transform: 'translateY(-50%)',
  },
  fieldRow: {
    display: 'flex',
    padding: '10px 15px',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  field: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.875rem',
    color: theme.palette.grey[800],
  },
  separator: {
    marginLeft: 'auto',
    color: theme.palette.grey[800],
  },
  value: {
    fontSize: '0.875rem',
    color: theme.palette.grey[800],
    fontWeight: 400,
  },
}));

export interface FieldConfig {
  label: string;
  key: string;
}

interface ProductSectionContentProps {
  fields: FieldConfig[];
  data?: Record<string, any>;
  orderIdKey?: string;
  productType?: string;
  onInfoClick?: (
    orderId: string,
    productType: string,
    data: Record<string, any>
  ) => void;
}

function ProductSectionContent({
  fields,
  data,
  orderIdKey = 'orderId',
  productType = '',
  onInfoClick,
}: Readonly<ProductSectionContentProps>) {
  const classes = useStyles();

  const orderId = data?.[orderIdKey];

  const handleInfoClick = () => {
    if (orderId && onInfoClick && data) {
      onInfoClick(orderId, productType, data);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.orderHeader}>
        <div className={classes.orderLabelSection}>
          <div className={classes.orderLabelContent}>
            <span className={classes.orderLabel}>
              {getString('leadDetailFields.orderId')}{' '}
            </span>
          </div>
          <div className={classes.orderColon}>
            <span>:</span>
          </div>
        </div>

        <div className={classes.orderValueSection}>
          <div className={classes.orderIdValue}>{orderId || '-'}</div>
          <IconButton
            className={classes.infoIcon}
            size="small"
            onClick={handleInfoClick}
          >
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </div>
      </div>

      {fields
        .filter((field) => field.key !== orderIdKey)
        .map((field) => (
          <FieldRow
            key={field.key}
            label={field.label}
            value={data?.[field.key]}
          />
        ))}
    </div>
  );
}

export default ProductSectionContent;
