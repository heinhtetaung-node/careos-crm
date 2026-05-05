import _isFunction from 'lodash/isFunction';
import React, { useState, ReactNode } from 'react';

import RenderDOB from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/RenderDOB';
import { getFieldTitle } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';

import { Field, FieldItem, SubTitleInfo, Colon } from './index.style';
import RenderDateField from './RenderDateField';
import RenderInputLicensePlate from './RenderInputLicensePlate';
import RenderInputSelectItem from './RenderInputSelectItem';
import RenderInputTextItem from './RenderInputTextItem';
import { IField } from './type';

import { getOptionData } from '../leadDetailsPage.helper';

type FormFieldRenderProps = ({
  setShowHighlight,
}: {
  setShowHighlight: (status: boolean) => void;
}) => ReactNode;

type FormFieldProps = {
  field?: IField;
  children: ReactNode | FormFieldRenderProps;
};

export function FormField({ children, field }: FormFieldProps) {
  const [showHighlight, setShowHighlight] = useState(false);
  return (() => {
    if (field?.type === 'subTitle') {
      return (
        <Field data-testid="field">
          <SubTitleInfo>{field?.value}</SubTitleInfo>
        </Field>
      );
    }

    return (
      <Field
        data-testid="field"
        showHighlight={
          field?.disabled || field?.isOptional ? false : showHighlight
        }
      >
        {(() => {
          if (field) {
            return (
              <>
                <FieldItem>
                  {field.title ? getFieldTitle(field.title) : field.titleString}
                </FieldItem>
                {_isFunction(children)
                  ? children({ setShowHighlight })
                  : children}
              </>
            );
          }
          return _isFunction(children)
            ? children({ setShowHighlight })
            : children;
        })()}
      </Field>
    );
  })();
}

const RenderItem: React.FC<any> = ({ props, handleUpdateOrder, error }: any) =>
  props.map((field: IField, index: number) => {
    if (field.type === 'text') {
      return (
        <FormField field={field} key={field.title ?? index}>
          {({ setShowHighlight }) => (
            <RenderInputTextItem
              valueText={field.value as string}
              isEditable={field.isEditable}
              disabled={field.disabled}
              handleOnBlur={field.onChange ?? handleUpdateOrder}
              handleOnEnter={field.onChange ?? handleUpdateOrder}
              setShowHighlight={setShowHighlight}
              name={field.name}
              isError={error && error.field === field.name}
              error={error && error.field === field.name ? error.msg : ''}
              testId={field.testId}
              packageTypeLabel={field.packageTypeLabel}
            />
          )}
        </FormField>
      );
    }
    if (field.type === 'select') {
      return (
        <FormField field={field} key={field.title ?? index}>
          {({ setShowHighlight }) => (
            <RenderInputSelectItem
              initialValue={field.value}
              isEditable={field.isEditable}
              isDisabled={field.disabled}
              handleUpdateOrder={handleUpdateOrder}
              name={field.name}
              options={
                field?.options
                  ? field.options
                  : getOptionData(field?.title ?? field.titleString)
              }
              setShowHighlight={setShowHighlight}
              testId={field.testId}
            />
          )}
        </FormField>
      );
    }
    if (field.type === 'license') {
      return (
        <FormField field={field} key={field.title ?? index}>
          {({ setShowHighlight }) => (
            <RenderInputLicensePlate
              licenseNo={field.value}
              name={field.name}
              handleOnEnter={handleUpdateOrder}
              handleOnBlur={handleUpdateOrder}
              registeredProvince={field.optional}
              setShowHighlight={setShowHighlight}
              isEditable={field.isEditable}
            />
          )}
        </FormField>
      );
    }
    if (field.type === 'date') {
      return (
        <FormField field={field} key={field.title ?? index}>
          <RenderDOB
            className="!w-1/2"
            onClose={(dateString: any) => {
              handleUpdateOrder({
                name: field.name,
                value: dateString,
              });
            }}
            value={field.value as Date | ''}
            name={field.name}
            isFieldDisabled={field.disabled}
          />
        </FormField>
      );
    }
    if (field.type === 'datef') {
      return (
        <FormField field={field} key={field.title ?? index}>
          <RenderDateField
            value={field.value as Date | null}
            onUpdateOrder={handleUpdateOrder}
            name={field.name}
            dateType={field.optional}
            isEditable={field.isEditable}
          />
        </FormField>
      );
    }
    return (
      <FormField field={field} key={field.title ?? index}>
        <Colon>: </Colon>
        <FieldItem>{field.value}</FieldItem>
      </FormField>
    );
  });

export default RenderItem;
