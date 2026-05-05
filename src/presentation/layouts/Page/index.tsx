import { CssBaseline, Paper as MuiPaper, withWidth } from '@material-ui/core';
import { isWidthUp } from '@material-ui/core/withWidth';
import { spacing } from '@material-ui/system';
import React, { useEffect, useState, PropsWithChildren } from 'react';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled, { createGlobalStyle } from 'styled-components';
import clsx from 'clsx';

import { routes } from 'presentation/components/Sidebar';
import {
  getLayoutConfig,
  clearLayoutConfig,
} from 'presentation/redux/actions/theme/layoutActions';
import { IHeaderRoutes } from 'presentation/routes/route.interface';
import headerRoutes, {
  healthHeaderRoutes,
} from 'shared/constants/headerRoutes';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { PRODUCTS } from 'config/TypeFilter';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import './index.scss';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    height: 100%;
  }

  body {
    background: ${(props: any) => props.theme.body.background};
    transition: none;
  }

  .MuiCardHeader-action .MuiIconButton-root {
    padding: 4px;
    width: 28px;
    height: 28px;
  }
`;

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Paper = styled(MuiPaper)(spacing);

const MainContent = styled(Paper)`
  flex: 1;
  background: ${(props) => props.theme.body.background};
  padding: 10px 0;

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    flex: none;
  }

  box-shadow: inset 0 10px 10px #1e28601a;
  position: relative;
`;

const sidebarArgs = {
  routes,
  variant: 'temporary',
  width: 260,
  collapsedWidth: 84,
};
interface PageLayoutProps {
  routes: any;
  width: any;
  getLayoutConfig: (payload: IHeaderRoutes[]) => void;
}

function PageLayout({
  children,
  width,
  getLayoutConfig: handleGetLayoutConfig,
}: PropsWithChildren<PageLayoutProps>) {
  const [collapse, setCollapse] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { data: user } = useGetAuthenticateQuery();

  const toggleCollapse = () => {
    setCollapse(!collapse);
  };
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const isHealthProduct = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  useEffect(() => {
    if (isHealthProduct) {
      handleGetLayoutConfig(healthHeaderRoutes(user?.role || ''));
      return () => {};
    }
    handleGetLayoutConfig(headerRoutes);
    return () => {
      dispatch(clearLayoutConfig());
    };
  }, [dispatch, handleGetLayoutConfig]);

  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      <AppContent>
        <Header toggleCollapse={toggleCollapse} {...sidebarArgs} />
        <MainContent
          p={isWidthUp('lg', width) ? 10 : 5}
          className={clsx('lead-page-detail', {
            '!justify-start': isHealthProduct,
            '!justify-center': !isHealthProduct,
          })}
        >
          {children}
        </MainContent>
        <Footer />
      </AppContent>
    </Root>
  );
}

const mapStateToProps = (state: any) => ({
  props: state,
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      getLayoutConfig,
    },
    dispatch
  );
export default connect(
  mapStateToProps,
  mapDispatchToProps
)((withWidth() as any)(PageLayout));
