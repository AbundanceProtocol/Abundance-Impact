import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CastPage() {
  const router = useRouter();
  const { username, cast } = router.query;

  useEffect(() => {
    console.log(`Cast: ${cast}`);
  }, [cast]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      <div>
        <h1 className='font-25' style={{color: '#eff'}}>Cast Page</h1>
        <p className='user-font' style={{color: '#eff'}}>User: {username}</p>
        <p className='user-font' style={{color: '#eff'}}>Cast: {cast}</p>
      </div>
    </div>
  );
}