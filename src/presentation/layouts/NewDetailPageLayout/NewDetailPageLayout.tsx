import { CssBaseline, Grid } from '@material-ui/core';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import Footer from 'presentation/components/Footer';

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    height: 100%;
  }

  body {
    background: ${(props: any) => props.theme.palette.common.white};
    transition: none;
  }
`;

function NewDetailPageLayout({ children }: { children?: React.ReactNode }) {
  return (
    <Grid container data-testid="detail-page-container">
      <CssBaseline />
      <GlobalStyle />
      <div className="flex-1 relative">
        {children}
        <Footer />
      </div>
    </Grid>
  );
}

export default NewDetailPageLayout;
