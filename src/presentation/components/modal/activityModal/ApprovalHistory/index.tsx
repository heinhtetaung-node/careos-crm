import React, { useEffect, useState } from 'react';

import { columns, initialFilter } from './config';
import {
  useLazyGetDiscountsRequestQuery,
  useLazyGetDiscountsRequest2Query,
} from 'data/slices/discountSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import useTableList from 'presentation/hooks/useTableList';

export default function ApprovalHistory({
  id,
  isHealth = false,
}: {
  readonly id: string;
  readonly isHealth?: boolean;
}) {
  const [filterURI] = useState(initialFilter(id, isHealth));
  const { TableComponent } = useTableList(
    'approvalHistory',
    columns,
    { ...initialPageState, filter: filterURI },
    useLazyGetDiscountsRequestQuery,
    undefined,
    undefined,
    []
  );
  return <TableComponent />;
}

export function ApprovalHistory3({ id }: { readonly id: string }) {
  const [filterURI] = useState(initialFilter(id));
  const { TableComponent } = useTableList(
    'approvalHistory',
    columns,
    { ...initialPageState, filter: 'customPackage=true' },
    useLazyGetDiscountsRequest2Query,
    undefined,
    undefined,
    []
  );
  return (
    <TableComponent
      fontSize="10px"
      paddingStyle="pt-[15px] pb-[15px]"
      paginationStyle="-mt-6 !text-[5px] p-1"
    />
  );
}
