import React from 'react';
import { Values } from '../interfaces';

interface InfoContentProps {
  content: Values;
  label: string;
}

function InfoContent({ content, label }: InfoContentProps) {
  return (
    <div className="w-[415px] px-3 py-2 text-left grow">
      <p className="my-1.5 text-muted-dark text-base font-bold">{label}</p>
      <p className="my-1.5 text-medium leading-6">{content.component}</p>
    </div>
  );
}

export default InfoContent;
