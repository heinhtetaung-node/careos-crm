import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';
import { CustomPackage } from './types';
import { getString } from 'presentation/theme/localization';
import { mockCustomPackages } from 'mock-data/GenericPackageData.mock';
import { formatCurrency } from 'shared/helper/utilities';
import { Link } from 'react-router-dom';

const columns: ColumnDef<CustomPackage>[] = [
  {
    header: getString('newPackageListing.insurer'),
    accessorKey: 'insurer',
    size: 180,
  },
  {
    header: getString('newPackageListing.packageName'),
    accessorKey: 'packageName',
    size: 380,
  },
  {
    header: getString('newPackageListing.insuranceType'),
    accessorKey: 'insuranceType',
    size: 100,
  },
  {
    header: getString('newPackageListing.repairType'),
    accessorKey: 'repairType',
    size: 100,
  },
  {
    header: getString('newPackageListing.carCoverage'),
    accessorFn: (row) => formatCurrency(row.carCoverage),
    size: 100,
  },
  {
    header: getString('newPackageListing.deductible'),
    accessorFn: (row) => formatCurrency(row.deductible),
    size: 120,
  },
  {
    header: getString('newPackageListing.price'),
    accessorFn: (row) => formatCurrency(row.price),
  },
  {
    header: getString('newPackageListing.paymentPlan'),
    accessorKey: 'paymentPlan',
    size: 200,
  },
  {
    header: getString('newPackageListing.shippingFee'),
    accessorFn: (row) => formatCurrency(row.shippingFee),
  },
  {
    header: getString('newPackageListing.discount'),
    accessorFn: (row) => formatCurrency(row.discount),
  },
  {
    header: getString('newPackageListing.processingFee'),
    accessorFn: (row) => formatCurrency(row.processingFee),
  },
  {
    header: getString('newPackageListing.invoicedAmount'),
    accessorFn: (row) => formatCurrency(row.invoiceAmount),
  },
  {
    id: 'actions',
    cell: (_props) => (
      <div className="flex flex-col">
        <span className="text-[11px] text-blue-500 underline cursor-pointer hover:text-blue-600">
          {getString('newPackageListing.select')}
        </span>
        <Link to="/leads/3cea2f79-e0f8-457f-ab5d-8847202a3730/detail?insuranceKind=VOLUNTARY&paymentOption=FULL_PAYMENT&paymentMethod=QR_CODE&installmentPlan=1&id=packages%2F1346073">
          <span className="text-[11px] text-blue-500 underline cursor-pointer hover:text-blue-600">
            {getString('newPackageListing.quotation')}
          </span>
        </Link>
        <span className="text-[11px] text-blue-500 underline cursor-pointer hover:text-blue-600">
          + {getString('newPackageListing.compare')}
        </span>
        <span className="text-[11px] text-blue-500 underline cursor-pointer hover:text-blue-600">
          {getString('newPackageListing.payment')}
        </span>
      </div>
    ),
  },
];

export default function CustomPackageList() {
  const table = useReactTable({
    columns,
    data: mockCustomPackages,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: { size: 100 },
  });

  return (
    <div className="overflow-y-auto custom-scrollbar h-full">
      <div className="border-collapse w-full text-xs">
        <div className="bg-primary-light sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <div
              key={headerGroup.id}
              className="flex flex-row gap-2 items-center px-4 py-2"
            >
              {headerGroup.headers.map((header) => (
                <div
                  key={header.id}
                  style={{
                    width: header.column.getSize(),
                  }}
                  className="border border-solid1 border-red-200"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div>
          {table.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="flex flex-row gap-2 hover:bg-gray-100 px-4 py-2"
            >
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  style={{
                    width: cell.column.getSize(),
                  }}
                  className="border border-solid1 border-blue-200"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
