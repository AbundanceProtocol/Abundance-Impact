import React, { useContext } from 'react';
import { AccountContext } from '../../../../../context';
import Link from 'next/link';

const Working = ({buttonName, link, menuState, TopIcon }) => {
  const { showActions, setShowActions } = useContext(AccountContext);

  const toggleShowActions = () => {
    if (showActions) {
      setShowActions(false)
    } else {
      setShowActions(true)
    }
  }

  return (
    <div onClick={() => {
      if (buttonName == 'Cast Actions') {
        toggleShowActions()
      }
    }}>
      <Link href={link || ''} style={{maxWidth: '260px'}}>
        <div className={`flex-row`} style={{padding: '0 10px', justifyContent: 'center'}}>
          <div className="flex-col" style={{height: '46px', alignItems: 'center', justifyContent: 'center'}}>
            <div className={`flex-row flex-middle ${menuState} btn-hvr`} style={{padding: '2px 0 2px 0', borderRadius: '16px'}}>
              <TopIcon style={{margin: '3px 12px 3px 12px', width: (buttonName == 'Cast Actions') ? '25px' : '25px', height: (buttonName == 'Cast Actions') ? '30px' : '25px'}} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Working;