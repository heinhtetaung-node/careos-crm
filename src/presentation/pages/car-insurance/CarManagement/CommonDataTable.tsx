import { Card, CardContent, Grid } from '@material-ui/core';
import React from 'react';

import Controls from 'presentation/components/controls/Control';

import useStyles from './styles';

interface IProps {
  buttonText: string;
  TopComponent: React.ReactNode;
  TableComponent: React.ReactNode;
  handleModal: (modal: boolean) => void;
}

function CommonDataTable({
  buttonText,
  TopComponent,
  TableComponent,
  handleModal,
}: IProps) {
  const classes = useStyles();
  return (
    <Card className={classes.card}>
      <CardContent>
        <Grid container>
          <Grid item lg={8}>
            <Controls.Button
              text={buttonText}
              color="primary"
              className={classes.btn}
              onClick={() => handleModal(true)}
            />
          </Grid>
          <Grid container item justifyContent="flex-end" lg={4}>
            {TopComponent}
          </Grid>
        </Grid>
        <br />
        {TableComponent}
      </CardContent>
    </Card>
  );
}

export default CommonDataTable;
