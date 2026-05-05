import { Button, DropdownButton } from '@alphafounders/ui';
import { TrashBinIcon } from '@alphafounders/icons';
import clsx from 'clsx';
import React, { useState } from 'react';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import {
  CustomerContactInformation,
  EmailResponse,
  PhoneResponse,
} from 'data/slices/customerSlice/types';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';

import DeletePhoneButton from './DeletePhoneButton';
import useSnackbar from 'utils/snackbar';

interface PhoneProps {
  phone: string;
  name: string;
}

const formatCustomerInfo = (
  data: PhoneResponse[] | EmailResponse[],
  handleRemovePhone: (phone: PhoneProps) => void,
  disableAction = false
) =>
  data.map((_data) => {
    const formattedResp: {
      name: string;
      isPrimary?: boolean;
      selected?: string;
      actionElem?: JSX.Element;
    } = { name: '' };

    if ('email' in _data) {
      formattedResp.name = _data.email;
    }
    if ('phone' in _data) {
      formattedResp.name = _data.phone;
      formattedResp.isPrimary = _data.isPrimary;
      formattedResp.selected = _data?.isPrimary ? _data.phone : '';
      formattedResp.actionElem = (
        <Button
          dataTestId="deletePhoneBtn"
          disabled={disableAction}
          className="bg-transparent"
          text={
            <TrashBinIcon
              className={clsx({
                'text-muted-dark': disableAction,
                'text-primary': !disableAction,
              })}
            />
          }
          onClick={() =>
            handleRemovePhone({ phone: _data.phone, name: _data.name })
          }
        />
      );
    }

    return {
      id: _data.name,
      ...formattedResp,
    };
  });

function ContactInformationSection({
  contacts,
  refetchContacts,
}: Readonly<{
  contacts: CustomerContactInformation;
  refetchContacts?: () => void;
}>) {
  const { showErrorSnackbar } = useSnackbar();
  const [isDeleteModal, setDeleteModal] = useState(false);
  const [currentPhone, setCurrentPhone] = useState<{
    phone: string;
    name: string;
  } | null>(null);

  const { data: user } = useGetAuthenticateQuery();

  const isAllowedToRemovePhones = [
    UserRoleID.Admin,
    UserRoleID.InboundAgent,
    UserRoleID.SuperAdmin,
  ].includes(user?.role as UserRoleID);

  const handleDeleteModal = (phone?: PhoneProps) => {
    if (
      ![UserRoleID.Admin, UserRoleID.SuperAdmin].includes(
        user?.role as UserRoleID
      )
    ) {
      showErrorSnackbar(getString('text.onlyAdminCanDeletePhone'));
      return;
    }
    setDeleteModal((prev) => !prev);
    if (phone) {
      setCurrentPhone(phone);
    }
  };
  if (contacts) {
    return (
      <div>
        {Object.keys(contacts)?.map((key) => {
          const currentData =
            contacts?.[key as keyof CustomerContactInformation];

          let selected = '';

          const formattedData = formatCustomerInfo(
            currentData,
            handleDeleteModal,
            !isAllowedToRemovePhones
          );

          if (key === 'emails') {
            selected = formattedData[0]?.name ?? '';
          }
          if (key === 'phones') {
            selected =
              formattedData?.find((phone: any) => phone.isPrimary)?.selected ??
              formattedData[0]?.name;
          }

          return (
            <div
              key={key}
              className="flex py-2 px-3 align-start border-b-1 border-gray-200"
            >
              <span className="flex items-center w-1/2 capitalize">
                {getString(`leadDetailFields.${key}`)}
              </span>
              <span className="flex items-center">:</span>
              <span className="flex items-center w-1/2 ml-2">
                <DropdownButton text={selected} options={formattedData} />
              </span>
            </div>
          );
        })}

        {/* Delete Phone Modal */}
        {currentPhone?.name && (
          <DeletePhoneButton
            phoneData={currentPhone}
            onSuccess={refetchContacts}
            handleDeleteModal={handleDeleteModal}
            isDeleteModal={isDeleteModal}
            isCustomer
          />
        )}
      </div>
    );
  }

  return (
    <p data-testid="no-contacts" className="text-center">
      {getString('text.noContacts')}
    </p>
  );
}
export default ContactInformationSection;
