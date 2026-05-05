import { ClickAwayListener, NotificationTypes } from '@alphafounders/ui';
import {
  Grid,
  Hidden as HiddenComponent,
  Menu,
  MenuItem,
  AppBar as MuiAppBar,
  IconButton as MuiIconButton,
  Toolbar,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import {
  Menu as MenuIcon,
  WallpaperOutlined as MenuRoute,
} from '@material-ui/icons';
import { useFlags } from 'flagsmith/react';
import i18n from 'i18next';
import clsx from 'clsx';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { User } from 'react-feather';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { withTheme } from 'styled-components';
import { Tooltip } from '@material-ui/core';
import { SettingsIcon, ViewDocumentIcon } from '@alphafounders/icons';
import { KNOWLEDGEBASE_URL } from 'config/constant';

import FeatureFlags from 'config/flagsmithConfig';
import LeadRepository from 'data/repository/lead';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { getNotificationTitle } from 'data/slices/notificationSlice/helper';
import CommonModal from 'presentation/components/modal/CommonModal';
import ProductTypeSelectorGlobal from 'presentation/components/ProductTypeSelectorGlobal';
import useNotification from 'presentation/hooks/useNotification/index';
import LeadPageAddLead, {
  IFormAddLead,
} from 'presentation/modules/leadPageAddLead';
import { changeLanguage } from 'presentation/redux/actions/languages';
import { destroyModalSchedule } from 'presentation/redux/actions/leadDetail/scheduleModal';
import { changeProductSelectorTypes } from 'presentation/redux/actions/typeSelector/globalProduct';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { initialProduct } from 'presentation/redux/reducers/typeSelector/globalProduct';
import { IHeaderRoutes } from 'presentation/routes/route.interface';
import {
  getLanguage,
  getString,
  LANGUAGES,
} from 'presentation/theme/localization';
import { ADD_LEAD_SCHEMA_ID } from 'shared/constants';
import headerRoutes, {
  emptyHeaderRoutes,
  myOrderRoute,
  comissionReportRoute,
  healthHeaderRoutes,
} from 'shared/constants/headerRoutes';
import { formatE164 } from 'shared/helper/utilities';
import useSnackbar from 'utils/snackbar';
import { PRODUCTS } from 'config/TypeFilter';

import NewLeadScheduleModal from './modal/LeadScheduleModal/NewLeadScheduleModal';
import LogoutModal from './modal/LogoutModal';

import { resetIsLogoutSuccess } from '../redux/actions/presence';

import './header.scss';
import { RolesWithoutProduct, UserRoleID } from './ProtectedRouteHelper';

const Hidden: any = HiddenComponent; // FIXME

interface IProps {
  color: string;
}

export interface ICreateLead {
  product: string;
  schema: string;
  type: string;
  data: {
    customerFirstName?: string;
    customerLastName: string;
    customerPhoneNumber: {
      phone: string;
      status: string;
    }[];
    primaryPhoneIndex: number;
    customerEmail: string[];
    customerPolicyAddress: string[];
    customerShippingAddress: string[];
    customerBillingAddress: string[];
    numberOfFixedDriver: 0 | 1 | 2;
    locale: string;
  };
  source: string;
  reference: string;
  assignedTo: string;
}

const AppBar: any = styled(MuiAppBar)<IProps>`
  background: ${(props) => props.theme.header.background};
  color: ${(props) => props.theme.header.color};
  box-shadow: ${(props) => props.theme.shadows[1]};
`;

const IconButton = styled(MuiIconButton)`
  svg {
    width: 22px;
    height: 22px;
  }
`;

const RabbitIcon = styled.img`
  vertical-align: middle;
  margin: 0 auto;
  height: auto;
`;

const Flag = styled.img`
  border-radius: 50%;
  width: 22px;
  height: 22px;
  object-fit: cover;
  border: 1px solid gray;
`;

const MenuItemStyle = withTheme(styled(MenuItem)`
  &&& {
    &.active {
      background: ${(props) => props.theme.palette.grey[300]};
    }
  }
`);

const ADD_LEAD_TYPE = 'addLead';
const APPOINTMENT_TYPE = 'appointment';
const ADMIN_ROLE = 'roles/admin';
const SUPER_ADMIN_ROLE = 'roles/super-admin';
const SALE_AGENT_ROLE = 'roles/sales';

const flags = {
  en: '/static/img/flags/gb.png',
  thai: '/static/img/flags/th.png',
};

function LanguageMenu() {
  const [anchorMenu, setAnchorMenu] = useState(null);
  const dispatch = useDispatch();

  const toggleMenu = (event: any) => {
    setAnchorMenu(event.currentTarget);
  };

  const selectedLang = getLanguage();
  const [flag, setFlag] = useState(
    selectedLang === LANGUAGES.ENGLISH ? flags.en : flags.thai
  );

  const closeMenu = async () => {
    setAnchorMenu(null);
  };

  const onChangeLanguage = async (language: string) => {
    const newFlag = language === LANGUAGES.ENGLISH ? flags.en : flags.thai;
    setFlag(newFlag);
    dispatch(changeLanguage(language));
    setAnchorMenu(null);
    window.location.reload();
  };

  return (
    <>
      <IconButton
        data-testid="languageBtn"
        aria-owns={anchorMenu ? 'menu-appbar' : undefined}
        aria-haspopup="true"
        onClick={toggleMenu}
        color="inherit"
      >
        <Flag src={flag} alt="English" />
      </IconButton>

      <Menu
        id="menu-appbar"
        data-testid="menu-appbar"
        anchorEl={anchorMenu}
        open={Boolean(anchorMenu)}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={closeMenu}
      >
        <MenuItemStyle
          className={i18n.language === LANGUAGES.ENGLISH ? 'active' : ''}
          onClick={() => onChangeLanguage(LANGUAGES.ENGLISH)}
        >
          <Flag src={flags.en} alt="English" />
          &nbsp; English
        </MenuItemStyle>
        <MenuItemStyle
          className={i18n.language === LANGUAGES.THAI ? 'active' : ''}
          onClick={() => onChangeLanguage(LANGUAGES.THAI)}
        >
          <Flag src={flags.thai} alt="Thai" />
          &nbsp; Thai
        </MenuItemStyle>
      </Menu>
    </>
  );
}

interface IRouteMenu {
  routes: Readonly<IHeaderRoutes[]>;
}
function LeadRouteMenu({ routes }: IRouteMenu) {
  const [openAddLead, setOpenAddLead] = useState(false);
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const { data: user } = useGetAuthenticateQuery();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const setOpenScheduleModalOnPage = () => {
    setOpenScheduleModal(true);
  };

  const handleHeaderClick = (item: IHeaderRoutes) => {
    if (item.type === ADD_LEAD_TYPE) {
      setOpenAddLead(!openAddLead);
    }
    if (item.type === APPOINTMENT_TYPE) {
      setOpenScheduleModalOnPage();
    }
  };

  const closeModalSchedule = (close: boolean) => {
    destroyModalSchedule();
    setOpenScheduleModal(close);
  };

  const customFormValue = (formValue: IFormAddLead) => {
    // INFO: after that, need to get schema id from api
    const phoneDefaultStatus = 'unverified';

    return {
      product: formValue.product || '',
      schema: ADD_LEAD_SCHEMA_ID,
      type: formValue.type || '',
      data: {
        customerFirstName: formValue.firstName,
        customerLastName: formValue.lastName,
        customerPhoneNumber: [
          {
            phone: formatE164(formValue.phone),
            status: phoneDefaultStatus,
          },
        ],
        customerEmail: [formValue.email],
        primaryPhoneIndex: 0,
        numberOfFixedDriver: formValue.fixedDriver,
        locale: 'th-th',
      },
      assignedTo: user?.name || '',
      reference: formValue?.reference || '',
      source: formValue.source?.value || '',
    };
  };

  const handleResultSubmitForm = () => {
    setOpenAddLead(false);
    showSuccessSnackbar(getString('text.addLeadSuccess'));
  };

  const handleError = (error: any) => {
    showErrorSnackbar(error.message || getString('text.createLeadFail'));
  };

  const callBackAddLead = (value: IFormAddLead) => {
    const form = customFormValue(value);
    const leadRepository = new LeadRepository();
    leadRepository
      .createLead(form as ICreateLead)
      .subscribe(handleResultSubmitForm, handleError);
  };

  return (
    <>
      <CommonModal
        title={getString('text.addLeadButton')}
        open={openAddLead}
        handleCloseModal={() => setOpenAddLead(false)}
      >
        <LeadPageAddLead
          callBackAddLead={(value: IFormAddLead) => callBackAddLead(value)}
          close={setOpenAddLead}
        />
      </CommonModal>
      {openScheduleModal && (
        <Grid item xs={12} lg={12}>
          <NewLeadScheduleModal
            isOpen={openScheduleModal}
            onClose={() => closeModalSchedule(false)}
            isViewOnly
          />
        </Grid>
      )}

      <Grid container item xs={9} md={9}>
        <Grid
          item
          container
          xs={12}
          md={12}
          lg={2}
          className="header-rabbit-icon"
        >
          <Link to="/">
            <RabbitIcon
              alt="Rabbit Finance"
              src="/static/img/rabbit-care-logo.svg"
              className="w-[150px]"
            />
          </Link>
        </Grid>
        <Grid
          item
          container
          className="general-header__detail-buttons"
          xs={12}
          md={12}
          lg={10}
        >
          <Grid container>
            <div className="menu-route">
              {routes.map((item: IHeaderRoutes) => (
                <div
                  color="inherit"
                  aria-label="Route Manu"
                  className="menu-route__items"
                  key={item.id}
                >
                  {!item?.hiddenIcon && (
                    <span className="menu-route__icon">
                      <MenuRoute />
                    </span>
                  )}
                  <Link
                    to={item.path}
                    className="menu-route__link"
                    onClick={() => handleHeaderClick(item)}
                  >
                    <span>{getString(item.text)}</span>
                  </Link>
                </div>
              ))}
            </div>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

function UserMenu() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const openLogoutModal = () => {
    dispatch(resetIsLogoutSuccess());
    setOpen(!open);
  };

  const { data: user } = useGetAuthenticateQuery();
  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`;

  return (
    <>
      <Button
        onClick={openLogoutModal}
        startIcon={<User />}
        className="user-logout-button grow shrink-0"
      >
        {userName}
      </Button>
      <CommonModal
        title="Logout"
        open={open}
        handleCloseModal={() => {
          setOpen(false);
        }}
      >
        <LogoutModal closeModal={() => setOpen(false)} />
      </CommonModal>
    </>
  );
}

function DefaultMenu({ toggleCollapse }: any) {
  return (
    <>
      <Hidden smDown>
        <Grid container>
          <Grid
            item
            container
            xs={12}
            md={12}
            lg={2}
            className="header-rabbit-icon"
          >
            <Link to="/">
              <RabbitIcon
                alt="Rabbit Finance"
                src="/static/img/rabbit-care-logo.svg"
                className="w-[150px]"
              />
            </Link>
          </Grid>
        </Grid>
      </Hidden>
      <Hidden mdUp>
        <Grid container>
          <Grid item>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={toggleCollapse}
            >
              <MenuIcon />
            </IconButton>
          </Grid>
        </Grid>
      </Hidden>
    </>
  );
}

const SettingPagesMenu = ({ navigate, path }: any) => {
  const [isSettingDropdown, setSettingDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const SettingPages = [
    {
      id: 0,
      title: getString('menu.userManagement.users'),
      value: '/health/users',
    },
    {
      id: 1,
      title: getString('menu.userManagement.teams'),
      value: '/health/teams',
    },
  ];

  ClickAwayListener(dropdownRef, () => setSettingDropdown(false));

  return (
    <>
      <button
        type="button"
        aria-label="setting"
        onClick={() => setSettingDropdown((prev) => !prev)}
        className="bg-transparent mr-2 cursor-pointer border-none outline-none hover:bg-transparent"
      >
        <SettingsIcon />
      </button>
      {isSettingDropdown && (
        <div
          ref={dropdownRef}
          className="flex flex-col bg-white drop-shadow-lg rounded-md border border-solid border-primary absolute top-[3rem] right-[10em] z-50 translate-y-6 card w-[14em]"
        >
          {SettingPages.map((page) => (
            <button
              type="button"
              key={page.id}
              className={clsx(
                'p-3 px-4 rounded-md text-[#4f4b66] font-normal text-left outline-none border-none border-b border-gray-200 hover:bg-[#e5eef8]',
                path.includes(page.value) ? 'bg-[#e5eef8]' : 'bg-transparent'
              )}
              onClick={() => navigate(page.value)}
            >
              {page.title}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

function Header({ toggleCollapse }: Readonly<{ toggleCollapse?: () => void }>) {
  const dispatch = useDispatch();
  const { data: user } = useGetAuthenticateQuery();

  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const headerConfig = useAppSelector((state) => state.headerLayoutReducer);

  const [isSaleAgent, setIsSaleAgent] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const featureFlags = useFlags([
    FeatureFlags.BROK_210_ENABLE_ORDER_LISTING_PAGE_241024_TEMP,
    FeatureFlags.BROK_625_ENABLE_TRANSACTION_LISTING_PAGE_20241113_TEMP,
    FeatureFlags.BROK_446_ENABLE_CAMPAIGN_PAGE_FOR_HEALTH_20241211_TEMP,
    FeatureFlags.BROK_1208_ENABLE_CONTRACT_PAGE_FOR_HEALTH_20241213_TEMP,
    FeatureFlags.BROK_4135_ENABLE_PERFORMANCE_STATISTIC_PAGE_20251126_TEMP,
  ]);

  const isOrderPageEnabled =
    featureFlags[FeatureFlags.BROK_210_ENABLE_ORDER_LISTING_PAGE_241024_TEMP]
      ?.enabled ?? false;

  const isTransactionPageEnabled =
    featureFlags[
      FeatureFlags.BROK_625_ENABLE_TRANSACTION_LISTING_PAGE_20241113_TEMP
    ]?.enabled ?? false;

  const isCommissionReportEnabled = false;

  const isCampaignPageEnabled =
    featureFlags[
      FeatureFlags.BROK_446_ENABLE_CAMPAIGN_PAGE_FOR_HEALTH_20241211_TEMP
    ]?.enabled ?? false;
  const isContractPageEnabled =
    featureFlags[
      FeatureFlags.BROK_1208_ENABLE_CONTRACT_PAGE_FOR_HEALTH_20241213_TEMP
    ]?.enabled ?? false;
  const isPerformanceStatisticPageEnabled =
    featureFlags[
      FeatureFlags.BROK_4135_ENABLE_PERFORMANCE_STATISTIC_PAGE_20251126_TEMP
    ]?.enabled ?? false;

  const { addNotification, NotificationList, NotificationContainer } =
    useNotification({
      userId: user?.name ?? null,
    });

  useMemo(() => {
    if (user?.role === SALE_AGENT_ROLE) {
      setIsSaleAgent(true);
    }
  }, [user]);

  useEffect(() => {
    if (!globalProduct) {
      dispatch(changeProductSelectorTypes(initialProduct));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalProduct]);

  const handleTestNotify = () => {
    addNotification({
      data: {
        id: '10',
        name: 'name',
        title: getNotificationTitle(NotificationTypes.QC_FIXED),
        type: NotificationTypes.QC_FIXED,
        details: {
          customerName: 'Kiki Test',
          orderId: 'L9905493',
        },
        description: null,
        date: '12/12/2020 (15:00)',
        url: 'orders/e5832a90-22e9-471e-8cd6-4420f1c8b6ac',
      },
    });
  };

  const isHealthProduct =
    (RolesWithoutProduct.includes(user?.role as UserRoleID)
      ? globalProduct
      : user?.product) === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

  const getLeadRoutes = () => {
    if (isHealthProduct) {
      return healthHeaderRoutes(user?.role || '').filter(({ id }: any) => {
        const isOrderPage = id === 'orders';
        const isTransactionPage = id === 'transactions';
        const isCampaignPage = id === 'campaign-discount';
        const isContractPage = id === 'contract-listing';
        const isPerformanceStatisticPage = id === 'performance-statistic';

        return (
          (isOrderPageEnabled || !isOrderPage) &&
          (isTransactionPageEnabled || !isTransactionPage) &&
          (isCampaignPageEnabled || !isCampaignPage) &&
          (isContractPageEnabled || !isContractPage) &&
          (isPerformanceStatisticPageEnabled || !isPerformanceStatisticPage)
        );
      });
    }
    if (isSaleAgent) {
      const routes = [headerRoutes[0], myOrderRoute, headerRoutes[1]];
      if (isCommissionReportEnabled) routes.push(comissionReportRoute);
      return routes;
    }
    return emptyHeaderRoutes;
  };
  const routes = useMemo(
    () => getLeadRoutes(),
    [headerConfig, isSaleAgent, globalProduct]
  );

  const isNewHeaderLayout = headerConfig.params || routes.length;

  return (
    <div className="general-header">
      <AppBar position="sticky" color="inherit">
        <Toolbar
          className={`general-header__toolbar${
            headerConfig.params ? ' toolbar-lead-detail' : ''
          }`}
        >
          {!isNewHeaderLayout && (
            <DefaultMenu toggleCollapse={toggleCollapse} />
          )}

          <Grid container alignItems="center" wrap="nowrap">
            {isNewHeaderLayout ? (
              <LeadRouteMenu routes={routes} />
            ) : (
              <Grid item xs />
            )}
            <Grid
              item
              className={`shrink-0 general-header__user-buttons${
                headerConfig.params ? ' user-buttons-lead-detail' : ''
              }`}
              justify-content="flex-end"
            >
              <Grid item className="pr-[10px]">
                <ProductTypeSelectorGlobal />
              </Grid>
              {NotificationList}
              {NotificationContainer}
              <Tooltip title="View Knowledge Base" placement="bottom">
                <Link to={KNOWLEDGEBASE_URL} target="_blank" className="px-2">
                  <ViewDocumentIcon
                    fontSize="small"
                    className="cursor-pointer pt-2 pr-2 text-primary border-none"
                  />
                </Link>
              </Tooltip>
              {isHealthProduct &&
                [SUPER_ADMIN_ROLE].includes(user?.role ?? '') && (
                  <SettingPagesMenu
                    navigate={navigate}
                    path={location.pathname}
                  />
                )}
              <UserMenu />
              <LanguageMenu />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;
