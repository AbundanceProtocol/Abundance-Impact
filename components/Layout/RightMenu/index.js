import React from 'react';
import Leaderboard from './Leaderboard';
import Ecoboard from './Ecoboard';

const RightMenu = () => {

  return (
    <div className='right-nav-text' style={{width: '400px'}}>
      <div>
        <Ecoboard />
        <Leaderboard />
      </div>
    </div>
  );
};

export default RightMenu;