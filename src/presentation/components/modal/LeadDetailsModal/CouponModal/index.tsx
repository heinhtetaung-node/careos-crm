import { FormControl, Grid } from '@material-ui/core';
import { Formik, Form } from 'formik';
import React from 'react';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { useAddCouponMutation } from 'data/slices/leadDetailSlices/couponSlice';
import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import './index.scss';

interface CouponModalProps {
  close: (isClose: boolean) => void;
  leadStatus: string;
}

function CouponModal({ close, leadStatus }: CouponModalProps) {
  const dispatch = useDispatch();
  const [addCoupon, { isLoading }] = useAddCouponMutation();
  const closeModal = () => {
    close(false);
  };
  const handleSubmit = async (coupon: string) => {
    const patchParams = {
      leadId: getLeadIdFromPath(),
      coupon,
    };
    const response = await addCoupon(patchParams);
    if ('error' in response) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message:
            (response.error as any).status === 424
              ? getString('text.leadIsNotSync')
              : getString('text.invalidCoupon'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.addCouponSuccess'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
    closeModal();
  };

  const couponSchema = Yup.object().shape({
    coupon: Yup.string().trim().required(getString('text.required')),
  });

  const isDisableInput = () => {
    return [
      'LEAD_STATUS_PENDING_PAYMENT',
      'LEAD_STATUS_PURCHASED',
      'LEAD_STATUS_CANCELLED',
    ].includes(leadStatus);
  };
  return (
    <Formik
      initialValues={{
        coupon: '',
      }}
      onSubmit={() => closeModal()}
      validationSchema={couponSchema}
    >
      {(props) => {
        const {
          values,
          isValid,
          errors,
          touched,
          handleChange,
          handleBlur,
          dirty,
        } = props;

        return (
          <Form className="lead-add-coupon">
            <FormControl
              margin="normal"
              required
              className={isDisableInput() ? 'disabled-input' : ''}
            >
              <Controls.Input
                label={getString('text.couponCode')}
                name="coupon"
                value={values.coupon}
                onChange={handleChange}
                onBlur={handleBlur}
                margin="normal"
                error={touched.coupon ? errors.coupon : ''}
                placeholder={getString('text.enterCoupon')}
                fixedLabel
                disabled={isDisableInput()}
              />
            </FormControl>
            <Grid container item xs={12} md={12} className="button-group">
              <Controls.Button
                className="button-group__btn"
                text={getString('text.cancelButton')}
                color="secondary"
                variant="text"
                onClick={() => closeModal()}
              />
              <Controls.Button
                className="button-group__btn"
                color="primary"
                loading={isLoading}
                disabled={!(isValid && dirty) || isLoading}
                onClick={() => handleSubmit(values.coupon)}
                text={getString('text.apply')}
              />
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

export default CouponModal;
