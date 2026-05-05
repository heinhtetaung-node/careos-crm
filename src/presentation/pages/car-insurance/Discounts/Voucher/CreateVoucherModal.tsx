import { Formik, Form } from 'formik';
import React, { useCallback, useEffect } from 'react';

import { CreateVoucherSchema, VoucherTypeOptions } from './config';
import { useCreateVoucherMutation } from 'data/slices/discountSlice';
import { VoucherPayload } from 'data/slices/discountSlice/types';
import Controls from 'presentation/components/controls/Control';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { bahtToSatang } from 'utils/currency';
import useSnackbar from 'utils/snackbar';

import { handleFormatDate } from './helper';

export default function CreateVoucherModal({
  handleClose,
  handleSuccess,
}: {
  handleClose: () => void;
  handleSuccess: () => void;
}) {
  const [
    createVoucher,
    { data: createdVoucher, isLoading, isSuccess, isError, error },
  ] = useCreateVoucherMutation({});
  const { showErrorSnackbar } = useSnackbar();

  const currentUser = useAppSelector((state) => state.authReducer.data.user);

  const handleCreateVoucher = useCallback(
    async (body: VoucherPayload['body']) => {
      await createVoucher({
        body: {
          ...body,
          startTime: handleFormatDate(body.startTime, true),
          endTime: handleFormatDate(body.endTime),
        },
      });
    },
    [createVoucher]
  );

  const handleSubmit = useCallback(
    async (data: VoucherPayload['body']) => {
      const isPercent = data.voucherType === 'percent';
      const body = { ...data };
      const isPercentDiscount = isPercent && body.percentDiscount !== null;
      const isPrice = !isPercent && body.price !== null;

      if (!isPercentDiscount && !isPrice) return;
      if (isPercent && body.percentDiscount) {
        delete body.price;
        body.percentDiscount *= 100;
      }
      if (!isPercent && body.price) {
        delete body.percentDiscount;
        body.price = bahtToSatang(body.price);
      }
      await handleCreateVoucher(body);
    },
    [handleCreateVoucher]
  );
  useEffect(() => {
    if (isSuccess && createdVoucher?.name) {
      handleClose();
      handleSuccess();
    } else if (isError) {
      const err = error as any;
      if (err && err?.data) {
        showErrorSnackbar(
          getString('text.errorMessage', {
            message: err.data.message,
          })
        );
      }
    }
  }, [
    handleClose,
    handleSuccess,
    isLoading,
    createdVoucher,
    isError,
    error,
    showErrorSnackbar,
    isSuccess,
  ]);

  return (
    <Formik
      enableReinitialize
      initialValues={{
        humanName: '',
        startTime: new Date().toLocaleDateString(),
        endTime: '',
        voucherType: 'cash',
        code: '',
        percentDiscount: null,
        quantity: null,
        price: null,
        active: true,
        createBy: currentUser.name,
      }}
      validationSchema={CreateVoucherSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, values, handleChange, setFieldValue }) => (
        <Form
          data-testid="discount-voucher-modal"
          className="admin-team-create-team"
        >
          <Controls.Input
            className="mt-2 mb-2"
            fixedLabel
            label={getString('menu.discounts.voucherName')}
            placeholder={getString('menu.discounts.voucherName')}
            name="humanName"
            error={errors.humanName}
            value={values.humanName}
            onChange={handleChange}
          />
          <div className="flex flex-row text-left">
            <div className="mr-2">
              <Controls.KeyBoardDatePicker
                className="mt-2 mb-2"
                fixedLabel
                label={getString('text.startDate')}
                placeholder={getString('text.startDate')}
                name="startTime"
                disableToolbar
                autoOk
                minDateMessage
                invalidDateMessage
                disablePast
                helperText={errors.startTime}
                data-testid="input-startTime"
                value={new Date(values.startTime).toLocaleDateString()}
                onChange={(date) => setFieldValue('startTime', date)}
              />
            </div>
            <div>
              <Controls.KeyBoardDatePicker
                className="mt-2 mb-2"
                fixedLabel
                label={getString('text.endDate')}
                placeholder={getString('text.endDate')}
                name="endTime"
                disableToolbar
                autoOk
                minDateMessage
                invalidDateMessage
                disablePast
                helperText={errors.endTime}
                data-testid="input-endTime"
                value={new Date(values.endTime).toLocaleDateString()}
                onChange={(date) => setFieldValue('endTime', date)}
              />
            </div>
          </div>
          <Controls.Select
            className="mt-2 mb-2"
            fixedLabel
            options={VoucherTypeOptions}
            label={getString('menu.discounts.voucherType')}
            placeholder={getString('menu.discounts.voucherType')}
            name="voucherType"
            selectField="value"
            value={values.voucherType}
            onChange={handleChange}
          />
          <Controls.Input
            className="mt-2 mb-2"
            fixedLabel
            label={getString('menu.discounts.voucherCode')}
            placeholder={getString('menu.discounts.voucherCode')}
            name="code"
            error={errors.code}
            value={values.code}
            onChange={handleChange}
          />
          {values.voucherType === 'percent' ? (
            <Controls.Input
              className="mt-2 mb-2"
              fixedLabel
              adornment="%"
              label={getString('menu.discounts.discountPercent')}
              placeholder={getString('menu.discounts.discountPercent')}
              name="percentDiscount"
              error={errors.percentDiscount}
              value={values.percentDiscount}
              onChange={handleChange}
            />
          ) : (
            <Controls.Input
              className="mt-2 mb-2 "
              fixedLabel
              adornment="THB"
              label={getString('menu.discounts.voucherPrice')}
              placeholder={getString('menu.discounts.voucherPrice')}
              name="price"
              error={errors.price}
              value={values.price}
              onChange={handleChange}
            />
          )}
          <Controls.Input
            className="mt-2 mb-2"
            fixedLabel
            label={getString('menu.discounts.voucherQuantity')}
            placeholder={getString('menu.discounts.voucherQuantity')}
            name="quantity"
            error={errors.quantity}
            value={values.quantity}
            onChange={handleChange}
          />
          <div className="flex p-0 pl-16 button-group mt-6 mb-4 justify-end">
            <Controls.Button
              color="secondary"
              variant="text"
              text={getString('text.cancelButton')}
              disabled={isLoading}
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
