import { Paper } from '@material-ui/core';
import React, { memo, useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { RabbitResource } from 'data/gateway/api/resource';
import {
  useGetAuthenticateQuery,
  useGetLoginRequestQuery,
} from 'data/slices/authSlice';
import Loading from 'Loading';
import Form from 'presentation/components/Kratos/Form';
import './index.scss';

const loginUrl = RabbitResource.Auth.getLoginUrl();

const Wrapper = styled(Paper)`
  padding: ${(props) => props.theme.spacing(6)}px;
  ${(props) => props.theme.breakpoints.up('md')} {
    padding: ${(props) => props.theme.spacing(10)}px;
  }
`;

function SignIn() {
  const [requestToken, setRequestToken] = useState<string>('');
  const { search } = useLocation();
  const { isFetching } = useGetAuthenticateQuery();
  const { data: loginData, isError: isGetLoginError } = useGetLoginRequestQuery(
    requestToken,
    {
      skip: !requestToken,
    }
  );

  useEffect(() => {
    const request = search.split('=')[1];

    if (!request) {
      window.location.replace(loginUrl);
      return;
    }
    setRequestToken(request);
  }, [search]);

  if (isGetLoginError) {
    window.location.replace(loginUrl);
  }

  if (!requestToken) {
    return <Loading />;
  }

  return (
    <Wrapper className="sign-in-page">
      <Helmet title="Sign In" />
      {loginData && (
        <Form
          config={loginData?.methods.password.config}
          isFetching={isFetching}
        />
      )}
    </Wrapper>
  );
}

export default memo(SignIn);
