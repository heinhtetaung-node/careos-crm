import { Button, Input } from '@alphafounders/ui';
import { debounce } from 'lodash';
import React, { FormEvent, useEffect, useState } from 'react';
import SearchableJSONView from 'searchable-react-json-view';
import { useCopyToClipboard } from 'usehooks-ts';

import { useGetHistoryBffQuery } from 'data/slices/gffSlice';
import Spinner from 'presentation/components/Spinner';
import { getString } from 'presentation/theme/localization';

import {
  getPresetFields,
  sortObjectAlphabetically,
  filterDeepNestedObjectByKeys,
  addTranslationKey,
  filterDeepNestedObjectByFields,
  redactSensitiveData,
} from './LeadHistoricalData.helper';

function LeadHistoricalData({
  leadId,
  sourceId,
}: {
  readonly leadId?: string;
  readonly sourceId?: string;
}) {
  const [_, copy] = useCopyToClipboard();
  const [collapsedValue, setCollapsedValue] = useState<number | boolean>(1);
  const [presetValue, setPresetValue] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [queryText, setQueryText] = useState<string>('');
  const [historicalData, setHistoricalData] = useState({});
  const { data: historyData, isLoading } = useGetHistoryBffQuery(
    `/v1alpha1/${leadId}:history`,
    { skip: !leadId }
  );

  const presetFields = getPresetFields(sourceId ?? '');

  // first component loads sort and translate the field and display.
  useEffect(() => {
    if (historyData?.resource?.data) {
      const sortedData = sortObjectAlphabetically(historyData?.resource?.data);
      const redactedData = redactSensitiveData(sortedData);

      const translatedData = addTranslationKey(redactedData);
      setHistoricalData(translatedData);
    }
  }, [historyData]);

  // if search text is added, sort alphabetically first then translate and finally filter the data by the searched text.
  useEffect(() => {
    if (searchText && queryText) {
      setPresetValue('');
      const sortedData = sortObjectAlphabetically(historyData?.resource?.data);
      const redactedData = redactSensitiveData(sortedData);

      const translatedData = addTranslationKey(redactedData);

      const filteredData = filterDeepNestedObjectByKeys(
        translatedData,
        searchText
      );

      setHistoricalData(filteredData);
    }
  }, [queryText, searchText]);

  const handlePresetClick = (value: string) => {
    setCollapsedValue(false);
    setQueryText('');
    setSearchText(value);
    setPresetValue(value);

    const sortedData = sortObjectAlphabetically(historyData?.resource?.data);
    const PresetFieldOptions = presetFields?.find(
      (preset) => preset.value === value
    );
    const filteredData = filterDeepNestedObjectByFields(
      sortedData,
      PresetFieldOptions?.fields ?? []
    );
    const redactedData = redactSensitiveData(filteredData);

    const translatedData = addTranslationKey(redactedData);
    setHistoricalData(translatedData);
  };

  const updateSearchValue = debounce(() => {
    setSearchText(queryText);
  }, 1000);

  useEffect(() => {
    updateSearchValue();
  }, [queryText]);

  const handleResetClick = (type?: string) => {
    setCollapsedValue(1);
    setQueryText('');
    if (type !== 'search') {
      setPresetValue('');
    }
    const sortedData = sortObjectAlphabetically(historyData?.resource?.data);
    const redactedData = redactSensitiveData(sortedData);
    const translatedData = addTranslationKey(redactedData);

    setHistoricalData(translatedData);
  };

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    if ((e.target as HTMLInputElement).value) {
      setQueryText((e.target as HTMLInputElement).value);
    } else {
      handleResetClick('search');
    }
  };

  const handlePaste = (e: FormEvent<HTMLInputElement>) => {
    if ((e.target as HTMLInputElement)?.value) {
      setQueryText((e.target as HTMLInputElement).value);
    }
  };

  const handleClipboard = (copyData: { src: any }) => {
    if (typeof copyData.src === 'string') {
      copy(copyData.src.replaceAll('"', ''));
    } else if (typeof copyData.src === 'object') {
      copy(JSON.stringify(copyData.src));
    } else {
      copy(copyData.src);
    }
  };

  return (
    <div
      className="min-h-[300px] p-4 border border-solid border-borderColor rounded-md h-full"
      data-testid="lead-extra-json-details"
    >
      {isLoading && <Spinner />}
      {!isLoading && historyData?.resource?.data && (
        <div data-testid="json-response">
          <div className="flex flex-wrap items-center gap-1">
            {presetFields?.map((field) => (
              <Button
                key={field.value}
                text={field.title}
                className="p-3 !h-[40px]"
                onClick={() => handlePresetClick(field.value)}
                dataTestId={`preset-button-${field.value}`}
                disabled={presetValue === field.value}
              />
            ))}
            <Button
              variant="secondary"
              text={getString('text.reset')}
              className="p-3 !h-[40px]"
              onClick={() => handleResetClick()}
              dataTestId="preset-button-reset"
              disabled={!presetValue && !searchText && !queryText}
            />
            <Input
              value={queryText}
              onChange={handleInputChange}
              onPaste={handlePaste}
              dataTestId="search-input"
            />
          </div>
          <SearchableJSONView
            highlightSearch={searchText}
            src={historicalData}
            collapsed={collapsedValue}
            enableClipboard={(copyData: any) => handleClipboard(copyData)}
            displayDataTypes={false}
          />
        </div>
      )}
    </div>
  );
}

export default LeadHistoricalData;
