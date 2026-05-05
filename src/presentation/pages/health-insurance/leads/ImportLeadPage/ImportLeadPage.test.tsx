import { render } from '@testing-library/react';
import React from 'react';

import { PRODUCTS } from 'config/TypeFilter';

import ImportLeadPage from '.';

const mockLeadImportPage = jest.fn(() => (
  <div data-testid="shared-lead-import-page" />
));

jest.mock('presentation/pages/shared/LeadImportPage', () => ({
  __esModule: true,
  default: (props: any) => mockLeadImportPage(props),
}));

describe('health LeadImportPage', () => {
  beforeEach(() => {
    mockLeadImportPage.mockClear();
  });

  it('passes the expected health import configuration to the shared page', () => {
    render(<ImportLeadPage />);

    expect(mockLeadImportPage).toHaveBeenCalled();
    expect(mockLeadImportPage.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        tableName: 'healthLeadImport',
        historyFilter: `product="${PRODUCTS.HEALTH_PRODUCT_INSURANCE}"`,
        sourceFilter: {
          filter: `product="${PRODUCTS.HEALTH_PRODUCT_INSURANCE}"`,
          pageSize: 100,
        },
        validationProps: expect.objectContaining({
          maximumUpload: 10000,
          requiredColumns: ['First Name', 'Last Name', 'Phone'],
          shouldNotHaveColumns: ['Redbook ID'],
        }),
      })
    );
  });
});
