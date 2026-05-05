import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import _find from 'lodash/find';
import React, { FormEventHandler, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { useGetAddonsQuery } from 'data/slices/orderPolicySlice';
import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import { useUpdateSubmissionMutation } from 'data/slices/submissionSlice';
import Autocomplete from 'presentation/components/common/Autocomplete';
import { formatSatang } from 'presentation/components/QcDetailPage/helpers/utils';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { getString } from 'presentation/theme/localization';
import {
  AddOnTypes,
  ItemSubmissionStatus,
  ItemQcStatus,
} from 'shared/constants/orderType';
import useSnackbar from 'utils/snackbar';

import CommonButton from '../../Button/CommonButton';
import CommonTextField from '../../CommonTextField/CommonTextField';
import Dialog from '../../Dialog';
import {
  PanelHeader,
  useStyles,
} from '../../FormikFields/FormikWrapper/index.styles';
import { Option } from '../../FormikFields/LeadAutocomplete/Autocomplete.helper';

const addOnTitleMap = {
  [AddOnTypes.ASSET]: getString('order.addOns.carAssetCoverage'),
  [AddOnTypes.CAR_REPLACEMENT]: getString('order.addOns.carReplacement'),
  [AddOnTypes.ROADSIDE_ASSISTANCE]: getString(
    'order.addOns.roadSideAssistance'
  ),
};

const options: Option[] = [
  {
    id: 'updateStatus',
    value: 'updateStatus',
    title: getString('submissionStatus.submit'),
  },
];

function AddOnStatusForm({
  policy,
  toggleDialog,
}: {
  policy: string;
  toggleDialog: () => void;
}) {
  const { orderId } = useParams();
  const [comment, setComment] = useState('');
  const [selectedOption, setSelectedOption] = useState<Option>(options[0]);
  const [updateSubmission] = useUpdateSubmissionMutation();
  const [addAndGetComment] = useOrderComments();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      await updateSubmission({
        orderId: policy, // orders/{{orderId}}/items/{{itemId}},
        payload: {
          status: ItemSubmissionStatus.SUBMITTED,
        },
      }).unwrap();
      addAndGetComment(
        {
          createBy: '',
          text: comment,
          orderId,
        },
        orderId
      );
      showSuccessSnackbar(getString('text.updatePolicySuccessfully'));
    } catch (err) {
      showErrorSnackbar(
        getString('text.errorMessage', {
          message: (err as Error)?.message ?? '',
        })
      );
    } finally {
      toggleDialog();
    }
  };
  return (
    <form onSubmit={handleSubmit} id="addon-status-form">
      <Autocomplete
        textFieldProps={{
          variant: 'outlined',
          placeholder: getString('text.select'),
        }}
        options={options}
        onChange={(_, selection: any) => {
          setSelectedOption(selection);
        }}
        value={selectedOption}
        optionTextKey="title"
      />
      <CommonTextField
        value={comment}
        dataTestId="comment-form"
        label={getString('qc.comment')}
        placeholder={getString('qc.typeHere')}
        multiline
        minRows={4}
        variant="outlined"
        onChange={(e) => setComment(e.target.value)}
        className="w-full mt-[15px]"
      />
    </form>
  );
}

export default function AddOns() {
  const [openModal, setOpenModal] = useState(false);
  const [currentAddon, setCurrentAddon] = useState('');
  const { orderId } = useParams();
  const { pathname } = useLocation();
  const classes = useStyles();

  const { data } = useGetOrderItemsQuery({ orderId: orderId! });
  const humanId = pathname.split('/')[4];
  const { item: { name = '' } = {} } =
    _find(data?.items, ({ item }) => item.humanId === humanId) || {};

  const policyId = name.split('/')[3] ?? '-'; // BE suppport endpoint like order/orderId/items/-/addons

  const { data: addOnResponse } = useGetAddonsQuery({
    orderId: orderId!,
    policyId,
  });

  if (addOnResponse && addOnResponse?.addons?.length < 1) return null;

  const closeDialog = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={12} className={classes.panelHeader}>
            <PanelHeader variant="h5">{getString('text.addOns')}</PanelHeader>
          </Grid>
          <Grid item xs={12}>
            {addOnResponse?.addons.map((addon) => (
              <div
                key={addon.addonType}
                className="flex items-center border border-t-0 border-b border-solid border-[#e9edf5] relative p-[10px]"
              >
                <div className="absolute w-0 h-0 top-0 right-0 border-t-0 border-r-[10px] border-b-[10px] border-l-0 border-solid border-t-transparent border-r-[#e9edf5] border-b-transparent border-l-transparent" />
                <div className="flex items-center basis-1/3">
                  <div>{addOnTitleMap[addon.addonType]}</div>
                  <div>:</div>
                </div>
                <div className="flex items-center basis-2/3">
                  <span>{`+${formatSatang(addon.price)}`}</span>
                  {addon.submissionStatus !== ItemSubmissionStatus.SUBMITTED ? (
                    <CommonButton
                      onClick={() => {
                        setCurrentAddon(addon.name);
                        setOpenModal(true);
                      }}
                      disabled={addon.qcStatus !== ItemQcStatus.APPROVED}
                      color="success"
                      size="small"
                      variant="contained"
                      className="ml-2"
                    >
                      {getString('text.updateStatus')}
                    </CommonButton>
                  ) : (
                    <span className="ml-2 text-[#2fce82]">
                      {getString('text.submitted')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </Grid>
        </Grid>
      </Paper>
      <Dialog
        title={getString('text.updateStatus')}
        formId="addon-status-form"
        open={openModal}
        handleToggle={closeDialog}
        content={
          <AddOnStatusForm policy={currentAddon} toggleDialog={closeDialog} />
        }
        showButton
        buttonText={getString('text.save')}
      />
    </>
  );
}
