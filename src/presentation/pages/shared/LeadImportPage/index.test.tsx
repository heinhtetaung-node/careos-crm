import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import FeatureFlags from 'config/flagsmithConfig';

import LeadImportPage from '.';

const mockDispatch = jest.fn();
const mockUseFlags = jest.fn();
const mockUseGetAuthenticateQuery = jest.fn();
const mockUseGetSourcesLeadServiceQuery = jest.fn();
const mockUseTableList = jest.fn();
const mockGetLeadSourceOptions = jest.fn();
const mockFormatE164 = jest.fn();

let latestImportModalProps: any = null;
let latestColumns: any[] = [];

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));

jest.mock('flagsmith/react', () => ({
  ...jest.requireActual('flagsmith/react'),
  useFlags: (...args: any[]) => mockUseFlags(...args),
}));

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: () => mockUseGetAuthenticateQuery(),
}));

jest.mock('data/slices/sourceSlices/sourceSlices', () => ({
  useGetSourcesLeadServiceQuery: (...args: any[]) =>
    mockUseGetSourcesLeadServiceQuery(...args),
}));

jest.mock('data/slices/importSlices', () => ({
  useLazyGetImportHistoryQuery: jest.fn(),
}));

jest.mock('presentation/hooks/useTableList', () => ({
  __esModule: true,
  default: (...args: any[]) => mockUseTableList(...args),
}));

jest.mock('presentation/components/controls/Control', () => ({
  __esModule: true,
  default: {
    Button: ({ text, onClick }: any) => (
      <button onClick={onClick} type="button">
        {text}
      </button>
    ),
    Autocomplete: ({ onChange }: any) => (
      <button
        data-testid="lead-source"
        onClick={() =>
          onChange({ target: { value: { name: 'sources/referral' } } })
        }
        type="button"
      >
        select-source
      </button>
    ),
  },
}));

jest.mock('presentation/components/modal/CommonModal', () => ({
  __esModule: true,
  default: ({ open, children, title }: any) =>
    open ? (
      <div data-testid={`modal-${title || 'blank'}`}>{children}</div>
    ) : null,
}));

jest.mock('presentation/components/modal/ImportModal', () => ({
  __esModule: true,
  default: (props: any) => {
    latestImportModalProps = props;
    return props.showModal ? (
      <div data-testid="import-modal">{props.CustomImportSuccessElements}</div>
    ) : null;
  },
}));

jest.mock('presentation/modules/addLead', () => ({
  __esModule: true,
  default: ({ callBackAddLead }: any) => (
    <button
      data-testid="complete-add-lead"
      onClick={() => callBackAddLead('leads/123')}
      type="button"
    >
      complete-add-lead
    </button>
  ),
}));

jest.mock('presentation/modules/addLeadSuccess', () => ({
  __esModule: true,
  default: ({ leadId }: any) => (
    <div data-testid="add-lead-success">{leadId}</div>
  ),
}));

jest.mock('presentation/modules/addLead/addLead.helper', () => ({
  getLeadSourceOptions: (...args: any[]) => mockGetLeadSourceOptions(...args),
}));

jest.mock('presentation/redux/actions/page', () => ({
  destroyPage: () => ({ type: 'DESTROY_PAGE' }),
}));

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

jest.mock('shared/helper/utilities', () => ({
  formatE164: (...args: any[]) => mockFormatE164(...args),
}));

describe('shared LeadImportPage', () => {
  beforeEach(() => {
    latestImportModalProps = null;
    latestColumns = [];
    mockDispatch.mockReset();
    mockUseFlags.mockReset();
    mockUseGetAuthenticateQuery.mockReset();
    mockUseGetSourcesLeadServiceQuery.mockReset();
    mockUseTableList.mockReset();
    mockGetLeadSourceOptions.mockReset();
    mockFormatE164.mockReset();

    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_316_HIDE_PRODUCT_COLUMN_ON_LEAD_IMPORT_PAGE_20241119_TEMP]:
        { enabled: false },
    });
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'roles/admin' },
    });
    mockUseGetSourcesLeadServiceQuery.mockReturnValue({
      data: [{ name: 'sources/referral', source: 'Referral' }],
      isLoading: false,
    });
    mockGetLeadSourceOptions.mockReturnValue([
      { name: 'sources/referral', source: 'Referral' },
    ]);
    mockUseTableList.mockImplementation((_tableName, columns) => {
      latestColumns = columns;
      return {
        TableComponent: () => <div data-testid="table-component" />,
        TopComponent: () => <div data-testid="top-component" />,
      };
    });
    mockFormatE164.mockImplementation(
      (phoneNumber) => `formatted:${phoneNumber}`
    );
  });

  const renderPage = (
    canCreateLead: (role: string) => boolean = (role: string) =>
      role === 'roles/admin'
  ) =>
    render(
      <LeadImportPage
        canCreateLead={canCreateLead}
        historyFilter={'product="products/car-insurance"'}
        sourceFilter={{
          filter: 'product in ("products/car-insurance")',
          pageSize: 100,
        }}
        tableName="leads"
        validationProps={{
          maximumUpload: 10000,
          requiredColumns: ['First Name'],
          template: ['First Name', 'Phone'],
          templateWithType: [
            { name: 'First Name', dataType: 'string' },
            { name: 'Phone', dataType: 'number' },
          ],
        }}
      />
    );

  it('renders create actions, updates import payload, and downloads the template', () => {
    const createdLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      remove: jest.fn(),
    };
    const originalCreateElement = document.createElement.bind(document);
    const originalAppendChild = document.body.appendChild.bind(document.body);
    const createElementSpy = jest
      .spyOn(document, 'createElement')
      .mockImplementation(((tagName: string) =>
        tagName === 'a'
          ? (createdLink as any)
          : originalCreateElement(tagName)) as typeof document.createElement);
    const appendChildSpy = jest
      .spyOn(document.body, 'appendChild')
      .mockImplementation(((node: Node) =>
        node === (createdLink as unknown as Node)
          ? (createdLink as unknown as Node)
          : originalAppendChild(node)) as typeof document.body.appendChild);

    renderPage();

    expect(latestColumns.some((column) => column.id === 'product')).toBe(true);
    expect(screen.getByText('text.addLead')).toBeInTheDocument();
    expect(screen.getByText('text.importLead')).toBeInTheDocument();

    fireEvent.click(screen.getByText('text.template'));
    expect(createdLink.setAttribute).toHaveBeenCalledWith(
      'download',
      'template.csv'
    );
    expect(createdLink.setAttribute).toHaveBeenCalledWith(
      'href',
      'data:text/plain;charset=utf-8,First Name,Phone'
    );
    expect(appendChildSpy).toHaveBeenCalledWith(createdLink);
    expect(createdLink.click).toHaveBeenCalled();
    expect(createdLink.remove).toHaveBeenCalled();

    fireEvent.click(screen.getByText('text.importLead'));
    expect(screen.getByTestId('import-modal')).toBeInTheDocument();
    expect(latestImportModalProps.btnDisabled).toBe(true);
    expect(
      latestImportModalProps.transformResultFn({ Phone: 812345678 }).Phone
    ).toBe('formatted:812345678');
    expect(
      latestImportModalProps.transformResultFn({ Phone: '0812345678' }).Phone
    ).toBe('0812345678');

    fireEvent.click(screen.getByTestId('lead-source'));
    expect(latestImportModalProps.btnDisabled).toBe(false);
    expect(latestImportModalProps.payloadData).toEqual({
      leadDetails: {
        source: 'sources/referral',
      },
    });

    fireEvent.click(screen.getByText('text.addLead'));
    fireEvent.click(screen.getByTestId('complete-add-lead'));
    expect(screen.getByTestId('add-lead-success')).toHaveTextContent(
      'leads/123'
    );

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });

  it('hides create actions and the product column when the flag is enabled or role is not allowed', () => {
    mockUseFlags.mockReturnValue({
      [FeatureFlags.BROK_316_HIDE_PRODUCT_COLUMN_ON_LEAD_IMPORT_PAGE_20241119_TEMP]:
        { enabled: true },
    });
    mockUseGetAuthenticateQuery.mockReturnValue({
      data: { role: 'roles/agent' },
    });

    renderPage(() => false);

    expect(latestColumns.some((column) => column.id === 'product')).toBe(false);
    expect(screen.queryByText('text.addLead')).not.toBeInTheDocument();
    expect(screen.queryByText('text.importLead')).not.toBeInTheDocument();
    expect(screen.getByText('text.template')).toBeInTheDocument();
  });
});
