import { useLazyGetCarDataQuery } from 'data/slices/carSlice';
import _get from 'lodash/get';
import { getString } from 'presentation/theme/localization';
import React, { useEffect, useState } from 'react';
import useSnackbar from 'utils/snackbar';

import Controls from '../../../controls/Control';
import { CarBrand, CarModel, Option } from '../interface';

interface CarModelFilterProps {
  onChange: (fieldName: string, value?: string) => void;
  dependentValues: {
    'car.brand'?: string;
    'car.model'?: string;
  };
}

function CarModelFilter({ onChange, dependentValues }: CarModelFilterProps) {
  const { showErrorSnackbar } = useSnackbar();

  const [carBrandLoading, setCarBrandLoading] = useState(false);
  const [carModelLoading, setCarModelLoading] = useState(false);
  const [selectedCarBrand, setSelectedCarBrand] = useState<Option>();
  const [selectedCarModel, setSelectedCarModel] = useState<Option>();
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);

  const [getCarData] = useLazyGetCarDataQuery();

  const handleCarBrandFocus = async () => {
    if (carBrands.length > 0) return;
    setCarBrandLoading(true);
    const carData = await getCarData({
      pathParam: 'brands',
      queryParam: {
        pageSize: 1000,
      },
      field: 'brands',
    });
    setCarBrandLoading(false);
    if ('data' in carData) {
      setCarBrands(
        carData.data.map((brand: CarBrand) => ({
          id: brand.name,
          title: brand.displayName,
          value: brand.displayName,
        }))
      );
    } else {
      showErrorSnackbar(getString('text.generalErrorMessage'));
    }
  };

  const handleBrandChange = (selectedOption: Option) => {
    setSelectedCarBrand(selectedOption);
    onChange('car.brand', selectedOption.title);
    setCarModels([]);
    setSelectedCarModel(undefined);
    onChange('car.model', undefined);
  };

  const handleCarModelFocus = async () => {
    if (!selectedCarBrand || carModels.length > 0) return;
    setCarModelLoading(true);
    const carData = await getCarData({
      pathParam: `${selectedCarBrand.id}/models`,
      queryParam: {
        pageSize: 1000,
      },
      field: 'models',
    });
    setCarModelLoading(false);
    if ('data' in carData) {
      setCarModels(
        carData.data.map((model: CarModel) => ({
          id: model.name,
          title: model.displayName,
          value: model.displayName,
        }))
      );
    } else {
      showErrorSnackbar(getString('text.generalErrorMessage'));
    }
  };

  const handleCarModelChange = (selectedOption: Option) => {
    onChange('car.model', selectedOption.title);
    setSelectedCarModel(selectedOption);
  };

  useEffect(() => {
    // handle form reset
    if (
      _get(dependentValues, 'car.brand') === undefined &&
      _get(dependentValues, 'car.model') === undefined
    ) {
      setSelectedCarBrand(undefined);
      setSelectedCarModel(undefined);
    }
  }, [dependentValues]);

  return (
    <div className="w-full flex gap-5">
      <Controls.Autocomplete
        testid="carBrand-input"
        name="carBrand"
        options={carBrands}
        value={selectedCarBrand ?? null}
        label={getString('text.carBrand')}
        fixedLabel
        onChange={(e, val) => handleBrandChange(val as Option)}
        onFocus={handleCarBrandFocus}
        multiple={false}
        loading={carBrandLoading}
      />
      <Controls.Autocomplete
        testid="carModel-input"
        name="carModel"
        options={carModels}
        value={selectedCarModel ?? null}
        label={getString('text.carModel')}
        fixedLabel
        onChange={(e, val) => handleCarModelChange(val as Option)}
        onFocus={handleCarModelFocus}
        multiple={false}
        loading={carModelLoading}
      />
    </div>
  );
}

export default CarModelFilter;
