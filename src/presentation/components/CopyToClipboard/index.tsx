import { Tooltip } from '@material-ui/core';
import { FileCopyOutlined as ContentCopyIcon } from '@material-ui/icons';
import React, { useState } from 'react';

import { getString } from 'presentation/theme/localization';

interface Props {
  text: string;
  fontSize?: 'small' | 'inherit' | 'default' | 'large' | 'medium';
  mainClassName?: string;
  iconColor?:
    | 'error'
    | 'disabled'
    | 'primary'
    | 'action'
    | 'inherit'
    | 'secondary'
    | undefined;
}

function CopyToClipboard({
  text,
  fontSize,
  mainClassName,
  iconColor = 'inherit',
}: Readonly<Props>): JSX.Element {
  const [copied, setCopied] = useState(false);
  const copyTextToClipboard = async (selectedText: string) => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(selectedText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  };

  return (
    <div
      className={mainClassName}
      onKeyDown={() => copyTextToClipboard(text)}
      onClick={() => copyTextToClipboard(text)}
      role="button"
      tabIndex={0}
    >
      {text}
      <Tooltip
        PopperProps={{
          disablePortal: true,
        }}
        open={copied}
        placement="top"
        disableFocusListener
        disableHoverListener
        disableTouchListener
        arrow
        title={getString('text.copied')}
      >
        <ContentCopyIcon
          className="cursor-pointer pl-1 align-middle color-primary"
          fontSize={fontSize ?? 'small'}
          onClick={() => copyTextToClipboard(text)}
          data-testid="unittest-copy-content-btn"
          color={iconColor}
        />
      </Tooltip>
    </div>
  );
}

export default CopyToClipboard;
