import { Grid, FormControl } from '@material-ui/core';
import clsx from 'clsx';
import { Form, Formik } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import React, { useState, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Source, Hide } from 'mock-data/LeadSourceSelect.mock';
import Controls from 'presentation/components/controls/Control';
import { getLocaleOptions } from 'presentation/pages/car-insurance/leads/LeadSourcePage/leadSourceHelper';
import {
  createLeadSources,
  updateLeadSources,
  getLeadSourceScore,
  clearSourceScore,
} from 'presentation/redux/actions/leads/sources';
import { getProductSelectorTypes } from 'presentation/redux/actions/typeSelector/product';
import { hideModal } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { ILeadSources } from 'shared/interfaces/common/lead/sources';

import {
  getInitialLeadSources,
  createValidationSchema,
} from './sourceModal.helper';

import './index.scss';

interface AddtionalParams {
  score: number;
  scoreName?: string;
}

interface ICreateLeadSourcesProps {
  data: any;
  // TODO: Remove type any
  close: any;
  isEdit?: boolean;
  score: any;
  globalProduct: string;
  hideModal: (payload: string) => void;
  getProductSelectorTypes: () => void;
  createLeadSources: (
    payload: ILeadSources,
    additional: AddtionalParams
  ) => void;
  updateLeadSources: (
    payload: ILeadSources,
    additional: AddtionalParams
  ) => void;
  getLeadSourceScore: (payload: string) => void;
  clearSourceScore: () => void;
}

function SourceModal({
  data,
  close,
  isEdit,
  score,
  globalProduct,
  hideModal: handleHideModal,
  createLeadSources: handleCreateLeadSources,
  getProductSelectorTypes: handleGetProductSelectorTypes,
  updateLeadSources: handleUpdateLeadSources,
  getLeadSourceScore: handleGetLeadSourceScore,
  clearSourceScore: handleClearSourceScore,
}: ICreateLeadSourcesProps) {
  const [isDisabled] = useState(true);
  const [leadSources, setLeadSources] = useState<ILeadSources>();

  const closeModal = () => {
    close?.();
    handleHideModal(CONSTANTS.ModalConfig.leadSourcesModal);
  };

  const handleGetTypeSelector = () => {
    handleGetProductSelectorTypes();
  };

  useEffect(() => {
    handleGetTypeSelector();
    return () => {
      handleClearSourceScore();
    };
  }, []);

  useEffect(() => {
    if (isEdit && score) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const _clone = { ...cloneDeep(leadSources)!, score };
      setLeadSources(_clone);
    }
  }, [score]);

  useMemo(() => {
    if (isEdit) {
      // INFO: Selected row
      const { name } = data;
      setLeadSources({
        ...data,
        score: '',
      });
      handleGetLeadSourceScore(`scores/${name}`);
      return;
    }
    setLeadSources(getInitialLeadSources());
  }, []);

  const createFormSchema = () => createValidationSchema();

  const handleSubmit = (values: any) => {
    const payload: ILeadSources = {
      product: globalProduct,
      hidden: values.hidden === 'true',
      source: values.source,
      online: false,
    };

    if (isEdit) {
      payload.name = values.name;
      handleUpdateLeadSources(payload, {
        score: values.score,
        scoreName: `scores/${values.name}`,
      });
    } else {
      handleCreateLeadSources(payload, {
        score: values.score,
      });
    }
    close?.();
  };

  const localeHideSelectOptions = getLocaleOptions(Hide, 'title');

  return (
    <Formik
      enableReinitialize
      initialValues={leadSources as ILeadSources}
      onSubmit={handleSubmit}
      validationSchema={createFormSchema}
    >
      {(props) => {
        const { values, dirty, isValid, handleChange } = props;
        return (
          <Form className="lead-source-form">
            <Grid item xs={12} md={12} className="lead-source-modal">
              <FormControl
                className="relative z-[1000]"
                margin="normal"
                required
              >
                <Controls.Input
                  name="source"
                  label={getString('text.source')}
                  value={values.source}
                  onChange={handleChange}
                  options={Source}
                  selectField="title"
                />
              </FormControl>

              <FormControl
                margin="normal"
                required
                className="relative  z-[1000]"
              >
                <Controls.Select
                  name="hidden"
                  label={getString('text.hide')}
                  value={values.hidden}
                  selectField="value"
                  onChange={handleChange}
                  options={localeHideSelectOptions}
                />
              </FormControl>

              <Grid container className="button-group">
                <Controls.Button
                  type="button"
                  variant="text"
                  color="secondary"
                  text={getString('text.cancelButton')}
                  onClick={closeModal}
                />
                <Controls.Button
                  type="submit"
                  color="primary"
                  disabled={!(isValid && dirty)}
                  className={clsx({
                    'opacity-50': isDisabled,
                    'opacity-100': !isDisabled,
                  })}
                  text={
                    !isEdit
                      ? `${getString('text.createSource')}`
                      : `${getString('text.updateSource')}`
                  }
                />
              </Grid>
            </Grid>
          </Form>
        );
      }}
    </Formik>
  );
}

const mapStateToProps = (state: any) => ({
  score: state.leadSourceReducer.sourceReducer.scoreSource.score,
  scoreName: state.leadSourceReducer.sourceReducer.scoreSource.name,
  globalProduct: state.typeSelectorReducer.globalProductSelectorReducer.data,
});
const mapDispatchToProps = (dispatch: any) =>
  bindActionCreators(
    {
      hideModal,
      getProductSelectorTypes,
      createLeadSources,
      updateLeadSources,
      getLeadSourceScore,
      clearSourceScore,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SourceModal);
