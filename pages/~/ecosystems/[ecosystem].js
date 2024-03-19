import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function EcosystemPage() {
  const router = useRouter();
  const { ecosystem } = router.query;

  useEffect(() => {
    console.log(`Ecosystem: ${ecosystem}`);
  }, [ecosystem]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      <div>
        <h1 className='font-25' style={{color: '#eff'}}>Ecosystem Page</h1>
        <p className='user-font' style={{color: '#eff'}}>Ecosystem: {ecosystem}</p>
      </div>
    </div>
  );
}