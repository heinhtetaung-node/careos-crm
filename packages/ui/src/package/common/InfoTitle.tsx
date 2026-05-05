import React from 'react';

interface TitleProps {
  text: string;
}
function InfoTitle({ text }: TitleProps) {
  return (
    <div className="text-primary font-bold bg-white text-lg py-[20px] border-0 border-b-[1px] border-solid border-muted-light">
      {text}
    </div>
  );
}

export default InfoTitle;
