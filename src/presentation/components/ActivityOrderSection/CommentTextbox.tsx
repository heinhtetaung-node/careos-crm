import { Button, Grid, TextareaAutosize, makeStyles } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import clsx from 'clsx';

import useOrderComments from 'presentation/hooks/useOrderComments';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

import { getString } from '../../theme/localization';
import { isScrollTop$ } from '../controls/Services/serviceHandleScroll';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .Mui-disabled': {
      backgroundColor: '#0000001f',
      color: theme.palette.common.white,
      '&:hover': {
        backgroundColor: '#0000001f',
      },
    },
    '& .MuiButton-root': {
      '&:hover': {
        backgroundColor: theme.palette.common.blueHover,
      },
    },
  },
  activityCommentBtn: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
}));

export type NewComment = {
  createBy: string;
  text: string;
  orderId: string;
};

function CommentTextBox({
  className,
  orderId: orderIdProps,
}: {
  className?: string;
  orderId?: string;
}) {
  const [comment, setComment] = useState('');
  const { orderId: _orderId } = useParams();

  const orderId = orderIdProps ?? _orderId;
  const classes = useStyles();

  const isFetching: boolean = useAppSelector(
    (currentState) => currentState.orderCommentReducer.isFetching
  );

  const [addAndGetComment, _, { isLoading }] = useOrderComments();

  const handleChangeComment = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const commentValue = event.target.value;
    setComment(commentValue);
  };

  const handleSubmit = () => {
    const payload: NewComment = {
      createBy: '',
      text: comment.trim() ?? '',
      orderId: orderId ?? '',
    };

    addAndGetComment(payload, orderId);
    setComment('');
    isScrollTop$.next(true);
  };

  useEffect(() => {
    if (isLoading || isFetching) {
      setComment('');
    }
  }, [isLoading, isFetching]);

  return (
    <Grid
      className={`${classes.root} shared-comment-text-box__btn-container`}
      data-testid="unittest-text-area-comment"
    >
      <TextareaAutosize
        className={clsx(
          'shared-comment-text-box__text-area unittest-text-area-comment',
          className
        )}
        value={comment}
        onChange={handleChangeComment}
        aria-label="empty textarea"
        minRows={5}
      />
      <Button
        className={`${classes.activityCommentBtn} shared-comment-text-box__btn unittest-text-box-btn`}
        onClick={handleSubmit}
        disabled={comment.length <= 0}
      >
        {getString('text.save')}
      </Button>
    </Grid>
  );
}

export default CommentTextBox;
