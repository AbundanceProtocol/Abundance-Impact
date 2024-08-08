import React from 'react';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';

const ItemWrap = ({children}) => {
  const { isMobile } = useMatchBreakpoints();

  return (
    <div className={`active-nav-link btn-hvr flex-col`} style={{border: '1px solid #000', padding: '2px', borderRadius: '10px', margin: '3px 3px 6px 3px', backgroundColor: '#001122cc', maxWidth: '100%', cursor: 'default', width: 'auto', justifyContent: 'flex-start', flexBasis: isMobile ? '100%' : '100%'}}>
      {children}
    </div>
  );
};

export default ItemWrap;