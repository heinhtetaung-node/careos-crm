import { Grid, AppBar, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

import HeaderAction from 'presentation/components/Header';

const useStyles = makeStyles({
  appbar: {
    boxShadow: `0px 7px 15px rgba(42, 49, 203, 0.1)`,
    marginBottom: '20px',
  },
  header: {
    height: '60px',
    borderBottom: '2px solid #E9EDF5',
    marginBottom: '20px',
    justifyContent: 'space-between',
  },
  topbar: {
    height: '66px',
    background: '#fff',
    padding: 'unset !important',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  logo: { width: '150px' },
});

function Header({
  hideIcon,
  children,
}: PropsWithChildren<{ hideIcon?: boolean }>) {
  const classes = useStyles();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      className={classes.appbar}
      id="app-bar-header"
    >
      <Toolbar>
        <Grid container spacing={5}>
          <Grid
            item
            container
            xs={12}
            alignItems="flex-end"
            className={classes.header}
          >
            {!hideIcon && (
              <Link to="/">
                <img
                  alt="Rabbit Finance"
                  src="/static/img/rabbit-care-logo.svg"
                  className={classes.logo}
                />
              </Link>
            )}
            <HeaderAction />
          </Grid>
          <Grid item container xs={12} className={classes.topbar}>
            {children}
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
