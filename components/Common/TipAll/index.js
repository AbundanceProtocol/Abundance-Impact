import React, { useContext, useState } from 'react';
import { AccountContext } from '../../../context';
import { FaLock } from 'react-icons/fa';
import useStore from '../../../utils/store';
import Spinner from '../Spinner';
import { processTips } from '../../../utils/utils';
import axios from 'axios';

const TipAll = ({ tokenData, setTokenData, loading, setLoading, noTip, modal, setModal, userFeed, tipPercent }) => {
  const { LoginPopup, isLogged, fid, ecoData, points } = useContext(AccountContext)
  const store = useStore()

  async function postMultiTip() {

    const { castData, coinTotals } = await processTips(userFeed, fid, tokenData, ecoData?.ecosystem_name, ecoData?.percent_tipped)

    if (castData?.length > 0 && store.signer_uuid) {
      setLoading(true)
      try {
        const response = await axios.post('/api/curation/postMultipleTips', {       
          signer: store.signer_uuid,
          fid: fid,
          data: castData,
          points: points
        })
        console.log(castData)
        if (response?.status !== 200) {
          setLoading(false)
          console.log(response)
          setModal({on: true, success: false, text: 'Tipping all casts failed'});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);
        } else {
          let updatedTokenData = [...tokenData]
          for (const token of updatedTokenData) {
            if (token.set) {
              if (token.token == '$TN100x') {
                token.allowance = token.allowance - (coinTotals[token.token].totalTip * 10)
              } else {
                token.allowance = token.allowance - coinTotals[token.token].totalTip
              }
              token.totalTip = Math.round(token.allowance * tipPercent / 100)
            }
          }
          setTokenData(updatedTokenData)
          setLoading(false)
          console.log(response)
          setModal({on: true, success: true, text: response.data.message});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);
        }
        console.log(response.status)
      } catch (error) {
        console.error('Error submitting data:', error)
      }
    }
  }


  return (
    isLogged ? (
      <div className="flex-row">
        <div className={`flex-row ${(loading || noTip) ? 'follow-locked' : 'follow-select'} ${modal.success ? 'flash-success' : ''}`} style={{position: 'relative', height: 'auto', width: '100px', marginRight: '0', cursor: (loading || noTip) ? 'default' : 'pointer'}}>
          {(loading || noTip) ? (
            <div className='flex-row' style={{height: '100%', alignItems: 'center'}}>
              <Spinner size={21} color={'#999'} />
            </div>
          ) : (
            <div className='cast-btn'
            onClick={() => { if (!noTip) { postMultiTip() }}}
            name='follow' style={{color: loading ? 'transparent' : '#fff', height: 'auto', width: '100px'}}>TIP ALL</div>
          )}
        </div>
      </div>
    ) : (
      <div className="flex-row follow-locked" style={{position: 'relative', height: 'auto', width: '100px', marginRight: '0'}}>
        <div className='cast-btn' onClick={LoginPopup} style={{height: 'auto', width: '100px'}}>TIP ALL</div>
        <div className='top-layer' style={{position: 'absolute', top: 0, right: 0, transform: 'translate(40%, -60%)' }}>
          <FaLock size={8} color='#eee' />
        </div>
      </div>
    )
  );
}

export default TipAll;