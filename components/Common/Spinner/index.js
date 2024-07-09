import React from 'react';
import styled from '@emotion/styled';

const Spinner = ({ size, color }) => {
  let spinnerColor = '#ccc'
  let spinnerSize = 21
  if (size) {
    spinnerSize = size
  }
  if (color) {
    spinnerColor = color
  }

  return (
    <SpinnerIcon size={spinnerSize} color={spinnerColor} />
  );
}

export default Spinner;


const SpinnerIcon = styled.div`
  display: inline-block;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border: 4px solid ${props => props.color};
  border-top-color: transparent;
  border-radius: 50%;
  -webkit-animation: spin 1s linear infinite;
  animation: spin 1s linear infinite;
  /* position: absolute; */
  top: Calc(50% - 20px);
  left: Calc(50% - 20px);

  @keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
    }
    to {
      -webkit-transform: rotate(1turn);
      transform: rotate(1turn)
    }
  }
`;