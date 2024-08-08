import React from 'react';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const Item = ({text, description, icon: Icon}) => {
  const { isMobile } = useMatchBreakpoints();


  return (
    <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '5px 10px 0px 10px' : '5px 10px 5px 10px', alignItems: 'center', justifyContent: 'flex-start', flexGrow: 1}}>

      {Icon && (<div>
        <Icon style={{width: isMobile ? '20px' : '40px', height: isMobile ? '20px' : '40px', backgroundColor: '', padding: '0', margin: isMobile ? '0 8px 0 0' : '8px 15px 0 0 '}} />
      </div>)}

      <div className='flex-col'>
        {text && (<div style={{fontSize: isMobile ? '16px' : '24px', fontWeight: '600', color: '', padding: '4px 3px'}}>{text}</div>)}
        {description && (<div style={{fontSize: isMobile ? '13px' : '16px', fontWeight: '400', color: '#7bd', padding: isMobile ? '0 3px 8px 3px' : '0px 3px 4px 3px'}}>{description}</div>)}
      </div>
    </div>
  );
};

export default Item;