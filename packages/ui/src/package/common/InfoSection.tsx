import React from 'react';
import InfoTitle from './InfoTitle';
import InfoRow from './InfoRow';
import { DetailSectionList } from '../interfaces';

interface InfoSectionProps {
  data: DetailSectionList;
}

function InfoSection({ data }: InfoSectionProps) {
  if (!data.hasData) {
    return null;
  }
  return (
    <div>
      <InfoTitle text={data.title} />
      {data.items.map((x) => (
        <InfoRow items={x} packages={data.packages} key={x.label} />
      ))}
    </div>
  );
}

export default InfoSection;
