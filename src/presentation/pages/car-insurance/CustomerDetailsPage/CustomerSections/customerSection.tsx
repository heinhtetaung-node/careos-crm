import { Grid, Paper } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

import { useStyles } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection';
import RenderColumn from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/RenderColumn';
import { getString } from 'presentation/theme/localization';

import ContactInformationSection from './contactInformationSection';
import LeadSection from './leadSection';
import OrderSection from './orderSection';

import { filterMaxYearData, CUSTOMER_SECTIONS } from '../helper';
import { ICustomerSectionProps, IRenderSectionProps } from '../types';
import 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/index.scss';

function RenderSection({
  type,
  styles,
  leads,
  orders,
  dataSchema,
}: IRenderSectionProps) {
  if (type === 'leads') {
    return <LeadSection leads={leads} classes={styles} />;
  }
  if (type === 'orders') {
    return <OrderSection orders={orders} classes={styles} />;
  }
  return (
    <RenderColumn
      item={dataSchema.customer}
      onSaveCustomerInputInfo={() => {
        console.log('handle Change');
      }}
    />
  );
}
export default function CustomerSection({
  leads,
  orders,
  styles,
  dataSchema,
  refetchContacts,
  contacts = null,
}: ICustomerSectionProps) {
  const classes = useStyles();
  return (
    <>
      {CUSTOMER_SECTIONS.map((type) => {
        const isCustomer = type === 'customer';

        return (
          <Grid
            key={type}
            item
            xs={12}
            md={4}
            lg={4}
            className={clsx(styles.grid, styles.item)}
          >
            <Paper className="customer-section-container">
              <div
                data-testid="customer-section-comp"
                className="customer-section"
              >
                <div className={classes.Item}>
                  <h3 className={classes.Title}>{getString(`text.${type}`)}</h3>
                  <RenderSection
                    type={type}
                    styles={styles}
                    leads={filterMaxYearData(leads)}
                    orders={orders}
                    contacts={contacts}
                    dataSchema={dataSchema}
                  />
                  <br />
                  {isCustomer && (
                    <h3 data-testid="contact-section" className={classes.Title}>
                      {getString(`text.contactInformation`)}
                    </h3>
                  )}
                  {isCustomer && contacts && (
                    <ContactInformationSection
                      contacts={contacts}
                      refetchContacts={refetchContacts}
                    />
                  )}
                </div>
              </div>
            </Paper>
          </Grid>
        );
      })}
    </>
  );
}
