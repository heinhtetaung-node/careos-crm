import { FormControl, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React from 'react';
import styled from 'styled-components';

import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import { SelectElement } from 'shared/types/controls';

interface Props {
  close: () => void;
}

interface Item {
  id: number;
  title: string;
}
interface PolicySelect {
  selected: string;
  items: Item[];
}

const CustomFormControl = styled(FormControl)`
  width: 70%;
  margin: auto;
  .action-btn {
    button {
      color: #ffff;
      font-weight: bold;
    }
  }
`;

const useStyles = makeStyles({
  customStyle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '15px 0 15px 0',
  },
  formControlCustomStyle: {
    position: 'relative',
    zIndex: 1000,
  },
  uppercaseWording: {
    textTransform: 'uppercase',
  },
});

function DownloadDocumentModal({ close }: Props) {
  const [policySelected, setPolicySelected] = React.useState<PolicySelect>({
    selected: 'Select',
    items: [
      { id: 0, title: 'Select' },
      { id: 1, title: 'All' },
      { id: 2, title: 'Mandatory policy' },
      { id: 3, title: 'Voluntary policy' },
      { id: 4, title: 'Knock for Knock' },
      { id: 5, title: 'Receipt' },
      { id: 6, title: 'Sticker' },
      { id: 7, title: 'Card' },
      { id: 8, title: 'Endorsement' },
      { id: 9, title: 'Thank you letter' },
    ],
  });
  const classes = useStyles();

  const optionChanged = (event: React.ChangeEvent<SelectElement>) => {
    setPolicySelected({ ...policySelected, selected: `${event.target.value}` });
  };

  const handleSubmit = () => {
    console.log('submitting');
  };

  return (
    <div data-testid="download-document-modal">
      <CustomFormControl>
        <FormControl
          margin="normal"
          required
          className={classes.formControlCustomStyle}
        >
          <Controls.Select
            name="documentType"
            className="documentTypeChange"
            label="Document type"
            value={policySelected.selected}
            selectField="title"
            options={policySelected.items}
            onChange={optionChanged}
          />
        </FormControl>
        <Grid item className={classes.customStyle}>
          <Controls.Button
            type="submit"
            variant="outlined"
            color="primary"
            className={classes.uppercaseWording}
            data-testid="download-document-cancel-btn"
            onClick={close}
          >
            {getString('text.cancelButton')}
          </Controls.Button>

          <Controls.Button
            color="primary"
            type="submit"
            disabled={policySelected.selected === 'Select'}
            data-testid="download-document-submit-btn"
            className={clsx(
              classes.uppercaseWording,
              'button-change-car unittest-handle-change-car'
            )}
            onClick={handleSubmit}
          >
            {getString('text.confirmButton')}
          </Controls.Button>
        </Grid>
      </CustomFormControl>
    </div>
  );
}

export default DownloadDocumentModal;
