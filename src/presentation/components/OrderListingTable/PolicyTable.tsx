import {
  createStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  withStyles,
} from '@material-ui/core';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import { makeStyles } from '@material-ui/styles';
import clsx from 'clsx';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  useGetSelections,
  addSelected,
} from 'data/slices/orderPolicySlice/selectionsSlice';
import {
  addItemAssign,
  SelectionItems,
} from 'data/slices/orderPolicySlice/selectionsSlice/reducer';
import { useGetItemAssign } from 'data/slices/orderPolicySlice/selectionsSlice/selector';
import { ShipmentOrderPoliciesType } from 'data/slices/shipmentSlice';
import { format, isValid } from 'utils/datetime';

import {
  Column,
  Product,
  shippingPoliciesColumnSetting,
  submissionPoliciesColumnSetting,
  approvalPoliciesColumnSetting,
  getShipmentStatus,
  PolicyTableType,
  productColumnSettings,
  getAddonsTextByPackage,
} from './helper';
import { IconWrapper, TableCellContent } from './index.styles';
import StatusTag from './StatusTag';
import TextStatus, { ITextStatus } from './TextStatus';

import { getString } from '../../theme/localization';
import Chip from '../common/Chip';
import Checkbox from '../common/controls/Checkbox';
import TableSkeleton from '../TableAllLead/TableAllLeadComponent/TableSkeleton';

type IProp = {
  policies: Product[];
  policyTableType?: PolicyTableType;
  isPolicyShipmentFetching?: boolean;
  orderPolicies?: ShipmentOrderPoliciesType[];
};

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.white,
      fontWeight: theme.typography.fontWeightBold as any,
    },
    body: {
      '& .MuiCheckbox-root': {
        color: theme.palette.primary.main,
      },
      '& .MuiCheckbox-root.Mui-disabled': {
        color: theme.palette.grey[400],
      },
    },
  })
)(TableCell);

const useTableCellStyles = makeStyles((theme: Theme) => ({
  noneBorderBottom: {
    borderBottom: 'none',
  },
  widthPolicyId: {
    minWidth: '130px',
  },
  smallTextStyle: {
    fontSize: '0.6875rem',
    fontWeight: 400,
  },
  tableBgColor: {
    '& .MuiTableCell-root.MuiTableCell-body': {
      backgroundColor: `${theme.palette.grey[100]} !important`,
    },
    backgroundColor: `${theme.palette.grey[100]} !important`,
  },
  shipmentStatus: {
    color: theme.palette.grey[800],
  },
}));

const shippmentDateColumns = [
  'deliveredByEmail',
  'deliveredByCourier',
  'pickedUpInPerson',
];

const columnSettings: Record<string, Column[]> = {
  all: productColumnSettings,
  submission: submissionPoliciesColumnSetting,
  approval: approvalPoliciesColumnSetting,
  shipment: shippingPoliciesColumnSetting,
};

const detailViewLinkMapping: Record<string, string> = {
  submission: 'submission',
  approval: 'approval',
  shipment: 'printing-and-shipping',
};

function PolicyTable({
  policies,
  policyTableType = 'all',
  isPolicyShipmentFetching = false,
  orderPolicies,
}: IProp) {
  const dispatch = useDispatch();
  const classes = useTableCellStyles();

  const policiesColumnSettings = columnSettings[policyTableType];

  const { itemAssignToAgent: listCheckBox } = useGetItemAssign();

  const { selectedPolicies } = useGetSelections();

  const handleSelectedPolicies = (
    productName: string,
    insurer: string,
    approvalStatus: string
  ) => {
    const selectedOrderId = productName ? productName.split('/items')[0] : '';
    dispatch(addItemAssign({ id: productName }));
    dispatch(
      addSelected({
        orderId: selectedOrderId,
        items: [productName],
        insurers: [insurer],
        approvalStatuses: [approvalStatus],
        noOfPolicies: policies.length,
      })
    );
  };

  const selectedOrderPolicy = (selectedProduct: Product) => {
    if (selectedPolicies?.length <= 0) return false;
    // If selected policy rows is exists in the store, then checked the checkbox.
    return (
      selectedPolicies.find((selected: SelectionItems) =>
        selected?.items?.includes(selectedProduct?.name ?? '')
      ) !== undefined
    );
  };

  return (
    <Table data-testid="policy-table">
      {isPolicyShipmentFetching ? (
        <TableSkeleton
          configTable={policiesColumnSettings}
          pageState={{ pageSize: 15, currentPage: 0 }}
          tableType="orders_list"
          page={0}
          isOrderListingTable
          rowsPerPage={2}
        />
      ) : (
        <>
          <TableHead className={classes.tableBgColor}>
            <TableRow>
              {policiesColumnSettings.map((productColumnSetting: Column) => (
                <StyledTableCell
                  className={clsx(classes.smallTextStyle, classes.tableBgColor)}
                  key={productColumnSetting.id}
                  align={productColumnSetting.align}
                  width={productColumnSetting?.minWidth}
                >
                  {getString(productColumnSetting.label)}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody className={classes.tableBgColor}>
            {policies?.map((product: Product) => (
              <TableRow
                key={(product as any).humanId}
                hover
                data-testid={`${(product as any).humanId}-policy`}
              >
                {policiesColumnSettings.map((column: Column) => {
                  const value: any = product[column.id as keyof Product]; // FIXME
                  // Check policy agent assignment
                  const detailViewLink = `/${
                    (product as Product)?.name?.split('/items')[0]
                  }/policies/${(product as Product)?.humanId}/${
                    detailViewLinkMapping[policyTableType]
                  }`;
                  if (column.id === 'checkbox' && !product.isAddon) {
                    return (
                      <StyledTableCell key={column.id} align="center">
                        <Checkbox
                          name=""
                          dataTestId={`shipment-policy-${
                            (product as any).policyId
                          }`}
                          handleUpdate={() => {
                            handleSelectedPolicies(
                              product?.name || '',
                              product?.insurer || '',
                              product?.approvalStatus?.status || ''
                            );
                          }}
                          isDisabled={product.isCancelled}
                          checked={
                            orderPolicies
                              ? selectedOrderPolicy(product)
                              : listCheckBox.includes(product?.name ?? '')
                          }
                        />
                      </StyledTableCell>
                    );
                  }

                  if (column.id === 'detailView' && !product.isAddon) {
                    return (
                      <TableCell key={column.id}>
                        <Link
                          to={detailViewLink}
                          target="_blank"
                          referrerPolicy="no-referrer"
                        >
                          <IconWrapper showBackground>
                            <FolderSharedIcon className="text-white" />
                          </IconWrapper>
                        </Link>
                      </TableCell>
                    );
                  }

                  if (column.id === 'policyStartDate') {
                    return (
                      <TableCell key={column.id}>
                        <span>{format(new Date(value), 'dd/MM/yyyy')}</span>
                      </TableCell>
                    );
                  }

                  if (shippmentDateColumns.includes(column.id)) {
                    return (
                      <TableCell key={column.id}>
                        <TableCellContent>
                          {value ? (
                            <>
                              <span
                                className={`${classes.shipmentStatus} text-sm font-normal`}
                              >
                                {column.id === 'deliveredByEmail' &&
                                value.shipmentStatus ===
                                  'SHIPMENT_STATUS_DELIVERED'
                                  ? getString('shipmentStatus.digitalDelivery')
                                  : getShipmentStatus(value.shipmentStatus)}
                              </span>
                              <span>
                                {value?.statusUpdateTime &&
                                  isValid(new Date(value.statusUpdateTime)) &&
                                  format(
                                    new Date(value.statusUpdateTime),
                                    'dd/MM/yyyy'
                                  )}
                              </span>
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCellContent>
                      </TableCell>
                    );
                  }

                  if (column.id === 'insurancePackage') {
                    return (
                      <TableCell key={column.id}>
                        <TableCellContent>
                          {!product.isAddon ? (
                            <>
                              <span className="text-small max-w-[100px] text-ellipsis overflow-hidden inline-block whitespace-nowrap">
                                {product.insurer}
                              </span>
                              <span style={{ fontSize: '14px' }}>
                                {(product as any).insurancePackageType}
                              </span>
                            </>
                          ) : (
                            <Chip
                              color="success"
                              text={getAddonsTextByPackage(product.package)}
                            />
                          )}
                        </TableCellContent>
                      </TableCell>
                    );
                  }

                  if ((value as ITextStatus)?.status) {
                    return (
                      <StyledTableCell key={column.id}>
                        <TextStatus
                          status={
                            product.isCancelled
                              ? 'cancelled'
                              : (value as ITextStatus).status
                          }
                          label={(value as ITextStatus).label}
                          type={(value as ITextStatus).type ?? 'circle'}
                          tableType="order"
                        />
                      </StyledTableCell>
                    );
                  }

                  if (column.id === 'policyRef' || column.id === 'policyId') {
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        className={classes.widthPolicyId}
                      >
                        {value}
                        {product?.isCancelled && (
                          <StatusTag text={getString('text.cancelled')} />
                        )}
                      </TableCell>
                    );
                  }

                  if (column.id === 'assignedTo') {
                    return (
                      <TableCell key={column.id}>
                        <span data-testid="assigned-to">
                          {value
                            ? `${value?.firstName} ${value?.lastName}`
                            : '-'}
                        </span>
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={column.id} align={column.align}>
                      {value ?? '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </>
      )}
    </Table>
  );
}

export default PolicyTable;
