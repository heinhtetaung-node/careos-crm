import {
  FileSearchIcon,
  DownloadFileIcon,
  TrashIcon,
} from '@alphafounders/icons';
import { Fab as MuiButton } from '@material-ui/core';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import React from 'react';

import { render, ComponentWithProvider } from '__tests__/rtl-test-utils';
import { findCurrentDocument } from 'presentation/components/modal/FileBrowseModal';
import { getFieldTitle } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import { getString } from 'presentation/theme/localization';

import CustomUploadFile from './CustomUploadFile';
import { isValidFileType, showFormatFile } from './helper';

import { ButtonStyleSheet } from '../document.styles';
import { IUploadedDocument, FilesDownload } from '../DocumentSection';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({
    pathname: '/orders/7e9216af-1e3f-42ea-a5b9-17d1d53926a8g',
    search: '',
    state: undefined,
    hash: '',
  }),
}));

const Button = ButtonStyleSheet(MuiButton);
const document = {
  documentType: 'DOCUMENT_TYPE_VEHICLE_PICTURE_BACK',
  file: 'documents/2ccaf61a-659b-4f3b-ac57-4730d93f9882',
  fileName: 'vehiclePictureBack-Dash Cam Picture_&*.png',
  title: getString('leadDetailFields.vehiclePictureBack'),
  label: '',
};

function mockData(files: any) {
  return {
    dataTransfer: {
      files,
      items: files.map((file: any) => ({
        kind: 'file',
        type: file.type,
        getAsFile: () => file,
      })),
      types: ['Files'],
    },
  };
}

async function flushPromises(rerender: any, ui: any) {
  await act(() => waitFor(() => rerender(ui)));
}

function dispatchEvt(node: any, type: any, data: any) {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, data);
  fireEvent(node, event);
}

describe('<CustomUploadFile/>', () => {
  const downloadAction = jest.fn();
  const trashAction = jest.fn();
  const fileUploadAction = jest.fn();
  const previewAction = jest.fn();

  it('<CustomUploadFile/> show preview btn when there is document', () => {
    render(
      <ComponentWithProvider>
        <CustomUploadFile
          title=""
          value=""
          handleUpdateListFiles={jest.fn()}
          handleDeleteDocument={jest.fn()}
          listFiles={[] as FilesDownload[]}
          document={document}
          label=""
          documents={[] as IUploadedDocument[]}
        >
          {!document ? (
            <CustomUploadFile.AddButton>
              <Button
                data-testid="upload-btn"
                size="small"
                onClick={fileUploadAction}
              >
                <AddCircleOutlineIcon fontSize="small" color="primary" />
              </Button>
            </CustomUploadFile.AddButton>
          ) : (
            <CustomUploadFile.PreviewButton>
              <Button
                data-testid="preview-btn"
                size="small"
                onClick={previewAction}
              >
                <FileSearchIcon fontSize="small" color="primary" />
              </Button>
            </CustomUploadFile.PreviewButton>
          )}
          <CustomUploadFile.Content>
            <CustomUploadFile.Title>
              {getFieldTitle(document.title)}
            </CustomUploadFile.Title>
            {document && <CustomUploadFile.Dropzone />}
          </CustomUploadFile.Content>
          {document && (
            <CustomUploadFile.ActionButtons>
              <Button size="small" onClick={downloadAction}>
                <DownloadFileIcon fontSize="small" />
              </Button>
              <Button size="small" onClick={trashAction}>
                <TrashIcon fontSize="small" color="primary" />
              </Button>
            </CustomUploadFile.ActionButtons>
          )}
        </CustomUploadFile>
      </ComponentWithProvider>
    );

    const title = screen.getByText(getFieldTitle(document.title));
    const uploadBtn = screen.queryByTestId('upload-btn');
    const previewBtn = screen.queryByTestId('preview-btn');
    expect(title).toBeInTheDocument();
    expect(previewBtn).toBeInTheDocument();
    expect(uploadBtn).not.toBeInTheDocument();
  });
});

describe('<CustomUploadFile/> render props', () => {
  const renderProps = jest.fn();
  afterEach(() => renderProps.mockClear());
  it('<CustomUploadFile/> action buttons render props', () => {
    render(
      <ComponentWithProvider>
        <CustomUploadFile
          title=""
          value=""
          handleUpdateListFiles={jest.fn()}
          handleDeleteDocument={jest.fn()}
          listFiles={[] as FilesDownload[]}
          document={document}
          label=""
          documents={[] as IUploadedDocument[]}
        >
          <CustomUploadFile.ActionButtons>
            {renderProps}
          </CustomUploadFile.ActionButtons>
        </CustomUploadFile>
      </ComponentWithProvider>
    );

    expect(renderProps).toHaveBeenCalled();
  });

  it('<CustomUploadFile/> upload button render props', () => {
    const addButtonRenderProps = jest.fn(() => (
      <Button data-testid="upload-btn" size="small" onClick={jest.fn()}>
        <AddCircleOutlineIcon fontSize="small" color="primary" />
      </Button>
    ));
    render(
      <ComponentWithProvider>
        <CustomUploadFile
          title=""
          value=""
          handleUpdateListFiles={jest.fn()}
          handleDeleteDocument={jest.fn()}
          listFiles={[] as FilesDownload[]}
          document={document}
          label=""
          documents={[] as IUploadedDocument[]}
        >
          <CustomUploadFile.AddButton>
            {addButtonRenderProps}
          </CustomUploadFile.AddButton>
        </CustomUploadFile>
      </ComponentWithProvider>
    );

    expect(addButtonRenderProps).toHaveBeenCalled();
  });

  it('<CustomUploadFile/> preview button render props', () => {
    const previewButtonRenderProps = jest.fn(
      (props: { handleOpenCloseDialog: () => void }) => {
        jest.spyOn(props, 'handleOpenCloseDialog');
        return (
          <Button
            data-testid="preview-btn"
            size="small"
            onClick={props.handleOpenCloseDialog}
          >
            <FileSearchIcon fontSize="small" color="primary" />
          </Button>
        );
      }
    );
    render(
      <ComponentWithProvider>
        <CustomUploadFile
          title=""
          value=""
          handleUpdateListFiles={jest.fn()}
          handleDeleteDocument={jest.fn()}
          listFiles={[] as FilesDownload[]}
          document={document}
          label=""
          documents={[] as IUploadedDocument[]}
        >
          <CustomUploadFile.PreviewButton>
            {previewButtonRenderProps}
          </CustomUploadFile.PreviewButton>
        </CustomUploadFile>
      </ComponentWithProvider>
    );

    const previewBtn = screen.getByTestId('preview-btn');
    fireEvent.click(previewBtn);
    expect(previewButtonRenderProps).toHaveBeenCalled();
  });

  it('<CustomUploadFile/> title render props', () => {
    const titleRenderProps = jest.fn();
    render(
      <ComponentWithProvider>
        <CustomUploadFile
          title=""
          value=""
          handleUpdateListFiles={jest.fn()}
          handleDeleteDocument={jest.fn()}
          listFiles={[] as FilesDownload[]}
          label=""
          document={undefined}
          documents={[] as IUploadedDocument[]}
        >
          <CustomUploadFile.Title>{titleRenderProps}</CustomUploadFile.Title>
        </CustomUploadFile>
      </ComponentWithProvider>
    );
    expect(titleRenderProps).toHaveBeenCalled();
  });
});

describe('<CustomUploadFile/> test react dropzone', () => {
  it('<CustomUploadFile/> react dropzone', async () => {
    const file = new File([JSON.stringify({ ping: true })], 'ping.json', {
      type: 'application/json',
    });
    const data = mockData([file]);
    const onDragEnter = jest.fn();
    const ui = (
      <ComponentWithProvider>
        <CustomUploadFile
          title=""
          value=""
          handleUpdateListFiles={jest.fn()}
          handleDeleteDocument={jest.fn()}
          listFiles={[] as FilesDownload[]}
          document={document}
          label=""
          documents={[] as IUploadedDocument[]}
        >
          <CustomUploadFile.Dropzone onDragEnter={onDragEnter} />
        </CustomUploadFile>
      </ComponentWithProvider>
    );
    const { rerender, queryByTestId } = render(ui);

    const dropzone = queryByTestId('drop-zone');

    dispatchEvt(dropzone, 'dragenter', data);
    await flushPromises(rerender, ui);

    expect(onDragEnter).toHaveBeenCalled();
  });

  it("<CustomUploadFile/> doesn't allow to upload unsupported types", async () => {
    const file = new File(['file'], 'ping.json', {
      type: 'application/json',
    });
    const ui = (
      <ComponentWithProvider>
        <CustomUploadFile
          title=""
          value=""
          handleUpdateListFiles={jest.fn()}
          handleDeleteDocument={jest.fn()}
          listFiles={[] as FilesDownload[]}
          document={document}
          label=""
          documents={[] as IUploadedDocument[]}
        >
          <CustomUploadFile.Dropzone />
        </CustomUploadFile>
      </ComponentWithProvider>
    );
    const { queryByTestId } = render(ui);
    const input = queryByTestId('drop-input');
    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.drop(input as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByText('pine.json')).not.toBeInTheDocument();
    });
  });
});

describe("<CustomUploadFile/>'s file browse modal", () => {
  const ui = (
    <ComponentWithProvider>
      <CustomUploadFile
        title=""
        value=""
        handleUpdateListFiles={jest.fn()}
        handleDeleteDocument={jest.fn()}
        listFiles={[] as FilesDownload[]}
        document={document}
        label=""
        documents={[] as IUploadedDocument[]}
      >
        <CustomUploadFile.PreviewButton>
          {({ handleOpenCloseDialog }: any) => (
            <Button
              data-testid="preview-btn"
              size="small"
              onClick={handleOpenCloseDialog}
            >
              <FileSearchIcon fontSize="small" color="primary" />
            </Button>
          )}
        </CustomUploadFile.PreviewButton>
      </CustomUploadFile>
    </ComponentWithProvider>
  );

  it('<CustomUploadFile/> will show <FileBrowseModal/> when user click preview button', () => {
    // we have to use baseElement because dialog are render outside of this current wrapper
    const { baseElement, getByTestId } = render(ui);
    const previewBtn = getByTestId('preview-btn');
    fireEvent.click(previewBtn);
    expect(
      within(baseElement as HTMLElement).getByTestId('file-browse-modal')
    ).toBeInTheDocument();
  });

  it("<FileBrowseModal/>'s dropzone doesn't allow to upload unsupported file type", async () => {
    const file = new File(['file'], 'ping.json', {
      type: 'application/json',
    });

    const { baseElement, getByTestId } = render(ui);
    const previewBtn = getByTestId('preview-btn');
    fireEvent.click(previewBtn);

    const fileBrowseModal = within(baseElement as HTMLElement).getByTestId(
      'file-browse-modal'
    );
    const addBtn = within(fileBrowseModal).getAllByTestId('preview-add-btn')[0];

    fireEvent.click(addBtn);
    const input = within(fileBrowseModal).getByTestId('drop-input');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    fireEvent.drop(input as HTMLElement);
    await waitFor(() => {
      expect(screen.queryByText('pine.json')).not.toBeInTheDocument();
    });
  });
});

describe('findCurrentDocument', () => {
  const documents = [
    { label: 'idCard-idcardphoto.jpeg' },
    { label: 'dashCamPicture-dashcamphoto.jpeg' },
  ];

  it('findCurrentDocument find document based on label', () => {
    expect(
      findCurrentDocument(documents as IUploadedDocument[], 'idCard')
    ).toBeTruthy();
    expect(
      findCurrentDocument(documents as IUploadedDocument[], 'dashCamPicture')
    ).toBeTruthy();
    expect(
      findCurrentDocument(
        documents as IUploadedDocument[],
        'vehiclePictureBack'
      )
    ).toBeFalsy();
  });
});

describe('test isValidFileType, showFormatFile helper functions', () => {
  const fileNames = [
    'Test Image.jpeg',
    'Test Image.jpg',
    'Test Image.png',
    'Test PDF.pdf',
    'import-lead-fail (1).svg',
  ];

  const fileTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'image/svg+xml',
  ];

  it('showFormatFile show correct file type', () => {
    expect(showFormatFile(fileNames[0])).toBe('jpeg');
    expect(showFormatFile(fileNames[1])).toBe('jpg');
    expect(showFormatFile(fileNames[2])).toBe('png');
    expect(showFormatFile(fileNames[3])).toBe('pdf');
    expect(showFormatFile(fileNames[4])).toBe('svg');
  });

  it('isValidFileType return true for supported file type', () => {
    expect(isValidFileType(fileTypes[0])).toBe(true);
    expect(isValidFileType(fileTypes[1])).toBe(true);
    expect(isValidFileType(fileTypes[2])).toBe(true);
    expect(isValidFileType(fileTypes[3])).toBe(false);
  });
});
