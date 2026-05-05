import { Grid, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import {
  useGetCustomerQuery,
  useGetCustomerLeadsQuery,
  useGetCustomerOrdersQuery,
  useGetCustomerPhoneNumberQuery,
  useGetCustomerEmailQuery,
} from 'data/slices/customerSlice';
import {
  CustomerContactInformation,
  TransformedOrder,
} from 'data/slices/customerSlice/types';
import Loader from 'presentation/components/Loader';
import NotFound from 'presentation/components/NotFound';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { mappingFieldValue } from 'presentation/pages/car-insurance/CustomerDetailsPage/helper';
import { FormType } from 'presentation/pages/car-insurance/CustomerDetailsPage/types';
import { maskPhoneNumber } from 'shared/helper/utilities';

import CustomerSection from './CustomerSections/customerSection';

import '../LeadDetailsPage/index.scss';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    height: '100%',
    borderTop: `5px solid ${theme.palette.grey[200]}`,
  },
  fluidContainer: {
    width: '80%',
    margin: '0 auto',
  },
  grid: {
    '& .MuiButton-outlinedPrimary': {
      border: `1px solid ${theme.palette.info.main}`,
    },
  },
  heading: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  th: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  item: {
    [theme.breakpoints.down('md')]: {
      paddingTop: 20,
    },
    [theme.breakpoints.up('md')]: {
      paddingLeft: 10,
    },
  },
  overflow: {
    maxHeight: 800,
    [theme.breakpoints.down('md')]: {
      maxHeight: 400,
    },
    overflowY: 'scroll',
    overflowX: 'hidden',
  },
  card: {
    minHeight: 290,
  },
  btnContainer: {
    [theme.breakpoints.down('lg')]: {
      marginTop: 10,
    },
  },
  accordion: {
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  textCenter: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
  },
}));

export function CustomerPage() {
  // States
  const [customerSchema, setCustomerSchema] = useState<FormType | null>(null);
  const [contactInfo, setContactInfo] =
    useState<CustomerContactInformation | null>(null);

  const classes = useStyles();
  const { id: customerId } = useParams<{ id: string }>();

  // RTK Queries
  const {
    data: customerData,
    isLoading: isGettingCustomer,
    isError: isErrorFetchingCustomer,
  } = useGetCustomerQuery(`customers/${customerId}`);

  const {
    data: customerPhones,
    isLoading: isGettingPhones,
    isError: isErrorFetchingPhones,
    refetch: refetchPhones,
  } = useGetCustomerPhoneNumberQuery(
    {
      customerName: `customers/${customerId}`,
    },
    { skip: !customerId }
  );

  const {
    data: customerEmails,
    isLoading: isGettingEmails,
    isError: isErrorFetchingEmails,
    refetch: refetchEmails,
  } = useGetCustomerEmailQuery(
    {
      customerId: `customers/${customerId}`,
    },
    { skip: !customerId }
  );

  const {
    data: customerLeads,
    isLoading: isGettingLeads,
    isError: isErrorFetchingLeads,
  } = useGetCustomerLeadsQuery(`customers/${customerId}`);

  const {
    data: customerOrders,
    isLoading: isGettingOrders,
    isError: isErrorFetchingOrders,
  } = useGetCustomerOrdersQuery(`customers/${customerId}`);

  const { data: user } = useGetAuthenticateQuery();
  const isSalesAgent = user?.role === UserRoleID.SalesAgent;

  useEffect(() => {
    if (!customerData?.name) {
      return;
    }
    const _customerData: Record<string, any> = {
      ...customerData,
    };

    setCustomerSchema(
      mappingFieldValue({
        customer: _customerData,
      })
    );
  }, [customerData, isGettingCustomer]);

  useEffect(() => {
    const contactDetails: any = {
      phones: [],
      emails: [],
    };

    if (customerPhones?.phones?.length) {
      contactDetails.phones = isSalesAgent
        ? customerPhones.phones?.map((phone) => ({
            ...phone,
            phone: maskPhoneNumber(phone.phone),
          }))
        : customerPhones.phones;

      contactDetails.phones = contactDetails.phones.map((phone: any) => ({
        ...phone,
        isPrimary: customerData?.primaryPhoneId === phone.name,
      }));
    }
    if (customerEmails?.all?.length) {
      contactDetails.emails = customerEmails.all;
    }

    setContactInfo(contactDetails);
  }, [customerPhones, customerEmails, isSalesAgent, customerData]);

  const isError =
    !customerSchema ||
    !customerId ||
    !customerLeads ||
    isErrorFetchingLeads ||
    isErrorFetchingCustomer ||
    isErrorFetchingPhones ||
    isErrorFetchingOrders ||
    isErrorFetchingEmails;

  if (
    isGettingLeads ||
    isGettingCustomer ||
    isGettingPhones ||
    isGettingOrders ||
    isGettingEmails
  ) {
    return <Loader />;
  }
  if (isError) {
    return <NotFound />;
  }

  return (
    <>
      <Helmet title="Customer Page" />
      <Grid className={clsx(classes.grid)} item xs={12} md={12}>
        <div className={clsx(classes.wrapper, 'lead-detail-page')}>
          <Grid
            container
            direction="row"
            data-testid="customer-detail-section"
            className={clsx(
              classes.grid,
              classes.fluidContainer,
              'lead-detail-page__boards'
            )}
          >
            <Grid
              className={classes.grid}
              item
              xs={12}
              container
              direction="row"
            >
              <CustomerSection
                styles={classes}
                leads={customerLeads?.leads}
                contacts={contactInfo}
                refetchContacts={() => {
                  refetchPhones();
                  refetchEmails();
                }}
                orders={customerOrders as TransformedOrder[]}
                dataSchema={customerSchema}
              />
            </Grid>
          </Grid>
        </div>
      </Grid>
    </>
  );
}

export default CustomerPage;
