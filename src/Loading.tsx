import React from 'react';
import './Loading.scss';

function Loading() {
  return (
    <div className="wrapper-loading-icon" data-testid="loading-wrapper">
      <img
        src="/static/img/rabbit-care-logo.svg"
        alt="Rabbit Finance"
        className="w-[150px]"
      />
      <div className="lds-rabbit">
        <div className="lds-rabbit__children" />
        <div className="lds-rabbit__children" />
        <div className="lds-rabbit__children" />
      </div>
    </div>
  );
}
export default Loading;
