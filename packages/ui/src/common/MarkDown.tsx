import React from 'react';
import showdown from 'showdown';
import clsx from 'clsx';

export interface MarkdownProps {
  readonly md: string;
  readonly cssClass?: string;
}

function Markdown({ md, cssClass }: MarkdownProps) {
  const converter = new showdown.Converter({
    strikethrough: true,
    splitAdjacentBlockquotes: true,
    simpleLineBreaks: true,
  });

  return (
    <div
      className={clsx(cssClass)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: converter.makeHtml(md) }}
    />
  );
}

export default Markdown;
