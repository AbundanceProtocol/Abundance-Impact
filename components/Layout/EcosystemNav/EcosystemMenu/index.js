import React, { useContext } from 'react';
import { AccountContext } from '../../../../context';
import useMatchBreakpoints from '../../../../hooks/useMatchBreakpoints';

const EcosystemNav = () => {
  const { ecosystemsData, ecoData, handleEcoChange } = useContext(AccountContext)
  const { isMobile } = useMatchBreakpoints();

  return (
    <div className={isMobile ? '' : 'left-container'} style={{margin: '0', maxWidth: '237px', width: 'auto'}}>
      <div style={{backgroundColor: '#334455ee', borderRadius: '16px', padding: '0px', border: '0px solid #678', color: '#fff', fontWeight: '700', alignItems:' center', fontSize: '20px'}}>
        <div className='flex-row' style={{gap: '0.5rem'}}>
          <select id="minuteSelect" value={ecoData?.ecosystem_points_name} onChange={handleEcoChange} style={{backgroundColor: '#adf', borderRadius: '4px', fontSize: isMobile ? '15px' : '18px', fontWeight: '500', padding: isMobile ? '1px 1px' : '0 3px'}}>
            {ecosystemsData.map((ecosystem) => (
              <option key={ecosystem.ecosystem_points_name} value={ecosystem.ecosystem_points_name}>
                {ecosystem.ecosystem_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

export default EcosystemNav;