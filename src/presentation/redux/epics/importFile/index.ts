import { ofType, combineEpics } from 'redux-observable';
import { defer, EMPTY, merge, of } from 'rxjs';
import {
  catchError,
  map,
  mergeAll,
  pluck,
  exhaustMap,
  withLatestFrom,
} from 'rxjs/operators';

import ImportCSVUseCase from 'domain/usecases/importFile';
import { getCarSubModelImport } from 'presentation/redux/actions/carSubModel';
import { getCustomerProfileImport } from 'presentation/redux/actions/customerProfile';
import {
  ImportFileAction,
  importCSVSuccess,
  importCSVFailed,
} from 'presentation/redux/actions/importFile';
import { getImportLead } from 'presentation/redux/actions/leads/import';
import { getPackageImport } from 'presentation/redux/actions/package';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { ImportType } from 'shared/constants/importFile';
import {
  epicWithoutStateFn,
  epicWithStateFn,
  IImportData,
} from 'shared/interfaces/common';

const importCSVEpic: epicWithStateFn = (action$, state$) =>
  action$.pipe(
    ofType(ImportFileAction.IMPORT_CSV),
    withLatestFrom(
      state$.pipe(
        pluck('typeSelectorReducer', 'globalProductSelectorReducer', 'data')
      )
    ),
    exhaustMap(([action, productType]) => {
      let importData: IImportData = {
        product: productType,
        importType: action.payload.importType,
        file: action.payload.file,
        filename: action.payload?.file?.name,
      };

      if (action?.payload?.importType === ImportType.Lead) {
        importData = {
          ...importData,
          leadDetails: {
            source: action.payload.source,
          },
        };
      }

      if (action?.payload?.importType === ImportType.Package) {
        importData = {
          ...importData,
          packageDetails: {
            packageType: action.payload.packageType,
          },
        };
      }

      return new ImportCSVUseCase.ImportCSVUseCase().execute(importData).pipe(
        map((res) =>
          importCSVSuccess({
            ...res,
            importType: action?.payload?.importType,
          })
        ),
        catchError((err) => of(importCSVFailed(err)))
      );
    })
  );

const importCSVSuccessEpic: epicWithStateFn = (action$) =>
  action$.pipe(
    ofType(ImportFileAction.IMPORT_CSV_SUCCESS),
    map((res) =>
      merge(
        defer(() => {
          if (res?.payload?.importType === ImportType.Lead) {
            return of(
              getImportLead({
                currentPage: 1,
                pageSize: 15,
              })
            );
          }
          if (res?.payload?.importType === ImportType.Package) {
            return of(
              getPackageImport({
                currentPage: 1,
                pageSize: 15,
                pageToken: '',
                showDeleted: true,
                orderBy: '',
                filter: '',
              })
            );
          }
          if (res?.payload?.importType === ImportType.CarSubModel) {
            return of(
              getCarSubModelImport({
                currentPage: 1,
                filter: '',
                orderBy: '&orderBy=createTime desc',
                pageSize: 15,
                pageToken: '',
                showDeleted: true,
              })
            );
          }
          if (res?.payload?.importType === ImportType.CustomerProfile) {
            return of(
              getCustomerProfileImport({
                currentPage: 1,
                filter: '',
                orderBy: '&orderBy=createTime desc',
                pageSize: 15,
                pageToken: '',
                showDeleted: true,
              })
            );
          }
          // TODO: Reload page when have API get list car discount
          return EMPTY;
        }),
        of(
          showSnackBar({
            isOpen: true,
            message: getString('text.importCSVSuccess'),
            status: CONSTANTS.snackBarConfig.type.success,
          })
        )
      )
    ),
    mergeAll()
  );

const importCSVFailedEpic: epicWithoutStateFn = (action$) =>
  action$.pipe(
    ofType(ImportFileAction.IMPORT_CSV_FAILED),
    map(() =>
      of(
        showSnackBar({
          isOpen: true,
          message: getString('text.importCSVFailed'),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      )
    ),
    mergeAll()
  );

const importFileEpic = combineEpics(
  importCSVEpic,
  importCSVSuccessEpic,
  importCSVFailedEpic
);
export default importFileEpic;
