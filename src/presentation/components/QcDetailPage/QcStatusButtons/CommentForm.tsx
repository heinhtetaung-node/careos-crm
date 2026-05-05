import { makeStyles, createStyles } from '@material-ui/core';
import * as React from 'react';

import CommonTextField from 'presentation/components/common/CommonTextField/CommonTextField';
import { IDialogProps } from 'presentation/components/common/Dialog';
import { getString } from 'presentation/theme/localization';

interface CommentFormProps {
  setDialogProps?: React.Dispatch<
    React.SetStateAction<
      Omit<IDialogProps, 'content' | 'handleToggle'> | undefined
    >
  >;
  onSubmit: (payload: any) => void;
  formId: string;
}

const useStyles = makeStyles(() =>
  createStyles({
    fieldSpace: {
      width: '100%',
      marginTop: '15px',
    },
  })
);

function CommentForm({ setDialogProps, onSubmit, formId }: CommentFormProps) {
  const [comment, setComment] = React.useState('');

  const handleCommentChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setComment(event.target.value);
  };

  const handleDialogProps = (
    props: Omit<IDialogProps, 'content' | 'handleToggle'>
  ) => {
    if (setDialogProps) {
      setDialogProps(props);
    }
  };

  const handleCommentBlur = (event: any) => {
    const commentValue: any = event.target.value;
    if (commentValue && commentValue?.length > 3) {
      handleDialogProps({
        buttonProps: {
          disabled: false,
        },
      });
    } else {
      handleDialogProps({
        buttonProps: {
          disabled: true,
        },
      });
    }
  };

  const handleSubmitData = (event: any) => {
    event.preventDefault();
    onSubmit({
      comment,
    });
  };

  const classes = useStyles();

  return (
    <form
      id={formId}
      onSubmit={handleSubmitData}
      data-testid="comment-text-field"
    >
      <CommonTextField
        label={getString('qc.comment')}
        placeholder={getString('qc.typeHere')}
        multiline
        minRows={4}
        variant="outlined"
        inputProps={{ onKeyUp: handleCommentBlur }}
        onChange={handleCommentChange}
        className={classes.fieldSpace}
      />
    </form>
  );
}

export default CommentForm;
