import React, { useState, useContext } from 'react';
// import { GiMeat, GiTwoCoins } from "react-icons/gi";
// import { Degen } from '../../../pages/assets';
// import { formatNum } from '../../../utils/utils';
import { AccountContext } from '../../../context';
import { FaStar } from 'react-icons/fa';
import { IoMdRefresh as Refresh} from "react-icons/io";
import axios from 'axios';
import { PiMedal, PiCheckFat } from "react-icons/pi";

const ImpactScale = ({ initValue, setTipPercent, setInitValue, type, cast, updateCast, index }) => {
  const { isLogged, userBalances, setUserBalances, fid } = useContext(AccountContext)
  const [fail, setFail] = useState(false)
  const [success, setSuccess] = useState(false)

  const [value, setValue] = useState(5);
  const handleChange = (event) => {
    setValue(parseInt(event.target.value));
  };

  const handleMouseLeave = () => {
    // setTipPercent(value)
    setInitValue(value)
  };

  function clickFailed() {
    setFail(true);
    setTimeout(() => {
      setFail(false);
    }, 1000);
  }

  function nomSuccess() {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  }


  async function boostImpact(cast, impactAmount) {

    const castContext = {
      author_fid: cast.author.fid,
      author_pfp: cast.author.pfp_url,
      author_username: cast.author.username,
      author_display_name: cast.author.display_name,
      cast_hash: cast.hash,
      cast_text: cast.text,
      cast_channel: cast.root_parent_url
    }
    
    console.log('cast, impactAmount', cast, impactAmount, fid, fid !== '-', impactAmount, userBalances?.impact > 0)
    // console.log('112 ca1', fid, cast, impactAmount, ecosystem)
    async function postImpact(fid, castContext, impactAmount) {
      try {
        const response = await axios.post('/api/curation/postPointImpact', { fid, castContext, impactAmount, points: '$IMPACT' })
        return response
      } catch (error) {
        console.error('Error creating post:', error);
        return null
      }
    }

    let impactResponse
    if (fid && fid !== '-' && impactAmount && castContext && userBalances?.impact > 0) {
      impactResponse = await postImpact(fid, castContext, impactAmount)
      if (impactResponse?.data && impactResponse.status == 201) {
        let impactBalance = impactResponse?.data?.balance
        let currentImpact = cast.impact_balance || 0
        let addedPoints = impactResponse.data.points
        const updatedCast = {...cast, impact_balance: currentImpact + addedPoints}
        updateCast(index, updatedCast)
        setUserBalances(prev => ({
          ...prev,
          impact: impactBalance
        }))
        console.log('userBalance', impactBalance)

        nomSuccess()
      } else {
        console.log('fail')
        clickFailed()
      }
    } else {
      clickFailed()
    }
  }



  return (
    <div 
      className='flex-col' 
      style={{ width: '100%', gap: '0.2rem', alignItems: 'center', margin: '20px auto 10px auto', border: '1px solid #999', padding: '13px 12px 3px 12px', borderRadius: '10px', backgroundColor: '#002244cc'}}
      onMouseLeave={handleMouseLeave} 
      onTouchEnd={handleMouseLeave}
    >
      <div style={{textAlign: 'center', fontSize: '16px', fontWeight: '400', color: '#eee', margin: `2px 2px`, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80%'}}>
        How impactful is this cast on Farcaster?
      </div>
      <div className='flex-row' style={{ width: '100%', padding: '5px', gap: '0.0rem'}}>
        <input
          type="range"
          min="1"
          max={userBalances.impact}
          value={value || 5}
          onChange={handleChange}
          style={{ width: '100%' }}
        />



        <FaStar size={25} className='' style={{fontSize: '25px', color: '#eee', margin: '0 2px 0 18px'}} />
        <div style={{textAlign: 'left', fontSize: '19px', fontWeight: '600', color: '#eee', margin: `2px`, display: 'flex', alignItems: 'left', justifyContent: 'left', width: '50px'}}>
          {value || 5}
        </div>
      </div>
      <div>
      <div className='flex-row' style={{alignContent: 'center', alignItems: 'center', gap: '0.25rem', margin: '10px'}}>
        <div onClick={
            () => {
              if (isLogged) {
                if(userBalances.impact >= value) {
                  boostImpact(cast, value || 5)
                } else { 
                  clickFailed()
                }
              }
            }
          }
          className={`flex-row ${success ? 'btn-act' : (fail) ? 'btn-off' : 'btn-on'}`}
          style={{
            borderRadius: "16px",
            padding: "4px 16px",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.25rem",
            margin: '0px 0 10px 0',
            cursor: 'pointer'
          }}
        >
          {success ? (<PiCheckFat size={20} />): (<PiMedal size={20} />)}
          <p
            style={{
              padding: "2px 10px 2px 2px",
              fontSize: "20px",
              fontWeight: "700",
              textWrap: "nowrap",
            }}
          >
            {success ? 'Nominated!' : 'Nominate'}
          </p>

        </div>

      </div>
      </div>




    </div>
  );
};

export default ImpactScale;