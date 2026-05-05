import { buildFilter, hasLeadStatusFilter, getQueryParts } from '..';

test('Test buildFilter filters null', () => {
  const path = [
    {
      filter: 'test',
      type: 'string',
    },
  ];
  const output: any[] = [];
  expect(buildFilter(null, path)).toEqual(output);
});

describe('hasLeadStatusFilter', () => {
  it('returns true', () => {
    expect(
      hasLeadStatusFilter([
        'lead.type in ("LEAD_TYPE_NEW")',
        'lead.status in ("LEAD_STATUS_NEW")',
      ])
    ).toBeTruthy();
  });

  it('returns false', () => {
    expect(hasLeadStatusFilter(['lead.type in ("LEAD_TYPE_NEW")'])).toBeFalsy();
  });
});

describe('getQueryParts when user is in rejection page', () => {
  const savedLocation = window.location;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global.window.location;
    global.window.location = {
      href: '/leads/assignments',
    } as any;
  });

  afterEach(() => {
    window.location = savedLocation;
  });

  it('returns the query params', () => {
    expect(
      getQueryParts(
        'product/car-insurance',
        [
          'lead.type in ("LEAD_TYPE_NEW")',
          'lead.status in ("LEAD_STATUS_NEW")',
        ],
        15,
        1,
        'order_by=lead.createTime desc',
        false
      )
    ).toEqual(
      expect.arrayContaining([
        'product=product/car-insurance',
        'page_size=15',
        'filter=lead.type in ("LEAD_TYPE_NEW") lead.status in ("LEAD_STATUS_NEW") lead.isRejected!%3Dtrue',
        'order_by=lead.createTime desc',
      ])
    );
  });

  it('returns the query params including the default filter when not filtered with lead status', () => {
    expect(
      getQueryParts(
        'product/car-insurance',
        ['lead.type in ("LEAD_TYPE_NEW")'],
        15,
        1,
        'order_by=lead.createTime desc',
        false
      )
    ).toEqual(
      expect.arrayContaining([
        'product=product/car-insurance',
        'page_size=15',
        'filter=lead.type in ("LEAD_TYPE_NEW") lead.status!="LEAD_STATUS_PURCHASED" lead.isRejected!%3Dtrue',
        'order_by=lead.createTime desc',
      ])
    );
  });
});
