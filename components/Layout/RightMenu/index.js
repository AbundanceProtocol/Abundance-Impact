import React from 'react';
import Leaderboard from './Leaderboard';
import Ecoboard from './Ecoboard';
import { useRouter } from 'next/router';

const RightMenu = () => {
  const router = useRouter()

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