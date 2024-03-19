import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProjectPage() {
  const router = useRouter();
  const { project } = router.query;

  useEffect(() => {
    console.log(`Project: ${project}`);
  }, [project]);

  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>
      <div>
        <h1 className='font-25' style={{color: '#eff'}}>Project Page</h1>
        <p className='user-font' style={{color: '#eff'}}>Project: {project}</p>
      </div>
    </div>
  );
}