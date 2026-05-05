import { Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';

import { getString } from 'presentation/theme/localization';

import { IFilterComponent } from './index.helper';

import { IFilterFormField } from '../../../../shared/interfaces/common';
import Controls from '../Control';

const FilterForm: React.FC<any> = ({
  fields,
  onSubmit,
  onCancel,
}: IFilterComponent) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    let colNums = 0;
    const THRESHOLD = 9;
    fields.forEach((field: IFilterFormField) => {
      const col = field.columnSizeMd || 3;
      colNums += col;
      if (colNums <= THRESHOLD || field.isTeamPage)
        setCurrentIndex(
          (prevState: number) => prevState + (field.isTeamPage ? 2 : 1)
        );
    });
  }, []);

  const renderActionButtons = (
    <Grid container item xs={6} md={6} lg={6} xl={6} justifyContent="flex-end">
      <Controls.Button
        color="primary"
        onClick={onCancel}
        text={getString('text.clearAll')}
        style={{ textTransform: 'uppercase', marginLeft: 10, marginRight: 0 }}
      />
      <Controls.Button
        color="primary"
        text={getString('text.search')}
        style={{ textTransform: 'uppercase', marginLeft: 10, marginRight: 0 }}
        onClick={onSubmit}
      />
    </Grid>
  );

  const renderField = ({
    Tag,
    columnSizeXs,
    columnSizeMd,
    columnSizeLg,
    columnSizeXl,
    ...props
  }: IFilterFormField) => {
    return (
      <Grid
        item
        xs={columnSizeXs || 6}
        md={columnSizeMd || 6}
        lg={columnSizeLg || 6}
        xl={columnSizeXl || 3}
      >
        <Tag {...props} />
      </Grid>
    );
  };

  return (
    <>
      {fields.map((props: IFilterFormField, index: number) => (
        // eslint-disable-next-line react/no-array-index-key
        <React.Fragment key={index}>
          {index === currentIndex ? renderActionButtons : ''}
          {renderField(props)}
        </React.Fragment>
      ))}
    </>
  );
};

export default FilterForm;
