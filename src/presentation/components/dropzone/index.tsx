/* eslint-disable react/forbid-component-props */
/* eslint-disable react/destructuring-assignment */
import { SuccessIcon } from '@alphafounders/icons';
import { parse } from 'papaparse';
import React, { useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';

import { setFile } from 'presentation/redux/actions/importFile';
import { getString } from 'presentation/theme/localization';
import { ImportType } from 'shared/constants/importFile';

import { ImportLead } from '../icons';

const SharedDropzone = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 180px;
  margin-top: 20px;
  border: 1px dashed ${({ theme }) => theme.palette.info.main};
  border-radius: 4px;

  .placeholder-image {
    width: 70px;
    border-radius: 50%;
    height: 70px;
    background-color: #e0e0e0;
  }

  p {
    margin-bottom: 0;
  }

  .container {
    .dropzone {
      border: none;
    }
  }
`;

// eslint-disable-next-line react/function-component-definition
const DefaultDropzone: React.FC<any> = (props: any) => {
  const onDrop = useCallback((acceptedFiles: any[]) => {
    acceptedFiles.map((file: any) => {
      if (props.setCsvFile) {
        props.setCsvFile(file);
      }
      file.text().then((res: any) => {
        const result = parse(res, {
          skipEmptyLines: true,
          header: props.importModalType !== ImportType.Discounts,
        });
        let errorType = '';
        if (
          result.errors.length &&
          (result.errors[0].type !== 'Delimiter' ||
            result.meta.fields?.length !== 1)
        ) {
          errorType = result.errors[0].type;
        }
        const data = {
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size,
          result: props.transformResult
            ? result.data.map(props.transformResult)
            : result.data,
          errorFileMessage: errorType,
        };
        props.setFile(data);
      });
      return (
        <li key={file.path}>
          <strong>Name:</strong>
          {file.path}
        </li>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false,
  });

  const getSrcUrl = useMemo(() => {
    if (props.importStatus === 'success') {
      return <SuccessIcon />;
    }

    return <ImportLead />;
  }, [props.importStatus]);

  return (
    <SharedDropzone {...getRootProps()} style={{ cursor: 'pointer' }}>
      <input
        {...getInputProps()}
        data-testid="file-drop-input"
        accept="text/csv"
      />
      <div>
        {getSrcUrl}

        {isDragActive ? (
          <p>{` ${getString('text.dropFilesHere')}...`}</p>
        ) : (
          <p>{getString('text.selectFiles')}</p>
        )}
      </div>
    </SharedDropzone>
  );
};

const mapStateToProps = (state: any) => ({ propsData: state });
const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators({ setFile }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(DefaultDropzone);
