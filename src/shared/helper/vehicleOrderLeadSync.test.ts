import {
  syncOrderDataPatchesToLead,
  syncVehicleOrderFieldToLead,
} from './vehicleOrderLeadSync';

describe('syncOrderDataPatchesToLead', () => {
  it('calls updateLead for each mapped data path with non-null value', async () => {
    const updateLead = jest.fn().mockResolvedValue(undefined);
    await syncOrderDataPatchesToLead(
      [
        { path: 'data/carUsageType', value: 'commercial' },
        { path: 'data/unknown', value: 'x' },
        { path: 'data/chassisNumber', value: 'CH123' },
      ],
      updateLead
    );
    expect(updateLead).toHaveBeenCalledTimes(2);
    expect(updateLead).toHaveBeenCalledWith('/carUsageType', 'commercial');
    expect(updateLead).toHaveBeenCalledWith('/chassisNumber', 'CH123');
  });

  it('skips null and undefined values', async () => {
    const updateLead = jest.fn().mockResolvedValue(undefined);
    await syncOrderDataPatchesToLead(
      [
        { path: 'data/carUsageType', value: null },
        { path: 'data/carUsageType', value: undefined },
      ],
      updateLead
    );
    expect(updateLead).not.toHaveBeenCalled();
  });
});

describe('syncVehicleOrderFieldToLead', () => {
  it('maps isRedPlate to carLicensePlate redplate or empty', async () => {
    const updateLead = jest.fn().mockResolvedValue(undefined);
    await syncVehicleOrderFieldToLead(updateLead, 'isRedPlate', true);
    expect(updateLead).toHaveBeenCalledWith('/carLicensePlate', 'redplate');
    updateLead.mockClear();
    await syncVehicleOrderFieldToLead(updateLead, 'isRedPlate', 'false');
    expect(updateLead).toHaveBeenCalledWith('/carLicensePlate', '');
  });

  it('maps engineNumber to vehicleIdNumber', async () => {
    const updateLead = jest.fn().mockResolvedValue(undefined);
    await syncVehicleOrderFieldToLead(updateLead, 'engineNumber', 'E1');
    expect(updateLead).toHaveBeenCalledWith('/vehicleIdNumber', 'E1');
  });

  it('coerces dash cam and modified to booleans', async () => {
    const updateLead = jest.fn().mockResolvedValue(undefined);
    await syncVehicleOrderFieldToLead(updateLead, 'carDashCam', 'true');
    expect(updateLead).toHaveBeenCalledWith('/carDashCam', true);
    updateLead.mockClear();
    await syncVehicleOrderFieldToLead(updateLead, 'carModified', false);
    expect(updateLead).toHaveBeenCalledWith('/carModified', false);
  });

  it('does nothing for unknown field names', async () => {
    const updateLead = jest.fn().mockResolvedValue(undefined);
    await syncVehicleOrderFieldToLead(updateLead, 'firstDriverName', 'x');
    expect(updateLead).not.toHaveBeenCalled();
  });
});
