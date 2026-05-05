import { useFormik } from 'formik';
import _capitalilze from 'lodash/capitalize';
import _find from 'lodash/find';
import _get from 'lodash/get';
import _lowerCase from 'lodash/lowerCase';
import React, { useEffect, useState } from 'react';

import { useGetSelections } from 'data/slices/orderPolicySlice/selectionsSlice';
import { useMergePolicyDocumentsMutation } from 'data/slices/shipmentSlice';
import { DocumentType } from 'presentation/components/ActivityOrderSection/Document/config';
import Autocomplete from 'presentation/components/common/Autocomplete';
import CommonButton from 'presentation/components/common/Button/CommonButton';
import Dialog from 'presentation/components/common/Dialog';
import { getInsurersAll } from 'presentation/redux/actions/orders/all';
import { showSnackBar } from 'presentation/redux/actions/ui';
import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { downloadFileFromBlobURL } from 'shared/helper/downloadDocumentHelper';

const documentTypesOptions = [
  DocumentType.DOCUMENT_TYPE_SCAN_OF_POLICY,
  DocumentType.DOCUMENT_TYPE_POLICY,
  DocumentType.DOCUMENT_TYPE_POLICY_COPY,
  DocumentType.DOCUMENT_TYPE_INSURER_RECEIPT,
  DocumentType.DOCUMENT_TYPE_STICKER,
  DocumentType.DOCUMENT_TYPE_CARD,
  DocumentType.DOCUMENT_TYPE_ENDORSEMENT,
  DocumentType.DOCUMENT_TYPE_KNOCK_KNOCK,
].map((docType) => {
  const [firstWord, ...other] = docType.split('_');
  return {
    title: `${_capitalilze(firstWord)} ${_lowerCase(other.join(' '))}`,
    value: docType,
  };
});

export default function DownloadPolicyDocuments() {
  const dispatch = useAppDispatch();
  const [toggleModal, setToggleModal] = useState(false);
  const { selectedPolicies } = useGetSelections();

  const items = selectedPolicies?.flatMap((policy) => policy.items);
  const selectedInsurers = Array.from(
    new Set(selectedPolicies?.flatMap((policy) => policy.insurers))
  );
  const insurersOptions = useAppSelector((state) => {
    const insurers = state.ordersReducer?.insurersAllReducer.data || [];
    return selectedInsurers
      .map((insurer) => _find(insurers, ['displayName', insurer]))
      .map((insurer) => {
        const { displayName = '', name = '' } = insurer || {};
        return {
          title: displayName,
          value: name,
        };
      });
  });

  const [mergeDocuments, { isError, isLoading, isSuccess, data, error }] =
    useMergePolicyDocumentsMutation();

  useEffect(() => {
    dispatch(getInsurersAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.errorMessage', {
            message: _get(error, 'data.message'),
          }),
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    }
  }, [error, isError, dispatch]);

  useEffect(() => {
    if (isSuccess && data) {
      downloadFileFromBlobURL(data.documentName);
    }
  }, [data, isSuccess]);

  const formik = useFormik({
    onSubmit: async (values: {
      insurer: null | Record<string, string>;
      documentType: null | Record<string, string>;
    }) => {
      const { insurer, documentType } = values;
      const payload = {
        insurer: insurer?.value ?? '',
        document_types:
          items.length > 1 && documentType
            ? [documentType.value as DocumentType]
            : [],
        items,
      };

      await mergeDocuments(payload);
      setToggleModal(false);
      formik.resetForm();
    },
    initialValues: {
      insurer: null,
      documentType: null,
    },
  });

  const Form = (
    <form
      id="merge-policy-documens-form"
      className="pt-3"
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit();
      }}
    >
      <Autocomplete
        options={insurersOptions}
        className="mb-8"
        optionTextKey="title"
        textFieldProps={{
          label: 'Select insurer',
          placeholder: getString('text.select'),
        }}
        value={formik.values.insurer}
        onChange={(_e, value) => {
          formik.setFieldValue('insurer', value);
        }}
      />
      <Autocomplete
        options={documentTypesOptions}
        className="mb-8"
        optionTextKey="title"
        textFieldProps={{
          label: 'Select document type',
          placeholder: getString('text.select'),
        }}
        value={formik.values.documentType}
        onChange={(_e, value) => {
          formik.setFieldValue('documentType', value);
        }}
      />
    </form>
  );

  return (
    <>
      <CommonButton
        disabled={items.length < 1}
        className="mr-2"
        color="default"
        variant="contained"
        onClick={() => setToggleModal(true)}
      >
        {getString('order.shipping.downloadPolicyDocs')}
      </CommonButton>
      <Dialog
        showButton
        buttonProps={{
          disabled: isLoading || !formik.dirty,
        }}
        open={toggleModal}
        formId="merge-policy-documens-form"
        handleToggle={() => setToggleModal(false)}
        content={Form}
      />
    </>
  );
}
