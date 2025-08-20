import React from 'react';
import Leaderboard from './Leaderboard';
import Ecoboard from './Ecoboard';
import { useAppRouter } from '../../../hooks/useAppRouter';

const RightMenu = () => {
  const router = useAppRouter()

  return (
    router.route !== '/~/studio/multi-tip-compose' && (<div className='right-nav-text' style={{width: '400px'}}>
      <div>
        <Ecoboard />
        <Leaderboard />
      </div>
    </div>)
  );
};

export default RightMenu;