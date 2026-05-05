import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import React from 'react';
import { v4 } from 'uuid';
import { AnyObject } from 'yup';

import {
  CustomerLeadResponse,
  TransformedOrder,
} from 'data/slices/customerSlice/types';
import Loader from 'presentation/components/Loader';
import {
  EDIT_TYPE,
  formatDateValue,
} from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/helper';
import { getOptionData } from 'presentation/pages/car-insurance/OrderDetailPage/leadDetailsPage.helper';
import {
  customerLeadType,
  customerLeadStatus,
} from 'presentation/redux/reducers/leads/lead-assignment';
import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';

import {
  IAccordionListProps,
  CustomerFormType,
  FormType,
  LeadDataType,
  OrderDataType,
  IDataProps,
} from './types';

const formValue = {
  customer: {
    humanId: {
      value: '',
      isEditable: false,
      editType: EDIT_TYPE.INPUT,
      title: 'humanId',
      id: v4(),
      isError: false,
      name: 'humanId',
      isRequired: false,
    },
    title: {
      value: '',
      isEditable: false,
      editType: EDIT_TYPE.INPUT,
      title: 'title',
      id: v4(),
      isError: false,
      name: 'policyTitle',
      isRequired: false,
    },
    firstName: {
      value: '',
      isEditable: false,
      editType: EDIT_TYPE.INPUT,
      title: 'firstName',
      id: v4(),
      isError: false,
      name: 'firstName',
      isRequired: false,
    },
    lastName: {
      value: '',
      isEditable: false,
      editType: EDIT_TYPE.INPUT,
      title: 'lastName',
      id: v4(),
      isError: false,
      name: 'lastName',
      isRequired: false,
    },
    gender: {
      value: '',
      isEditable: false,
      editType: EDIT_TYPE.SELECT,
      title: 'gender',
      options: getOptionData('Gender'),
      id: v4(),
      isError: false,
      name: 'gender',
      isRequired: false,
    },
    DOB: {
      value: '',
      isEditable: false,
      editType: EDIT_TYPE.DATE_PICKER,
      title: 'dob',
      id: v4(),
      isError: false,
      name: 'dateOfBirth',
      isRequired: false,
    },
  },
};
const MAX_YEAR_DATA = 2;

export const ORDER_DETAILS_KEYS = [
  'carPlate',
  'orderId',
  'paymentStatus',
  'totalInvoice',
];
export const LEAD_DETAILS_KEYS = [
  'id',
  'name',
  'deleteTime',
  'type',
  'status',
  'brand',
  'model',
  'updateTime',
  'user',
];

export const mappingFieldValue = (data: any) => {
  const newFormValue: FormType = { ...formValue };
  Object.keys(newFormValue).forEach((key) => {
    Object.keys(newFormValue[key as keyof FormType]).forEach((childKey) => {
      const isGender = childKey === 'gender';
      const _key =
        newFormValue[key as keyof FormType][childKey as keyof CustomerFormType];
      const _childKey = data?.[key]?.[childKey];

      if (!_key) {
        return;
      }
      _key.value = isGender ? _childKey?.toLowerCase() : _childKey;
    });
  });
  newFormValue.customer.DOB.value = data.customer.dateOfBirth;

  return newFormValue;
};
export const CUSTOMER_SECTIONS: string[] = ['customer', 'leads', 'orders'];

export const getFormattedLead = (
  leadData: Lead,
  additionalData: { model: string; brand: string }
) => {
  const {
    humanId,
    name,
    data,
    status,
    type,
    deleteTime,
    assignedTo,
    updateTime,
  } = leadData;
  const customerName =
    data?.customerFirstName && data?.customerLastName
      ? `${data.customerFirstName} ${data?.customerLastName}`
      : '';

  return {
    [name.split('/')[1]]: {
      id: humanId,
      user: assignedTo,
      name: customerName,
      status: getString(customerLeadStatus(status)),
      type: getString(customerLeadType(type)),
      deleteTime: formatDateValue(deleteTime),
      updateTime: formatDateValue(updateTime),
      ...additionalData,
    },
  };
};

export const filterMaxYearData = (data: CustomerLeadResponse[]) => {
  const FilterData: IDataProps[] = [];
  data.forEach((_data: CustomerLeadResponse) => {
    if (
      new Date().getFullYear() - new Date(_data.createTime).getFullYear() <=
      MAX_YEAR_DATA
    ) {
      FilterData.push({ name: _data.name.split('/')[3] });
    }
  });
  return FilterData;
};

export function AccordionListWithTable({
  id,
  data,
  name,
  classes,
  expanded,
  handleExpand,
  isLoading,
  FILTERED_DETAILS,
  handleGetSelectedData,
}: IAccordionListProps) {
  const triggerExpand = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    isExpanded: boolean
  ) => {
    handleExpand(isExpanded ? id : false);
    if (isExpanded) {
      handleGetSelectedData(id);
    }
  };

  return (
    <Accordion
      key={id}
      data-testid="test-accordion"
      className={classes.accordion}
      expanded={expanded === id}
      onChange={triggerExpand}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <p className={classes.heading}>{name}</p>
      </AccordionSummary>
      <AccordionDetails>
        <Table>
          <TableBody>
            {!isLoading && data?.[id] ? (
              FILTERED_DETAILS.map((detail: string) => (
                <TableRow key={`${detail}-${id}`} data-testid={detail}>
                  <TableCell className={classes.th}>
                    {getString(`lead.tableListing.${detail}`)}
                  </TableCell>
                  <TableCell>
                    {
                      data?.[id]?.[
                        detail as keyof LeadDataType | keyof OrderDataType
                      ]
                    }
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <Loader />
            )}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}

export function RenderOrderList({
  id,
  data,
  name,
  classes,
  expanded,
  handleExpand,
}: {
  id: string;
  data: TransformedOrder;
  name: string;
  classes: AnyObject;
  expanded: string | false;
  handleExpand: (id: any) => void;
}) {
  const triggerExpand = (
    _event: React.ChangeEvent<Record<string, unknown>>,
    isExpanded: boolean
  ) => {
    handleExpand(isExpanded ? id : false);
  };

  return (
    <Accordion
      key={id}
      data-testid="test-accordion"
      className={classes.accordion}
      expanded={expanded === id}
      onChange={triggerExpand}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <p className={classes.heading}>{name}</p>
      </AccordionSummary>
      <AccordionDetails>
        <Table>
          <TableBody>
            {ORDER_DETAILS_KEYS.map((key) => (
              <TableRow key={`${key}-${id}`} data-testid={key}>
                <TableCell className={classes.th}>
                  {getString(`customerProfile.orders.${key}`)}
                </TableCell>
                <TableCell>{data[key as keyof TransformedOrder]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionDetails>
    </Accordion>
  );
}
