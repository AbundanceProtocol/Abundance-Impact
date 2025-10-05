import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AccountContext } from '../../context';
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';

export default function Diagram() {
  const router = useRouter();
  const { isMobile } = useMatchBreakpoints();


  useEffect(() => {
    console.log('diagram')
  }, []);




  //// ABUNDANCE DIAGRAM ////

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative', padding: '0 0 70px 0'}}>

    </div>

  );
}