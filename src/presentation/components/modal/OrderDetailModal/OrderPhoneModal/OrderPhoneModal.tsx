import { FormControl, Grid, makeStyles } from '@material-ui/core';
import { Formik, Form } from 'formik';
import React, { FormEvent, useEffect } from 'react';
import * as Yup from 'yup';

import {
  useCreatePhoneNumberMutation,
  useGetCustomerPhoneNumberQuery,
  useUpdateCustomerMutation,
} from 'data/slices/customerSlice';
import { PhoneResponse } from 'data/slices/customerSlice/types';
import { useUpdateLeadJsonMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import { useGetLeadByIDQuery } from 'data/slices/leadSlice';
import Controls from 'presentation/components/controls/Control';
import Loader from 'presentation/components/Loader';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import phone from 'shared/validators/phone';
import useSnackbar from 'utils/snackbar';

import { syncCustomerAndLeadPhones, isPhoneExists } from './helpers';

import useAddPhone from '../../LeadDetailsModal/PhoneModal/useAddPhone';

interface OrderPhoneModalProps {
  customerId?: string;
  close: () => void;
}

const useStyle = makeStyles((theme) => ({
  btnGroup: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
    marginTop: '14px',
    '& button': {
      textTransform: 'uppercase',
    },
  },
  orderAddPhone: {
    '& .MuiFormControl-root': {
      position: 'relative',
    },
    '& .button-group': {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '14px',
      '&__btn': {
        textTransform: 'uppercase',
      },
      '& .shared-button': {
        '&:last-child': {
          '& .button-group__btn': {
            marginRight: 0,
          },
        },
      },
    },
    '& .MuiInputLabel-animated': {
      color: '#4f4b66',
      fontSize: '14px',
      fontFamily: 'Poppins, sans-serif',
    },
    '& input': {
      padding: '11px 16px',
      border: '1px solid $bg-color-blue-5',
      borderRadius: '10px',
      height: '42px',
      boxSizing: 'border-box',
      fontFamily: 'Poppins, sans-serif',
      '&:hover, &:focus': {
        transition: '0.2s',
        border: `1px solid ${theme.palette.primary.main}`,
        boxShadow: theme.effects.shadow2,
      },
    },
  },
}));

function OrderPhoneModal({ customerId, close }: OrderPhoneModalProps) {
  const classes = useStyle();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();
  const { setPrimaryPhoneIndex } = useAddPhone();
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const [addPhoneToCustomer, { isLoading: isAddingPhoneToCustomer }] =
    useCreatePhoneNumberMutation();
  const { data: phoneList, refetch } = useGetCustomerPhoneNumberQuery(
    {
      customerName: customerId ?? '',
    },
    {
      skip: !customerId,
    }
  );
  const { lead: leadPath } = useAppSelector(
    (currentState) => currentState.order?.payload
  );
  const leadId = leadPath?.split('/')[1] ?? '';
  const { data: leadData } = useGetLeadByIDQuery(leadId);
  const [updateLead] = useUpdateLeadJsonMutation();

  const [
    updateCustomer,
    {
      isLoading: isUpdateCustomerLoading,
      isSuccess: isUpdateCustomerSuccess,
      isError: isUpdateCustomerError,
      error: updateCustomerError,
    },
  ] = useUpdateCustomerMutation();
  // Phones from customer service
  const customerPhones = phoneList?.phones;

  useEffect(() => {
    if (isUpdateCustomerError) {
      showErrorSnackbar((updateCustomerError as any)?.data?.message ?? '');
    }
    if (isUpdateCustomerSuccess) {
      showSuccessSnackbar(getString('text.updateCustomerSuccess'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpdateCustomerError, isUpdateCustomerSuccess]);

  const isCar = globalProduct === 'products/car-insurance';

  const handleSubmit = async ({
    phone: phoneNumber,
    isMain,
  }: {
    phone: string;
    isMain: boolean;
  }) => {
    if (!customerId) return;

    const customerPhonesUpdated = await refetch();

    const { customerPhoneNumber: phonesFromLeadCar } = leadData?.data ?? {
      customerPhoneNumber: [],
    };
    const { phoneNumbers: phonesFromLeadHealth } = leadData?.data?.customer ?? {
      phoneNumbers: [] as PhoneResponse[],
    };

    const phonesFromLead = isCar ? phonesFromLeadCar : phonesFromLeadHealth;

    const internationalPhoneNumber = phoneNumber.replace(/^0+/, '+66');
    const { object: customerPhoneExists } = isPhoneExists(
      customerPhonesUpdated?.data?.phones,
      internationalPhoneNumber
    );
    const { indexOf: leadPhoneIndex } = isPhoneExists(
      phonesFromLead as PhoneResponse[],
      internationalPhoneNumber
    );
    const leadPhoneExists = leadPhoneIndex !== -1;

    // Add customer phone for order side
    let customerPhoneId: string;
    if (customerPhoneExists) {
      customerPhoneId = (customerPhoneExists as PhoneResponse)?.name;
    } else {
      const addPhoneResult = await addPhoneToCustomer({
        customerName: customerId,
        phone: internationalPhoneNumber,
      }).unwrap();
      customerPhoneId = addPhoneResult?.name;
    }

    // Add customer phone for lead side
    let primaryPhoneIndex: number | undefined;
    if (!leadPhoneExists) {
      const leadPhones = phonesFromLead ?? [];
      const { data: leadUpdatedData } = await updateLead({
        leadId,
        payload: [
          {
            op: 'add',
            path: '/customerPhoneNumber',
            value: [
              ...leadPhones,
              {
                phone: internationalPhoneNumber,
                status: 'unverified',
              },
            ],
          },
        ],
      }).unwrap();

      if (leadUpdatedData) {
        primaryPhoneIndex = isCar
          ? (leadUpdatedData?.customerPhoneNumber?.length || 1) - 1
          : (leadUpdatedData?.customer?.phoneNumbers?.length || 1) - 1;
      }
    } else {
      primaryPhoneIndex = leadPhoneIndex;
    }

    // Set primary phone index for call button
    if (isMain && primaryPhoneIndex !== undefined) {
      setPrimaryPhoneIndex(primaryPhoneIndex);
    }

    // Set primary phone number if is main contact
    if (isMain && customerPhoneId) {
      updateCustomer({
        customerId,
        payload: {
          primaryPhoneId: customerPhoneId,
        },
      });
    }
    showSuccessSnackbar(getString('text.updateCustomerSuccess'));
    close();
  };

  const phoneSchema = Yup.object().shape({
    phone: phone(),
  });

  const initialValues = {
    phone: '',
    isMain: false,
  };

  if (!customerPhones) {
    return <Loader />;
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={close}
      validationSchema={phoneSchema}
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
          setFieldTouched,
        } = props;

        const handleChangeContact = (event: FormEvent) => {
          event.persist();
          handleChange(event);
          setFieldTouched('phone', true, false);
        };

        const handleKeyPress = (event: React.KeyboardEvent) => {
          if (!/\d/.test(event.key)) {
            event.preventDefault();
          }
        };

        return (
          <Form className={classes.orderAddPhone} data-testid="order-add-phone">
            <FormControl margin="normal" required>
              <Controls.Input
                onKeyPress={handleKeyPress}
                label={getString('text.phoneNumber')}
                name="phone"
                value={values.phone}
                onChange={handleChangeContact}
                onBlur={handleBlur}
                margin="normal"
                error={touched.phone ? errors.phone : ''}
                placeholder={getString('text.enterPhoneNumber')}
                fixedLabel
                data-testid="input-phone-number"
                type="tel"
              />
              <Controls.Checkbox
                value={values.isMain}
                name="isMain"
                label={getString('text.mainContact')}
                onChange={handleChangeContact}
              />
            </FormControl>
            <Grid container item xs={12} md={12} className={classes.btnGroup}>
              <Controls.Button
                className="button-group__btn"
                text={getString('text.closeButton')}
                color="secondary"
                variant="text"
                onClick={close}
              />
              <Controls.Button
                className="button-group__btn"
                color="primary"
                data-testid="add-phone-btn"
                disabled={
                  !(
                    isValid &&
                    dirty &&
                    !isUpdateCustomerLoading &&
                    !isAddingPhoneToCustomer
                  )
                }
                onClick={() => handleSubmit(values)}
                text={
                  isUpdateCustomerLoading || isAddingPhoneToCustomer
                    ? getString('text.loading')
                    : getString('text.addButton')
                }
              />
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

export default OrderPhoneModal;
