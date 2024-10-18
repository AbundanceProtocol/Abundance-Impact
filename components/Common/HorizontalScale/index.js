import React, { useState } from 'react';
import { GiMeat, GiTwoCoins } from "react-icons/gi";
import { Degen } from '../../../pages/assets';
import { formatNum } from '../../../utils/utils';

const HorizontalScale = ({ initValue, setTipPercent, tokenData, setTokenData, availableTokens, tokensSelected, setInitValue, type }) => {
  const [value, setValue] = useState(initValue);
  const handleChange = (event) => {
    setValue(parseInt(event.target.value));
  };

  const handleMouseLeave = () => {
    setTipPercent(value)
    setInitValue(value)
  };

  const handleToken = (selection) => {
    if (selection === 'All tokens') {
      availableTokens.forEach((tokenSymbol) => {
        setTokenData((prevTokenData) => {
          const tokenIndex = prevTokenData.findIndex(token => token.token == tokenSymbol);
          if (tokenIndex !== -1) {
            const updatedTokenData = [...prevTokenData];
            updatedTokenData[tokenIndex].set = true
            return updatedTokenData
          } else {
            const newToken = {token: tokenSymbol, set: true}
            return [...prevTokenData, newToken];
          }
        })
      })
    } else {
      const tokenIndex = tokenData.findIndex(token => token.token == selection);
      if (tokenIndex !== -1) {
        const updatedTokenData = [...tokenData];
        if (updatedTokenData[tokenIndex].set == true) {
          updatedTokenData[tokenIndex].set = false
        } else {
          updatedTokenData[tokenIndex].set = true
        }
        setTokenData(updatedTokenData)
      } else {
        const newToken = {token: selection, set: true}
        setTokenData(prev => ({...prev, newToken }))
      }
    }
  }


  return (
    <div 
      className='flex-row' 
      style={{ width: '100%', padding: '3px 12px', gap: '1.0rem', alignItems: 'center' }}
      onMouseLeave={handleMouseLeave} 
      onTouchEnd={handleMouseLeave}
    >
      <input
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={handleChange}
        style={{ width: '100%' }}
      />
      <div className='flex-col' style={{gap: '0.45rem'}}>
        <div className='flex-row' style={{flexWrap: 'wrap', justifyContent: 'center', gap: '0.35rem', width: '160px'}}>
        {(tokenData?.length > 0) && tokenData.map((token, index) => {
          return (
            <div key={index} className='flex-row' style={{border: (token.allowance == 0 && type !== 'schedule') ? '1px solid #888' : token.set ? '1px solid #abc' : '1px solid #aaa', borderRadius: '6px', padding: '2px 5px', color: (token.allowance == 0 && type !== 'schedule') ? '#888' : token.set ? '#9df' : '#ccc', gap: '0.35rem', alignItems: 'center', cursor: (token.allowance == 0 && type !== 'schedule') ? 'default' : 'pointer', backgroundColor: (token.allowance == 0 && type !== 'schedule') ? 'transparent' : token.set ? '#246' : 'transparent'}} onClick={() => {
              if (token.allowance > 0 || type == 'schedule') {
              handleToken(token.token)
            }}}>
            <div style={{textAlign: 'center', color: (token.allowance == 0 && type !== 'schedule') ? '#888' : token.set ? '#9df' : '#ccc', fontSize: '15px', fontWeight: '700'}}>
              {type == 'schedule' ? value + '%' : formatNum(Math.round(token.allowance * value / 100))}
            </div>
            {(token.token == '$DEGEN') ? (<div style={{fontSize: '11px'}}>$DEGEN</div>) : (token.token == '$TN100x') ? (<div style={{fontSize: '11px'}}>$HAM</div>) : (token.token == '$HUNT') ? (<div style={{fontSize: '11px'}}>$HUNT</div>) : (<GiTwoCoins />)}
          </div>)
        })}
        </div>
        <div className='flex-row' style={{gap: '0.5rem', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{ textAlign: 'center', color: '#def', fontSize: '12px' }}>({value}%)</div><div style={{border: '1px solid #abc', fontSize: '12px', color: (tokensSelected.length == 0 || tokensSelected.length == 2) ? '#9df' : '#eee', padding: '1px 3px', borderRadius: '5px', backgroundColor: (tokensSelected.length == 0 || tokensSelected.length == 2) ? '#246' : 'transparent', cursor: 'pointer'}} onClick={() => {handleToken('All tokens')}}>SELECT ALL</div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalScale;