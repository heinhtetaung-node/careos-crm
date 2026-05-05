import { Grid } from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import React from 'react';

import { getString } from 'presentation/theme/localization';

import Controls from 'presentation/components/controls/Control';
import { TypeShowImportantStar, TypeStar } from '../myLeadsHelper';

const addBtnIcon = <StarBorderIcon className="mr-1" />;
interface IMyLeadButton {
  handleStarImportant: (type: TypeStar) => void;
  isDisabledBtn: { addStar: boolean; removeStar: boolean };
  isShowStarBtn: boolean;
  showImportantLead: (type: TypeShowImportantStar) => void;
  showUnreadMessage: (showUnread: boolean) => void;
  isShowUnreadMessages?: boolean;
}

function MyLeadButton({
  handleStarImportant,
  isDisabledBtn,
  isShowStarBtn,
  showImportantLead,
  showUnreadMessage,
  isShowUnreadMessages,
}: Readonly<IMyLeadButton>) {
  return (
    <Grid item xs={12} md={6} lg={6} className="dp-flex">
      <Controls.Button
        text={getString('text.addStar')}
        color="primary"
        icon={addBtnIcon}
        onClick={() => handleStarImportant(TypeStar.ADD)}
        className="button btn-uppercase"
        disabled={isDisabledBtn.addStar}
        data-testid="add-star-btn"
      />
      <Controls.Button
        text={getString('text.removeStar')}
        color="primary"
        onClick={() => handleStarImportant(TypeStar.REMOVE)}
        className="button btn-uppercase"
        disabled={isDisabledBtn.removeStar}
        data-testid="remove-star-btn"
      />
      {isShowStarBtn ? (
        <Controls.Button
          text={getString('text.showOnlyStar')}
          color="primary"
          onClick={() => showImportantLead(TypeShowImportantStar.STAR)}
          className="button btn-uppercase"
        />
      ) : (
        <Controls.Button
          text="Show All"
          color="primary"
          onClick={() => showImportantLead(TypeShowImportantStar.ALL)}
          className="button btn-uppercase"
        />
      )}
      {isShowUnreadMessages ? (
        <Controls.Button
          text={getString('myLead.showUnreadMessage')}
          color="primary"
          onClick={() => showUnreadMessage(true)}
          className="button btn-uppercase"
        />
      ) : (
        <Controls.Button
          text={getString('myLead.showAll')}
          color="primary"
          onClick={() => showUnreadMessage(false)}
          className="button btn-uppercase"
        />
      )}
    </Grid>
  );
}
export default MyLeadButton;
