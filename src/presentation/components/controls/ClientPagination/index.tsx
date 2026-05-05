import ButtonGroup from '@material-ui/core/ButtonGroup';
import FormControl from '@material-ui/core/FormControl';
import margin from 'polished/lib/shorthands/margin';
import React, { useMemo, useState } from 'react';

import { getString } from 'presentation/theme/localization';
import { SelectElement } from 'shared/types/controls';

import Controls from '../Control';

import './index.scss';
import {
  AngleDoubleLeftIcon,
  AngleDoubleRightIcon,
} from 'presentation/components/icons';

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
  totalItem: number;
}

interface IPageState {
  savedPage: number;
  savedToken: string | null;
}

function ClientPagination({
  page,
  nextToken,
  perPage,
  pageSizes,
  onChangePage,
  onChangePerPage,
  isLoading,
  totalItem,
}: IPaginationProps) {
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

  const isDisabledButton = useMemo(() => {
    const totalPage = Math.ceil(totalItem / perPage);
    return totalPage === page;
  }, [page, perPage, totalItem]);

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
            data-cy="first-button"
            className={`pagination-button ${isLoading ? 'remove-event' : ''}`}
            disabled={isLoading}
            size="medium"
            style={margin(0)}
          />
        )}
        {page > 1 && (
          <Controls.Button
            onClick={prevPage}
            data-cy="prev-button"
            className={`pagination-button pagination-arrow-button ${
              isLoading ? 'remove-event' : ''
            }`}
            disabled={isLoading}
            size="medium"
            style={margin(0)}
          >
            <AngleDoubleLeftIcon />
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
          data-cy="next-button"
          className={`pagination-button pagination-arrow-button ${
            isLoading ? 'remove-event' : ''
          }`}
          size="medium"
          disabled={isDisabledButton || isLoading || !totalItem}
          style={margin(0)}
        >
          <AngleDoubleRightIcon />
        </Controls.Button>
      </ButtonGroup>

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
        <span className="pagination-label" style={{ whiteSpace: 'nowrap' }}>
          {`of ${totalItem}`}
        </span>
        <span className="pagination-label">{getString('text.entries')}</span>
      </FormControl>
    </div>
  );
}

export default ClientPagination;
