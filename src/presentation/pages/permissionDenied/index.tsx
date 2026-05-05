import {
  Grid,
  Button as MuiButton,
  Typography,
  CardMedia,
} from '@material-ui/core';
import DoubleArrowRoundedIcon from '@material-ui/icons/DoubleArrowRounded';
import { spacing } from '@material-ui/system';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getString } from 'presentation/theme/localization';
import NotAllowedImage from 'shared/permission-denied.png';
import './index.scss';

const Button: FC<any> = styled(MuiButton)(spacing);

function PermissionDenied() {
  return (
    <Grid className="permission-denied-page">
      <Grid className="permission-denied-page__content">
        <CardMedia
          image={NotAllowedImage}
          className="permission-denied-page__content__image"
        />
        <Typography variant="h2" gutterBottom>
          {getString('text.permissionDenied')}
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          color="primary"
          mt={2}
          className="permission-denied-page__content__btn"
        >
          <span className="btn_text">{getString('text.goToHomePage')}</span>
          <DoubleArrowRoundedIcon />
        </Button>
      </Grid>
    </Grid>
  );
}

export default PermissionDenied;
