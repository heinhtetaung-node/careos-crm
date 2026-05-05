import React from 'react';
import { Paper } from '@material-ui/core';
import clsx from 'clsx';

import { getString } from 'presentation/theme/localization';
import { coverageSchema } from 'shared/constants/packageFormFields';

import { getTitle } from '../customQuote.helper';
import CustomQuoteField from '../customQuoteField';

interface CoverageProps {
  classes: Record<string, string>;
}

function Coverage({ classes }: Readonly<CoverageProps>) {
  return (
    <Paper elevation={3} className="shared-insurer-info">
      <div className="package-section custom-quote-components">
        <div className="custom-quote-components--headerSection">
          <div
            className={clsx(
              'custom-quote-page__name',
              classes.titleBackground
            )}
          >
            <h5
              className={clsx(
                'custom-quote-page__name--text',
                classes.title
              )}
            >
              {getString('package.coverageTitle')}
            </h5>
          </div>
        </div>

        <CustomQuoteField
          data={getTitle(coverageSchema())}
          classes={classes}
        />
      </div>
    </Paper>
  );
}

export default Coverage;