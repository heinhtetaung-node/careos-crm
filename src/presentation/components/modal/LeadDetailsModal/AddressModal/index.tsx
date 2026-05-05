import { Grid, withTheme } from '@material-ui/core';
import { FormikValues, useFormik } from 'formik';
import _omit from 'lodash/omit';
import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { useUpdateOrderDataMutation } from 'data/slices/orderSlice';
import Controls from 'presentation/components/controls/Control';
import { OrderActionTypes } from 'presentation/redux/actions/order';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';

import AddressForm from './AddressForm';
import {
  AddressUsage,
  getAddressSubmitBody,
  formatInitialFormData,
  initialFormDataInfo,
  formatOrderAddressPayload,
  formatInitialOrderData,
} from './helper';
import useAddAddress from './useAddAddress';
import { validationSchema } from './validation';

import './index.scss';

const Title = withTheme(styled.h3`
  &&& {
    margin: 0;
    color: ${({ theme }) => theme.palette.primary.main};
    border-bottom: 1px solid #2a31cb1a;
    padding-bottom: 10px;
  }
`);

const GridContainer = withTheme(styled(Grid)`
  &&& {
    min-height: 70vh;
  }
`);

const GridPolyAddress = withTheme(styled(Grid)`
  &&& {
    padding-right: 15px;
    padding-left: 2px;
  }
`);
const GridShipAddress = withTheme(styled(Grid)`
  &&& {
    padding-left: 15px;
    padding-right: 15px;
    border-right: 1px solid #2a31cb1a;
    border-left: 1px solid #2a31cb1a;
  }
`);
const GridBillAddress = withTheme(styled(Grid)`
  &&& {
    padding-right: 2px;
    padding-left: 15px;
  }
`);

interface AddressModalProps {
  close: () => void;
  leadId: string | undefined;
  isReadOnly?: boolean;
}

function AddressModal({
  close,
  leadId,
  isReadOnly = false,
}: Readonly<AddressModalProps>) {
  const currentCustomer = useGetLeadSelector();
  const order = useAppSelector((state) => state.order);
  const { addAddress, status } = useAddAddress();
  const params = useParams<{ orderId?: string }>();
  const [updateOrder, { isSuccess }] = useUpdateOrderDataMutation();
  const dispatch = useDispatch();

  const isOrderAddressModal = params?.orderId && order?.payload;

  const formattedInitialValues = useMemo(() => {
    if (isOrderAddressModal) {
      return formatInitialOrderData(order?.payload);
    }
    return formatInitialFormData(currentCustomer);
  }, []);

  const formik = useFormik({
    initialValues: formattedInitialValues,
    validationSchema: validationSchema(!isOrderAddressModal), // temporarily disable the name vaildation for order side until the feature is stable.
    onSubmit: async (formVal: FormikValues) => {
      // Order detail pages - address update
      if (isOrderAddressModal) {
        const payload = formatOrderAddressPayload(
          formVal,
          order?.payload?.product
        );
        await updateOrder({
          orderId: params?.orderId ?? '',
          payload,
        });
      } else {
        await addAddress(getAddressSubmitBody(formVal, leadId));
        close();
      }
    },
  });

  useEffect(() => {
    if (isSuccess) {
      close();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  useEffect(() => {
    // get order details
    if (isOrderAddressModal && isSuccess) {
      dispatch({
        type: OrderActionTypes.GET_DETAIL,
        payload: {
          orderName: `orders/${params?.orderId}`,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  const { isValid, initialValues, values, setFieldValue } = formik;

  const handleShipmentAddressIsSameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.checked) {
      setFieldValue('shipping', initialFormDataInfo);
    }
    if (isOrderAddressModal) {
      const policyAddress = _omit(formik.values.policy, [
        'isBillingAddress',
        'isShippingAddress',
      ]);
      setFieldValue(
        'shipping',
        !event.target.checked
          ? {
              ...policyAddress,
              addressType: formik.values.shipping.addressType,
            }
          : formik.values.shipping
      );
    }
    formik.handleChange(event);
  };

  const handleBillingAddressIsSameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.checked) {
      setFieldValue('billing', initialFormDataInfo);
    }
    if (isOrderAddressModal) {
      const policyAddress = _omit(formik.values.policy, [
        'isBillingAddress',
        'isShippingAddress',
      ]);
      setFieldValue(
        'billing',
        !event.target.checked
          ? {
              ...policyAddress,
              addressType: formik.values.shipping.addressType,
            }
          : formik.values.billing
      );
    }
    formik.handleChange(event);
  };

  const isDisabledAddButton =
    !isValid || status.isLoading || initialValues === values;

  return (
    <div className="address-modal" data-testid="add-address-modal">
      <form onSubmit={formik.handleSubmit}>
        <GridContainer
          container
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <GridPolyAddress item xs>
            <Title>{getString('addressModal.titlePolicyAddress')}</Title>
            <p
              className="address-modal__label__bold line"
              data-testid="add-address-label"
            >
              {getString('addressModal.mainAddress')}
            </p>
            <AddressForm
              keyForm={AddressUsage.POLICY}
              formik={formik as any}
              hasDisabledField
              isOrderAddress={isOrderAddressModal}
              isReadOnly={isReadOnly}
            />
          </GridPolyAddress>
          <GridShipAddress item xs>
            <Title>{getString('addressModal.titleShipmentAddress')}</Title>
            <Controls.Checkbox
              name="shipmentAddressIsSame"
              value={formik.values.shipmentAddressIsSame}
              color="primary"
              className="line"
              label={getString('addressModal.samePolicyAddress')}
              onChange={handleShipmentAddressIsSameChange}
              disabled={isReadOnly}
            />
            {!formik.values.shipmentAddressIsSame && (
              <AddressForm
                keyForm={AddressUsage.SHIPPING}
                formik={formik as any}
                isOrderAddress={isOrderAddressModal}
                isReadOnly={isReadOnly}
              />
            )}
          </GridShipAddress>
          <GridBillAddress item xs>
            <Title>{getString('addressModal.titleBillingAddress')}</Title>
            <Controls.Checkbox
              name="billingAddressIsSame"
              value={formik.values.billingAddressIsSame}
              color="primary"
              className="line"
              label={getString('addressModal.samePolicyAddress')}
              onChange={handleBillingAddressIsSameChange}
              disabled={isReadOnly}
            />
            {!formik.values.billingAddressIsSame && (
              <AddressForm
                keyForm={AddressUsage.BILLING}
                formik={formik as any}
                isOrderAddress={isOrderAddressModal}
                isReadOnly={isReadOnly}
              />
            )}
          </GridBillAddress>
        </GridContainer>
        <Grid
          container
          direction="row"
          justifyContent="center"
          className="button-group"
        >
          <Controls.Button
            className="button-group__btn add-address-cancel"
            color="secondary"
            variant="text"
            data-testid="add-address-cancel"
            text={getString('text.cancelButton')}
            onClick={close}
          />

          <Controls.Button
            className="button-group__btn"
            data-testid="add-address-submit-btn"
            type="submit"
            color="primary"
            disabled={isDisabledAddButton || isReadOnly}
            text={getString(
              status.isLoading ? 'text.loading' : 'text.addButton'
            )}
          />
        </Grid>
      </form>
    </div>
  );
}

export default AddressModal;
