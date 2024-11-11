import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AccountContext } from '../../context';
import { FaLock, FaRegStar } from "react-icons/fa";
import { PiSquaresFourLight as Actions } from "react-icons/pi";
import useMatchBreakpoints from '../../hooks/useMatchBreakpoints';

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState([])
  const { LoginPopup, isLogged } = useContext(AccountContext)
  const { isMobile } = useMatchBreakpoints();


  useEffect(() => {
    getCuratorData()
  }, []);



  async function getCuratorData() {
    try {
      const response = await axios.get('/api/testing/raffle')
      if (response?.data) {
        const userData = response?.data?.userData

        let username = []

        for (const user of userData) {
          for (let i = 0; i < user.total; i = i + 10) {
            username.push(user.username)
          }
        }


        setData(username)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setData([])
    }
  }



  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative', padding: '0 0 70px 0'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>

      <div title='Cast Actions' className='flex-row' style={{alignItems: 'center', justifyContent: 'center', margin: '8px'}}>
        <p className='' style={{padding: '10px', color: '#fff', fontWeight: '700', fontSize: '20px'}}>Impact 5000 $degen Raffle tickets </p>
      </div>
      <div title='Cast Actions' className='flex-row' style={{alignItems: 'flex-start', justifyContent: 'flex-start', margin: '8px'}}>
        <p className='' style={{padding: '10px', color: '#fff', fontWeight: '700', fontSize: '16px'}}>To participate: multi-tip, auto-tip, or curate content with the /impact $IMPACT Console Cast Action</p>
      </div>

      <div className='flex-col' style={{margin: '15px 0 10px 0', gap: '0.25rem', alignItems: 'center'}}>
            <div className='flex-row' style={{alignItems: 'center', gap: '0.5rem'}}>
              <Actions size={28} color={'#9cf'} />
              <div style={{fontSize: isMobile ? '15px' : '18px', fontWeight:'500', color: '#ace'}}>Get Cast Actions:</div>
            </div>
            <div className='flex-row' style={{gap: '0.5rem', margin: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center'}}>

              {isLogged ? (<a className="" title={`$IMPACT Console`} href={`https://warpcast.com/~/add-cast-action?name=%24IMPACT+Console&icon=star&actionType=post&postUrl=https%3A%2F%2Fimpact.abundance.id%2Fapi%2Faction%2Fstatus%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
                <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                  <FaRegStar size={14} />
                  <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap'}}>$IMPACT Console</p>
                </div>
              </a>) : (
                <div className={`flex-row`} onClick={LoginPopup}>
                  <div>
                    <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: '#bbb'}}>
                      <FaRegStar size={14} />
                      <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap', color: '#222'}}>$IMPACT Console</p>
                    </div>
                  </div>
                  <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                    <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
                      <FaLock size={8} color='#999' />
                    </div>
                  </div>
                </div>
              )}

              {isLogged ? (<a className="" title={`+1 $IMPACT`} href={`https://warpcast.com/~/add-cast-action?name=%2B1+%24IMPACT&icon=star&actionType=post&postUrl=https%3A%2Fimpact.abundance.id%2Fapi%2Faction%2Fimpact1%3Fpoints=IMPACT&description=Curate+Casts+with+the+Impact+App`} target="_blank" rel="noopener noreferrer">
                <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem'}}>
                  <FaRegStar size={14} />
                  <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap'}}>+1 $IMPACT</p>
                </div>
              </a>) : (
                <div className={`flex-row`} onClick={LoginPopup}>
                  <div>
                    <div className='flex-row cast-act-lt' style={{borderRadius: '8px', padding: '8px 8px', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', backgroundColor: '#bbb'}}>
                      <FaRegStar size={14} />
                      <p style={{padding: '0px', fontSize: '12px', fontWeight: '500', textWrap: 'nowrap', color: '#222'}}>+1 $IMPACT</p>
                    </div>
                  </div>
                  <div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
                    <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-50%, -50%)' }}>
                      <FaLock size={8} color='#999' />
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>



      {data?.length > 0 && data.map((user, index) => { return (
        <div key={index} className='' style={{gap: '1.5rem', color: '#eee', padding: '0 20px'}}>@{user}</div>
      )})}
    </div>

  );
}