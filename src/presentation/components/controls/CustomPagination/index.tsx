import ButtonGroup from '@material-ui/core/ButtonGroup';
import FormControl from '@material-ui/core/FormControl';
import margin from 'polished/lib/shorthands/margin';
import React, { useMemo, useState } from 'react';

import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
} from 'presentation/components/icons';
import { getString } from 'presentation/theme/localization';
import { SelectElement } from 'shared/types/controls';

import Controls from '../Control';
import './index.scss';

interface IPaginationProps {
  page: number;
  nextToken: any | null;
  perPage: number;
  pageSizes: number[];
  onChangePage: (
    page: number,
    nextToken: string | null,
    isPrev?: boolean
  ) => void;
  onChangePerPage: (itemsPerPage: number) => void;
  isLoading: boolean;
  totalItem?: number;
  tableType?: string;
}

interface IPageState {
  savedPage: number;
  savedToken: string | null;
}

const CustomPagination: React.FC<IPaginationProps> = ({
  page,
  nextToken,
  perPage,
  pageSizes,
  onChangePage,
  onChangePerPage,
  isLoading,
  totalItem,
  tableType,
}) => {
  const [pagesStates, setPagesState] = useState<IPageState[]>([
    { savedPage: 1, savedToken: '' },
  ]);

  const handleChangePage = (pg: number, isPrev = false) => {
    const targetPage = pagesStates.find(
      (pageState: IPageState) => pageState.savedPage === pg
    );

    if (targetPage) {
      onChangePage(targetPage.savedPage, targetPage.savedToken, isPrev);
    } else {
      onChangePage(pg, nextToken, isPrev);
    }
  };
  const pageSizeOptions = () =>
    pageSizes.map((size, index) => ({ id: index, title: size }));

  const goToFirst = () => {
    onChangePage(1, '');
  };

  const prevPage = () => {
    handleChangePage(page - 1, true);
  };

  const nextPage = () => {
    handleChangePage(page + 1);
  };

  const changePerPage = (event: React.ChangeEvent<SelectElement>) => {
    onChangePerPage(event.target.value as number);
  };
  const disabledByTotal = () => {
    if (totalItem) {
      return Math.ceil(totalItem / perPage) === page;
    }
    return false;
  };
  useMemo(() => {
    setPagesState([
      ...pagesStates,
      {
        savedPage: page + 1,
        savedToken: nextToken,
      },
    ]);
    // eslint-disable-next-line
  }, [page]);
  return (
    <div className="pagination-wrapper">
      <ButtonGroup>
        {page > 2 && (
          <Controls.Button
            text={getString('text.first')}
            onClick={goToFirst}
            className={`pagination-button ${isLoading ? 'remove-event' : ''}`}
            size="medium"
            style={margin(0)}
          />
        )}
        {page > 1 && (
          <Controls.Button
            onClick={prevPage}
            className={`pagination-button pagination-arrow-button ${
              isLoading ? 'remove-event' : ''
            }`}
            size="medium"
            data-testid="pagination-prev-page-btn"
            style={margin(0)}
          >
            <AngleDoubleLeftIcon fontSize="inherit" />
          </Controls.Button>
        )}
        <Controls.Button
          text={page}
          className="pagination-button"
          size="medium"
          style={margin(0)}
        />
        <Controls.Button
          onClick={nextPage}
          data-testid="pagination-next-page-btn"
          className={`pagination-button pagination-arrow-button ${
            isLoading ? 'remove-event' : ''
          }`}
          size="medium"
          disabled={!nextToken || isLoading || disabledByTotal()}
          style={margin(0)}
        >
          <AngleDoubleRightIcon fontSize="inherit" />
        </Controls.Button>
      </ButtonGroup>

      {tableType !== 'orderHistory' && (
        <FormControl variant="standard" className="pagination-select-wrapper">
          <span className="pagination-label">{getString('text.show')}</span>
          <Controls.Select
            name="pageSizeSelect"
            value={perPage}
            selectField="title"
            onChange={changePerPage}
            options={pageSizeOptions()}
            className="pagination-select"
          />
          <span className="pagination-label">{getString('text.entries')}</span>
        </FormControl>
      )}
    </div>
  );
};

export default CustomPagination;
