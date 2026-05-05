import { Grid } from '@material-ui/core';
import _get from 'lodash/get';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { connect, useDispatch, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { of, Subject } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

import { UserRoles } from 'config/constant';
import { useUpdateLeadStatusMutation } from 'data/slices/leadDetailSlices/updateLeadSlice';
import { DataTableMyLead } from 'presentation/components/DataTable/MyLeads';
import { IData } from 'presentation/components/DataTable/MyLeads/DataTableMyLeadHelper';
import { getMyLeads } from 'presentation/redux/actions/myLeads';
import useSnackbar from 'utils/snackbar';

import MyLeadButton from './MyLeadButton';
import MyLeadsFilter from './MyLeadsFilter';
import {
  changeSortStatus,
  Column,
  columns,
  getMyLeadsApi,
  getTeamId,
  INITIAL_ITEM_PER_PAGE,
  initialPageState,
  IRowMyLead,
  SORT_TABLE_TYPE,
  TypeShowImportantStar,
  TypeStar,
} from './myLeadsHelper';

import AdminUserCloud from 'data/repository/admin/user/cloud';
import ClientPagination from 'presentation/components/controls/ClientPagination';
import { ITEM_PER_PAGE_LIST } from 'presentation/HOCs/WithTableListHelper';
import { getString } from 'presentation/theme/localization';
import './index.scss';

type HumanIds = {
  id: string;
  humanId: string;
};

type TBulkImportBody = {
  ids: string[];
  important: boolean;
  humanIds?: HumanIds[];
};

// eslint-disable-next-line react/function-component-definition
export const MyLeads: React.FC<any> = () => {
  const removedColumns = ['renewalPackageStatus', 'paymentCall', 'renewalId'];

  const newColumns = columns.filter((cl) => !removedColumns.includes(cl.id));

  const [pageState, setPageState] = useState(initialPageState);
  const [perPage, setPerPage] = useState<number>(INITIAL_ITEM_PER_PAGE);
  const [isDisabledBtn, setIsDisabledBtn] = useState({
    addStar: true,
    removeStar: true,
  });
  const [listItemChecked, setListItemChecked] = useState<IRowMyLead[]>([]);
  const [originalData, setOriginalData] = useState<IRowMyLead[]>([]);
  const [isShowStarBtn, setIsShowStarBtn] = useState(true);
  const [columnsSetting, setColumnsSetting] = useState(newColumns);
  const [rows, setRows] = useState<IData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [myLeadsData, setMyLeadsData] = useState([]);
  const [totalItem, setTotalItem] = useState(0);
  const [productType, setProductType] = useState('');
  const [isShowUnreadMessages, setIsShowUnreadMessages] = useState(true);
  const [updateLeadStatus] = useUpdateLeadStatusMutation();
  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const importantRef = useRef<{ important: any[]; unimportant: any[] }>({
    important: [],
    unimportant: [],
  });
  const searchStateRef = useRef({});
  const dispatch = useDispatch();
  const user = useSelector(
    (state: any) => state?.authReducer?.data?.user || {}
  );

  const handleDisableBtn = (item: IRowMyLead) => {
    if (item.isChecked) {
      setListItemChecked((oldList: IRowMyLead[]) => [...oldList, item]);
    } else {
      const newList = listItemChecked.filter(
        (element: IRowMyLead) => element.id !== item.id
      );
      setListItemChecked(newList);
    }
  };

  const handleDisableBtnSelectedAll = (list: IRowMyLead[]) => {
    setListItemChecked(list);
  };

  const callApiHandle = (
    product = productType,
    state = pageState,
    delayTime = 0,
    useIsLoading = true
  ) => {
    // order by createtime by default.
    if (state.orderBy === '') {
      state.orderBy = 'orderBy=lead.createTime desc';
    }

    if (isLoading) {
      return new Subject();
    }

    setIsLoading(useIsLoading);
    return getMyLeadsApi(
      product,
      {
        ...state,
        ...searchStateRef.current,
        assignedTo: user.name,
      },
      delayTime
    ).pipe(
      tap((res: any) => {
        setIsLoading(false);
        setMyLeadsData(res.data);
        setTotalItem(res.totalItem);
        setIsDisabledBtn({
          addStar: true,
          removeStar: true,
        });
      })
    );
  };

  const handlePageChange = (page: number) => {
    const newPageState = {
      ...pageState,
      currentPage: page,
    };
    callApiHandle(productType, newPageState).subscribe();
    setPageState(newPageState);
  };

  const handlePerPageChange = (itemsPerPage: number) => {
    setPerPage(itemsPerPage);
    const newPageState = {
      ...pageState,
      pageSize: itemsPerPage,
      pageToken: '',
      currentPage: 1,
    };
    callApiHandle(productType, newPageState).subscribe();
    setPageState(newPageState);
  };

  async function bulkUpdateLead(body: TBulkImportBody) {
    const { important, humanIds } = body;
    if (humanIds) {
      // eslint-disable-next-line consistent-return
      const assignLeadResource = humanIds?.map(async ({ id, humanId }) => {
        try {
          const resp = await updateLeadStatus({
            leadId: id,
            payload: { important },
          });

          return {
            result: resp,
            id,
            humanId,
          };
        } catch (e) {
          const err = e as Error;
          newrelic?.noticeError?.(err);
        }
      });

      const allAssignLeadResource = await Promise.all(assignLeadResource);
      const errorResponses = allAssignLeadResource.filter((response) =>
        _get(response, 'result.error')
      );

      if (errorResponses.length > 0) {
        const leads = errorResponses.map((respo) => respo?.humanId).join(', ');
        showErrorSnackbar(getString('text.bulkLeadUpdateFailed', { leads }));
      } else {
        showSuccessSnackbar(
          getString(
            important
              ? 'text.bulkImportantSuccess'
              : 'text.bulkUnimportantSuccess'
          )
        );
      }
    }
  }

  const callApiUpdateImportant = (body: TBulkImportBody) => {
    bulkUpdateLead(body);
  };

  const handleStarImportant = (type: TypeStar) => {
    const important = type === TypeStar.ADD;
    const dataType = important
      ? importantRef.current.unimportant
      : importantRef.current.important;

    const ids = dataType.map((item: any) => item.id);

    const body = {
      important,
      ids,
      humanIds: dataType,
    };

    const myLeadsDataTemp = [...myLeadsData];
    for (let i = 0; i < rows.length; i += 1) {
      if (rows[i].isChecked) {
        const iLead = myLeadsDataTemp.findIndex(
          (lead: IData) => lead.id === rows[i].id
        );
        if (iLead > -1 && myLeadsDataTemp[iLead]) {
          (myLeadsDataTemp[iLead] as IData).important = important;
        }
      }
      setMyLeadsData([...myLeadsDataTemp]);
    }

    callApiUpdateImportant(body);
  };

  const showImportantLead = (action: TypeShowImportantStar) => {
    const newPageState: any = {
      ...pageState,
    };
    if (action === TypeShowImportantStar.STAR) {
      newPageState.searchStar = true;
      setIsShowStarBtn(false);
    } else {
      newPageState.searchStar = false;
      setIsShowStarBtn(true);
    }
    callApiHandle(productType, newPageState).subscribe();
    setPageState(newPageState);
  };

  const showUnreadMessage = (showUnread: boolean) => {
    const newPageState: any = {
      ...pageState,
    };

    if (showUnread) {
      newPageState.unreadMessages = 0;
      setIsShowUnreadMessages(false);
    } else {
      delete newPageState.unreadMessages;
      setIsShowUnreadMessages(true);
    }

    callApiHandle(productType, newPageState).subscribe();
    setPageState(newPageState);
  };

  const handleRowImportant = (itemId: number, value: boolean) => {
    const newData = originalData.map((row: IRowMyLead) => {
      const newItem = { ...row };
      if (newItem.id === itemId) {
        newItem.important = value;
        return newItem;
      }
      return newItem;
    });

    setOriginalData(newData);
    setListItemChecked([]);
  };

  const getOrderByField = ({ sorting, field }: any) => {
    if (sorting === SORT_TABLE_TYPE.NONE) return '';
    if (sorting === SORT_TABLE_TYPE.ASC) return `&order_by=${field}`;
    return `&order_by=${field} desc`;
  };

  const findSortColumn = (newColumns: Column[], columnId: string) => {
    const findColumnSort = newColumns.find((item) => item.field === columnId);
    const orderQuery = getOrderByField({
      sorting: findColumnSort?.sorting,
      field: findColumnSort?.sortingField,
    });
    const newPageState: any = {
      ...pageState,
      currentPage: 1,
      pageToken: '',
      orderBy: orderQuery,
    };
    if (!findColumnSort?.sortingField) {
      delete newPageState.orderBy;
    }
    callApiHandle(productType, newPageState).subscribe();
    setPageState(newPageState);
  };

  const sortColumnHandle = (columnId: string) => {
    let newColumns = [...columnsSetting];
    newColumns = newColumns.map((item) => ({
      ...item,
      sorting:
        item.id === columnId
          ? changeSortStatus(item.sorting as SORT_TABLE_TYPE)
          : SORT_TABLE_TYPE.NONE,
    }));
    findSortColumn(newColumns, columnId);
    setColumnsSetting(newColumns);
  };

  const updateSingleImportant = (body: TBulkImportBody) => {
    callApiUpdateImportant(body);
  };

  useEffect(() => {
    if (user && user.role === UserRoles.SALE_ROLE) {
      setIsLoading(true);
      const teamFilter = encodeURI(`filter=user="${user.name}"`);
      AdminUserCloud.getTeamByUser(teamFilter)
        .pipe(
          mergeMap((res) => {
            const teamId = getTeamId(res);
            if (teamId) {
              return AdminUserCloud.getTeamInfo(teamId);
            }
            return of({
              productType: 'products/car-insurance',
            });
          }),
          tap((res: any) => {
            if (res) {
              setProductType(res.productType);
            }
          }),
          mergeMap((res: any) => {
            const newPageState: any = {
              ...pageState,
              currentPage: 1,
              pageToken: '',
            };
            return callApiHandle(res.productType, newPageState);
          })
        )
        .subscribe();
    } else if (user && user.role !== UserRoles.SALE_ROLE) {
      callApiHandle().subscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStarButton = (itemsChecked: any[]) => {
    const important = itemsChecked
      .filter((item) => item.important)
      .map((item) => ({ id: item.fullLeadId, humanId: item.leadId }));
    const unimportant = itemsChecked
      .filter((item) => !item.important)
      .map((item) => ({ id: item.fullLeadId, humanId: item.leadId }));

    importantRef.current = {
      unimportant,
      important,
    };
    let newStateBtn: any = {};
    if (important.length > 0) {
      newStateBtn = {
        ...newStateBtn,
        removeStar: false,
      };
    } else {
      newStateBtn = {
        ...newStateBtn,
        removeStar: true,
      };
    }
    if (unimportant.length > 0) {
      newStateBtn = {
        ...newStateBtn,
        addStar: false,
      };
    } else {
      newStateBtn = {
        ...newStateBtn,
        addStar: true,
      };
    }
    setIsDisabledBtn(newStateBtn);
  };

  const handleSearchData = (body: any) => {
    searchStateRef.current = body;
    const newPageState = { ...pageState, currentPage: 1, ...body };
    callApiHandle(productType, newPageState).subscribe();
    setPageState(newPageState);
  };

  const handleChangeForm = (body: any) => {
    searchStateRef.current = body;
  };

  return (
    <div className="my-leads-page" data-testid="my-leads-listing">
      <Helmet title="Lead - My Leads" />
      <Grid container spacing={6}>
        <Grid
          item
          xs={12}
          md={12}
          lg={12}
          className="my-leads-filter"
          data-testid="my-leads-filter-panel"
        >
          <MyLeadsFilter
            searchData={handleSearchData}
            handleChangeForm={handleChangeForm}
          />
        </Grid>
        <Grid
          container
          item
          xs={12}
          lg={12}
          className="my-leads-buttons items-center"
        >
          <MyLeadButton
            handleStarImportant={handleStarImportant}
            showImportantLead={showImportantLead}
            showUnreadMessage={showUnreadMessage}
            isShowStarBtn={isShowStarBtn}
            isShowUnreadMessages={isShowUnreadMessages}
            isDisabledBtn={isDisabledBtn}
          />
          <Grid
            item
            xs={12}
            md={6}
            lg={6}
            className="dp-flex paging-my-leads top-paging"
          >
            <div className="paging">
              <ClientPagination
                page={pageState.currentPage as number}
                perPage={perPage}
                pageSizes={ITEM_PER_PAGE_LIST}
                nextToken={pageState.pageToken}
                onChangePage={handlePageChange}
                onChangePerPage={handlePerPageChange}
                isLoading={isLoading}
                totalItem={totalItem}
              />
            </div>
          </Grid>
        </Grid>
        <Grid item xs={12} md={12} lg={12} className="my-leads-table">
          <DataTableMyLead
            columns={columnsSetting}
            originalData={myLeadsData}
            perPage={perPage}
            isLoading={isLoading}
            handleDisableBtn={handleDisableBtn}
            handleDisableBtnSelectedAll={handleDisableBtnSelectedAll}
            itemImportant={handleRowImportant}
            sortTable={sortColumnHandle}
            starButtonAction={handleStarButton}
            updateSingleImportant={updateSingleImportant}
            setRows={setRows}
            rows={rows}
          />
        </Grid>
        <Grid
          container
          item
          xs={12}
          lg={12}
          className="dp-flex paging-my-leads"
        >
          <div className="paging">
            <ClientPagination
              page={pageState.currentPage as number}
              perPage={perPage}
              pageSizes={ITEM_PER_PAGE_LIST}
              nextToken={pageState.pageToken}
              onChangePage={handlePageChange}
              onChangePerPage={handlePerPageChange}
              isLoading={isLoading}
              totalItem={totalItem}
            />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators({ getMyLeads }, dispatch);

export default connect(null, mapDispatchToProps)(MyLeads);
