import { Grid, FormControl } from '@material-ui/core';
import React, { useState, useMemo } from 'react';

import {
  Supervisor,
  TeamName,
  Product,
  LeadType,
  Manager,
} from 'mock-data/AdminPage.mock';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import './index.scss';

function AdminModal({ data, close }: any) {
  const [isDisabled, setIsDisabled] = useState(true);
  const [formData, setFormData] = useState({
    teamName: '',
    product: '',
    leadType: '',
    manager: '',
    supervisor: '',
  });

  useMemo(() => {
    if (data) setFormData(data);
  }, [data]);

  const handleChange = (event: any) => {
    if (!data) setIsDisabled(false);
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitHandler = () => {
    close(false);
  };

  const closeModal = () => {
    close(false);
  };

  return (
    <div className="admin-modal">
      <Grid item xs={12} md={12}>
        <FormControl
          margin="normal"
          required
          className="position-relative z-50"
        >
          <Controls.Select
            name="teamName"
            label="text.teamName"
            value={formData.teamName}
            onChange={handleChange}
            options={TeamName}
            selectField="title"
          />
        </FormControl>

        <FormControl
          margin="normal"
          required
          className="position-relative z-50"
        >
          <Controls.Select
            name="leadType"
            label={getString('text.leadType')}
            value={formData.leadType}
            onChange={handleChange}
            options={LeadType}
            selectField="title"
          />
        </FormControl>

        <FormControl
          margin="normal"
          required
          className="position-relative z-50"
        >
          <Controls.Select
            name="product"
            label={getString('text.product')}
            value={formData.product}
            onChange={handleChange}
            options={Product}
            selectField="title"
          />
        </FormControl>

        <FormControl
          margin="normal"
          required
          className="position-relative z-50"
        >
          <Controls.Select
            name="manager"
            label={getString('text.manager')}
            value={formData.manager}
            onChange={handleChange}
            options={Manager}
            selectField="title"
          />
        </FormControl>
        <FormControl
          margin="normal"
          required
          className="position-relative z-50"
        >
          <Controls.Select
            name="supervisor"
            label={getString('text.supervisor')}
            value={formData.supervisor}
            onChange={handleChange}
            options={Supervisor}
            selectField="title"
          />
        </FormControl>
        <div className="button-group">
          <Controls.Button
            type="submit"
            color="primary"
            text={getString('text.cancelButton')}
            onClick={closeModal}
          />
          <Controls.Button
            type="submit"
            color="primary"
            disabled={isDisabled}
            className={isDisabled ? 'button-create' : 'button-create-active'}
            onClick={submitHandler}
            text={
              !data
                ? `${getString('text.createTeam')}`
                : `${getString('text.updateTeam')}`
            }
          />
        </div>
      </Grid>
    </div>
  );
}

export default AdminModal;
