/* eslint-disable jsx-a11y/click-events-have-key-events */
import clsx from 'clsx';
import React, { useState } from 'react';

import DragAndDropList from 'presentation/components/DragAndDropList';
import { DragAndDropPayload } from 'presentation/components/DragAndDropList/helper';
import {
  DoubleSideArrowIcon,
  DocumentSearchIcon,
} from 'presentation/components/icons';
import { getString } from 'presentation/theme/localization';
import getApiEndpoint from 'utils/endpointHelper';

import {
  columns,
  initialCustomers,
  initialLeads,
  initialOrders,
} from './helper';

function renderCell({
  data,
  index,
  columnId,
  moveCell,
}: {
  data: Record<string, string>;
  index: number;
  columnId: '1' | '2';
  moveCell: (index: number, columnId: string) => void;
}) {
  const redirectUri = getApiEndpoint(data.id);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span
          role="button"
          tabIndex={0}
          aria-label="arrow-button"
          data-testid="cell-move-button"
          onClick={() => moveCell(index, columnId)}
        >
          <DoubleSideArrowIcon className="cursor-pointer align-middle" />
        </span>
        <span className="px-2 font-bold"> {data.humanId}</span>
      </div>
      <a
        target="_blank"
        rel="noreferrer"
        aria-label="search-icon"
        href={redirectUri}
      >
        <DocumentSearchIcon className="cursor-pointer align-middle" />
      </a>
    </div>
  );
}

function RenderCustomers({
  customers,
}: {
  customers: Record<string, string>[];
}) {
  return (
    <table className="w-full table-fixed border-collapse">
      <tbody className="">
        {columns.map((column) => (
          <tr key={column.id}>
            <td className="p-2 border border-muted border-solid table-cell">
              {getString(column.title)}
            </td>
            {customers.map((customer) => (
              <td
                key={customer.id}
                className="p-2 border border-muted border-solid table-cell"
              >
                {customer[column.id]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CustomerMergeDetailPage() {
  // const { id } = useParams<{ id: string }>();  Will be used during integration
  const [orders, setOrders] = useState<DragAndDropPayload[]>(initialOrders);
  const [leads, setLeads] = useState<DragAndDropPayload[]>(initialLeads);

  const checkDisable = () => {
    const [firstOrder, secondOrder] = orders;
    const [firstLead, secondLead] = leads;
    const isOrder =
      firstOrder.rows?.length === 0 || secondOrder.rows?.length === 0;
    const isLead =
      firstLead.rows?.length === 0 || secondLead.rows?.length === 0;

    return isOrder && isLead;
  };

  const handleLeadData = (payload: DragAndDropPayload[]) => setLeads(payload);

  const handleOrderData = (payload: DragAndDropPayload[]) => setOrders(payload);

  return (
    <div
      data-testid="customer-merge-page"
      className="bg-white m-auto w-3/6 p-7 my-5 rounded-2xl"
    >
      <div className="border border-muted border-solid">
        <div>
          <h3 className="text-primary bg-muted mt-0 mb-0 p-2">
            {getString('paymentDetails.customerInformation')}
          </h3>
          <RenderCustomers customers={initialCustomers} />
        </div>
        <div>
          <h3 className="text-primary bg-muted mt-0 mb-0 p-2">
            {getString('text.leads')}
          </h3>

          <DragAndDropList
            columnData={leads}
            handleColumnData={handleLeadData}
            CustomComponent={renderCell}
          />
        </div>
        <div>
          <h3 className="text-primary bg-muted mt-0 mb-0 p-2">
            {getString('text.orders')}
          </h3>
          <DragAndDropList
            columnData={orders}
            handleColumnData={handleOrderData}
            CustomComponent={renderCell}
          />
        </div>
      </div>
      <div className="flex items-center justify-center my-5">
        <button
          className="px-5 py-2 border-transparent text-[#5c5b5b] text-sm font-semibold cursor-pointer bg-transparent hover:bg-[#b0c6e34d] ease-in-out duration-300 rounded-md mr-2"
          data-testid="reset-button"
          type="button"
          onClick={() => {
            setOrders(initialOrders);
            setLeads(initialLeads);
          }}
        >
          {getString('text.reset')}
        </button>
        <button
          className={clsx(
            'px-5 py-2 border-transparent text-white text-sm font-semibold rounded-md mr-2',
            checkDisable() ? 'bg-primary cursor-pointer' : 'bg-[#aaa]'
          )}
          data-testid="submit-button"
          type="button"
          onClick={() => null}
          disabled={!checkDisable()}
        >
          {getString('discountPricing.submit')}
        </button>
      </div>
    </div>
  );
}

export default CustomerMergeDetailPage;
