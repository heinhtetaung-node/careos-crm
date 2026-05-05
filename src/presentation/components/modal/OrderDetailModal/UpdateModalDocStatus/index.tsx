import {
  FormControl,
  Button,
  Grid,
  withStyles,
  FormHelperText,
} from '@material-ui/core';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import { Formik, Form } from 'formik';
import React, { FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { NewComment } from 'presentation/components/ActivityOrderSection/CommentTextbox';
import Controls from 'presentation/components/controls/Control';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { updateDocumentStatus } from 'presentation/redux/actions/order';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { OrderDocumentStatus } from 'shared/constants/orderType';

import { styles, UpdateDocumentStatusSchema } from '../UpdateModal';

interface OrderUpdateDocStatusProps {
  close: () => void;
  warning?: any;
  classes?: Record<string, any>;
  docStatus?: OrderDocumentStatus;
}

export interface FormDataProps {
  comment: string;
  status: OrderDocumentStatus | '';
}

function OrderUpdateDocStatus({
  close,
  warning,
  classes,
  docStatus,
}: OrderUpdateDocStatusProps) {
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const documentStatus = useAppSelector(
    (state) => state?.order?.payload?.documentStatus
  );
  const [addAndGetComment] = useOrderComments();

  const handleSubmit = (values: FormDataProps) => {
    const payload: NewComment = {
      createBy: '',
      text: values.comment.trim(),
      orderId: orderId ?? '',
    };
    addAndGetComment(payload, orderId);
    dispatch(
      updateDocumentStatus({
        status: docStatus ?? OrderDocumentStatus.COMPLETE,
      })
    );
    close();
  };

  const initialValues: FormDataProps = {
    comment: '',
    status: docStatus ?? documentStatus,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={UpdateDocumentStatusSchema}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
      validateOnChange
    >
      {(props) => {
        const { handleChange, isValid, dirty, errors, touched, values } = props;
        const handleChangeComment = (event: FormEvent) => {
          handleChange(event);
        };

        return (
          <Form data-testid="order-update-modal-demo">
            {warning && (
              <div data-testid="order-update-modal-demo__warning">
                <p className={classes?.warning}>
                  <ReportProblemOutlinedIcon />
                  <span>{getString('orderUpdateFrm.warning')}</span>
                </p>
                {warning}
              </div>
            )}
            <FormControl margin="normal" required className={classes?.textArea}>
              <Controls.Input
                name="comment"
                margin="normal"
                label={getString('orderUpdateFrm.commentLbl')}
                onChange={handleChangeComment}
                placeholder={getString('text.enterComment')}
                rows={6}
                required
                multiline
                fixedLabel
                value={values.comment}
              />
              {touched.comment ?? (
                <FormHelperText error>{errors.comment}</FormHelperText>
              )}
            </FormControl>
            <Grid container item xs={12} md={12} className={classes?.btnGrp}>
              <Button
                data-testid="document-status-update-button"
                color="primary"
                type="submit"
                variant="contained"
                disabled={!(isValid && dirty)}
              >
                {getString('text.update')}
              </Button>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

export default withStyles(styles)(OrderUpdateDocStatus);
