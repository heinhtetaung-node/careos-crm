import React from 'react';
import styled, { StyledComponent } from 'styled-components';

const SvgWrapper = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${(props) => props.theme.sidebar.header.background};
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const withCircle = (SvgComponent: any) => {
  return (
    <SvgWrapper className="svg-wrapper">
      <SvgComponent fill="currentColor" />
    </SvgWrapper>
  );
};

export default withCircle;
