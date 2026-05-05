import { Button as MuiButton, Typography } from '@material-ui/core';
import { spacing } from '@material-ui/system';
import React, { FC } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { getString } from 'presentation/theme/localization';

import { NotFoundIcon } from './icons';

const Button: FC<any> = styled(MuiButton)(spacing);

const Wrapper = styled.div`
  border-radius: ${(props) => props.theme.border.radius};
  margin: 0 ${(props) => props.theme.spacing(3)}px;
  background: white;
  flex-grow: 1;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;

  h2 {
    width: 20%;
  }
  span {
    text-transform: uppercase;
  }
`;

interface NotFoundProps {
  text?: string;
  redirectTo?: string;
  btnText?: string;
}

function NotFound({ text, redirectTo, btnText }: NotFoundProps) {
  return (
    <Wrapper data-testid="not-found-wrapper">
      <Helmet title="404 Error" />
      <NotFoundIcon />
      <Typography component="h2" variant="h3" align="center" gutterBottom>
        {text ?? getString('errorPage.notFoundText')}
      </Typography>
      <Button
        component={Link}
        to={redirectTo ?? '/'}
        variant="contained"
        color="primary"
        mt={2}
        className="upper-case"
      >
        {btnText ?? getString('errorPage.backToHomePage')}
      </Button>
    </Wrapper>
  );
}

export default NotFound;
