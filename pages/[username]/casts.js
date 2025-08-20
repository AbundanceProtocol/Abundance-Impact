import { useAppRouter } from '../../hooks/useAppRouter';
import { useEffect } from 'react';

export default function UserCasts() {
  const router = useAppRouter();
  const { username } = router.query;

  useEffect(() => {
    console.log(`Username: ${username}`);
  }, [username]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      <div>
        <h1 className='font-25' style={{color: '#eff'}}>User Casts</h1>
        <p className='user-font' style={{color: '#eff'}}>User: {username}</p>
      </div>
    </div>
  );
}