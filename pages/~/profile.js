import { useEffect } from 'react';

export default function ProfilePage() {
  useEffect(() => {
    console.log(`Temp page`);
  }, []);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>&nbsp;
    </div>
  );
}