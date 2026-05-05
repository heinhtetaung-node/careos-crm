import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

import { useGetOrderItemsQuery } from 'data/slices/orderSlice';
import Loader from 'presentation/components/Loader';
import NotFound from 'presentation/components/NotFound';
import Customer from 'presentation/components/OrderDetailPage/Customer';
import Header from 'presentation/components/OrderDetailPage/Header';
import { formatMotoType } from 'presentation/components/OrderListingTable/helper';
import { format } from 'utils/datetime';

function NewOrderDetailPage() {
  const { orderId } = useParams();
  const { data, isSuccess, isFetching, isError } = useGetOrderItemsQuery(
    {
      orderId: orderId!,
    },
    {
      skip: !orderId,
    }
  );

  if (isFetching) {
    return <Loader />;
  }

  if (isError) {
    return <NotFound />;
  }

  return (
    <Box
      data-testid="new-order-detail-page"
      sx={{
        flexBasis: '100%',
      }}
    >
      <Helmet title="Order detail page" />
      {isSuccess ? (
        <>
          <Header>
            <Grid item xs={12}>
              <Typography>Topbar</Typography>
            </Grid>
          </Header>
          <Grid container spacing={2} data-testid="new-order-detail-content">
            <Grid item container xs={12} spacing={2}>
              <Grid item xs={3}>
                <p>Tabs</p>
              </Grid>
              <Grid item xs={4}>
                <Customer customerData={data?.customer} />
                {data?.items.map((item: any) => (
                  <div key={item.item.name}>
                    <p>{formatMotoType(item.item.motorItemType)}</p>
                    <p>
                      Premium:
                      {item.item.grossPremium}
                    </p>
                    <p>
                      Policy start date:
                      {format(
                        new Date(item.item.policyStartDate),
                        'dd/MM/yyyy'
                      )}
                    </p>
                  </div>
                ))}
              </Grid>
              <Grid item xs={5}>
                <p>Documents</p>
              </Grid>
            </Grid>
          </Grid>
        </>
      ) : null}
    </Box>
  );
}

export default NewOrderDetailPage;
