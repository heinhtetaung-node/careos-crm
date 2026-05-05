import { BlueEditIcon as EditIcon } from '@alphafounders/icons';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

import { columns, fields, InitialValuesOfFilter } from './config';
import {
  useActivateCampaignMutation,
  useDeactivateCampaignMutation,
  useLazyGetCampaignsQuery,
} from 'data/slices/discountSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import CommonModal from 'presentation/components/modal/CommonModal';
import SuccessModal from 'presentation/components/modal/SuccessModal';
import useTableList from 'presentation/hooks/useTableList';
import { useStyles } from 'presentation/pages/car-insurance/CustomerProfile/ImportCustomerProfile/index';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';
import { PRODUCTS } from 'config/TypeFilter';

import CampaignModal from './CampaignModal';
import { formatFilterURI } from './helper';

import '../../../../../scss/reuse-mixin.scss';

function ActionComponent({
  row,
  handleCampaignStatus,
  handleCampaignModal,
}: {
  row: any;
  handleCampaignStatus: (data: any) => void;
  handleCampaignModal: (
    state: boolean,
    type: 'edit' | 'create',
    data: any
  ) => void;
}) {
  return (
    <div className="flex flex-rows items-center">
      <Controls.Switch
        data-testid="discount-toggle-button"
        onChange={() => handleCampaignStatus(row)}
        checked={!row.deleteTime}
      />
      <EditIcon
        className="cursor-pointer ml-2"
        onClick={() => handleCampaignModal(true, 'edit', row)}
        fontSize="large"
      />
    </div>
  );
}
export default function DiscountCampaignPage({
  product = PRODUCTS.CAR_PRODUCT_INSURANCE,
}) {
  const [campaignModal, setCampaignModal] = useState({
    edit: false,
    create: false,
    data: null,
  });
  const [filterURI, setFilterURI] = useState('');
  const [campaignSuccessModal, setSuccessCampaignModal] = useState({
    type: '',
    isActive: false,
  });

  const [activateCampaign, { data: activatedCampaign, isLoading: activating }] =
    useActivateCampaignMutation();
  const [
    deactivateCampaign,
    { data: deactivatedCampaign, isLoading: deactivating },
  ] = useDeactivateCampaignMutation();

  const { showSuccessSnackbar } = useSnackbar();
  const { TableComponent, TopComponent } = useTableList(
    'discountsCampaign',
    columns,
    {
      ...initialPageState,
      filter: `${filterURI} product="${product}"`,
    },
    useLazyGetCampaignsQuery,
    undefined,
    undefined,
    [
      activatedCampaign,
      activating,
      deactivatedCampaign,
      deactivating,
      campaignSuccessModal.isActive,
    ]
  );

  const classes = useStyles();

  const handleChange = useCallback(() => console.log('changed ...'), []);
  const handleSubmit = useCallback((payload: any) => {
    setFilterURI(formatFilterURI(payload));
  }, []);

  const handleCampaignModal = useCallback(
    (isModalActive: boolean, id: 'edit' | 'create', data = null) =>
      setCampaignModal((prev) => ({
        ...prev,
        [id]: isModalActive,
        data,
      })),
    []
  );

  const handleCampaignStatus = useCallback(
    (row: any) => {
      const { name, deleteTime } = row;
      if (deleteTime) {
        activateCampaign({ name });
      } else {
        deactivateCampaign({ name });
      }
    },
    [activateCampaign, deactivateCampaign]
  );
  const handleResetFilter = useCallback(() => setFilterURI(''), []);

  const handleSuccessModal = useCallback(
    (isModalActive: boolean, id = '') =>
      setSuccessCampaignModal({ isActive: isModalActive, type: id }),
    []
  );

  useEffect(() => {
    if (activatedCampaign?.name || deactivatedCampaign?.name) {
      showSuccessSnackbar(getString('menu.discounts.campaignUpdated'));
    }
  }, [
    activating,
    deactivating,
    activatedCampaign,
    deactivatedCampaign,
    showSuccessSnackbar,
  ]);
  const ModalType = campaignModal.create ? 'create' : 'edit';

  return (
    <div data-testid="discount-campaign-page">
      <Helmet title="Discounts - Campaign Page" />
      <div className="flex flex-row">
        <FilterPanel
          fields={fields}
          initialValues={InitialValuesOfFilter}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
          onChangeValue={handleChange}
        />
      </div>
      <div className="flex flex-row">
        <div className="basis-full w-full pt-6 pb-6 bg-white border border-gray-200 rounded-lg shadow">
          <div
            className={clsx(
              'flex grow-0 basis-full flex-wrap mb-2 justify-between',
              classes.controlBtn
            )}
          >
            <div className={clsx('flex m-0 ml-[56px]', classes.btnGroup)}>
              <Controls.Button
                text={`${getString('text.create')} ${getString(
                  'text.campaign'
                )}`}
                color="primary"
                onClick={() => handleCampaignModal(true, 'create')}
              />
            </div>
            <div className="flex m-0 ml-[56px]">
              <TopComponent />
            </div>
          </div>
          <div className={classes.table}>
            <TableComponent
              ActionCellElements={({ row }) =>
                ActionComponent({
                  row,
                  handleCampaignStatus,
                  handleCampaignModal,
                })
              }
            />
          </div>
        </div>
      </div>
      <CommonModal
        title={`${
          campaignModal.create
            ? getString('text.create')
            : getString('text.edit')
        } ${getString('text.campaign')}`}
        open={campaignModal.create || campaignModal.edit}
        handleCloseModal={() => handleCampaignModal(false, ModalType)}
      >
        <CampaignModal
          product={product}
          campaignData={campaignModal.data}
          handleSuccess={() => handleSuccessModal(true, ModalType)}
          handleClose={() => handleCampaignModal(false, ModalType)}
        />
      </CommonModal>
      <SuccessModal
        text={
          campaignSuccessModal.type === 'create'
            ? getString('text.addCampaignSuccess')
            : getString('text.editCampaignSuccess')
        }
        isOpen={campaignSuccessModal.isActive}
        handleClose={handleSuccessModal}
      />
    </div>
  );
}
