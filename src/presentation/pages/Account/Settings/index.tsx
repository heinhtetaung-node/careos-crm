import { Box, Container, Paper } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import Helmet from 'react-helmet';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { KratosField, KratosFormConfig } from 'data/slices/authSlice';
import Loading from 'Loading';
import Form from 'presentation/components/Kratos/Form';
import { getString } from 'presentation/theme/localization';

import { RabbitResource } from '../../../../data/gateway/api/resource';
import AccountRepository from '../../../../data/repository/account';
import './index.scss';

type FormSettings = {
  state: string;
  username: string;
  password: KratosFormConfig;
};

const Wrapper = styled(Paper)`
  padding: ${(props) => props.theme.spacing(6)}px;
  ${(props) => props.theme.breakpoints.up('md')} {
    padding: ${(props) => props.theme.spacing(10)}px;
  }
`;

function Settings() {
  const [formSettings, setFormSettings] = useState<FormSettings | undefined>();
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [flow, setFlow] = useState<string | undefined>();

  const listInstruction = [
    getString('text.instruction1'),
    getString('text.instruction2'),
    getString('text.instruction3'),
    getString('text.instruction4'),
  ];

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const flowId = useQuery().get('flow');

  useEffect(() => {
    if (flowId === null) {
      window.location.replace(RabbitResource.Auth.getSettingsUrl());
      return;
    }

    setFlow(flowId);
  }, [flowId]);

  useEffect(() => {
    if (flow) {
      AccountRepository.getSettingsRequest(flow).subscribe(
        ({ response }: any) => {
          setFormSettings({
            state: response.state,
            username: response.identity.traits.email,
            password: response.methods.password.config,
          });
          // Check kratos password message
          if (response.methods.password.config.fields.length) {
            const passwordField: KratosField =
              response.methods.password.config.fields.find(
                (field: KratosField) => field.name === 'password'
              );
            if (passwordField?.messages?.length) {
              setIsValidPassword(false);
            } else {
              setIsValidPassword(true);
            }
          }
        },
        () => {
          window.location.replace(RabbitResource.Auth.getSettingsUrl());
        }
      );
    }
  }, [flow]);

  if (formSettings && formSettings.state === 'success') {
    window.location.replace('/');
  }

  return (
    <>
      {!flowId ? (
        <Loading />
      ) : (
        <Container>
          <Wrapper className="sign-in-form">
            <Helmet title="Account Settings" />
            {formSettings?.state === 'show_form' ? (
              <Form config={formSettings.password} isFetching={false} />
            ) : null}
            {!isValidPassword && (
              <Box mt={2} color="error.main">
                {getString('text.passwordError')}
              </Box>
            )}

            <div className="sign-in-instruction">
              {listInstruction.map((item, index) => (
                <p key={index.toString()}>{item}</p>
              ))}
            </div>
          </Wrapper>
        </Container>
      )}
    </>
  );
}

export default Settings;
