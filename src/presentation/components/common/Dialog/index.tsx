import {
  Dialog as MuiDialog,
  DialogProps,
  makeStyles,
  Theme,
  withStyles,
  createStyles,
  ButtonProps,
} from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseRounded from '@material-ui/icons/CloseRounded';
import * as React from 'react';

import { getString } from 'presentation/theme/localization';

import CommonButton from '../Button/CommonButton';
import IconButton from '../Button/IconButton';

export interface IDialogProps
  extends Omit<
    DialogProps,
    | 'open'
    | 'disableBackdropClick'
    | 'onBackdropClick'
    | 'onEnter'
    | 'onEntered'
    | 'onEntering'
    | 'onEscapeKeyDown'
    | 'onExit'
    | 'onExited'
    | 'onExiting'
    | 'onRendered'
    | 'onClose'
  > {
  title?: string;
  open?: boolean;
  scrollType?: 'paper' | 'body';
  color?: 'default' | 'warning';
  content: any;
  footerContent?: JSX.Element | string;
  formId?: string;
  handleToggle: () => void;
  showButton?: boolean;
  buttonProps?: Omit<ButtonProps, 'color'>;
  buttonText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  showCancelButton?: boolean;
  cancelButtonClick?: () => void;
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'xl' | 'lg';
}

const DialogStyle = withStyles((theme: Theme) => ({
  root: {
    '& .MuiDialogContent-root': {
      padding: '20px 30px',
    },
    '& .MuiDialog-paperWidthXs': {
      minWidth: '450px',
    },
    '& .MuiPaper-root': {
      overflowY: 'initial',
      borderRadius: '10px',
    },
    '& .MuiDialogTitle-root': {
      color: theme.palette.common.white,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 0,
      height: '20px',
      borderRadius: '10px 10px 0px 0px',
      '&.has-title': {
        height: '40px',
        '& .MuiTypography-root': {
          fontSize: '14px',
          fontWeight: 700,
        },
      },
    },
    '& .CloseDialogBtn': {
      position: 'absolute',
      right: '-12px',
      top: '-13px',
      boxShadow: `0px 7px 15px rgba(42, 49, 203, 0.1)`,
    },
    '& .MuiDialogActions-root': {
      justifyContent: 'center',
      '& .dialog-footer': {
        padding: '20px 0px 20px 0px',
      },
      '& .divider': {
        borderTop: `2px solid ${theme.palette.grey[200]}`,
        width: '100%',
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 0px 20px 0px',
        margin: '0 8px',
      },
    },
  },
}))(MuiDialog);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    default: {
      '& .MuiDialogTitle-root': {
        '&.has-title': {
          backgroundColor: theme.palette.primary.main,
        },
      },
    },
    warning: {
      '& .MuiDialogTitle-root': {
        '&.has-title': {
          backgroundColor: theme.palette.error.main,
        },
      },
    },
  })
);

function Dialog({
  title = '',
  open = false,
  scrollType = 'body',
  color = 'default',
  content,
  footerContent,
  formId,
  handleToggle,
  showButton = false,
  buttonProps,
  buttonText = 'Submit',
  disabled = false,
  isLoading = false,
  showCancelButton = false,
  cancelButtonClick,
  maxWidth = 'xs',
  ...rest
}: IDialogProps) {
  const dialogContextRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: dialogContentElement } = dialogContextRef;
      if (dialogContentElement !== null) {
        dialogContentElement.focus();
      }
    }
  }, [open]);

  const classes = useStyles();
  const colorClass = classes[color];

  return (
    <DialogStyle
      className={colorClass}
      open={open}
      onClose={handleToggle}
      scroll={scrollType}
      maxWidth={maxWidth}
      {...rest}
    >
      <IconButton
        extraClass="CloseDialogBtn z-20 "
        btnSize="medium"
        iconSize="s"
        color="secondary"
        icon={<CloseRounded />}
        handleClick={handleToggle}
        data-testid="close-dialog-button"
      />
      <DialogTitle
        id="scroll-dialog-title"
        className={title && 'has-title text-center'}
      >
        {title}
      </DialogTitle>
      <DialogContent>{content}</DialogContent>
      <DialogActions>
        {footerContent || ''}
        {showButton && (
          <div className={scrollType === 'paper' ? 'divider' : 'dialog-footer'}>
            <CommonButton
              disabled={disabled || isLoading}
              type={formId ? 'submit' : 'button'}
              form={formId || ''}
              color={color === 'warning' ? 'danger' : 'default'}
              variant="contained"
              data-testid="form-button"
              {...buttonProps}
            >
              {isLoading ? getString('text.loading') : buttonText}
            </CommonButton>
          </div>
        )}
        {showCancelButton && (
          <CommonButton
            onClick={cancelButtonClick}
            type="button"
            color="default"
            variant="outlined"
          >
            {getString('text.cancelButton')}
          </CommonButton>
        )}
      </DialogActions>
    </DialogStyle>
  );
}

export default Dialog;
