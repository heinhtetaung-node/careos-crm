import {
  Chip,
  Collapse,
  Hidden as HiddenComponent,
  HiddenProps,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
} from '@material-ui/icons';
import clsx from 'clsx';
import { useFlags } from 'flagsmith/react';
import { rgba } from 'polished';
import React, {
  ComponentProps,
  ComponentType,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {
  Link as LinkRabbitIcon,
  NavLink as RouterNavLink,
  useLocation,
} from 'react-router-dom';
import styled, { StyledComponent } from 'styled-components';

import FeatureFlags from 'config/flagsmithConfig';
import { PRODUCTS } from 'config/TypeFilter';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import withCircle from 'presentation/HOCs/WithCircle';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { useGetUserSelector } from 'presentation/redux/selectors/user';
import {
  healthSidebar as healthSidebarRoutes,
  sidebar as sidebarRoutes,
  travelSidebar as travelSidebarRoutes,
} from 'presentation/routes';
import {
  CRM_ROUTES,
  getBrandImportUrl,
  getModelImportUrl,
  getRedbookImportUrl,
} from 'presentation/routes/Urls';

import getSidebarRoutes from './sideBar.helper';

import { getString } from '../../theme/localization';
import {
  AdminUser,
  DocumentSearchIcon,
  LeadAll,
  PackageImportIcon,
} from '../icons';
import { RolesWithoutProduct, UserRoleID } from '../ProtectedRouteHelper';

const Hidden = HiddenComponent as ComponentType<PropsWithChildren<HiddenProps>>;

interface ILink {
  component: any;
  exact: boolean;
  to: string;
  activeClassName: string;
}

const NavLink = React.forwardRef((props: any, ref: any) => (
  <RouterNavLink innerRef={ref} {...props} />
));

const Brand = styled.div`
  font-size: ${(props) => props.theme.typography.h5.fontSize};
  font-weight: ${(props) => props.theme.typography.fontWeightMedium};
  color: ${(props) => props.theme.sidebar.header.color};
  background-color: ${(props) => props.theme.sidebar.header.background};
  font-family: ${(props) => props.theme.typography.fontFamily};
  min-height: 56px;
  padding-left: ${(props) => props.theme.spacing(6)}px;
  padding-right: ${(props) => props.theme.spacing(6)}px;
  padding-top: ${(props) => props.theme.spacing(4)}px;

  ${(props) => props.theme.breakpoints.up('sm')} {
    min-height: 64px;
  }
`;

const Items: StyledComponent<any, any> = styled.div`
  ${(props) => props.theme.breakpoints.up('lg')} {
    padding-top: ${(props) => props.theme.spacing(2.5)}px;
  }
  padding-bottom: ${(props) => props.theme.spacing(2.5)}px;
  overflow: hidden;
`;

const Category: StyledComponent<any, any> = styled(ListItem)`
  padding: 15px 30px;
  font-weight: ${(props) => props.theme.typography.fontWeightRegular};
  white-space: nowrap;

  &.${(props: any) => props.activeclassname} {
    background-color: ${(props) => props.theme.sidebar.header.background};

    &:hover {
      background-color: ${(props) =>
        props.theme.sidebar.header.background} !important;
    }

    span {
      color: ${(props) => props.theme.palette.primary.main};
    }

    .svg-wrapper {
      background: ${(props) => props.theme.palette.primary.main};
    }

    svg {
      color: ${(props) => props.theme.palette.primary.contrastText};

      & path {
        fill: ${(props) => props.theme.palette.primary.contrastText};
      }
    }
  }
`;

const RabbitIcon = styled.img`
  vertical-align: middle;
  margin: 0 auto;
  height: auto;
`;

const Icon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: ${(props) => props.theme.spacing(4)}px;

  svg {
    color: ${(props) => props.theme.palette.primary.main};
    vertical-align: middle;
  }
`;

const CategoryText: StyledComponent<any, any> = styled(ListItemText)`
  margin: 0;
  span {
    color: ${(props) => props.theme.sidebar.color};
    font-size: ${(props) => props.theme.typography.sidebar.fontSize}px;
    font-weight: ${(props) => props.theme.sidebar.category.fontWeight};
  }

  &.minimize {
    display: none;
  }
`;

const CategoryIconLess: StyledComponent<any, any> = styled(ExpandLess)`
  color: ${(props) => props.theme.sidebar.color};
`;

const CategoryIconMore: StyledComponent<any, any> = styled(ExpandMore)`
  color: ${(props) => props.theme.sidebar.color};
`;

const Link: StyledComponent<any, any> = styled(ListItem)<ILink>`
  width: 77.5%;
  float: right;
  padding-left: ${(props) => props.theme.spacing(2.75)}px;
  padding-top: ${(props) => props.theme.spacing(4)}px;
  padding-bottom: ${(props) => props.theme.spacing(4)}px;

  span {
    font-weight: ${(props) => props.theme.typography.sidebar.fontWeight};
  }

  &:hover span {
    color: ${(props) => rgba(props.theme.sidebar.color, 0.9)};
  }

  &.${(props: any) => props.activeClassName} {
    background-color: ${(props) => props.theme.palette.common.white};
    border-top-left-radius: ${(props) => props.theme.spacing(2)}px;
    border-bottom-left-radius: ${(props) => props.theme.spacing(2)}px;

    span {
      color: ${(props) => props.theme.palette.primary.main};
    }
  }
`;

const LinkText: StyledComponent<any, any> = styled(ListItemText)`
  color: ${(props) => props.theme.sidebar.color};
  span {
    font-size: ${(props) => props.theme.typography.body1.fontSize}px;
  }
  margin-top: 0;
  margin-bottom: 0;
`;

const LinkBadge: StyledComponent<any, any> = styled(Chip)`
  font-size: 11px;
  font-weight: ${(props) => props.theme.typography.fontWeightBold};
  height: 20px;
  position: absolute;
  right: 12px;
  top: 8px;
  background: ${(props) => props.theme.sidebar.badge.background};

  span.MuiChip-label,
  span.MuiChip-label:hover {
    cursor: pointer;
    color: ${(props) => props.theme.sidebar.badge.color};
    padding-left: ${(props) => props.theme.spacing(2)}px;
    padding-right: ${(props) => props.theme.spacing(2)}px;
  }
`;

const CategoryBadge: StyledComponent<any, any> = styled(LinkBadge)`
  top: 12px;
`;

const SidebarSection: StyledComponent<any, any> = styled(Typography)`
  color: ${(props) => props.theme.sidebar.color};
  padding: ${(props) => props.theme.spacing(4)}px
    ${(props) => props.theme.spacing(6)}px
    ${(props) => props.theme.spacing(1)}px;
  opacity: 0.9;
  display: block;
`;

const Wrapper: StyledComponent<any, any> = styled.div`
  border-right: 0;
  height: 100vh;
  width: ${(props: any) =>
    `${props.collapse ? props.collapsedWidth : props.width}px`};
  overflow-y: auto;
  align-self: start;
  position: sticky;
  -webkit-transition: width 0.1s ease-in-out;
  -moz-transition: width 0.1s ease-in-out;
  -o-transition: width 0.1s ease-in-out;
  transition: width 0.1s ease-in-out;
  top: 0;
  z-index: 2;

  &::-webkit-scrollbar {
    width: 6px;
    background: #f2f3fa;
  }
  &::-webkit-scrollbar-track {
    background: #f2f3fa;
  }
  &::-webkit-scrollbar-thumb {
    background: #a5aac0;
    border-radius: 3px;
  }

  > div {
    border-right: 0;
  }
`;

const Scrollbar = styled(PerfectScrollbar)`
  background-color: ${(props) => props.theme.sidebar.background};
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  height: fit-content;
  min-height: 100vh;
`;

type SidebarLinkContainerProps = {
  readonly isActive: boolean;
};

const SidebarLinkContainer = styled.div<SidebarLinkContainerProps>`
  position: relative;
  &::before {
    content: '';
    border: 1px solid
      ${(props) =>
        props.isActive ? props.theme.palette.common.blue : 'transparent'};
    position: absolute;
    top: -15px;
    left: 40px;
    height: 100%;
    z-index: 1;
  }
`;

const CollapseButton = styled.button`
  position: fixed;
  border: 1px solid ${(props) => props.theme.palette.common.blue};
  box-shadow: ${(props) => props.theme.shadows[25]};
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ddd;
  z-index: 1200;
  top: 75px;
  border-radius: 50%;
  left: 236px;
  cursor: pointer;
  transition: all 0.1s ease 0s;
  padding: 0;

  &.minimize {
    left: 70px;
  }

  &:focus {
    outline: 0;
  }
`;

const cypressClass = (name: string) => {
  const nameFormatted = name ? name.toLowerCase().replace(/ /g, '') : '';

  return `list-item_${nameFormatted}`;
};

function SidebarCategory({
  name,
  icon,
  collapse,
  isOpen,
  isCollapsable,
  badge,
  activeClassName,
  ...rest
}: any) {
  return (
    <Category activeclassname={activeClassName} {...rest}>
      <Icon>{icon}</Icon>
      <CategoryText
        className={clsx('category-text', collapse && 'minimize')}
        data-cy={cypressClass(name)}
      >
        {name}
      </CategoryText>
      {isCollapsable &&
        !collapse &&
        (isOpen ? (
          <CategoryIconMore className="icon-collapsible" />
        ) : (
          <CategoryIconLess className="icon-collapsible" />
        ))}
      {badge ? <CategoryBadge label={badge} /> : ''}
    </Category>
  );
}

function SidebarLink({ name, to, badge }: any) {
  return (
    <Link
      button
      dense
      component={NavLink}
      exact
      to={to}
      activeClassName="active"
    >
      <LinkText>
        {name.split('\n').map((str: string, key: number) => (
          <>
            {key > 0 && <br />}
            {str}
          </>
        ))}
      </LinkText>
      {badge ? <LinkBadge label={badge} /> : ''}
    </Link>
  );
}

const EmptySidebarCategory = styled(SidebarCategory)`
  &&& {
    pointer-events: none;
  }
`;

export const routes = (
  isCustomerMergePageEnabled: boolean,
  cancellationPageEnabled: boolean,
  carePayPageEnabled: boolean,
  isTravelInsurancePageEnabled: boolean,
  isAccountingPages: boolean,
  isAllAccountingPage: boolean,
  isPerformanceStatisticPageEnabled: boolean = false
) =>
  [
    {
      id: getString('menu.lead.root'),
      path: '/leads/assignment',
      icon: withCircle(LeadAll),
      children: [
        {
          name: getString('menu.lead.assignment'),
          path: '/leads/assignment',
          id: 'Assignment',
        },
        {
          name: getString('menu.lead.rejections'),
          path: '/leads/rejection',
          id: 'Rejections',
        },
        {
          name: getString('menu.lead.all'),
          path: '/leads/all',
          id: 'All',
        },
        {
          name: getString('menu.lead.import'),
          path: '/leads/import',
          id: 'Import',
        },
        {
          name: getString('menu.lead.sources'),
          path: '/leads-settings/sources',
          id: 'Sources',
        },
      ],
    },
    {
      id: getString('menu.order.root'),
      path: '/orders/all',
      icon: withCircle(LeadAll),
      children: [
        {
          name: getString('menu.order.all'),
          path: '/orders/all',
          id: 'All',
        },
        {
          name: getString('menu.order.documents'),
          path: '/orders/documents',
          id: 'Documents',
        },
        {
          name: getString('menu.order.QC'),
          path: '/orders/qc',
          id: 'QC',
        },
        {
          name: getString('menu.order.submission'),
          path: '/orders/submission',
          id: 'Submission',
        },
        {
          name: getString('menu.order.approval'),
          path: '/orders/approval',
          id: 'Approval',
        },
        {
          name: getString('menu.order.printingShipping'),
          path: '/orders/shipment',
          id: 'PrintingAndShipping',
        },
        {
          name: getString('text.exportShipmentMenu'),
          path: '/orders/export-shipment',
          id: 'ExportShipment',
        },
        {
          name: getString('order.massAssign.massStatusChange'),
          path: '/orders/mass-status-update',
          id: 'OrderMassStatusUpdate',
        },
      ],
    },
    {
      id: getString('menu.userManagement.root'),
      path: '/admin/teams',
      icon: withCircle(AdminUser),
      children: [
        {
          name: getString('menu.userManagement.users'),
          path: '/admin/users',
          id: 'Users',
        },
        {
          name: getString('menu.userManagement.teams'),
          path: '/admin/teams',
          id: 'Teams',
        },
      ],
    },
    {
      id: getString('menu.autoAssignment.root'),
      path: '/auto-assign/configs',
      icon: withCircle(AdminUser),
      children: [
        {
          name: getString('menu.autoAssignment.leadsConfig'),
          path: '/auto-assign/configs',
          id: 'AutoAssign',
        },
        {
          name: getString('menu.autoAssignment.leadsImport'),
          path: '/auto-assign/import',
          id: 'Import',
        },
        {
          name: getString('menu.autoAssignment.leadsMassAssign'),
          path: '/auto-assign/mass-lead-import',
          id: 'MassLeadImport',
        },
        {
          name: getString('menu.autoAssignment.orderConfig'),
          path: '/auto-assign/order-configs',
          id: 'ConfigsPage',
        },
      ],
    },
    {
      id: getString('menu.package.root'),
      path: '/package/import',
      icon: withCircle(PackageImportIcon),
      children: [
        {
          name: getString('menu.package.import'),
          path: '/package/import',
          id: 'Import',
        },
      ],
    },
    {
      id: getString('menu.curatedCar.root'),
      path: '/curated-car/import',
      icon: withCircle(PackageImportIcon),
      children: [
        {
          name: getString('menu.curatedCar.brandImport'),
          path: getBrandImportUrl(),
          id: 'Import Brand',
        },
        {
          name: getString('menu.curatedCar.modelImport'),
          path: getModelImportUrl(),
          id: 'Import Model',
        },
        {
          name: getString('menu.curatedCar.importSubmodel'),
          path: '/curated-car/import',
          id: 'Import Submodel',
        },
        {
          name: getString('menu.curatedCar.redbookImport'),
          path: getRedbookImportUrl(),
          id: 'Import Redbook',
        },
      ],
    },
    {
      id: getString('menu.carDiscount.root'),
      path: '/car-discount/import',
      icon: withCircle(PackageImportIcon),
    },
    {
      id: getString('menu.customerProfile.root'),
      path: '/customer-profile',
      icon: withCircle(AdminUser),
      children: [
        {
          name: getString('autoAssignOption.all'),
          path: '/customer-profile/all',
          id: 'All',
        },
        {
          name: getString('menu.customerProfile.import'),
          path: '/customer-profile/import',
          id: 'Import',
        },
        isCustomerMergePageEnabled && {
          name: getString('menu.customerMerge.all'),
          path: '/customers-merge/all',
          id: 'CustomerMergeAll',
        },
      ],
    },
    {
      id: getString('menu.discounts.root'),
      path: '/discounts',
      icon: withCircle(AdminUser),
      children: [
        {
          name: getString('menu.discounts.approval'),
          path: '/discounts/approval',
          id: 'Approve',
        },
        {
          name: getString('menu.discounts.importDiscount'),
          path: '/discounts/import',
          id: 'Import',
        },
        {
          name: getString('menu.discounts.voucher'),
          path: CRM_ROUTES.DISCOUNT_VOUCHER,
          id: 'Voucher',
        },
        {
          name: getString('text.campaign'),
          path: '/discounts/campaign',
          id: 'Campaign',
        },
      ],
    },
    carePayPageEnabled && {
      id: getString('menu.carePay.root'),
      path: '/care-pay',
      icon: withCircle(AdminUser),
      children: [
        {
          name: getString('menu.carePay.contractManagement'),
          path: '/care-pay/contracts',
          id: 'ContractListing',
        },
      ],
    },
    cancellationPageEnabled && {
      id: getString('menu.cancellation.root'),
      path: '/cancellation',
      icon: withCircle(DocumentSearchIcon),
      children: [
        {
          name: getString('menu.cancellation.all'),
          path: '/cancellation/all',
          id: 'cancellationAll',
        },
      ],
    },
    isTravelInsurancePageEnabled && {
      id: getString('menu.order.root'),
      path: '/travel/orders',
      icon: withCircle(PackageImportIcon),
      children: [
        {
          name: getString('menu.order.root'),
          path: '/travel/orders',
          id: 'Orders',
          children: [
            {
              name: getString('menu.order.all'),
              path: '/travel/orders/all',
              id: 'All',
            },
          ],
        },
      ],
    },
    isAccountingPages && {
      id: getString('menu.accounting.root'),
      path: '/accounting',
      icon: withCircle(DocumentSearchIcon),
      children: [
        {
          name: getString('menu.accounting.root'),
          path: '/accounting',
          id: 'Accounting',
          children: [
            isAllAccountingPage && {
              name: getString('menu.accounting.all'),
              path: '/accounting/all',
              id: 'AllAccounting',
            },
            {
              name: getString('menu.accounting.mass-status-change'),
              path: '/accounting/mass-status',
              id: 'Mass-status-change',
            },
          ],
        },
      ],
    },
    isPerformanceStatisticPageEnabled && {
      id: getString('menu.performanceStatistic.root'),
      path: '/performance-statistic',
      icon: withCircle(AdminUser),
      children: [
        {
          name: getString('menu.performanceStatistic.root'),
          path: '/performance-statistic',
          id: 'PerformanceStatistic',
        },
      ],
    },
  ].filter(Boolean);

function Sidebar({
  routes: Routes,
  collapse,
  toggleCollapse,
  ...rest
}: ComponentProps<any>) {
  // Feature flags
  const flags = useFlags([
    FeatureFlags.HT_36_ENABLE_TRAVEL_ORDER_PAGE_20230521_TEMP,
    FeatureFlags.BROK_35_ENABLE_ACCOUNTING_PAGES_20240715_TEMP,
    FeatureFlags.BROK_177_ENABLE_ALL_ACCOUNTING_PAGE_20240815_TEMP,
    FeatureFlags.BROK_4135_ENABLE_PERFORMANCE_STATISTIC_PAGE_20251126_TEMP,
    FeatureFlags.BROK_4823_ENABLE_IMPORT_REDBOOK_20260311_TEMP,
  ]);

  const isCustomerMergePageEnabled = false;
  const isTravelInsurancePageEnabled =
    flags[FeatureFlags.HT_36_ENABLE_TRAVEL_ORDER_PAGE_20230521_TEMP]?.enabled;
  const isAccountingPages =
    flags[FeatureFlags.BROK_35_ENABLE_ACCOUNTING_PAGES_20240715_TEMP]?.enabled;
  const isAllAccountingPages =
    flags[FeatureFlags.BROK_177_ENABLE_ALL_ACCOUNTING_PAGE_20240815_TEMP]
      ?.enabled;
  const isPerformanceStatisticPageEnabled =
    flags[
      FeatureFlags.BROK_4135_ENABLE_PERFORMANCE_STATISTIC_PAGE_20251126_TEMP
    ]?.enabled;
  const isImportRedbookEnabled =
    flags[FeatureFlags.BROK_4823_ENABLE_IMPORT_REDBOOK_20260311_TEMP]
      ?.enabled ?? false;

  const location = useLocation();
  const [routesWithRole, setRoutesWithRole] = useState(Routes);
  const { data: user } = useGetAuthenticateQuery();
  const { product } = useGetUserSelector();
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const selectedProduct = globalProduct || product;

  useEffect(() => {
    let selectedRoutes: any[] = [];

    if (selectedProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE) {
      selectedRoutes = healthSidebarRoutes;
    }
    if (selectedProduct === PRODUCTS.TRAVEL_PRODUCT_INSURANCE) {
      selectedRoutes = travelSidebarRoutes;
    }
    if (selectedProduct === PRODUCTS.CAR_PRODUCT_INSURANCE) {
      selectedRoutes = sidebarRoutes;
    }
    const isAllowedToAccessPages =
      user?.product === selectedProduct ||
      RolesWithoutProduct.includes(user?.role as UserRoleID);

    if (user?.role) {
      setRoutesWithRole(
        getSidebarRoutes({
          role: user?.role,
          sidebar: isAllowedToAccessPages ? selectedRoutes : [],
          flags: {
            CustomerMergeAll: isCustomerMergePageEnabled,
            CarePayListing: true,
            Cancellation: true,
            carRedbookImport: isImportRedbookEnabled,
            isTravelInsurancePageEnabled,
            Accounting: isAccountingPages,
            AllAccounting: isAllAccountingPages,
            PerformanceStatistic: isPerformanceStatisticPageEnabled,
          },
        })
      );
    }
  }, [
    user,
    user?.role,
    isCustomerMergePageEnabled,
    isTravelInsurancePageEnabled,
    isAccountingPages,
    isAllAccountingPages,
    isPerformanceStatisticPageEnabled,
    isImportRedbookEnabled,
    product,
    globalProduct,
  ]);

  const initOpenRoutes = () => {
    /* Open collapse element that matches current url */
    const pathName = location.pathname;
    const pathNameArr = pathName.split('/');
    pathNameArr.shift();
    const [category] = pathNameArr;

    let _routes = {};

    Routes()?.forEach((route: any, index: number) => {
      const isActive = category === route.path.split('/').join('');
      const isOpen = route.open;
      const isHome = !!(route.containsHome && pathName === '/');

      _routes = { ..._routes, [index]: isActive || isOpen || isHome };
    });

    return _routes;
  };

  const [openRoutes, setOpenRoutes]: any = useState(() => initOpenRoutes());

  const toggle = (index: any) => {
    // Collapse all elements
    Object.keys(openRoutes).forEach(
      (item) =>
        openRoutes[index] ||
        setOpenRoutes((openedRoutes: any) => ({
          ...openedRoutes,
          [item]: false,
        }))
    );

    // Toggle selected element
    setOpenRoutes((openedRoutes: any) => ({
      ...openedRoutes,
      [index]: !openedRoutes[index],
    }));
  };

  if (selectedProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE) return null;

  return (
    <Wrapper
      className="general-side-bar"
      variant="permanent"
      collapse={collapse}
      {...rest}
      data-testid="general-side-bar-section"
    >
      <Scrollbar>
        <List>
          <Items>
            <Hidden smDown>
              <React.Fragment key="empty">
                <EmptySidebarCategory isCollapsable={false} />
                <EmptySidebarCategory isCollapsable={false} />
                <CollapseButton
                  type="button"
                  className={clsx('collapse-button', collapse && 'minimize')}
                  onClick={toggleCollapse}
                >
                  {collapse ? (
                    <ChevronRight className="text-[28px]" />
                  ) : (
                    <ChevronLeft className="text-[28px]" />
                  )}
                </CollapseButton>
              </React.Fragment>
            </Hidden>
            <Hidden mdUp>
              <Brand>
                <LinkRabbitIcon to="/">
                  <RabbitIcon
                    alt="Rabbit Finance"
                    src="/static/img/rabbit-care-logo.svg"
                    className="w-[150px]"
                  />
                </LinkRabbitIcon>
              </Brand>
            </Hidden>
            {routesWithRole?.map((navItem: any, index: number) => (
              <React.Fragment key={navItem.id}>
                {navItem.header ? (
                  <SidebarSection>{navItem.header}</SidebarSection>
                ) : null}
                {navItem?.standAlone && !navItem?.children ? (
                  <SidebarCategory
                    isCollapsable={false}
                    name={getString(navItem.name)}
                    to={navItem.path}
                    activeClassName="active"
                    component={NavLink}
                    icon={navItem.icon}
                    collapse={collapse}
                    exact
                    badge={navItem.badge}
                  />
                ) : (
                  <React.Fragment key={navItem.id}>
                    <SidebarCategory
                      isOpen={!openRoutes[index]}
                      isCollapsable
                      name={getString(navItem.name)}
                      icon={navItem.icon}
                      collapse={collapse}
                      button
                      onClick={() => toggle(index)}
                      className="h-45"
                    />
                    {!collapse && (
                      <SidebarLinkContainer isActive={openRoutes[index]}>
                        <Collapse
                          in={openRoutes[index]}
                          timeout="auto"
                          unmountOnExit
                        >
                          {navItem?.children?.map(
                            (route: any) =>
                              route && (
                                <SidebarLink
                                  key={route.name}
                                  name={getString(route.name)}
                                  to={route.path}
                                  icon={route.icon}
                                  badge={route.badge}
                                />
                              )
                          )}
                        </Collapse>
                      </SidebarLinkContainer>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            ))}
          </Items>
        </List>
      </Scrollbar>
    </Wrapper>
  );
}

export default Sidebar;
