import Markdown from 'common/MarkDown';
import React from 'react';

export interface TextPanelItemProps {
  label: string;
  values: string;
}
interface TextPanelProps {
  textDetails: string | Array<TextPanelItemProps>;
  code: string | null | undefined;
}
export default function TextPanel({ textDetails, code }: TextPanelProps) {
  const renderMarkDown = (content: string, key: number | 0) => (
    <div key={`text-panel-${key + 1}`} className="flex pb-1">
      <div
        className="flex-1 text-left  px-[7px] -mt-[2px]"
        data-testid={`${code}-text-${key + 1}`}
      >
        <Markdown
          md={content}
          cssClass="text-[12px] leading-[19px] text-left custom-markdown"
        />
      </div>
    </div>
  );

  return (
    <div className="rounded-[10px] overflow-hidden text-left p-[10px]">
      {typeof textDetails === 'string' && renderMarkDown(textDetails, 0)}
      {typeof textDetails === 'object' &&
        textDetails.length > 0 &&
        textDetails.map(
          (
            item: {
              label: string | null | undefined;
              values: string;
            },
            index: number
          ) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={`${index}-label`}>
              <span className="text-sm font-bold pb-[4px]">{item?.label}</span>
              {renderMarkDown(item?.values, index)}
            </div>
          )
        )}
    </div>
  );
}
