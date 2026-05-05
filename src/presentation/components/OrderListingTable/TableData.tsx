/* eslint-disable react/forbid-component-props */
/* eslint-disable react/forbid-dom-props */
import { StarIcon } from '@alphafounders/icons';
import {
  Box,
  Grid,
  TableCell,
  TableRow as MuiTableRow,
  Collapse,
  Checkbox,
  IconButton,
  Theme,
  BoxProps,
} from '@material-ui/core';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import {
  createStyles,
  makeStyles,
  withStyles,
  WithStyles,
} from '@material-ui/styles';
import cls from 'clsx';
import _truncate from 'lodash/truncate';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { addItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import { useGetItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/selector';
import { Color } from 'presentation/theme/variants';
import { format } from 'utils/datetime';

import { Column, Order, PolicyTableType, Product } from './helper';
import { TableCellContent, IconWrapper } from './index.styles';
import PolicyTable from './PolicyTable';
import StatusTag from './StatusTag';
import TextStatus, { ITextStatus } from './TextStatus';

import { getString } from '../../theme/localization';

type IProps = {
  order: Order;
  columnsSettings: Column[];
  policyTableType?: PolicyTableType;
  isDisableExpand?: boolean;
  isDisableLink?: boolean;
  isPolicyTable?: boolean;
  showCustomer?: boolean;
  showChassisNumber?: boolean;
  showStar?: boolean;
  noDetailPage?: boolean;
  hasCheckbox?: boolean;
  expandAsDefault?: boolean;
};

type ShowCellProps = Omit<
  IProps,
  'columnsSettings' | 'isDisableExpand' | 'isDisableLink' | 'policyTableType'
> & { column: Column };

type IsPolicyCancelledProps = {
  order: any;
  policy?: string;
  isPolicyTable?: boolean;
};

interface TextChipProps
  extends WithStyles<ReturnType<typeof TextChipStyles>>,
    BoxProps {
  isCancelled: boolean;
}

export const TRUNCATE_OPTIONS = {
  length: 27,
};

const useRowStyles = makeStyles((theme: Theme) => ({
  cancelled: {
    '& > *': {
      color: theme.palette.grey[400],
    },
  },
}));

const TextChipStyles = (theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.grey[200],
      display: 'inline-block',
      borderRadius: `${theme.spacing(1) + 2}px`,
      padding: `${theme.spacing(0.5)}px ${theme.spacing(1)}px`,
      textDecoration: 'none',
      marginTop: `${theme.spacing(1)}px`,
      '&:not(:last-child)': {
        marginRight: `${theme.spacing(1)}px`,
      },
    },
    cancelled: {
      textDecoration: `line-through ${theme.palette.grey[400]}`,
    },
  });

const TextChipWrapperStyles = () =>
  createStyles({
    root: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  });

const TextChipWrapper = withStyles(TextChipWrapperStyles)(Box);

const TextChip = withStyles(TextChipStyles)((props: TextChipProps) => {
  const { classes, isCancelled, ...rest } = props;
  return (
    <Box
      data-testid="text-chips"
      className={cls(classes.root, isCancelled && classes.cancelled)}
      {...rest}
    />
  );
});

export const TableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiTableCell-body': {
        backgroundColor: theme.palette.common.white,
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
      },
    },
    hover: {
      '&.MuiTableRow-root:hover, &.MuiTableRow-root:hover > .MuiTableCell-body':
        {
          backgroundColor: '#f9fafc',
        },
      '&.MuiTableRow-root:hover .icon-wrapper.highlight': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    selected: {
      '&.MuiTableRow-root, &.MuiTableRow-root > .MuiTableCell-body': {
        backgroundColor: theme.palette.grey[200],
      },
    },
  })
)(MuiTableRow);

export const StickyTableCell = withStyles((theme) =>
  createStyles({
    head: {
      left: 0,
      position: 'sticky',
      zIndex: theme.zIndex.appBar + 2,
    },
    body: {
      backgroundColor: theme.palette.common.white,
      left: 0,
      position: 'sticky',
      zIndex: 1,
      textAlign: 'center',
    },
  })
)(TableCell);

const useCollapseStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      '& .MuiCollapse-wrapperInner': {
        width: 'auto',
      },
    },
    wrapperBackgroundColor: {
      backgroundColor: `${theme.palette.grey[100]} !important`,
      '& .MuiTableCell-root.MuiTableCell-body': {
        backgroundColor: `${theme.palette.grey[100]} !important`,
      },
    },
  })
);

const isOrderCancelled = (orders: any) =>
  orders?.products?.every((product: Product) => product.isCancelled);

const isPolicyCancelled = ({
  order,
  policy = '',
  isPolicyTable = false,
}: IsPolicyCancelledProps) => {
  if (isPolicyTable) return order?.isCancelled;
  const productType = policy === 'm' ? 'mandatory' : policy;
  return !!order.products?.find(
    (item: any) => item?.productType.toLowerCase() === productType
  )?.isCancelled;
};

export const showArrow = (open: boolean) => {
  if (!open) return <KeyboardArrowRightIcon color="primary" />;
  return <KeyboardArrowDownIcon color="primary" />;
};

export const showStatusTag = (order: any) => {
  if (isOrderCancelled(order) || order?.isCancelled) {
    const status = getString('text.cancelled');
    return <StatusTag text={status} />;
  }
  return '';
};

export const showCell = ({
  order,
  column,
  isPolicyTable = false,
  showCustomer,
  showChassisNumber,
}: ShowCellProps) => {
  const value = order[column.id as keyof Order] as any;
  if (column.id === 'submissionStatus') {
    if (!value.length) {
      const isCancelled = isPolicyCancelled({ order, isPolicyTable });
      return (
        <TableCell
          data-testid="order-listing-table-column"
          style={{ maxWidth: 'fit-content' }}
          key={column.id}
        >
          <TextStatus
            status={isCancelled ? 'cancelled' : (value as ITextStatus).status}
            label={(value as ITextStatus).label}
            type={(value as ITextStatus).type}
            tableType="order"
          />
        </TableCell>
      );
    }
    return (
      <TableCell style={{ maxWidth: 'fit-content' }} key={column.id}>
        <TextChipWrapper maxWidth="230px">
          {value.map(([insuranceType, submissionStatus]: any) => (
            <TextChip
              isCancelled={isPolicyCancelled({
                order,
                policy: insuranceType as string,
              })}
              key={insuranceType}
            >
              <span
                style={{
                  color: isPolicyCancelled({
                    order,
                    policy: insuranceType as string,
                  })
                    ? Color.GREY_400
                    : 'currentcolor',
                }}
              >
                {`${insuranceType}: `}
              </span>
              <TextStatus
                status={
                  isPolicyCancelled({ order, policy: insuranceType as string })
                    ? 'cancelled'
                    : (submissionStatus as ITextStatus).status
                }
                label={`${(submissionStatus as ITextStatus).label}`}
                type={(submissionStatus as ITextStatus).type}
                tableType="order"
              />
            </TextChip>
          ))}
        </TextChipWrapper>
      </TableCell>
    );
  }

  if ((value as ITextStatus)?.status) {
    const isCancelled = isPolicyTable
      ? isPolicyCancelled({ order, isPolicyTable })
      : isOrderCancelled(order);
    return (
      <TableCell
        data-testid="order-listing-table-column"
        style={{ maxWidth: 'fit-content' }}
        key={column.id}
      >
        <div
          style={{
            maxWidth: '130px',
            wordBreak: 'normal',
            whiteSpace: 'normal',
          }}
        >
          <TextStatus
            status={isCancelled ? 'cancelled' : (value as ITextStatus).status}
            label={(value as ITextStatus).label}
            type={(value as ITextStatus).type ?? 'circle'}
            tableType="order"
          />
        </div>
      </TableCell>
    );
  }

  if (column.id === 'insurancePackage') {
    return (
      <TableCell style={{ maxWidth: 'fit-content' }} key={column.id}>
        {isPolicyTable ? (
          <span>{value}</span>
        ) : (
          <TextChipWrapper data-testid="insurance-packages">
            {value.map((insuranceType: any) => (
              <TextChip
                isCancelled={isPolicyCancelled({
                  order,
                  policy: insuranceType as string,
                })}
                key={insuranceType}
              >
                <span
                  style={{
                    color: isPolicyCancelled({
                      order,
                      policy: insuranceType as string,
                    })
                      ? Color.GREY_400
                      : 'currentcolor',
                  }}
                >
                  {insuranceType}
                </span>
              </TextChip>
            ))}
          </TextChipWrapper>
        )}
      </TableCell>
    );
  }

  if (column.id === 'insuredPerson') {
    const { customer, insuredPerson, isCompany, companyName } = order;
    const isInsuredPersonCustomer = customer === insuredPerson;
    if (isCompany) {
      return (
        <TableCell style={{ minWidth: '210px' }} key={column.id}>
          <TableCellContent>
            <span>{_truncate(companyName, TRUNCATE_OPTIONS)}</span>
            {showCustomer && customer && (
              <span>{`(${_truncate(customer, TRUNCATE_OPTIONS)})`}</span>
            )}
          </TableCellContent>
        </TableCell>
      );
    }
    return isInsuredPersonCustomer ? (
      <TableCell key={column.id}>
        {_truncate(insuredPerson, TRUNCATE_OPTIONS)}
      </TableCell>
    ) : (
      <TableCell style={{ minWidth: '210px' }} key={column.id}>
        <TableCellContent>
          <span>{_truncate(insuredPerson, TRUNCATE_OPTIONS)}</span>
          {showCustomer && customer && (
            <span>{`(${_truncate(customer, TRUNCATE_OPTIONS)})`}</span>
          )}
        </TableCellContent>
      </TableCell>
    );
  }

  if (column.id === 'insuranceCompany') {
    return (
      <TableCell style={{ minWidth: '150px' }} key={column.id}>
        {_truncate(value, TRUNCATE_OPTIONS)}
      </TableCell>
    );
  }

  // policy id and order id are same table column name `Order Id` to reduce confusion
  if (column.id === 'orderId') {
    return (
      <TableCell
        style={{
          maxWidth: 'fit-content',
        }}
        key={column.id}
        align={column.align}
      >
        <TableCellContent>
          {value}
          {showStatusTag(order)}
        </TableCellContent>
      </TableCell>
    );
  }

  if (column.id === 'salesAgent') {
    if (value === 'website')
      return <TableCell key={column.id}>{value}</TableCell>;

    const salesAgentName = `${value?.firstName} ${value?.lastName}`;
    const salesAgentEmail = `${value?.humanId}`;
    return (
      <TableCell style={{ minWidth: '210px' }} key={column.id}>
        <TableCellContent>
          <span>{_truncate(salesAgentName, TRUNCATE_OPTIONS)}</span>
          <span>{_truncate(salesAgentEmail, TRUNCATE_OPTIONS)}</span>
        </TableCellContent>
      </TableCell>
    );
  }

  if (column.id === 'assignedTo') {
    if (typeof value !== 'object') {
      return (
        <TableCell data-testid="assigned-to" key={column.id}>
          {value}
        </TableCell>
      );
    }
    const { firstName, lastName, humanId } = value;
    return (
      <TableCell style={{ minWidth: '210px' }} key={column.id}>
        <TableCellContent>
          <span data-testid="assigned-to">
            {_truncate(`${firstName} ${lastName}`, TRUNCATE_OPTIONS)}
          </span>
          <span>{`${_truncate(humanId, TRUNCATE_OPTIONS)}`}</span>
        </TableCellContent>
      </TableCell>
    );
  }

  if (column.id === 'orderCreated') {
    return (
      <TableCell key={column.id}>
        <TableCellContent>
          <span>{format(new Date(value), 'dd/MM/yyyy')}</span>
          <span style={{ color: '#a5aac0' }}>
            {`(${format(new Date(value), 'hh:mm a')})`}
          </span>
        </TableCellContent>
      </TableCell>
    );
  }

  if (column.id === 'licensePlate') {
    const { licensePlate, chassisNumber = '' } = order;
    return (
      <TableCell
        style={{ minWidth: '150px' }}
        key={column.id}
        align={column.align}
      >
        <TableCellContent>
          <span>{licensePlate}</span>
          {showChassisNumber && <span>{chassisNumber}</span>}
        </TableCellContent>
      </TableCell>
    );
  }

  if (column.id === 'earliestPolicyStartDate') {
    return (
      <TableCell key={column.id}>
        <TableCellContent>
          <span className="text-[11px]">{getString('text.earliestOn')}</span>
          <span>{value}</span>
        </TableCellContent>
      </TableCell>
    );
  }

  if (column.id === 'totalInvoiced') {
    return (
      <TableCell key={column.id}>
        <TableCellContent>
          <span>{value}</span>
          {order.discount > 0 && <span>{`(discount ${order.discount})`}</span>}
        </TableCellContent>
      </TableCell>
    );
  }

  return (
    <TableCell
      style={{ maxWidth: 'fit-content' }}
      key={column.id}
      align={column.align}
    >
      {value}
    </TableCell>
  );
};

export const showIsChecked = (
  checkedPolicies: string[],
  orderId: string,
  orderItemsLength: number | null = null,
  isPolicy = false
) => {
  if (isPolicy) {
    if (orderItemsLength === 0 || !orderItemsLength) return false;
    const orders = checkedPolicies.map((itemId) => itemId.split('/items')[0]);
    const isChecked =
      orders.filter((id) => id === `orders/${orderId}`).length ===
      orderItemsLength;
    return isChecked;
  }
  return !!checkedPolicies.includes(orderId);
};

function TableData({
  order,
  columnsSettings,
  showCustomer,
  showChassisNumber,
  showStar = false,
  policyTableType = 'all',
  isDisableExpand,
  isPolicyTable,
  isDisableLink,
  noDetailPage,
  hasCheckbox,
  expandAsDefault = false,
}: Readonly<IProps>) {
  const [open, setOpen] = useState(expandAsDefault);
  const { itemAssignToAgent: checkedPolicies } = useGetItemAssign();
  const classes = useRowStyles();
  const collapseClasses = useCollapseStyles();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const getLink = () => {
    if (!isDisableLink) {
      const path = pathname.split('/')[pathname.split('/').length - 1];
      const orderIdHash = order.id.split('/')[1] ?? '';
      const humanId = order.orderId;
      const samePageLinks = ['approval', 'submission'];
      const productLink = pathname.includes('health/') ? '/health' : '';
      switch (path) {
        case 'qc':
          return `${productLink}/orders/${path}/${order.id}`;
        case 'printing-and-shipping':
          return `${productLink}/orders/${order.id}`;
        case 'my-orders':
          return `${productLink}/orders/my-orders/${order.id}`;
        default:
          if (samePageLinks.includes(path)) {
            return `${productLink}/orders/${orderIdHash}/policies/${humanId}/${path}`;
          }
          return `${productLink}/orders/${order.id}`;
      }
    }
    return '';
  };

  const getPolicyShipment = () => {
    setOpen(!open);
  };

  const selectAllPolicies = () => {
    const { items: policies } = order;
    if (!policies || policies?.length <= 0) return;

    policies?.forEach((item) => {
      if (!item?.name) return;
      dispatch(addItemAssign({ id: item.name }));
    });
  };

  return (
    <>
      <TableRow
        data-testid="order-listing-table-row"
        className={cls(
          (isOrderCancelled(order) ||
            isPolicyCancelled({ order, isPolicyTable })) &&
            classes.cancelled
        )}
        role="checkbox"
        selected={showIsChecked(checkedPolicies, order.id)}
        hover
      >
        <StickyTableCell>
          <Grid
            container
            spacing={2}
            direction="row"
            justifyContent="space-around"
            alignItems="center"
            style={{ minWidth: 'max-content' }}
          >
            {hasCheckbox ? (
              <Grid item>
                <Checkbox
                  checked={showIsChecked(checkedPolicies, order.id)}
                  onChange={() => dispatch(addItemAssign({ id: order.id }))}
                  data-testid={`${order.orderId}-checkbox`}
                />
              </Grid>
            ) : null}

            {['approval', 'submission'].includes(policyTableType) && (
              <Grid item>
                <Checkbox
                  data-testid="select-all"
                  checked={showIsChecked(
                    checkedPolicies,
                    order.id,
                    order?.items?.length ?? 0,
                    true
                  )}
                  onChange={selectAllPolicies}
                />
              </Grid>
            )}
            <Grid item>
              {showStar ? (
                <IconWrapper>
                  {order.isStar ? (
                    <StarIcon fillColor="#FFDB4F" />
                  ) : (
                    <StarBorderIcon color="primary" />
                  )}
                </IconWrapper>
              ) : null}
            </Grid>
            {noDetailPage ? null : (
              <Grid item>
                <Link
                  style={{ color: 'currentcolor' }}
                  to={getLink()}
                  target={isDisableLink ? '_self' : '_blank'}
                  rel="noopener"
                  data-testid="page-link"
                >
                  <IconWrapper disabled={isDisableLink} showBackground>
                    <FolderSharedIcon style={{ color: 'fff' }} />
                  </IconWrapper>
                </Link>
              </Grid>
            )}
          </Grid>
        </StickyTableCell>

        {!isDisableExpand && (
          <TableCell>
            <IconButton
              data-testid={`${order.orderId}-expand-row-button`}
              aria-label="expand row"
              size="small"
              onClick={getPolicyShipment}
            >
              {showArrow(open)}
            </IconButton>
          </TableCell>
        )}

        {columnsSettings.map((column: Column) =>
          showCell({
            order,
            column,
            isPolicyTable,
            showCustomer,
            showChassisNumber,
          })
        )}
      </TableRow>

      {!isDisableExpand && (
        <TableRow className={collapseClasses.wrapperBackgroundColor}>
          <TableCell
            style={{
              paddingBottom: 0,
              paddingTop: 0,
            }}
            colSpan={14}
          >
            <Collapse
              className={collapseClasses.root}
              in={open}
              timeout="auto"
              unmountOnExit
            >
              {policyTableType === 'all' ? (
                <Box marginLeft={55}>
                  <PolicyTable
                    policies={order?.products}
                    policyTableType={policyTableType}
                  />
                </Box>
              ) : (
                <Box marginLeft={5}>
                  <PolicyTable
                    policies={order?.products}
                    policyTableType={policyTableType}
                  />
                </Box>
              )}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default TableData;
