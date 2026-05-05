import clsx from 'clsx';
import { Form, Formik } from 'formik';
import React, { useState, useEffect } from 'react';

import {
  useCreateSourceMutation,
  useUpdateSourceMutation,
} from 'data/slices/sourceSlices/sourceSlices';
import { Hide } from 'mock-data/LeadSourceSelect.mock';
import Controls from 'presentation/components/controls/Control';
import { getLocaleOptions } from 'presentation/pages/car-insurance/leads/LeadSourcePage/leadSourceHelper';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import { ILeadSources } from 'shared/interfaces/common/lead/sources';
import useSnackbar from 'utils/snackbar';
import ProductOptions from 'shared/constants/productOptions';

import {
  createValidationSchema,
  getInitialLeadSources,
} from './sourceModal.helper';
import FeatureFlags from 'config/flagsmithConfig';
import { useFlags } from 'flagsmith/react';

interface ICreateLeadSourcesProps {
  data: any;
  // TODO: Remove type any
  close: any;
  isEdit?: boolean;
  onSuccess?: () => void;
}

function SourceModal({
  data,
  close,
  isEdit,
  onSuccess,
}: ICreateLeadSourcesProps) {
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );

  const flags = useFlags([
    FeatureFlags.BROK_1052_ENABLE_PRODUCT_DROPDOWN_ON_LEAD_SOURCE_MODAL_20241223_TEMP,
  ]);
  const isEnableProductOption =
    flags[
      FeatureFlags
        .BROK_1052_ENABLE_PRODUCT_DROPDOWN_ON_LEAD_SOURCE_MODAL_20241223_TEMP
    ]?.enabled ?? false;

  const [createSource, { isLoading: createLoading }] =
    useCreateSourceMutation();
  const [updateSource, { isLoading: updateLoading }] =
    useUpdateSourceMutation();

  const { showErrorSnackbar, showSuccessSnackbar } = useSnackbar();

  const [leadSources, setLeadSources] = useState<ILeadSources>(
    getInitialLeadSources()
  );

  const closeModal = () => {
    close?.();
  };

  useEffect(() => {
    if (isEdit) {
      setLeadSources({ ...data });
    }
  }, [isEdit, data]);

  const handleSubmit = async (values: any) => {
    const payload: ILeadSources = {
      product: values.product,
      hidden: values.hidden === 'true',
      source: values.source,
      online: false,
    };

    if (isEdit) {
      payload.name = data.name;
      if (payload.source === data.source) {
        delete payload.source;
      }
      const response = await updateSource(payload);
      if ('error' in response) {
        showErrorSnackbar((response.error as any)?.data?.message);
        close?.();
        return;
      }
      showSuccessSnackbar(getString('text.updateSourceSuccess'));
    } else {
      const response = await createSource(payload);
      if ('error' in response) {
        showErrorSnackbar((response.error as any)?.data?.message);
        close?.();
        return;
      }
      showSuccessSnackbar(getString('text.createSourceSuccess'));
    }
    onSuccess?.();
    close?.();
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...leadSources, product: globalProduct } as ILeadSources}
      onSubmit={handleSubmit}
      validationSchema={createValidationSchema()}
    >
      {(props) => {
        const { values, dirty, isValid, handleChange } = props;
        return (
          <Form>
            <div className="lead-source-modal w-full">
              <div className="mb-3 mt-3">
                <Controls.Input
                  name="source"
                  label={getString('text.source')}
                  value={values.source}
                  onChange={handleChange}
                  fixedLabel
                />
              </div>
              <div className="mb-3">
                <Controls.Select
                  name="hidden"
                  label={getString('text.hide')}
                  value={values.hidden}
                  selectField="value"
                  onChange={handleChange}
                  options={getLocaleOptions(Hide, 'title')}
                  fixedLabel
                />
              </div>
              {isEnableProductOption && (
                <div className="mb-3">
                  <Controls.Select
                    name="product"
                    label={getString('text.product')}
                    value={values.product}
                    selectField="value"
                    placeholder={getString('text.select')}
                    onChange={handleChange}
                    options={ProductOptions.map((prod) => ({
                      ...prod,
                      title: getString(prod.title),
                    }))}
                    fixedLabel
                  />
                </div>
              )}

              <div className="flex justify-end py-5">
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
                  className={clsx('opacity-50', {
                    'p-5': createLoading || updateLoading,
                  })}
                  loading={createLoading || updateLoading}
                  text={
                    !isEdit
                      ? `${getString('text.createSource')}`
                      : `${getString('text.updateSource')}`
                  }
                />
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

export default SourceModal;
