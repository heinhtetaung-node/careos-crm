import { parse } from 'date-fns';
import { Formik, Form } from 'formik';
import React, { useCallback, useEffect, useMemo } from 'react';
import * as Yup from 'yup';

import { ApproverOptions } from './config';
import {
  useCreateCampaignMutation,
  useEditCampaignMutation,
} from 'data/slices/discountSlice';
import { CampaignPayload } from 'data/slices/discountSlice/types';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import useSnackbar from 'utils/snackbar';

import { handleFormatDate } from '../Voucher/helper';

export default function CampaignModal({
  product,
  campaignData,
  handleClose,
  handleSuccess,
}: {
  product: string;
  campaignData: CampaignPayload['body'] | null;
  handleSuccess: () => void;
  handleClose: () => void;
}) {
  const [
    createCampaign,
    {
      data: createdCampaign,
      isLoading: isCreatingCampaign,
      isSuccess: isCampaignCreated,
      isError: isCampaignNotCreated,
      error: createCampaignError,
    },
  ] = useCreateCampaignMutation({});
  const [
    editCampaign,
    {
      data: editedCampaign,
      isLoading: isEditingCampaign,
      isSuccess: isCampaignEdited,
      isError: isCampaignNotEdited,
      error: editCampaignError,
    },
  ] = useEditCampaignMutation({});

  const { isLoading, isSuccess, isError, error, isEditAllowed } = useMemo(
    () => ({
      isLoading: isCreatingCampaign || isEditingCampaign,
      isSuccess: isCampaignCreated || isCampaignEdited,
      isError: isCampaignNotCreated || isCampaignNotEdited,
      error: createCampaignError || editCampaignError,
      isEditAllowed: !!campaignData,
    }),
    [
      campaignData,
      createCampaignError,
      editCampaignError,
      isCampaignCreated,
      isCampaignEdited,
      isCampaignNotCreated,
      isCampaignNotEdited,
      isCreatingCampaign,
      isEditingCampaign,
    ]
  );

  const { showErrorSnackbar } = useSnackbar();

  const handleCampaignSubmit = useCallback(
    async (body: CampaignPayload['body']) => {
      const requiredBody = {
        approver: body.approver === '-' ? '' : body.approver,
        campaignCode: body.campaignCode,
        description: body.description,
        discountPercentage: body.discountPercentage,
        startDate: handleFormatDate(body.startDate, true),
        endDate: handleFormatDate(body.endDate),
      };

      if (isEditAllowed) {
        editCampaign({
          body: {
            ...requiredBody,
            name: body.name,
          },
        });
        return;
      }
      await createCampaign({
        body: {
          ...requiredBody,
          product,
        },
      });
    },
    [createCampaign, editCampaign, isEditAllowed]
  );

  const handleSubmit = useCallback(
    async (data: CampaignPayload['body']) => {
      const body = { ...data };
      const isPercentDiscount = body.discountPercentage !== null;

      if (isPercentDiscount && body.discountPercentage) {
        body.discountPercentage = (
          parseInt(body.discountPercentage, 10) * 100
        ).toString();
      }
      await handleCampaignSubmit(body);
    },
    [handleCampaignSubmit]
  );

  useEffect(() => {
    if (isSuccess && (createdCampaign?.name || editedCampaign?.name)) {
      handleClose();
      handleSuccess();
    } else if (isError) {
      const err = error as any;
      if (err?.data) {
        showErrorSnackbar(
          getString('text.errorMessage', {
            message: err.data.message,
          })
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    isError,
    error,
    isSuccess,
    createdCampaign?.name,
    editedCampaign?.name,
  ]);

  const INITIAL_VALUES = useMemo(
    () =>
      campaignData
        ? {
            ...campaignData,
            startDate: parse(
              campaignData.startDate,
              'dd/MM/yyyy',
              new Date()
            ).toLocaleDateString(),
            endDate: parse(
              campaignData.endDate,
              'dd/MM/yyyy',
              new Date()
            ).toLocaleDateString(),
            approver: campaignData.approver.length
              ? `roles/${campaignData.approver}`
              : '',
          }
        : {
            product: 'products/car-insurance',
            campaignCode: '',
            startDate: '',
            endDate: '',
            approver: '-',
            description: '',
            discountPercentage: '',
          },
    [campaignData]
  );
  return (
    <Formik
      enableReinitialize
      initialValues={INITIAL_VALUES}
      validationSchema={Yup.object().shape({})}
      onSubmit={handleSubmit}
    >
      {({ errors, values, handleChange, setFieldValue }) => (
        <Form
          data-testid="discount-campaign-modal"
          className="admin-team-create-team"
        >
          <Controls.Input
            className="mt-2 mb-2 "
            fixedLabel
            label={getString('menu.discounts.campaignName')}
            placeholder={getString('menu.discounts.campaignName')}
            name="campaignCode"
            error={errors.campaignCode}
            value={values.campaignCode}
            onChange={handleChange}
          />
          <div className="flex flex-row text-left">
            <div className="mr-2">
              <Controls.KeyBoardDatePicker
                className="mt-2 mb-2"
                fixedLabel
                label={getString('text.startDate')}
                placeholder={getString('text.startDate')}
                name="startDate"
                disableToolbar
                autoOk
                minDateMessage
                invalidDateMessage
                data-testid="input-startDate"
                disablePast
                helperText={errors.startDate}
                value={new Date(values.startDate).toLocaleDateString()}
                onChange={(date) => setFieldValue('startDate', date)}
              />
            </div>
            <div>
              <Controls.KeyBoardDatePicker
                className="mt-2 mb-2 "
                fixedLabel
                label={getString('text.endDate')}
                placeholder={getString('text.endDate')}
                name="endDate"
                disableToolbar
                autoOk
                minDateMessage
                invalidDateMessage
                data-testid="input-endDate"
                disablePast
                helperText={errors.endDate}
                value={new Date(values.endDate).toLocaleDateString()}
                onChange={(date) => setFieldValue('endDate', date)}
              />
            </div>
          </div>
          <Controls.Select
            className="mt-2 mb-2 "
            fixedLabel
            options={ApproverOptions}
            label={getString('text.approver')}
            name="approver"
            placeholder={getString('text.select')}
            selectField="value"
            value={values.approver}
            onChange={handleChange}
          />
          <Controls.Input
            className="mt-2 mb-2 "
            fixedLabel
            adornment="%"
            label={getString('menu.discounts.discountPercent')}
            placeholder={getString('menu.discounts.discountPercent')}
            name="discountPercentage"
            error={errors.discountPercentage}
            value={values.discountPercentage}
            onChange={handleChange}
          />
          <Controls.Input
            className="mt-2 mb-2"
            fixedLabel
            label={getString('text.description')}
            placeholder={getString('text.description')}
            name="description"
            value={values.description}
            onChange={handleChange}
          />
          <div className="flex p-0 pl-16 button-group mt-6 mb-4 justify-end">
            <Controls.Button
              color="secondary"
              variant="text"
              text={getString('text.cancelButton')}
              onClick={handleClose}
            />
            <Controls.Button
              type="submit"
              color="primary"
              disabled={isLoading || Object.entries(errors)?.length}
              loading={isLoading}
              text={getString('text.save')}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}
