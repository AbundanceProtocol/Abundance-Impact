import { useEffect } from 'react';

export default function FundingPage() {
  useEffect(() => {
    console.log(`Temp page`);
  }, [project]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>&nbsp;
    </div>
  );
}