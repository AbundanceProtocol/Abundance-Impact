import React, { useContext } from "react";
import useStore from "../../../utils/store";
import { AccountContext } from "../../../context";
import { ActiveUser, Degen } from '../../../pages/assets'
import { FaPowerOff, FaRegStar } from "react-icons/fa";
import { HiRefresh } from "react-icons/hi";
import { IoDiamondOutline as Diamond } from "react-icons/io5";
import { formatNum } from "../../../utils/utils";
import DashboardBtn from "../../Panels/DashboardBtn";

const UserData = ({ user, textMax, userAllowance, getCurationAllowance, show }) => {
  const store = useStore()
  const { LoginPopup, LogoutPopup, userBalance } = useContext(AccountContext)
  // const userRemainingImpact = useStore(state => state.userRemainingImpact);
  // const userRemainingQuality = useStore(state => state.userRemainingQuality);

 return (
  show && (
    <div className="inner-container flex-col" style={{width: '100%', display: 'flex', flexDirection: 'col', justifyContent: 'space-between', backgroundColor: '#33445588', gap: '1rem'}}>
      <div className='flex-row' style={{gap: '0.5rem'}}>
        <div style={{width: '100%'}}>
          <div className="flex-row">
            <span className="" datastate="closed" style={{margin: '0 10px 0 0'}}>
              <a className="" title="" href={`https://farcaster.xyz/${user?.username}`}>
                <img loading="lazy" src={user?.pfp_url} className="" alt={`${user?.display_name} avatar`} style={{width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px', borderRadius: '24px', border: '1px solid #cdd'}} />
              </a>
            </span>
            <div className="flex-col" style={{width: '100%', gap: '1rem', alignItems: 'flex-start'}}>
              <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '', alignItems: 'flex-start'}}>
                <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap'}}>
                  <span className="">
                    <a className="fc-lnk" title="" href={`https://farcaster.xyz/${user?.username}`}>
                      <div className="flex-row" style={{alignItems: 'center'}}>
                        <span className="name-font" style={{color: '#cdd', fontSize: '18px'}}>{user?.display_name}</span>
                        <div className="" style={{margin: '0 0 0 3px'}}>
                          {(user?.power_badge) && (<ActiveUser />)}
                        </div>
                      </div>
                    </a>
                  </span>
                  <span className="user-font">
                    <a className="fc-lnk" title="" href={`https://farcaster.xyz/${user?.username}`} style={{color: '#cdd'}}>@{user?.username}</a>
                  </span>
                  <div className="">·</div>
                  <a className="fc-lnk" title="Navigate to cast" href={`https://farcaster.xyz/${user?.username}`}>
                    <div className="fid-btn" style={{backgroundColor: '#355', color: '#cdd'}}>fid: {user?.fid}</div>
                  </a>
                </div>
              </div>
              <div className="">
                <div style={{wordWrap: 'break-word', maxWidth: textMax, color: '#cdd'}}>{user?.profile?.bio?.text}</div>
              </div>
              <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly'}}>
                <div className="" style={{flex: 1}}>
                  <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                    <div style={{fontWeight: '700', fontSize: '13px'}} title={user?.following_count}>{formatNum(user?.following_count)}</div>
                    <div style={{fontWeight: '400'}}>following</div>
                  </div>
                </div>
                <div className="flex-row" style={{flex: 2}}>
                  <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                    <div style={{fontWeight: '700', fontSize: '13px'}} title={user?.follower_count}>{formatNum(user?.follower_count)}</div>
                    <div style={{fontWeight: '400'}}>followed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex-col' style={{gap: '0.5rem', alignItems: 'center'}}>
          {store.isAuth ? (<div className='mini-out-btn' style={{height: 'max-content', textAlign: 'center', width: '30px', padding: '6px', alignItems: 'center', justifyContent: 'center'}} onClick={LogoutPopup}>
            <FaPowerOff size={20} color='#fff' />
            </div>) : (<div className='logout-btn' style={{height: 'max-content', textAlign: 'center'}} onClick={LoginPopup}>Login</div>)}
          <div className='follow-select' style={{width: 'auto', padding: '5px 5px 8px 5px', textAlign: 'center'}} onClick={() => getCurationAllowance(user?.fid)}>
            <HiRefresh size={22} color='#fff' />
          </div>
        </div>
        </div>
        <div className='flex-row' style={{justifyContent: 'center', gap: '0.5rem'}}>
          <DashboardBtn amount={formatNum(userAllowance)} type={'allowance'} icon={Degen} />
          <DashboardBtn amount={formatNum(userBalance?.impact || 0)} type={'impact'} icon={FaRegStar} />
          <DashboardBtn amount={formatNum(userBalance?.qdau || 0)} type={'q/dau'} icon={Diamond} />
        </div>
      </div>
    )
  )
}

export default UserData;