import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';

import { columns, fields, InitialValuesOfFilter } from './config';
import {
  useLazyGetVouchersQuery,
  useUpdateVoucherMutation,
} from 'data/slices/discountSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import CommonModal from 'presentation/components/modal/CommonModal';
import SuccessModal from 'presentation/components/modal/SuccessModal';
import useTableList from 'presentation/hooks/useTableList';
import { useStyles } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/index';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';

import '../../../../../scss/reuse-mixin.scss';
import CreateVoucherModal from './CreateVoucherModal';
import { formatFilterURI } from './helper';

function ActionComponent({ row, handleUpdateVoucher }: any) {
  return (
    <Controls.Switch
      data-testid="discount-toggle-button"
      onChange={() => handleUpdateVoucher(row)}
      checked={row.active}
    />
  );
}
export default function DiscountVoucher() {
  const [voucherModal, setVoucherModal] = useState(false);
  const [filterURI, setFilterURI] = useState('');
  const [voucherSuccessModal, setVoucherSuccessModal] = useState(false);
  const [filterFields, setFilterFields] = useState(fields);

  const [
    updateVoucher,
    { data: updatedVoucherResponse, isLoading: isUpdatingVoucher },
  ] = useUpdateVoucherMutation();

  const { TableComponent, TopComponent } = useTableList(
    'discountsVoucher',
    columns,
    {
      ...initialPageState,
      filter: filterURI,
    },
    useLazyGetVouchersQuery,
    undefined,
    undefined,
    [updatedVoucherResponse, isUpdatingVoucher, voucherSuccessModal]
  );

  const classes = useStyles();
  const dispatch = useDispatch();

  const handleUpdateVoucher = useCallback(
    (row: any) => {
      updateVoucher({
        body: {
          name: row.name,
          active: !row.active,
        },
        updateMask: 'active',
      });
    },
    [updateVoucher]
  );

  useEffect(() => {
    if (updatedVoucherResponse?.name && !isUpdatingVoucher) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('menu.discounts.voucherUpdated'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
  }, [dispatch, isUpdatingVoucher, updatedVoucherResponse]);

  const handleSubmit = useCallback((payload: any) => {
    setFilterURI(formatFilterURI(payload));
  }, []);
  const handleResetFilter = useCallback(() => setFilterURI(''), []);

  const handleChange = useCallback((data: any) => {
    const _fields = [...fields];
    if (data.voucherType === 'percent') {
      _fields.splice(2, 0, {
        InputComponent: Controls.Input,
        inputProps: {
          adornment: '%',
          name: 'percentDiscount',
          label: getString('menu.discounts.discountPercent'),
          filterType: 'detail',
          fixedLabel: true,
          placeholder: getString('menu.discounts.discountPercent'),
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      });
    } else if (data.voucherType === 'cash') {
      _fields.splice(2, 0, {
        InputComponent: Controls.Input,
        inputProps: {
          adornment: 'TH',
          name: 'price',
          label: getString('menu.discounts.voucherPrice'),
          filterType: 'detail',
          fixedLabel: true,
          placeholder: getString('menu.discounts.voucherPrice'),
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      });
    }
    setFilterFields(_fields);
  }, []);

  const handleVoucherModal = useCallback(
    (isModalActive: boolean) => setVoucherModal(isModalActive),
    []
  );
  const handleSuccessModal = useCallback(
    (isModalActive: boolean) => setVoucherSuccessModal(isModalActive),
    []
  );

  return (
    <div data-testid="voucher-page" className={classes.importCustomerProfile}>
      <Helmet title="Discounts - Voucher Page" />
      <div className="flex flex-row">
        <FilterPanel
          fields={filterFields}
          initialValues={InitialValuesOfFilter}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
          onChangeValue={handleChange}
        />
      </div>
      <div className="flex flex-row">
        <div className="basis-full w-full pt-6 pb-6 bg-white border border-gray-200 rounded-lg shadow">
          <div className="flex grow-0 basis-full flex-wrap m-0 mb-2 justify-between">
            <div className="flex m-0 ml-[56px]">
              <Controls.Button
                text={`${getString('text.create')} ${getString(
                  'menu.discounts.voucher'
                )}`}
                color="primary"
                className="uppercase"
                onClick={() => handleVoucherModal(true)}
              />
            </div>
            <div className="flex m-0 ml-[56px]">
              <TopComponent />
            </div>
          </div>
          <div className={classes.table}>
            <TableComponent
              actionCellTitle={getString('statusOptions.active')}
              ActionCellElements={({ row }) =>
                ActionComponent({ row, handleUpdateVoucher })
              }
            />
          </div>
        </div>
      </div>
      <CommonModal
        title={`${getString('text.create')} ${getString(
          'menu.discounts.voucher'
        )}`}
        open={voucherModal}
        handleCloseModal={() => handleVoucherModal(false)}
      >
        <CreateVoucherModal
          handleSuccess={() => handleSuccessModal(true)}
          handleClose={() => handleVoucherModal(false)}
        />
      </CommonModal>
      <SuccessModal
        text={getString('text.addVoucherSuccess')}
        isOpen={voucherSuccessModal}
        handleClose={handleSuccessModal}
      />
    </div>
  );
}
