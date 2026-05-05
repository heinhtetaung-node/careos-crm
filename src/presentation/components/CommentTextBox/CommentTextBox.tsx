import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper as MuiPaper,
  Tab,
  Tabs,
  TextareaAutosize,
  Typography,
  withTheme,
} from '@material-ui/core';
import _get from 'lodash/get';
import has from 'lodash/has';
import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';

import { UserRoles } from 'config/constant';
import { useGetAuthenticateQuery } from 'data/slices/authSlice';
import { useAddCommentMutation } from 'data/slices/leadDetails/commentsSlice';
import {
  resetScripts,
  addMoreScripts,
  useGenerateScriptMutation,
  useSaveScriptMutation,
  useLazyFetchScriptsQuery,
} from 'data/slices/leadDetails/scriptSlice';
import DocumentSection from 'presentation/components/ActivityOrderSection/DocumentSection';
import { resetCommentsScrollbar } from 'presentation/hooks/getComment';
import { uploadDocument } from 'presentation/redux/actions/document';
import { addRemark } from 'presentation/redux/actions/leadDetail/remark';
import {
  createDocumentLead,
  deleteDocumentLead,
  getDocumentLead,
} from 'presentation/redux/actions/leads/upload';
import { showSnackBar } from 'presentation/redux/actions/ui';
import * as CONSTANTS from 'shared/constants';
import { handleGenericStructureError } from 'shared/helper/ErrorHelper';
import { getUserRoleAccessLead } from 'utils/userRolesAccess';

import { getString } from '../../theme/localization';
import { isScrollTop$ } from '../controls/Services/serviceHandleScroll';

interface TabPanelProps {
  children?: React.ReactNode | undefined;
  dir?: string | undefined;
  index: any;
  value: any;
}

type NewComment = {
  text: string;
  leadId: string;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.defaultProps = {
  children: null,
  dir: null,
};

type remarkPayload = {
  leadId: string;
  remark: string;
};

interface Props {
  isUpdatingRemark: boolean;
  loading: boolean;
  leadID: string;
  documentName: string;
  uploadedDocuments: any;
  uploadDocument: (payload: any) => void;
  createDocumentLead: (payload: any) => void;
  deleteDocumentLead: (payload: any) => void;
  getDocumentLead: (payload: any) => void;
  addRemarkAction: (params: remarkPayload) => void;
  isFieldDisabled?: boolean;
}

enum TabValue {
  Comment = 0,
  Remark = 1,
  Script = 2,
  Document = 3,
}

const Paper = withTheme(styled(MuiPaper)`
  &&& {
    box-shadow: none;
    border-top: 1px solid ${({ theme }) => theme.border.color};
    border-bottom: 1px solid ${({ theme }) => theme.border.color};
  }
`);

function CommentTextBox({
  isUpdatingRemark,
  loading,
  leadID,
  documentName,
  uploadedDocuments,
  uploadDocument: handleUploadDocument,
  createDocumentLead: handleCreateDocumentLead,
  deleteDocumentLead: handleDeleteDocumentLead,
  getDocumentLead: handleGetDocumentLead,
  addRemarkAction,
}: Props) {
  const [fetchScripts] = useLazyFetchScriptsQuery();

  const dispatchHook = useDispatch();
  const location = useLocation();
  const [value, setValue] = useState(0);
  const [comment, setComment] = useState('');
  const [remark, setRemark] = useState('');
  const [script, setScript] = useState('');
  const [params, setParams] = useState<any>(null);
  const { data: user } = useGetAuthenticateQuery();
  const { canComment } = getUserRoleAccessLead(user?.role as UserRoles);

  const [addComment, { isSuccess: commentAdded, error: addCommentFailed }] =
    useAddCommentMutation();
  const [
    saveScript,
    {
      isLoading: saveScriptLoading,
      isSuccess: scriptAdded,
      error: saveScriptError,
    },
  ] = useSaveScriptMutation();
  const [getScript, { isLoading: generateScriptLoading }] =
    useGenerateScriptMutation();

  useEffect(() => {
    handleGetDocumentLead(leadID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (commentAdded) {
      setComment('');
    }

    if (scriptAdded) {
      setScript('');
    }
  }, [commentAdded, scriptAdded]);

  useEffect(() => {
    if (addCommentFailed) {
      dispatchHook(
        showSnackBar({
          isOpen: true,
          message: addCommentFailed.toString(),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }

    if (saveScriptError) {
      dispatchHook(
        showSnackBar({
          isOpen: true,
          message: saveScriptError.toString(),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addCommentFailed, saveScriptError]);

  useEffect(() => {
    if (isUpdatingRemark) {
      setRemark('');
    }
  }, [isUpdatingRemark]);

  useEffect(() => {
    if (documentName && params?.type) {
      handleCreateDocumentLead({
        params: {
          ...params,
          document: documentName,
        },
        parents: leadID,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentName]);

  const handleChangeComment = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const commentValue = event.target.value;
    setComment(commentValue);
  };

  const handleChangeRemark = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const remarkValue = event.target.value;
    setRemark(remarkValue);
  };

  const handleChangeScript = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const scriptVal = event.target.value;
    setScript(scriptVal);
  };

  const handleSubmit = async () => {
    const leadId = location.pathname.split('leads/')[1];
    const payload: NewComment = {
      text: '',
      leadId,
    };

    if (value === TabValue.Comment) {
      payload.text = comment.trim();
      payload.leadId = `leads/${payload.leadId}`;
      await addComment(payload);
      isScrollTop$.next(true);
      resetCommentsScrollbar();
      return;
    }

    if (value === TabValue.Script) {
      // reset the scripts
      dispatchHook(resetScripts());

      payload.text = script.trim();
      payload.leadId = `leads/${payload.leadId}`;
      await saveScript(payload);

      // fetch the new ones:
      const response = await fetchScripts({
        leadId: payload.leadId,
        scriptParams: { pageToken: '', pageSize: 2 },
      });

      if (response && has(response, 'data')) {
        dispatchHook(
          addMoreScripts({
            scripts: response.data?.scripts,
            nextPageToken: response.data?.nextPageToken,
          })
        );
      }

      isScrollTop$.next(true);
      return;
    }

    if (value === TabValue.Remark) {
      addRemarkAction({ leadId, remark: remark.trim() });
      isScrollTop$.next(true);
      return;
    }

    isScrollTop$.next(true);
  };

  const handleGenerateScript = async () => {
    const response = await getScript(leadID);
    if ('error' in response) {
      const errorResponse: any = _get(response, 'error.data.details');
      const errorMessage: string[] =
        handleGenericStructureError(errorResponse) ??
        _get(response, 'error.data.message', getString('clipboard.apiFailure'));
      dispatchHook(
        showSnackBar({
          isOpen: true,
          message: errorMessage.join('. '),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else {
      setScript(response.data?.script ?? '');
    }
  };

  const handleChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setValue(newValue);
  };

  const getCurrentDoc = (label: string) => {
    const currentDoc = uploadedDocuments.filter(
      (doc: any) => doc.label === label
    );
    if (!currentDoc[0]) return null;
    return currentDoc[0];
  };

  const onDeleteDocumentLead = (label: string) => {
    const document = getCurrentDoc(label);
    if (document) handleDeleteDocumentLead(document.name);
  };

  const onUploadDocument = (fileUpload: any) => {
    setParams({
      type: fileUpload?.documentType,
      label: `${fileUpload?.label}-${fileUpload?.fileName}`,
    });
    handleUploadDocument({
      contentType: fileUpload?.file.type,
      displayName: fileUpload?.fileName,
      file: fileUpload?.file,
      size: 'MEDIUM',
    });
  };

  return (
    <Paper
      square
      className="shared-comment-text-box"
      data-testid="comment-text-box-main"
    >
      {loading && (
        <div className="back-drop">
          <CircularProgress color="inherit" size={20} />
        </div>
      )}
      <AppBar
        position="static"
        color="transparent"
        className="shared-comment-text-box__app-bar"
      >
        <Tabs
          className="shared-comment-text-box__tab-header"
          value={value}
          indicatorColor="primary"
          onChange={handleChange}
          aria-label="disabled tabs example"
        >
          <Tab
            label={getString('lead.comment')}
            color="primary"
            className="unittest-tab-comment tab-comment-btn"
            value={TabValue.Comment}
          />
          <Tab
            label={getString('lead.remark')}
            className="unittest-tab-comment tab-comment-btn"
            value={TabValue.Remark}
          />
          <Tab
            label={getString('lead.script')}
            className="unittest-tab-comment tab-comment-btn"
            value={TabValue.Script}
          />
          <Tab
            label={getString('lead.document')}
            className="unittest-tab-comment tab-comment-btn"
            value={TabValue.Document}
          />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={TabValue.Comment}>
        <TextareaAutosize
          data-testid="comment-input"
          className="shared-comment-text-box__text-area unittest-text-area-comment"
          value={comment}
          onChange={handleChangeComment}
          aria-label="empty textarea"
          minRows={5}
          disabled={!canComment}
        />
      </TabPanel>
      <TabPanel value={value} index={TabValue.Remark}>
        <TextareaAutosize
          data-testid="remark-input"
          className="shared-comment-text-box__text-area"
          value={remark}
          onChange={handleChangeRemark}
          aria-label="empty textarea"
          minRows={5}
          disabled={!canComment}
        />
      </TabPanel>
      <TabPanel value={value} index={TabValue.Script}>
        <TextareaAutosize
          data-testid="script-input"
          className="shared-comment-text-box__text-area"
          value={script}
          onChange={handleChangeScript}
          aria-label="empty textarea"
          minRows={5}
          maxRows={5}
          disabled={!canComment}
        />
      </TabPanel>
      <TabPanel value={value} index={TabValue.Document}>
        <DocumentSection
          handleUploadDocument={onUploadDocument}
          handleDeleteDocument={onDeleteDocumentLead}
          documents={uploadedDocuments}
          isDisabled={!canComment}
        />
      </TabPanel>
      {value !== TabValue.Document && (
        <Grid className="shared-comment-text-box__btn-container">
          {value === TabValue.Script && (
            <Button
              color="primary"
              variant="contained"
              className="shared-comment-text-box__btn unittest-text-box-btn bg-primary text-white mx-3"
              disabled={generateScriptLoading || !canComment}
              onClick={handleGenerateScript}
            >
              {generateScriptLoading ? (
                <CircularProgress className="text-white" size={25} />
              ) : (
                getString('text.generate')
              )}
            </Button>
          )}
          <Button
            color="primary"
            variant="contained"
            className="shared-comment-text-box__btn unittest-text-box-btn bg-primary text-white"
            disabled={
              (value === TabValue.Comment && comment.length <= 0) ||
              (value === TabValue.Remark && remark.length <= 0) ||
              (value === TabValue.Script && script.length <= 0) ||
              !canComment ||
              saveScriptLoading
            }
            onClick={handleSubmit}
          >
            {getString('text.save')}
          </Button>
        </Grid>
      )}
    </Paper>
  );
}

const mapStateToProps = (state: any) => ({
  isUpdatingRemark: state.leadsDetailReducer.remarkReducer.isFetching,
  loading: state.leadsDetailReducer.commentReducer.data.loading,
  documentName: state.documentReducer.data?._data?.document.name || '',
  leadID: state.leadsDetailReducer.lead.payload.name,
  uploadedDocuments: state.leadsReducer.createDocumentReducer.documents || [],
});

const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      addRemarkAction: addRemark,
      uploadDocument,
      createDocumentLead,
      deleteDocumentLead,
      getDocumentLead,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(CommentTextBox);
