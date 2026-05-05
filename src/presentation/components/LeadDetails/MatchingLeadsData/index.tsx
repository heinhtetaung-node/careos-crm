import { Button } from '@alphafounders/ui';
import _get from 'lodash/get';
import _has from 'lodash/has';
import React from 'react';
import { Link } from 'react-router-dom';

import { useGetMatchingLeadsQuery } from 'data/slices/gffSlice';
import { MatchingLeadsResponse } from 'data/slices/gffSlice/types';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import CopyToClipboard from 'presentation/components/CopyToClipboard';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';
import { formatDDMMYYYYHHMMSS } from 'shared/helper/utilities';

import { flattenObject } from './MatchingLeadData.helper';
import usePatchLead from './usePatchLead';

function RenderFields({
  fields,
  patchLeadDisabled,
}: {
  readonly fields: MatchingLeadsResponse;
  readonly patchLeadDisabled: boolean;
}) {
  const { PatchLeadButton } = usePatchLead();
  const allowedOrderedFields = [
    'score',
    'firstName',
    'lastName',
    'phone',
    'email',
    'car',
    'licensePlate',
    'updateTime',
    'name',
  ];

  const clipboardFields = ['firstName', 'lastName'];
  const patchToLeadFields = ['phone', 'email'];

  const flattenedObject = flattenObject(fields);
  const orderedObject: any = {};

  allowedOrderedFields.forEach((key) => {
    if (_has(flattenedObject, key)) {
      orderedObject[key] = _get(flattenedObject, key);
    }
  });

  return (
    <div
      className="rounded-xl relative border-solid border border-gray-300 mb-3"
      data-testid={`matching-lead-${fields.name}`}
    >
      {Object.keys(orderedObject).map((field: any) => {
        if (allowedOrderedFields.includes(field)) {
          if (field === 'updateTime' && _has(orderedObject, 'updateTime')) {
            return (
              <div
                className="grid grid-cols-12 py-2 gap-2 px-3 border-solid border-0 border-gray-300 border-b last:border-none"
                key={field}
              >
                <span className="flex justify-between items-center col-span-3">
                  {getString(`leadDetailFields.${field}`)}
                  <span>:</span>
                </span>
                <span
                  data-testid={`${field}`}
                  className="break-words col-span-9 block w-full"
                >
                  {formatDDMMYYYYHHMMSS(_get(orderedObject, 'updateTime'))}
                </span>
              </div>
            );
          }
          if (field === 'name' && _has(orderedObject, 'name')) {
            return (
              <Link
                to={`/${orderedObject.name}`}
                target="_blank"
                key="name"
                className="no-underline"
              >
                <Button
                  text={getString('text.viewLead')}
                  className="p-3 !h-[40px] w-full !rounded-none !rounded-b-xl"
                  dataTestId="view-lead-button"
                  rounded={false}
                />
              </Link>
            );
          }
          if (
            _has(orderedObject, field) &&
            _get(orderedObject, field) &&
            patchToLeadFields.includes(field)
          ) {
            return (
              <div
                className="grid grid-cols-12 py-2 gap-2 px-3 border-solid border-0 border-gray-300 border-b last:border-none"
                key={field}
              >
                <span className="flex justify-between items-center col-span-3">
                  {getString(`leadDetailFields.${field}`)}
                  <span>:</span>
                </span>
                <span
                  data-testid={`${field}`}
                  className="break-words col-span-9 block w-full"
                >
                  <PatchLeadButton
                    leadId={fields.name}
                    field={field}
                    value={_get(orderedObject, field)}
                    testId={`${field}-patch-button`}
                    patchLeadDisabled={patchLeadDisabled}
                  />
                </span>
              </div>
            );
          }
          if (
            _has(orderedObject, field) &&
            _get(orderedObject, field) &&
            clipboardFields.includes(field)
          ) {
            return (
              <div
                className="grid grid-cols-12 py-2 gap-2 px-3 border-solid border-0 border-gray-300 border-b last:border-none"
                key={field}
              >
                <span className="flex justify-between items-center col-span-3">
                  {getString(`leadDetailFields.${field}`)}
                  <span>:</span>
                </span>
                <span
                  data-testid={`${field}`}
                  className="break-words col-span-9 flex flex-row items-center"
                >
                  <CopyToClipboard
                    text={_get(orderedObject, field)}
                    key={field}
                    mainClassName="flex w-full justify-between"
                    iconColor="primary"
                  />
                </span>
              </div>
            );
          }
          if (
            _has(orderedObject, field) &&
            _get(orderedObject, field) &&
            !clipboardFields.includes(field)
          ) {
            return (
              <div
                className="grid grid-cols-12 gap-2 py-2 px-3 border-solid border-0 border-gray-300 border-b last:border-none"
                key={field}
              >
                <span className="flex justify-between items-center col-span-3">
                  {getString(`leadDetailFields.${field}`)}
                  <span>:</span>
                </span>
                <span
                  data-testid={`${field}`}
                  className="break-words col-span-9 flex items-center"
                >
                  {_get(orderedObject, field)}
                </span>
              </div>
            );
          }
        }
        return (
          <div
            className="grid grid-cols-12 gap-2 py-2 px-3 border-solid border-0 border-gray-300 border-b last:border-none"
            key={field}
          >
            <span className="flex justify-between items-center col-span-3">
              {getString(`leadDetailFields.${field}`)}
              <span>:</span>
            </span>
            <span className="col-span-9 flex items-center">-</span>
          </div>
        );
      })}
    </div>
  );
}

function LeadSection({
  matchingLeads,
  patchLeadDisabled,
}: {
  readonly matchingLeads: any;
  readonly patchLeadDisabled: boolean;
}) {
  if (matchingLeads.length) {
    return (
      <div data-testid="matching-lead-response">
        {matchingLeads.map((lead: any) => (
          <RenderFields
            fields={lead}
            patchLeadDisabled={patchLeadDisabled}
            key={lead?.name}
          />
        ))}
      </div>
    );
  }

  return null;
}

function MatchingLeadsData({
  leadId,
  patchLeadDisabled = true,
}: {
  readonly leadId: string;
  readonly patchLeadDisabled?: boolean;
}) {
  const { data: matchingLeadsData, isLoading } = useGetMatchingLeadsQuery(
    { leadId },
    { skip: !leadId }
  );

  return (
    <SectionWrapper
      summary={getString('text.matchingLeads')}
      details={
        <div
          className="min-h-[600px] max-h-[85vh] h-full w-full p-2 overflow-y-auto"
          data-testid="matching-leads-data"
        >
          {isLoading && <Spinner />}
          {!isLoading && matchingLeadsData?.length === 0 && (
            <span>{getString('text.noMatchingLeads')}</span>
          )}
          {!isLoading && (matchingLeadsData?.length ?? 0) > 0 && (
            <LeadSection
              matchingLeads={matchingLeadsData}
              patchLeadDisabled={patchLeadDisabled}
            />
          )}
        </div>
      }
      hideBadge
      testId="matching-lead-container"
      headerTestId="matching-lead-section"
    />
  );
}

export default MatchingLeadsData;
