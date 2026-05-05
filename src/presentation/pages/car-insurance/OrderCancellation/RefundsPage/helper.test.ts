import {
  filterFields,
  getFilterPanelQueryString,
  tableColumns,
  fieldMapper,
  matchField,
} from './helper';

describe('helper module', () => {
  describe('filterFields', () => {
    it('should be defined and an array', () => {
      expect(filterFields).toBeDefined();
      expect(Array.isArray(filterFields)).toBe(true);
    });
  });

  describe('getFilterPanelQueryString', () => {
    it('should return an empty string for empty input', () => {
      expect(getFilterPanelQueryString({} as any)).toBe('');
    });

    it('should return correct query string for given filters', () => {
      // Use filters and fieldMapper that actually match your implementation
      const filters = {
        status: [{ value: 'PENDING' }],
        refundMethod: [{ value: 'BANK' }],
      };
      const result = getFilterPanelQueryString({ filters } as any);
      expect(typeof result).toBe('string');
      expect(result).toContain('PENDING');
      expect(result).toContain('BANK');
    });

    it('should format phone number when search field is customerPhone', () => {
      const filters = {
        search: {
          inputValue: '0812345678',
          selectValue: 'attributes.customerPhone.keyword',
        },
      };

      const result = getFilterPanelQueryString({ filters } as any);

      expect(result).toBe('attributes.customerPhone.keyword="+66812345678"');
    });

    it('should not format phone number for other search fields', () => {
      const originalValue = '12345';
      const filters = {
        search: {
          inputValue: originalValue,
          selectValue: 'refund.humanId',
        },
      };

      getFilterPanelQueryString({ filters } as any);

      // Verify phone formatting was not applied
      expect(filters.search.inputValue).toBe(originalValue);
    });
  });

  describe('tableColumns', () => {
    it('loop table columns should have correct structure', () => {
      const columns = tableColumns();
      columns.forEach((column) => {
        expect(column).toHaveProperty('field');
        console.log(`Testing column: ${column.field}`);
        const columnWithTransform = [
          {
            field: 'productType',
            value: ['products/car-insurance', 'products/health-insurance', ''],
          },
          { field: 'refundMethod', value: 'BANK_TRANSFER' },
          { field: 'bankName', value: 'banks/18' },
        ].find(({ field }) => field === column.field);
        if (columnWithTransform) {
          expect(typeof column.transform).toBe('function');
          if (typeof column.transform === 'function') {
            const result = column.transform({
              data: {
                [columnWithTransform.field]: columnWithTransform.value,
              },
            });
            expect(typeof result).toBe('string');
          }
        }
      });
    });
  });

  describe('fieldMapper', () => {
    it('should map known filter names', () => {
      // fieldMapper uses 'filter' property for lookup, not 'field'
      expect(fieldMapper.find((f) => f.filter === 'status')).toBeDefined();
      expect(
        fieldMapper.find((f) => f.filter === 'unknownField')
      ).toBeUndefined();
    });
  });

  describe('matchField', () => {
    it('should return mapping object for matching fields', () => {
      // matchField returns the mapping object, so check for object not undefined
      expect(matchField('status', 'status')).toBeDefined();
      const result = matchField('status', 'status');
      expect(result.filter).toBe('status');
      expect(result.type).toBe('match');
      expect(result.field).toBe('status');
      expect(typeof result.callback).toBe('function');
      expect(result.callback({ value: 'test' })).toBe('test');
    });
  });
});
