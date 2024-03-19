import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function UserPage() {
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
        <h1>User Page</h1>
        <p>Username: {username}</p>
      </div>
    </div>
  );
}