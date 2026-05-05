import _getValue from 'lodash/get';
import React from 'react';
import * as Yup from 'yup';

import { IFormikControllerProps } from 'interfaces/FormikFieldsInterface';
import FormikWrapper from 'presentation/components/common/FormikFields/FormikWrapper';
import AccordionSection from 'presentation/components/common/SectionWrapper/AccordionSection';
import { getString } from 'presentation/theme/localization';
import {
  titleOptions,
  languageOptions,
  genderOptions,
} from 'shared/helper/selectOptions';

interface CustomerData {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime?: string | null;
  createBy: string;
  humanId: string;
  firstName: string;
  lastName: string;
  gender?: any;
  title?: any;
  language?: any;
}

interface CustomerProps {
  customer: CustomerData;
  phones: string[];
  emails: string[];
}

function Customer({ customerData }: { customerData?: CustomerProps }) {
  const customer = _getValue(customerData, 'customer');

  const handleUpdate = () => {
    console.log('updating');
  };

  const items: IFormikControllerProps[] = [
    {
      name: 'gender',
      title: 'leadDetailFields.gender',
      fieldType: 'autocomplete',
      display: true,
      dataTestId: 'customer-gender',
      isDisabled: true,
      options: genderOptions,
    },
    {
      title: 'leadDetailFields.title',
      name: 'title',
      fieldType: 'autocomplete',
      display: true,
      options: titleOptions,
      dataTestId: 'customer-title',
      placeholder: getString('text.select'),
      isDisabled: true,
    },
    {
      name: 'firstName',
      title: 'text.firstName',
      fieldType: 'text',
      display: true,
      dataTestId: 'customer-first-name',
      placeholder: getString('text.enterPlaceholder'),
    },
    {
      name: 'lastName',
      title: 'text.lastName',
      placeholder: getString('text.enterPlaceholder'),
      fieldType: 'text',
      display: true,
      dataTestId: 'customer-last-name',
    },

    {
      name: 'dateOfBirth',
      title: 'leadDetailFields.dob',
      fieldType: 'datefield',
      display: true,
      dataTestId: 'customer-dob',
      placeholder: getString('text.enterAppointmentDate'),
      isDisabled: true,
    },
    {
      title: 'leadDetailFields.language',
      name: 'communicationLanguage',
      fieldType: 'autocomplete',
      display: true,
      options: languageOptions,
      dataTestId: 'customer-communication-language',
      isDisabled: true,
    },
  ];

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required(getString('text.inputFirstNameValid')),
    lastName: Yup.string().required(getString('text.inputLastNameValid')),
  });

  const initialValues = {
    firstName: customer?.firstName ?? '',
    lastName: customer?.lastName ?? '',
  };

  const renderDetails = () => {
    return (
      <FormikWrapper
        hasSectionWrapper
        items={items}
        initialValues={initialValues}
        validationSchema={validationSchema}
        handleUpdate={handleUpdate}
      />
    );
  };

  return (
    <AccordionSection
      isCollapsible
      summary={getString('order.customerInfo')}
      details={renderDetails()}
    />
  );
}

export default Customer;
