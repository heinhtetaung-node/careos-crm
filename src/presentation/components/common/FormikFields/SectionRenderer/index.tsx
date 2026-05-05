import { Grid } from '@material-ui/core';
import React, { useMemo } from 'react';

import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';

import { defaultConstructorConfig, defaultDataSchema } from './defaults';
import { ConstructorConfig } from './interface';

/* This will create section component based on schema provided.
 * @param config: define generic row component and the title of the section
 * @param dataSchema: define the content of each row. Each row props has customRow component for better
 * flexibility
 */
function SectionRenderer({
  dataSchema = defaultDataSchema,
  config = defaultConstructorConfig,
  dataTestId,
}: ConstructorConfig) {
  const Row = config.Row ? React.memo(config.Row) : React.Fragment;
  const rows = useMemo(
    () => (
      <Grid className="w-full">
        {dataSchema &&
          Object.entries(dataSchema).map(
            ([key, { InputComponent, inputProps, CustomRowComponent }]) => {
              if (CustomRowComponent) {
                return (
                  <CustomRowComponent key={inputProps.name} {...inputProps}>
                    <InputComponent key={key} {...inputProps} />
                  </CustomRowComponent>
                );
              }
              return (
                <Row key={inputProps.name} {...inputProps}>
                  <InputComponent key={key} {...inputProps} />
                </Row>
              );
            }
          )}
      </Grid>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dataSchema]
  );
  return (
    <SectionWrapper
      isCollapsible={false}
      summary={config.title}
      details={rows}
      hideBadge
      testId={dataTestId}
    />
  );
}

export default SectionRenderer;
