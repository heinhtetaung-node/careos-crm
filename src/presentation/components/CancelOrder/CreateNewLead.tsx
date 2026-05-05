import React, { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

import { Checkbox } from '@alphafounders/ui';
import { differenceInCalendarDays } from 'date-fns';

import { CreateLead, useSearchOrdersQuery } from 'data/slices/orderSlice';
import { getString } from 'presentation/theme/localization';
import { CancellationReasons } from 'shared/constants/orderType';

import Dialog from '../common/Dialog';
import RadioFieldGroup from '../common/RadioGroup/RadioGroup';
import { PolicyItem } from './helper';

export default function CreateNewLead({
  open = false,
  handleModalToggle,
  policies,
  selectedPolicies,
  cancelReason,
  handleCancelOrder,
  leadHumanId,
  cancellingPolicy,
  showLeadId,
  setShowLeadId,
  isEnableOrderCancellationV2,
}: Readonly<{
  orderId?: string;
  open?: boolean;
  handleModalToggle: () => void;
  policies: PolicyItem[];
  selectedPolicies: PolicyItem[];
  cancelReason?: CancellationReasons;
  handleCancelOrder: (payload: CreateLead) => void;
  leadHumanId?: string;
  cancellingPolicy: boolean;
  showLeadId: boolean;
  setShowLeadId: (payload: string) => void;
  isEnableOrderCancellationV2?: boolean;
}>) {
  const [createNewLead, setCreateNewLead] = useState<boolean>(true);

  const [changeOrder, setChangeOrder] = useState<boolean>(true);

  const [
    isCancelledPolicyItemAndChangedOrder,
    setIsCancelledPolicyItemAndChangedOrder,
  ] = useState<boolean>(false);

  const { data: cancelOrderItems } = useSearchOrdersQuery({
    queryParams: {
      type: 'cancellation',
      filter: `item.name in(${policies?.map((policy: any) => `'${policy?.id}'`).toString()})`,
    },
  });

  const handleUpateOption = (e: React.ChangeEvent<HTMLInputElement>) => {
    const option = e.target.value;
    const strTrueFalseToBoolean = isCancelledPolicyItemAndChangedOrder
      ? false
      : JSON.parse(option); // this code needs because e.target.value only returns string type 'true' or 'false' and JSON.parse change string 'true' or 'false' to boolean.

    setCreateNewLead(strTrueFalseToBoolean);
    setChangeOrder(strTrueFalseToBoolean);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CreateLead = {
      createLead: createNewLead,
      reason: changeOrder
        ? CancellationReasons.INSURER_REJECTED_INCORRECT_PACKAGE
        : cancelReason,
      ...{ changeOrder },
      ...(isEnableOrderCancellationV2
        ? { customerRequest: 'CUSTOMER_REQUEST_CHANGE_ORDER' }
        : {}),
    };

    handleCancelOrder(payload);
  };

  const showOrderCheckBox = useMemo(() => {
    const checkOrderIsMoreThan30days =
      selectedPolicies.filter(
        (policy) =>
          differenceInCalendarDays(new Date(), new Date(policy.policyDate)) <=
          30
      ).length > 0;
    return (
      policies.length === selectedPolicies.length &&
      checkOrderIsMoreThan30days &&
      !isEnableOrderCancellationV2
    );
  }, [policies, selectedPolicies, isCancelledPolicyItemAndChangedOrder]);

  const renderForm = () => (
    <form
      id="create-new-lead"
      data-testid="create-new-lead-form"
      onSubmit={onSubmit}
    >
      <p className="text-lg font-semibold text-center">
        {getString('order.cancel.createLeadConfirmation')}
      </p>
      <RadioFieldGroup
        name="options"
        className={clsx('gap-0', [isEnableOrderCancellationV2 && 'hidden'])}
        value={createNewLead}
        onChange={handleUpateOption}
        options={[
          {
            value: true,
            disabled: isCancelledPolicyItemAndChangedOrder,
            label: getString('text.yes'),
          },
          {
            value: false,
            label: getString('text.no'),
            status: 'danger',
          },
        ]}
      />
      {showOrderCheckBox && (
        <div className="w-full mt-4 flex">
          <Checkbox
            onChange={() => setChangeOrder(!changeOrder)}
            disabled
            checked={createNewLead && changeOrder}
            label={getString('carepay.changeOrder.changeOrderCheckbox')}
          />
        </div>
      )}
    </form>
  );

  useEffect(() => {
    if (cancelOrderItems?.orders?.length) {
      const alreadyChangedOrder =
        cancelOrderItems?.orders?.filter(
          (order: any) => order?.changeOrderFlag === 'TRUE'
        )?.length > 0;
      if (alreadyChangedOrder) {
        setIsCancelledPolicyItemAndChangedOrder(true);
        setCreateNewLead(false);
      } else {
        setIsCancelledPolicyItemAndChangedOrder(false);
        setCreateNewLead(true);
      }
    }
  }, [cancelOrderItems]);
  return (
    <>
      <Dialog
        open={open}
        content={renderForm()}
        handleToggle={handleModalToggle}
        data-testid="create-new-lead"
        showButton
        formId="create-new-lead"
        title={getString('order.cancel.createLead')}
        buttonText={getString('text.confirmButton')}
        isLoading={cancellingPolicy}
        disabled={cancellingPolicy}
      />
      <Dialog
        open={showLeadId}
        handleToggle={() => setShowLeadId('')}
        data-testid="show-lead-id"
        title={getString('createNewLeadModal.title')}
        content={
          <p>
            {getString('createNewLeadModal.creationMessage', { leadHumanId })}
          </p>
        }
      />
    </>
  );
}
