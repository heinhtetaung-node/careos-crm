import React from 'react';
import InfoTitle from './InfoTitle';

interface DisclaimerSectionProps {
  listStyleImage?: string;
  title?: string;
  description?: string;
}

function DisclaimerSection({
  listStyleImage,
  title,
  description,
}: DisclaimerSectionProps) {
  const inlineStyle = {
    listStyleImage: listStyleImage ? `url(${listStyleImage})` : undefined,
  };
  return (
    <div>
      <InfoTitle text={title || 'Remark'} />
      <div className="text-left text-medium flex flex-row bg-[#f2f3fa]">
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <ul className="w-[415px] grow px-3 pl-8 box-sizing" style={inlineStyle}>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: description || '' }} />
        </ul>
      </div>
    </div>
  );
}

export default DisclaimerSection;
