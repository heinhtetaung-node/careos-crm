import FormControl from '@material-ui/core/FormControl';
import { Pagination as MuiPagination } from '@material-ui/lab';
import React, { useEffect, useMemo, useState } from 'react';

import { SelectElement } from 'shared/types/controls';

import { getString } from '../../../theme/localization';
import Controls from '../Control';
import './index.scss';

interface PaginationProps {
  page: number;
  changePage: (page: number) => void;
  pageSize: number;
  totalItem: number;
  options: number[];
  changePerPage: (event: React.ChangeEvent<SelectElement>) => void;
  addClass?: string;
  paginationStyle?: string;
}

function Pagination({
  page,
  changePage,
  pageSize,
  totalItem,
  options,
  changePerPage,
  addClass = '',
  paginationStyle = '',
}: PaginationProps) {
  const [totalPage, setTotalPage] = useState(0);

  useEffect(() => {
    const total = Math.ceil(totalItem / pageSize);
    setTotalPage(() => (totalItem > 0 ? total : 1));
  }, [totalItem, pageSize]);

  const pageSizeOptions = useMemo(
    () => options.map((size, index) => ({ id: index, title: size })),
    [options]
  );

  return (
    <div
      className={`${paginationStyle} old-pagination ${addClass}`}
      data-testid="pagination"
    >
      <MuiPagination
        count={totalPage}
        variant="outlined"
        color="secondary"
        page={page}
        onChange={(event, pageValue: number) => changePage(pageValue)}
        disabled={totalItem <= 0}
        data-testid="pagination-mui"
      />
      <FormControl variant="standard" className="pagination-select-wrapper">
        <span className="pagination-label">{getString('text.show')}</span>
        <Controls.Select
          name="pageSizeSelect"
          value={pageSize}
          selectField="title"
          onChange={changePerPage}
          options={pageSizeOptions}
          className="pagination-select pagination-padding"
        />
        <span
          className="pagination-label whitespace-nowrap"
          data-testid="pagination-total-label"
        >
          {`of ${totalItem}`}
        </span>
        <span className="pagination-label">{getString('text.entries')}</span>
      </FormControl>
    </div>
  );
}

export default Pagination;
