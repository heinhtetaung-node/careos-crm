import React from 'react';
import { Helmet } from 'react-helmet';

import { Button } from '@alphafounders/ui';
import { ArrowLeftIcon } from '@alphafounders/icons';

import { getString } from 'presentation/theme/localization';

interface Props {
  title: string;
  buttonText: string;
  onBackClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onButtonClick?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  buttonDisabled?: boolean;
  children?: React.ReactNode;
  actionButtonTestId?: string;
}

export default function ActionPageLayout({
  title,
  onBackClick,
  onButtonClick,
  buttonText,
  buttonDisabled,
  children,
  actionButtonTestId,
}: Props) {
  const onBackClickHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (onBackClick) onBackClick(e);
  };

  const onClickHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (onButtonClick) onButtonClick(e);
  };

  return (
    <section data-testid="action-page-layout" className="page-background">
      <Helmet title={title} />

      <div className="px-4">
        {/* Header */}
        <div className="flex justify-between">
          <Button
            className="py-5 px-2 bg-white text-primary space-x-2 "
            dataTestId="back-button"
            onClick={onBackClickHandler}
            icon={<ArrowLeftIcon />}
            text={<span className="ml-2">{getString('text.back')}</span>}
          />

          <div className="flex flex-nowrap">
            <div className="p-0 w-full flex flex-col justify-center grow">
              <Button
                className="uppercase py-4 px-6 bold font-sans"
                dataTestId={actionButtonTestId || 'action-button'}
                disabled={buttonDisabled}
                onClick={onClickHandler}
                text={buttonText}
              />
            </div>
          </div>
        </div>
        {/* Body/Content */}
        <div className="py-4 flex space-x-2">{children}</div>
      </div>
    </section>
  );
}
