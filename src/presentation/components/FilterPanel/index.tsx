/* eslint-disable react/forbid-component-props */
import {
  Grid,
  withTheme,
  Accordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails as MuiAccordionDetails,
} from '@material-ui/core';
import { KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import { useFormik } from 'formik';
import _pick from 'lodash/pick';
import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  useCallback,
} from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { userAssignedLeadSearch } from 'presentation/pages/car-insurance/orders/filterFields';
import { OrderType } from 'shared/constants/orderType';

import { IFilterFormField } from './FilterField';
import { assignTypeToRole } from './Filterpanel.helper';
import { showRenderAgentName } from './RenderAgentName';

import { getString } from '../../theme/localization';
import Button from '../Button';
import './index.scss';
import Checkbox from '../common/controls/Checkbox';
import { clearSliderValue } from '../controls/Slider/Slider.helper';

const FormikWrapper = styled.div<{ collapseButton: boolean }>`
  &&& {
    width: 100%;
    .MuiCollapse-wrapper {
      padding: 15px 0;
      ${({ collapseButton }) => !collapseButton && 'display: none'}})}
    }
  }
`;

const AccordionSummary = styled(MuiAccordionSummary)`
  &&& {
    padding: 15px 40px;
    cursor: default;
    .MuiExpansionPanelSummary-content {
      margin: 0;
    }
    .MuiButton-containedPrimary .MuiButton-label {
      color: inherit;
    }
  }
  &&&.Mui-focused {
    background-color: transparent;
  }
`;

const AccordionDetails = withTheme(styled(MuiAccordionDetails)`
  &&& {
    padding: ${({ theme }) => theme.spacing(0, 10, 3, 10)};
  }
`);

const CollapseButton = styled.button`
  width: 30px;
  height: 30px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 50%;
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  visibility: visible;
  outline: none;
`;

enum fieldNames {
  search = 'search',
  searchKey = 'search.key',
  createTime = 'createTime',
  searchValue = 'search.value',
  startDate = 'date.startDate',
  endDate = 'date.endDate',
}

export interface FilterPanelProps {
  fields: IFilterFormField[];
  initialValues: any;
  onSubmit: (values: any) => void;
  validationSchema?: any;
  onReset?: (values: any) => void;
  onChangeValue?: (values: any) => void;
  isOrderPage?: boolean;
  assignType?: OrderType;
  setDirtyFilter?: (values: boolean) => void;
  noAgentAssignment?: boolean;
  originalArgs?: any;
  cancelledOrders?: boolean;
  onCancelledOrders?: () => void;
  isAllRequests?: boolean;
  onAllRequests?: (value: boolean, isReset: boolean) => void;
  showAllRequestCheckbox?: boolean;
  showCancelledCheckbox?: boolean;
  showThaiNationalCheckbox?: boolean;
  collapseButton?: boolean;
  showDeleted?: boolean;
}

function FilterPanel({
  fields,
  onReset,
  onSubmit,
  initialValues,
  onChangeValue,
  validationSchema,
  isOrderPage,
  assignType,
  noAgentAssignment,
  setDirtyFilter = () => null,
  originalArgs,
  cancelledOrders,
  onCancelledOrders = () => undefined,
  isAllRequests,
  onAllRequests,
  showAllRequestCheckbox = false,
  showCancelledCheckbox = false,
  collapseButton = true,
  showThaiNationalCheckbox = false,
  showDeleted = false,
}: Readonly<FilterPanelProps>) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<boolean>(true);
  const [formFields, setFormFields] = useState<IFilterFormField[]>([]);
  const formik = useFormik({
    onReset,
    onSubmit,
    initialValues,
    validationSchema,
  });

  useEffect(() => {
    if (!isOrderPage || !assignType || noAgentAssignment) {
      // normal field update
      setFormFields(fields);
      return;
    }
    // field update with special logic.
    // TODO: This logic should not be here. modifying the field.inputProps should be handle outside of this component.
    // This component should not need to know what field.inputProps.name should be
    const modifiedFields = fields.map((field) => {
      if (field.inputProps.name !== 'assignToUser') return field;
      const userRoleFilter = assignTypeToRole(assignType);
      return userAssignedLeadSearch(userRoleFilter, !noAgentAssignment);
    });

    setFormFields(modifiedFields as IFilterFormField[]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignType, isOrderPage, noAgentAssignment, fields]);

  useEffect(() => {
    if (onChangeValue) onChangeValue(formik.values);
  }, [formik.values, onChangeValue]);

  const handleChange = async (
    fieldName: string | ChangeEvent<HTMLInputElement>,
    value: any,
    action: string
  ) => {
    setDirtyFilter(true);
    if (
      (fieldName === fieldNames.startDate && value?.criteria === '') ||
      (fieldName === fieldNames.endDate && value?.criteria === '') ||
      (fieldName === fieldNames.createTime && value?.criteria === '')
    ) {
      return formik.setFieldValue(fieldName, {
        criteria: '',
        range: { startDate: null, endDate: null },
      });
    }

    if (fieldName === fieldNames.search) {
      if (action) {
        return formik.setFieldValue(fieldName, { key: '', value: '' });
      }

      if (value.key && !value.value) {
        await formik.setFieldValue(`${fieldName}`, value);
        return formik.setFieldError(
          fieldNames.searchValue,
          t('errorMessage.inputInvalid')
        );
      }
      if (!value.key && value.value) {
        await formik.setFieldValue(`${fieldName}`, value);
        return formik.setFieldError(
          fieldNames.searchKey,
          t('errorMessage.selectInvalid')
        );
      }
    }

    if (typeof fieldName !== 'string') {
      return formik.setFieldValue(
        fieldName.target.name,
        fieldName.target.type === 'checkbox'
          ? fieldName.target.checked
          : fieldName.target.value
      );
    }

    return formik.setFieldValue(`${fieldName}`, value);
  };

  const handleCancelledChanges = useCallback(() => {
    if (onCancelledOrders) {
      onCancelledOrders();
      formik.handleSubmit();
    }
  }, [formik, onCancelledOrders]);

  const handleAllRequestsChanges = useCallback(
    (value: boolean, isReset = false) => {
      formik.setFieldValue(`showDeleted`, value);
      if (onAllRequests) {
        onAllRequests(value, isReset);
        if (!isReset) formik.handleSubmit();
      }
    },
    [formik, onAllRequests]
  );

  const handleResetButton = useCallback(
    (event: React.ChangeEvent) => {
      clearSliderValue.next(true);
      formik.handleReset(event);
      if (cancelledOrders) handleCancelledChanges();
      if (isAllRequests) handleAllRequestsChanges(false, true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik, handleCancelledChanges, handleAllRequestsChanges]
  );

  const Buttons = useMemo(() => {
    const seachBtnDisable = !formik.dirty || (formik.dirty && !formik.isValid);
    const isValidReset = !formik.dirty;
    return (
      <Grid
        container
        item
        xs={12}
        md={12}
        justifyContent="center"
        alignItems="flex-end"
        className="filter-panel-button"
      >
        <div className="w-9/12 pl-8 2xl:pl-0 2xl:w-10/12 flex justify-end pt-3">
          {showCancelledCheckbox && (
            <Checkbox
              name={getString('text.showCancelled')}
              handleUpdate={handleCancelledChanges}
              checked={cancelledOrders}
              dataTestId="show-cancelled-orders"
            />
          )}
          {showAllRequestCheckbox && (
            <Checkbox
              name={getString('myLead.showAll')}
              handleUpdate={handleAllRequestsChanges}
              checked={showDeleted}
              dataTestId="show-all-requests"
            />
          )}
          {showThaiNationalCheckbox && (
            <Checkbox
              name={getString('healthLead.isThaiNational')}
              handleUpdate={(value) =>
                formik.setFieldValue(`isThaiNational`, value)
              }
              checked={formik.values.isThaiNational}
              dataTestId="show-thai-national"
            />
          )}
        </div>

        <div className="w-3/12 2xl:w-2/12 flex flex-row-reverse">
          <Button
            type="submit"
            color="primary"
            disabled={seachBtnDisable}
            variant="contained"
            onClick={formik.handleSubmit}
            data-testid="submit-btn"
          >
            {getString('text.search')}
          </Button>
          <Button
            type="reset"
            color="secondary"
            disabled={isValidReset}
            variant="contained"
            onClick={handleResetButton}
            data-testid="reset-btn"
          >
            {isOrderPage ? getString('text.reset') : getString('text.clearAll')}
          </Button>
        </div>
      </Grid>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik]);

  const renderFieldsSummary = () =>
    formFields.map(({ InputComponent, inputProps }: IFilterFormField) => {
      if (!inputProps?.name) return null;
      const { filterType, name, responsive, options, ...rest } = inputProps;
      const formatOptions = options?.map((item) => ({
        ...item,
        title: getString(item.title),
      }));
      if (filterType === 'summary') {
        const handleChangeFunc =
          name === 'effectiveDate'
            ? (val: string, _: string) => handleChange(name, val, '')
            : handleChange;
        return (
          <Grid container item {...responsive} key={name}>
            <InputComponent
              name={name}
              {...rest}
              value={formik.values[name]}
              options={formatOptions}
              error={formik.errors[name]}
              onError={formik.setErrors}
              onChange={handleChangeFunc}
            />
          </Grid>
        );
      }

      return null;
    });

  const renderFieldsDetail = () =>
    formFields?.map(({ InputComponent, inputProps }: IFilterFormField) => {
      if (!inputProps?.name) return null;
      const { filterType, name, responsive, dependentValues } = inputProps;

      if (filterType === 'detail') {
        return (
          <Grid
            container
            item
            {...responsive}
            key={name}
            style={{ marginTop: 20 }}
          >
            <InputComponent
              {...inputProps}
              dependentValues={_pick(formik.values, dependentValues ?? [])}
              error={formik.errors[name]}
              value={formik.values[name]}
              onChange={handleChange}
            />
          </Grid>
        );
      }

      if (filterType === 'detail-empty') {
        return (
          <Grid
            container
            item
            {...responsive}
            key={name}
            style={{ marginTop: 20 }}
          />
        );
      }

      return null;
    });

  const renderAccordion = () => (
    <Accordion expanded={expanded} style={{ padding: '15px 0' }}>
      <AccordionSummary>
        <Grid container spacing={5} justifyContent="space-between">
          {renderFieldsSummary()}
          {Buttons}
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={5}>
          {renderFieldsDetail()}
          {!noAgentAssignment &&
            showRenderAgentName(isOrderPage, assignType, originalArgs)}
        </Grid>
      </AccordionDetails>
      {collapseButton && (
        <CollapseButton
          data-testid="collapse-button"
          type="button"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <KeyboardArrowUp color="secondary" />
          ) : (
            <KeyboardArrowDown color="secondary" />
          )}
        </CollapseButton>
      )}
    </Accordion>
  );

  return (
    <FormikWrapper data-testid="filter-panel" collapseButton={collapseButton}>
      <form onSubmit={formik.submitForm}>{renderAccordion()}</form>
    </FormikWrapper>
  );
}

export default FilterPanel;
