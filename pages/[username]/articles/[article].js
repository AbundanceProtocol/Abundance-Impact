import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ArticlePage() {
  const router = useRouter();
  const { username, article } = router.query;

  useEffect(() => {
    console.log(`Article: ${article}`);
  }, [article]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      <div>
        <h1 className='font-25' style={{color: '#eff'}}>Article Page</h1>
        <p className='user-font' style={{color: '#eff'}}>User: {username}</p>
        <p className='user-font' style={{color: '#eff'}}>Article: {article}</p>
      </div>
    </div>
  );
}