import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function UserArticles() {
  const router = useRouter();
  const { username } = router.query;

  useEffect(() => {
    console.log(`Username: ${username}`);
  }, [username]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      <div>
        <h1 className='font-25' style={{color: '#eff'}}>User Articles</h1>
        <p className='user-font' style={{color: '#eff'}}>User: {username}</p>
      </div>
    </div>
  );
}