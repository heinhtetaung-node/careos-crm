import React from 'react';

import { render, waitFor } from '__tests__/rtl-test-utils';
import csvValidationErrors from 'shared/helper/csvValidationErrors';
import { ImportType } from 'shared/constants/importFile';

import CsvValidation from './CsvValidation';

jest.mock('shared/helper/csvValidationErrors', () => jest.fn(() => []));

const mockCsvValidationErrors = csvValidationErrors as jest.MockedFunction<
  typeof csvValidationErrors
>;

describe('CsvValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards optional and forbidden columns to CSV validation', async () => {
    const file = {
      fileName: 'leads.csv',
      name: 'leads.csv',
      fileType: 'text/csv',
      fileSize: 100,
      result: [{ Phone: '+66812345678', 'Redbook ID': 'RB1' }],
    };

    render(
      <CsvValidation
        checkError={jest.fn()}
        csvName="lead import"
        file={file}
        importModalType={ImportType.Lead}
        isErrorCheck
        optionalColumns={['Redbook ID']}
        requiredColumns={['Phone']}
        shouldNotHaveColumns={['Redbook ID']}
        template={['Phone', 'Redbook ID']}
      />
    );

    await waitFor(() => {
      expect(mockCsvValidationErrors).toHaveBeenCalledWith(
        expect.objectContaining({
          optionalColumns: ['Redbook ID'],
          shouldNotHaveColumns: ['Redbook ID'],
        })
      );
    });
  });
});
