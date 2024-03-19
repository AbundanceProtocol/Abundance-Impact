import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProposalPage() {
  const router = useRouter();
  const { proposal } = router.query;

  useEffect(() => {
    console.log(`Proposal: ${proposal}`);
  }, [proposal]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      <div>
        <h1 className='font-25' style={{color: '#eff'}}>Proposal Page</h1>
        <p className='user-font' style={{color: '#eff'}}>Proposal: {proposal}</p>
      </div>
    </div>
  );
}