'use client';

import clsx from 'clsx';
import React, { useEffect, useRef } from 'react';

interface TextAreaprops {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  label?: string;
  maxHeight?: number;
}

function TextArea({
  value,
  onChange,
  label,
  error,
  maxHeight = 100,
}: TextAreaprops) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextArea = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    textareaRef.current!.style.height = '0px';
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    textareaRef.current!.style.height = `${Math.min(
      textareaRef.current?.scrollHeight ?? 0,
      maxHeight
    )}px`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    resizeTextArea();
  };

  useEffect(() => {
    resizeTextArea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="w-full mx-auto mt-0 inline-flex flex-col">
      {label && <div className="text-xs text-left">{label}</div>}
      <textarea
        ref={textareaRef}
        className={clsx('font-sans resize-none rounded-md p-1 hover:border', {
          'border-red-600': Boolean(error),
          'border-muted-light': !error,
        })}
        rows={1}
        value={value}
        onChange={handleChange}
      />
      {error && <span className="text-xs text-left text-red-600">{error}</span>}
    </div>
  );
}

export default TextArea;
