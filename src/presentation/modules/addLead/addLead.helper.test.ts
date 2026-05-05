import {
  LEAD_SOURCE_EXCLUDED_FROM_OPTIONS,
  getLeadSourceOptions,
} from './addLead.helper';

describe('addLead.helper', () => {
  describe('LEAD_SOURCE_EXCLUDED_FROM_OPTIONS', () => {
    it('is "Change - Online"', () => {
      expect(LEAD_SOURCE_EXCLUDED_FROM_OPTIONS).toBe('Change - Online');
    });
  });

  describe('getLeadSourceOptions', () => {
    it('returns empty array for undefined or null sources', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getLeadSourceOptions(undefined as any)).toEqual([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(getLeadSourceOptions(null as any)).toEqual([]);
    });

    it('returns empty array for empty array', () => {
      expect(getLeadSourceOptions([])).toEqual([]);
    });

    it('maps sources to options with id, title, value, source, name', () => {
      const sources = [
        { source: 'Car Widget', name: 'sources/abc' },
        { source: 'Facebook', name: 'sources/def' },
      ];
      expect(getLeadSourceOptions(sources)).toEqual([
        {
          id: 'Car Widget',
          title: 'Car Widget',
          value: 'sources/abc',
          source: 'Car Widget',
          name: 'sources/abc',
        },
        {
          id: 'Facebook',
          title: 'Facebook',
          value: 'sources/def',
          source: 'Facebook',
          name: 'sources/def',
        },
      ]);
    });

    it('filters out "Change - Online"', () => {
      const sources = [
        { source: 'Car Widget', name: 'sources/abc' },
        { source: 'Change - Online', name: 'sources/change-online' },
        { source: 'Facebook', name: 'sources/def' },
      ];
      expect(getLeadSourceOptions(sources)).toEqual([
        {
          id: 'Car Widget',
          title: 'Car Widget',
          value: 'sources/abc',
          source: 'Car Widget',
          name: 'sources/abc',
        },
        {
          id: 'Facebook',
          title: 'Facebook',
          value: 'sources/def',
          source: 'Facebook',
          name: 'sources/def',
        },
      ]);
    });

    it('filters out all "Change - Online" when multiple', () => {
      const sources = [
        { source: 'Change - Online', name: 'sources/a' },
        { source: 'Change - Online', name: 'sources/b' },
      ];
      expect(getLeadSourceOptions(sources)).toEqual([]);
    });

    it('uses 0-based indices for id after filtering', () => {
      const sources = [
        { source: 'Change - Online', name: 'sources/excluded' },
        { source: 'Kept', name: 'sources/kept' },
      ];
      expect(getLeadSourceOptions(sources)).toEqual([
        {
          id: 'Kept',
          title: 'Kept',
          value: 'sources/kept',
          source: 'Kept',
          name: 'sources/kept',
        },
      ]);
    });

    it('uses empty string for missing source or name', () => {
      const sources = [
        { source: 'Only source', name: undefined },
        { source: undefined, name: 'sources/name-only' },
      ];
      expect(getLeadSourceOptions(sources)).toEqual([
        {
          id: 'Only source',
          title: 'Only source',
          value: '',
          source: 'Only source',
          name: '',
        },
        {
          id: 'sources/name-only',
          title: '',
          value: 'sources/name-only',
          source: '',
          name: 'sources/name-only',
        },
      ]);
    });
  });
});
