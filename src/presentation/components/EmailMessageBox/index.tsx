import QuillAutoDetectUrl from 'quill-auto-detect-url';
import React from 'react';
import ReactQuill, { Quill } from 'react-quill';

interface EmailMessageBoxProps {
  value: string;
  handleChange: (message: string) => void;
}

Quill.register('modules/autoDetectUrl', QuillAutoDetectUrl);

function EmailMessageBox({
  value,
  handleChange,
}: Readonly<EmailMessageBoxProps>) {
  return (
    <ReactQuill
      id="email-msg-template"
      modules={{
        autoDetectUrl: {
          urlRegularExpression: /(https?:\/\/|www\.)[\w-.]+\.[\w-.]+[\S]+/i,
        },
      }}
      value={value}
      onChange={(newValue, delta, source) => {
        if (source === 'user') {
          handleChange(newValue);
        }
      }}
      theme="bubble"
    />
  );
}

export default EmailMessageBox;
