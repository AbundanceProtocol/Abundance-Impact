import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const FrameButton = ({frameData, button, buttonAction, type, index}) => {
  return (
    type == 'link' ? (
      <div className='frame-btn' style={{flex: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '1 1 45%' : (frameData?.buttons?.length == 3 && index !== 2) ? '1 1 45%' : '1 100%', maxWidth: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '50%' : (frameData?.buttons?.length == 3 && index !== 2) ? '50%' : '100%', width: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '50%' : (frameData?.buttons?.length == 3 && index !== 2) ? '50%' : '100%'}}>
          <a className="" title="" href={button.target} target="_blank" rel="noopener noreferrer">
        <div className='flex-row' style={{alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
          <div>{button.title}</div>
          {button.action_type == 'link' && (
            <FaExternalLinkAlt color={'#aaa'} size={14} />)}
        </div>
      </a>
      </div>
    ) : type == 'post' ? (
      <div className='frame-btn' onClick={() => {buttonAction(button)}} style={{flex: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '1 1 45%' : (frameData?.buttons?.length == 3 && index !== 2) ? '1 1 45%' : '1 100%', maxWidth: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '50%' : (frameData?.buttons?.length == 3 && index !== 2) ? '50%' : '100%', width: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '50%' : (frameData?.buttons?.length == 3 && index !== 2) ? '50%' : '100%'}}>
        <div className='flex-row' style={{alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
          {button.title}
        </div>
      </div>
    ) : (
      <div key={index} className='frame-btn' onClick={() => {buttonAction(button)}} style={{flex: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '1 1 45%' : (frameData?.buttons?.length == 3 && index !== 2) ? '1 1 45%' : '1 100%', maxWidth: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '50%' : (frameData?.buttons?.length == 3 && index !== 2) ? '50%' : '100%', width: (frameData?.buttons?.length == 4 || frameData?.buttons?.length == 2) ? '50%' : (frameData?.buttons?.length == 3 && index !== 2) ? '50%' : '100%'}}>
        <div className='flex-row' style={{alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
          <div>{button.title}</div>
          {button.action_type == 'link' && (
            <FaExternalLinkAlt color={'#aaa'} size={14} />)}
        </div>
      </div>
    )
  )
}

export default FrameButton;