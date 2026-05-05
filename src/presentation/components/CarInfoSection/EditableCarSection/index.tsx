import { Grid } from '@material-ui/core';
import SectionWrapper from 'presentation/components/common/SectionWrapper/AccordionSection';
import Spinner from 'presentation/components/Spinner';
import { ICarInfo } from 'presentation/pages/car-insurance/LeadDetailsPage/leadDetailsPage.helper';
import useLeadUpdater from 'presentation/pages/car-insurance/LeadDetailsPage/leadUpdater';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';
import { getString } from 'presentation/theme/localization';
import React, { useMemo } from 'react';
import { provinceAbbreviationCollection } from 'shared/constants/provinceAbbreviation';

import { RowProps } from './interface';
import useUpdateCarData from './useUpdateCarData';

interface Props {
  carData: ICarInfo;
  isFieldDisabled?: boolean;
}

function EditableCarSection({ carData, isFieldDisabled = false }: Props) {
  const lead = useGetLeadSelector();

  const abbreviation = useMemo(() => {
    const provincesAbbreviations = provinceAbbreviationCollection();
    const province = provincesAbbreviations.find(
      (p) => p.oic === lead?.data?.registeredProvince
    );
    return province?.abbreviation || '';
  }, [lead]);

  const { updateLead } = useLeadUpdater();
  const {
    isLoading,
    dataSchema,
    carState,
    handleRadioChange,
    handleTextChange,
    handleAutocompleteChange,
  } = useUpdateCarData(carData, updateLead);

  const renderCarSection = useMemo(() => {
    if (isLoading) {
      return (
        <Grid container>
          <Grid
            item
            xs={12}
            className="h-[70vh] flex text-center justify-center"
          >
            <Spinner />
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container data-testid="editable-car-data-container">
        {dataSchema &&
          Object.entries(dataSchema).map(
            ([key, { InputComponent, inputProps, type }]: [
              string,
              RowProps,
            ]) => {
              const { name, isDisabled, ...rest } = inputProps;
              const value = carState ? carState[name] : '';

              switch (type) {
                case 'autocomplete':
                  return (
                    <InputComponent
                      key={key}
                      name={name}
                      {...rest}
                      value={value}
                      options={inputProps.options}
                      handleUpdate={(payload: any) =>
                        handleAutocompleteChange(payload, name)
                      }
                      isDisabled={isDisabled || isFieldDisabled}
                    />
                  );
                case 'radio':
                  return (
                    <InputComponent
                      key={key}
                      name={name}
                      {...rest}
                      value={value}
                      handleChange={(event: any) =>
                        handleRadioChange(event, name)
                      }
                      isDisabled={isDisabled || isFieldDisabled}
                    />
                  );
                case 'text':
                  return (
                    <InputComponent
                      key={key}
                      name={name}
                      {...rest}
                      value={value}
                      handleInputChange={(payload: any) =>
                        handleTextChange(payload, name)
                      }
                      handleUpdate={(payload: any) =>
                        handleTextChange(payload, name)
                      }
                      isDisabled={isDisabled || isFieldDisabled}
                    />
                  );
                case 'licensePlate':
                  return (
                    <InputComponent
                      key={key}
                      name={name}
                      {...rest}
                      value={
                        carState
                          ? {
                              carLicensePlate:
                                carState?.carLicensePlate ?? null,
                              redPlate: carState?.redPlate ?? undefined,
                            }
                          : {}
                      }
                      abbreviation={abbreviation}
                      handleInputChange={(payload: any) =>
                        handleTextChange(payload, name)
                      }
                      handleUpdate={(payload: any) =>
                        handleTextChange(payload, name)
                      }
                      isDisabled={isDisabled || isFieldDisabled}
                    />
                  );
                default:
                  return null;
              }
            }
          )}
      </Grid>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSchema, carState, carData]);

  return (
    <SectionWrapper
      isCollapsible={false}
      summary={getString('lead.car')}
      details={renderCarSection}
      hideBadge
      testId="editable-car-section-container"
    />
  );
}

export default EditableCarSection;
