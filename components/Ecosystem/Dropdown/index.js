import React, { useState, useEffect } from 'react';
import useMatchBreakpoints from '../../../hooks/useMatchBreakpoints';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FaRegFaceMeh, FaRegFaceFrown, FaRegFaceSmileBeam  } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { formatNum } from '../../../utils/utils';

export default function Dropdown({ title, setupEcosystem, target, button, conditions, cancel, isSet, onInput, placeholder, value, inputKeyDown, removeField, setCondition, state }) {
  const { isMobile } = useMatchBreakpoints();
  const [initCond, setInitCond] = useState(0)
  const [cond, setCond] = useState(initCond);
  const [selectedChain, setSelectedChain] = useState(0);
  const [selectedToken, setSelectedToken] = useState(0);
  const [fieldState, setFieldState] = useState(state)
  const [initSliderValue, setInitSliderValue] = useState(10)
  const [sliderValue, setSliderValue] = useState(initSliderValue);

  const chains = [
    { value: 0, label: 'Select', chainId: null },
    { value: 1, label: 'Ethereum', chainId: 'eip155:1' },
    { value: 2, label: 'Optimism', chainId: 'eip155:10' },
    { value: 3, label: 'Base', chainId: 'eip155:8453' },
    { value: 4, label: 'Arbitrum', chainId: 'eip155:42161' },
    { value: 5, label: 'Zora', chainId: 'eip155:7777777' },
    { value: 6, label: 'Polygon', chainId: 'eip155:137' },
    { value: 7, label: 'Degenchain', chainId: 'eip155:666666666' },
    { value: 8, label: 'Hamchain', chainId: 'eip155:5112' },
  ]

  const tokens = [
    { value: 0, label: 'Select' },
    { value: 1, label: '$ETH' },
    { value: 2, label: '$OP' },
    { value: 3, label: '$DEGEN' },
    { value: 4, label: '$TN100x' },
    { value: 5, label: '$ENJOY' },
    { value: 6, label: '$GLM' },
    { value: 7, label: '$RARE' },
    { value: 8, label: 'Other...' },
  ]

  const handleSlider = (event) => {
    setSliderValue(parseInt(event.target.value));
  };

  const handleMouseLeave = () => {
    setInitSliderValue(sliderValue)

  // if (name == 'tip-percent') {
    let valueState = {tipPercent: Number(sliderValue)}
  // }
  setCondition('tip-percent', target, valueState)
  };

  useEffect(() => {
    console.log(state)
    let updatedFieldState = {...fieldState}
    if (!updatedFieldState.tipName) {
      updatedFieldState.tipName = 'Tip points'
    }
    if (!updatedFieldState.tip) {
      updatedFieldState.tip = 1
    }
    if (!updatedFieldState.hypersub) {
      updatedFieldState.hypersub = 'Hypersub address'
    }
    if (!updatedFieldState.hypersubAddress) {
      updatedFieldState.hypersubAddress = ''
    }
    if (!updatedFieldState.chain) {
      updatedFieldState.chain = 0
    }
    if (!updatedFieldState.nft) {
      updatedFieldState.nft = 'Nft address'
    }
    if (!updatedFieldState.nftAddress) {
      updatedFieldState.nftAddress = ''
    }
    if (!updatedFieldState.token) {
      updatedFieldState.token = 0
    }
    if (!updatedFieldState.tokenMin) {
      updatedFieldState.tokenMin = 'Token min'
    }
    if (!updatedFieldState.tokenMinValue) {
      updatedFieldState.tokenMinValue = 0
    }
    if (!updatedFieldState.erc20) {
      updatedFieldState.erc20 = 'ERC20'
    }
    if (!updatedFieldState.erc20Address) {
      updatedFieldState.erc20Address = ''
    }
    if (!updatedFieldState.qdaoUp && updatedFieldState.qdaoUp !== 0) {
      console.log('triggered')
      updatedFieldState.qdaoUp = 1
    }
    if (!updatedFieldState.qdaoUpName) {
      updatedFieldState.qdaoUpName = 'qDAO Up'
    }
    if (!updatedFieldState.qdaoDown && updatedFieldState.qdaoUp !== 0) {
      console.log('triggered')
      updatedFieldState.qdaoDown = -1
    }
    if (!updatedFieldState.qdaoDownName) {
      updatedFieldState.qdaoDownName = 'qDAO Down'
    }
    if (!updatedFieldState.tipPercentName) {
      updatedFieldState.tipPercentName = 'Tip percent'
    }
    setFieldState(updatedFieldState)
  }, [])

  let setButton = 'btn-empty'
  if (isSet == 'empty') {
    setButton = 'btn-empty'
  } else if (isSet == 'error') {
    setButton = 'btn-error'
  } else if (isSet == 'working') {
    setButton = 'btn-set'
  } else if (isSet == 'set') {
    setButton = 'btn-hvr'
  }

  const handleChange = (event) => {
    setCond(event.target.value);
    setInitCond(event.target.value);
    console.log(event.target.value)
    setCondition(event.target.value, target)
  };

  const handleChainChange = (event, name) => {
    // console.log(event)
    let valueState = null
    if (name == 'nft-chain') {
      valueState = {chain: event.target.value}
    } else if (name == 'erc20-token') {
      valueState = {token: event.target.value}
    }
    setSelectedChain(event.target.value)
    // setCondition(event.target.value, target)
    setCondition(name, target, valueState)

  }

  const handleTokenChange = (event, name) => {
    setSelectedToken(event.target.value)
    let valueState = null
    if (name == 'erc20-token') {
      valueState = {token: event.target.value}
    } else if (name == 'erc20-chain') {
      valueState = {chain: event.target.value}
    }
    // setCondition(name, target, event.target.value, target)
    setCondition(name, target, valueState)
  }

  const getValues = (event, name) => {
    console.log(event.target.value, event.target.name, name, target)
    let valueState = null
    if (name == 'nft-address') {
      valueState = {nftAddress: event.target.value}
    } else if (name == 'tip-value') {
      valueState = {tip: event.target.value}
    } else if (name == 'hypersub-address') {
      valueState = {hypersubAddress: event.target.value}
    } else if (name == 'erc20-value') {
      valueState = {tokenMinValue: event.target.value}
    } else if (name == 'erc20-address') {
      valueState = {erc20Address: event.target.value}
    } else if (name == 'erc20-min-token') {
      valueState = {tokenMinValue: Number(event.target.value)}
    } else if (name == 'qdao-up') {
      valueState = {qdaoUp: Number(event.target.value)}
    } else if (name == 'qdao-down') {
      valueState = {qdaoDown: Number(event.target.value)}
    } else if (name == 'tip-percent') {
      console.log(event.target.value)
      if (event.target.value >= 100) {
        valueState = {tipPercent: 100}
        setSliderValue(100);
      } else if (event.target.value <= 1 || isNaN(event.target.value)) {
        valueState = {tipPercent: 1}
        setSliderValue(1);
      } else {
        setSliderValue(parseInt(event.target.value));
        valueState = {tipPercent: parseInt(event.target.value)}
      }
    }
    setCondition(name, target, valueState)
  }

  return (
    <div className='active-nav-link btn-hvr' style={{border: '1px solid #777', padding: '2px', borderRadius: '10px', margin: '3px 3px 13px 3px', backgroundColor: '', maxWidth: '100%', cursor: 'default', width: 'auto'}}>
      
      <div className="" style={{width: '100%'}}>
        <div className="flex-row" style={{padding: '0 10px', marginBottom: '0px', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '0.00rem', width: '100%', alignItems: 'center'}}>

          {title && (
          <div className='flex-col' style={{flexGrow: 1}}>
            <div style={{fontSize: isMobile ? '16px' : '20px', fontWeight: '600', color: '', padding: '10px 13px 10px 3px'}}>
              {title}
            </div>
          </div>)}

          <div style={{margin: '10px 5px 10px 0', width: '', flexGrow: title ? 0 : 1}}>
            <select value={value} onChange={handleChange} style={{backgroundColor: '#adf', borderRadius: '4px', padding: isMobile ? '7px 4px' : '6px', fontSize: isMobile ? '14px' : '16px', width: '100%', fontWeight: '600'}}>
              {conditions.map((condition) => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>
          <div className={`flex-row ${setButton} btn-hvr`} style={{border: '0px solid #abc', padding: '1px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', margin: isMobile ? '10px 0 10px 5px' : '10px 0 10px 5px'}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '4px 0px', fontWeight: '600'}}>
              {(isSet == 'empty') ? (<FaRegFaceMeh  size={isMobile ? 18 : 20} />
              ) : (isSet == 'error') ? (<FaRegFaceFrown size={isMobile ? 18 : 20} />
              ) : (<FaRegFaceSmileBeam size={isMobile ? 18 : 20} />
              )}
            </div>
          </div>
          {button && (<div className={`flex-row active-nav-link btn-hvr`} style={{border: '1px solid #abc', padding: '1px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', margin: isMobile ? '10px 0 10px 10px' : '10px 0 10px 10px'}} onClick={() => {setupEcosystem(target)}}>
            <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '5px', fontWeight: '600'}}>
              {button}
            </div>
          </div>)}
        {cancel && (<div className={`flex-row active-nav-link btn-hvr`} style={{border: '1px solid #abc', padding: '1px 5px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', margin: isMobile ? '10px 0 10px 10px' : '10px 0 10px 10px'}} onClick={() => {removeField(target)}}>
          <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem', padding: '7px 3px', fontWeight: '600'}}>
            <FaRegTrashAlt size={15} />
          </div>
        </div>)}
      </div>



      {(value == 'tip') && (
        <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'center', justifyContent: 'flex-start'}}
         >
          <div className='flex-col' style={{flexGrow: 0}}>
            <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px'}}>
              Points per $1 tipped: 
            </div>
          </div>
          <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '', flexGrow: 0, position: 'relative'}}>
            <input onChange={() => {getValues(event, 'tip-value')}} 
              name={fieldState.tipName} 
              placeholder='1' 
              value={state?.tip || fieldState.tip} 
              type='number' 
              className='srch-btn' 
              style={{width: '100px', backgroundColor: '#234', margin: '0'}} 
              onKeyDown={() => {getValues(event, 'tip-value')}} />
          </div>
        </div>
      )}
      {(value == 'qdao') && (
        <div className='flex-col' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'flex-start', justifyContent: 'flex-start'}}
         >
          <div className='flex-row' style={{alignItems: 'center'}}>
            <div className='flex-col' style={{flexGrow: 0}}>
              <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px'}}>
                Points per upvote: 
              </div>
            </div>
            <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '', flexGrow: 0, position: 'relative'}}>
              <input onChange={() => {getValues(event, 'qdao-up')}} 
                name={fieldState.qdaoUpName} 
                placeholder='1' 
                value={state?.qdaoUp || fieldState.qdaoUp} 
                type='number'
                step='0.5' 
                className='srch-btn' 
                style={{width: '100px', backgroundColor: '#234', margin: '0'}} 
                onKeyDown={() => {getValues(event, 'qdao-up')}} />
            </div>
          </div>
          <div className='flex-row' style={{alignItems: 'center'}}>
            <div className='flex-col' style={{flexGrow: 0}}>
              <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px'}}>
                Points per downvote: 
              </div>
            </div>
            <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '', flexGrow: 0, position: 'relative'}}>
              <input onChange={() => {getValues(event, 'qdao-down')}} 
                name={fieldState.qdaoDownName} 
                placeholder='1' 
                value={state?.qdaoDown || fieldState.qdaoDown} 
                type='number' 
                step='0.5' 
                className='srch-btn' 
                style={{width: '100px', backgroundColor: '#234', margin: '0'}} 
                onKeyDown={() => {getValues(event, 'qdao-down')}} />
            </div>
          </div>
        </div>
      )}
      {(value == 'hypersub') && (
        <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
          <div className='flex-col' style={{flexGrow: 0}}>
            <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px', textWrap: 'nowrap'}}>
              Hypersub address: 
            </div>
          </div>
          <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '100%', flexGrow: 1, position: 'relative'}}>
            <input onChange={() => {getValues(event, 'hypersub-address')}} 
              name={fieldState.hypersub} 
              placeholder='0x...' 
              value={state?.hypersubAddress || fieldState.hypersubAddress} 
              className='srch-btn' 
              style={{width: '100%', backgroundColor: '#234', margin: '0'}} 
              onKeyDown={() => {getValues(event, 'hypersub-address')}} />
          </div>
        </div>
      )}
      {(value == 'percent-tipped') && (
        <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
          <div className='flex-col' style={{flexGrow: 0}}>
            <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px', textWrap: 'nowrap'}}>
              % tipped: 
            </div>
          </div>


          <div className='flex-row' style={{ width: '100%', padding: '3px 12px', gap: '1.0rem', alignItems: 'center' }}
          onMouseLeave={handleMouseLeave} onTouchEnd={handleMouseLeave}>
            <input
              type="range"
              min="1"
              max="100"
              value={sliderValue}
              onChange={handleSlider}
              style={{ width: '100%' }} />
          </div>


          <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '', flexGrow: 0, position: 'relative'}}>
            <input onChange={() => {getValues(event, 'tip-percent')}} 
              name={fieldState.tipPercentName} 
              placeholder='1' 
              value={sliderValue} 
              type='number' 
              step='1' 
              className='srch-btn' 
              style={{width: '70px', backgroundColor: '#234', margin: '0'}} 
              onKeyDown={() => {getValues(event, 'tip-percent')}} />
            </div>
        </div>
      )}
      {(value == 'follow-owner') && (
        <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
          <div className='flex-col' style={{flexGrow: 0}}>
            <div style={{fontSize: isMobile ? '11px' : '13px', fontWeight: '600', color: '', padding: '0px 13px 0px 0px', textWrap: 'nowrap'}}>
              Only applies to channels 
            </div>
          </div>
        </div>
      )}
      {(value == 'follow-channel') && (
        <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
          <div className='flex-col' style={{flexGrow: 0}}>
            <div style={{fontSize: isMobile ? '11px' : '13px', fontWeight: '600', color: '', padding: '0px 13px 0px 0px', textWrap: 'nowrap'}}>
              Only applies to channels 
            </div>
          </div>
        </div>
      )}
      {(value == 'nft') && (
        <div className='flex-col'>
          <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 0px 10px' : '0 10px 0px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
            <div className='flex-col' style={{flexGrow: 0}}>
              <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px'}}>
                Chain: 
              </div>
            </div>
            <div style={{margin: '10px 5px 10px 0', width: '', flexGrow: title ? 0 : 1}}>
              <select value={state?.chain || fieldState.chain} onChange={() => {handleChainChange(event, 'nft-chain')}} style={{backgroundColor: '#adf', borderRadius: '4px', padding: isMobile ? '7px 4px' : '6px', fontSize: isMobile ? '14px' : '16px', width: 'auto', fontWeight: '600'}}>
                {chains.map((chain) => (
                  <option key={chain.value} value={chain.value}>
                    {chain.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
          <div className='flex-col' style={{flexGrow: 1, width: 'content-width'}}>
            <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px', textWrap: 'nowrap'}}>
              NFT address: 
            </div>
          </div>
          <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '100%', flexGrow: 1, position: 'relative'}}>
            <input onChange={() => {getValues(event, 'nft-address')}} 
              name={fieldState.nft} 
              placeholder='0x...' 
              value={state?.nftAddress || fieldState.nftAddress} 
              className='srch-btn' 
              style={{width: '100%', backgroundColor: '#234', margin: '0'}} 
              onKeyDown={() => {getValues(event, 'nft-address')}} />
          </div>
        </div>
      </div>
      )}
      {(value == 'erc20') && (
        <div className='flex-col'>
          <div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 0px 10px' : '0 10px 0px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
            <div className='flex-col' style={{flexGrow: 0}}>
              <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px'}}>
                Token: 
              </div>
            </div>
            <div style={{margin: '10px 5px 10px 0', width: '', flexGrow: title ? 0 : 0}}>
              <select value={state?.token || fieldState.token} onChange={() => {handleChainChange(event, 'erc20-token')}} style={{backgroundColor: '#adf', borderRadius: '4px', padding: isMobile ? '7px 4px' : '6px', fontSize: isMobile ? '14px' : '16px', width: 'auto', fontWeight: '600'}}>
                {tokens.map((token) => (
                  <option key={token.value} value={token.value}>
                    {token.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='flex-col' style={{flexGrow: 0}}>
              <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 13px'}}>
                Min. held: 
              </div>
            </div>

            <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '', flexGrow: 1, position: 'relative'}}>
              <input onChange={() => {getValues(event, 'erc20-min-token')}} 
                name={fieldState.tokenMin} 
                placeholder='1' 
                value={state?.tokenMinValue || fieldState.tokenMinValue} 
                type='number' 
                className='srch-btn' 
                style={{width: '100%', backgroundColor: '#234', margin: '0'}} 
                onKeyDown={() => {getValues(event, 'erc20-min-token')}} />
            </div>
          </div>
          {state?.token == '8' && (<div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 0px 10px' : '0 10px 0px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
            <div className='flex-col' style={{flexGrow: 0}}>
              <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px'}}>
                Chain: 
              </div>
            </div>
            <div style={{margin: '10px 5px 10px 0', width: '', flexGrow: title ? 0 : 1}}>
              <select value={state?.chain || fieldState.chain} onChange={() => {handleTokenChange(event, 'erc20-chain')}} style={{backgroundColor: '#adf', borderRadius: '4px', padding: isMobile ? '7px 4px' : '6px', fontSize: isMobile ? '14px' : '16px', width: 'auto', fontWeight: '600'}}>
                {chains.map((chain) => (
                  <option key={chain.value} value={chain.value}>
                    {chain.label}
                  </option>
                ))}
              </select>
            </div>
          </div>)}
          {state?.token == '8' && (<div className='flex-row' style={{width: 'auto', padding: '1px 5px', margin: isMobile ? '0 10px 10px 10px' : '0 10px 10px 10px', alignItems: 'center', justifyContent: 'flex-start'}}>
          <div className='flex-col' style={{flexGrow: 0, width: 'auto'}}>
            <div style={{fontSize: isMobile ? '13px' : '18px', fontWeight: '600', color: '', padding: '0px 13px 0px 3px', textWrap: 'nowrap'}}>
              ERC20 address: 
            </div>
          </div>
          <div className='flex-row' style={{margin: isMobile ? (title ? '0 0 10px 0' : '5px 0 5px 0px') : (title ? '5px 0 5px 10px' : '5px 0 5px 0'), width: '100%', flexGrow: 1, position: 'relative'}}>
            <input onChange={() => {getValues(event, 'erc20-address')}} 
              name={fieldState.erc20} 
              placeholder='0x...' 
              value={state?.erc20Address || fieldState.erc20Address} 
              className='srch-btn' 
              style={{width: '100%', backgroundColor: '#234', margin: '0'}} 
              onKeyDown={() => {getValues(event, 'erc20-address')}} />
          </div>
        </div>)}
      </div>
      )}
      </div>
    </div>
  );
}