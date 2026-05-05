import {
  FormControl,
  Button,
  Grid,
  withStyles,
  FormHelperText,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@material-ui/core';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import { Formik, Form } from 'formik';
import React, { FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';

import { NewComment } from 'presentation/components/ActivityOrderSection/CommentTextbox';
import Controls from 'presentation/components/controls/Control';
import useOrderComments from 'presentation/hooks/useOrderComments';
import { updateDocumentStatus } from 'presentation/redux/actions/order';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { Color } from 'presentation/theme/variants';
import { OrderDocumentStatus } from 'shared/constants/orderType';

interface IProps {
  close: () => void;
  warning?: any;
  classes?: any;
}

export interface IFormData {
  comment: string;
  status: OrderDocumentStatus | '';
}

export const styles = {
  warning: {
    color: Color.GREY_800,
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'end',

    '& span': {
      textDecoration: 'underline',
      display: 'inline-block',
      marginLeft: '0.5em',
    },
  },
  textArea: {
    '&& label': {
      fontSize: '1.3rem',
    },
    '& .MuiInput-multiline': {
      padding: '11px 16px',
      border: `1px solid ${Color.BLUE_MEDIUM}`,
      marginTop: '20px',
      borderRadius: '10px',
    },
  },
  btnGrp: {
    marginTop: '0',
    justifyContent: 'end',

    '& button': {
      marginBottom: '2em',
    },
  },
};

export const UpdateDocumentStatusSchema = Yup.object().shape({
  comment: Yup.string().required(getString('text.required')),
  status: Yup.string().required(getString('text.required')),
});

function OrderUpdateModal({ close, warning, classes }: IProps) {
  const dispatch = useDispatch();
  const { orderId } = useParams();
  const documentStatus = useAppSelector(
    (state) => state?.order?.payload?.documentStatus
  );

  const [addAndGetComment] = useOrderComments();

  const options = [
    {
      label: getString('orderUpdateFrm.pending'),
      value: OrderDocumentStatus.PENDING,
    },
    {
      label: getString('orderUpdateFrm.complete'),
      value: OrderDocumentStatus.COMPLETE,
    },
    {
      label: getString('orderUpdateFrm.submission'),
      value: OrderDocumentStatus.FAILED,
    },
  ];

  const handleSubmit = (values: IFormData) => {
    const payload: NewComment = {
      createBy: '',
      text: values.comment.trim(),
      orderId: orderId ?? '',
    };

    dispatch(updateDocumentStatus({ status: values.status }));
    addAndGetComment(payload, orderId);
    close();
  };

  const initialValues: IFormData = {
    comment: '',
    status: documentStatus,
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={UpdateDocumentStatusSchema}
      onSubmit={(values) => {
        handleSubmit(values);
      }}
    >
      {(props) => {
        const { handleChange, isValid, dirty, values, errors, touched } = props;

        const handleChangeComment = (event: FormEvent) => {
          handleChange(event);
        };

        const handleStatusChange = (
          event: React.ChangeEvent<HTMLInputElement>
        ) => {
          handleChange(event);
        };

        return (
          <Form data-testid="order-update-modal">
            <FormControl margin="normal" required>
              <RadioGroup
                aria-label="document-status"
                name="status"
                value={values.status}
                onChange={handleStatusChange}
              >
                {options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>

              {touched.status ?? (
                <FormHelperText error>{errors.status}</FormHelperText>
              )}
            </FormControl>

            {warning && (
              <div data-testid="order-update-modal__warning">
                <p className={classes.warning}>
                  <ReportProblemOutlinedIcon style={{ fill: '#ea4548' }} />
                  <span>{getString('orderUpdateFrm.warning')}</span>
                </p>
                {warning}
              </div>
            )}
            <FormControl margin="normal" required className={classes.textArea}>
              <Controls.Input
                name="comment"
                margin="normal"
                label={getString('orderUpdateFrm.commentLbl')}
                onChange={handleChangeComment}
                placeholder={getString('orderUpdateFrm.commentPlaceholder')}
                rows={6}
                required
                multiline
                fixedLabel
              />
              {touched.comment ?? (
                <FormHelperText error>{errors.comment}</FormHelperText>
              )}
            </FormControl>
            <Grid container item xs={12} md={12} className={classes.btnGrp}>
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

export default withStyles(styles)(OrderUpdateModal);
