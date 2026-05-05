/* eslint-disable react-hooks/exhaustive-deps */
import CircularProgress from '@material-ui/core/CircularProgress';
import React, { useState } from 'react';

import { SearchOrderPayload } from 'data/slices/orderSlice';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import {
  CourierProvider,
  getErrorMsg,
} from 'presentation/components/Shipment/helper';
import Warning from 'presentation/components/Shipment/Warning';
import { useCreateShipment } from 'presentation/components/Shipment/useCreateShipment';
import { getString } from 'presentation/theme/localization';
import { ShipmentMethods, ShipmentProviders } from 'shared/constants/orderType';

interface Props {
  handleError: (payload: string) => void;
  orders?: Record<string, any>[];
  originalArgs?: SearchOrderPayload;
}

export default function GenerateTracking({
  handleError,
  orders,
  originalArgs,
}: Props) {
  const [displayWarningModal, setDisplayWarningModal] = useState(false);

  const {
    handleCreateShipment,
    selectedPolicies,
    disabled: disabledGTButton,
    isLoading,
  } = useCreateShipment({
    handleError,
    orders,
    originalArgs,
    shipmentMethod: ShipmentMethods.SHIPMENT_METHOD_COURIER,
    shipmentProvider: CourierProvider.COURIER_PROVIDER_KERRY,
  });

  const handleClick = async () => {
    const currentSelection = selectedPolicies[0];
    // If all policies in order selected
    if (currentSelection?.noOfPolicies === currentSelection?.items?.length) {
      await handleCreateShipment(currentSelection);
    } else {
      // Display warning if not all policies in order selected
      setDisplayWarningModal(true);
    }
  };

  return (
    <>
      <CommonButton
        className="mr-2"
        color="default"
        variant="contained"
        disabled={disabledGTButton || isLoading}
        onClick={() => handleClick()}
        data-testid="generate-tracking-button"
      >
        {isLoading && (
          <CircularProgress color="inherit" size={24} className="mr-3" />
        )}
        {getString('order.shipping.generateTrackingNum')}
      </CommonButton>
      <Warning
        isOpen={displayWarningModal}
        toggleModal={setDisplayWarningModal}
        handleConfirm={() => {
          handleCreateShipment(selectedPolicies[0]);
          setDisplayWarningModal(false);
        }}
      />
    </>
  );
}
