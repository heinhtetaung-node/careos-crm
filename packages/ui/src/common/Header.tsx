import clsx from 'clsx';
import React from 'react';

interface HeaderProps {
  // Generally will be an image wrapped in an anchor element.
  icon: React.ReactElement;
  // This will be located right next to the icon.
  label?: string | React.ReactElement;
  // This is a menu button located on the leftmost side of the header.
  menuButton?: React.ReactElement;
  // Located on the right hand side of the header.
  phoneButton?: React.ReactNode;
  // A set of buttons placed after the phone button.
  contactButtons?: React.ReactElement[];
  // Placed after the contact buttons.
  customerPortalButton?: React.ReactElement;
  // A separated set of buttons on the right hand side of the header.
  localeButtons?: React.ReactNode;
  // Turns the header shadow on and off.
  shadow?: boolean;
  // Assigns to data-testid attribute
  dataTestId?: string;
  fullWidth?: boolean;
  noDivideIconAndLabel?: boolean;
  labelColor?: string;
  labelStyles?: string;
  isLocalesShowOnMobile?: boolean;
  multipleLanguageOptions?: React.ReactNode;
}

/**
 * This is a generic header component with some basic formatting and styling.
 */
function Header({
  icon,
  label,
  menuButton,
  phoneButton,
  contactButtons,
  customerPortalButton,
  localeButtons,
  shadow,
  dataTestId,
  fullWidth,
  noDivideIconAndLabel,
  labelColor,
  labelStyles,
  isLocalesShowOnMobile = false,
  multipleLanguageOptions,
}: Readonly<HeaderProps>) {
  const renderButtons =
    (localeButtons &&
      Array.isArray(localeButtons) &&
      localeButtons.length !== 0 &&
      localeButtons) ||
    multipleLanguageOptions;
  return (
    <div
      className={clsx('w-full flex justify-center', [shadow && 'shadow-lg'])}
      data-testid={dataTestId}
    >
      <div
        className={clsx(
          'flex justify-between items-center w-full lg:px-[2rem] xl:px-[3.75rem]',
          [!fullWidth && 'max-w-[90rem]']
        )}
      >
        {/* Left side */}
        <div className="flex items-center">
          {menuButton}

          <div className="flex flex-col md:flex-row justify-center items-end md:items-center">
            {icon}

            {label && (
              <>
                {/* Divider here */}
                <div
                  className={clsx('border-r-0 mx-2  h-8 hidden md:block', [
                    !noDivideIconAndLabel &&
                      'border-solid border-l-[0.5px] border-muted-light',
                  ])}
                />
                <span
                  className={clsx(
                    'uppercase leading-tight text-[0.6875rem] md:text-sm',
                    [labelColor ?? 'text-primary'],
                    labelStyles
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="space-x-1 flex items-center">
          <div className="space-x-1 largerThan395:space-x-1.5 lg:space-x-2.5 flex items-center">
            {/* Call button */}
            {phoneButton}

            {/* Contact buttons */}
            {contactButtons && (
              <div className="space-x-1 flex items-center">
                {contactButtons}
              </div>
            )}

            {/* Account button */}
            {customerPortalButton}
          </div>

          {renderButtons && (
            <div
              className={clsx('space-x-1 items-center', {
                'hidden lg:flex': !isLocalesShowOnMobile,
                flex: isLocalesShowOnMobile,
              })}
            >
              <div className="mx-0.5 sm:mx-2 border-dashed border-l border-t-0 border-b-0 border-r-0 border-muted-light h-8" />
              {/* Language buttons */}
              <div className="space-x-1 flex">{renderButtons}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
