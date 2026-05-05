import React, { useMemo } from 'react';
import { insertInterval } from 'utils/Array';
import Divider from 'common/Divider';
import InfoContent from './InfoContent';
import { DetailSectionItem } from '../interfaces';

interface InfoRowProps {
  items: DetailSectionItem;
  packages: string[];
}

function InfoRow({ items, packages }: InfoRowProps) {
  const Contents = useMemo(() => {
    const contents = packages.map((key) => (
      <InfoContent content={items.values[key]} label={items.label} />
    ));
    return insertInterval(
      contents,
      1,
      <Divider orientation="vertical" variant="secondary" />
    );
  }, [items, packages]);

  return (
    <div className="flex flex-row border-0 border-b-[1px] border-solid border-muted-light divide-x even:bg-[#f2f3fa]">
      {Contents}
    </div>
  );
}

export default InfoRow;
