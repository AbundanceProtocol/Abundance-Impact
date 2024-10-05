import React, { useRef, useEffect, useState } from 'react';
import FrameButton from './Button';

export default function Frame({ frames, embed, frame, index, subindex, textMax }) {

  


  useEffect(() => {
    // checkImage(embed)
  }, [])

  const buttonAction = async (button) => {
    const updatedPayload = {...payload}
    updatedPayload.buttonIndex = button.index
    updatedPayload.inputText = inputText
    updatedPayload.fid = fid

    setPayload(updatedPayload)

    const url = button.target

    async function postFrame(url, untrustedData) {
      try {
        const response = await axios.post(url, {untrustedData})
        // console.log(response)
  
        if (response.headers['content-type'].includes('text/html')) {
          const $ = cheerio.load(response.data);
          const metadata = {};
  
          $('meta').each((i, elem) => {
              const name = $(elem).attr('name') || $(elem).attr('property');
              if (name) {
                  metadata[name] = $(elem).attr('content');
              }
          });
  
          return metadata;
      } else {
          throw new Error('Response is not of type text/html');
      }
  
      } catch (error) {
        console.log('Error:', error)
      }
    }

    const getframeData = await postFrame(url, updatedPayload) 
    
    if (getframeData) {
      let updatedFrameData = {...frameData}
      updatedFrameData.input = null
      updatedFrameData.buttons = null
      let frameMeta = []
      for (let i = 1; i <= 4; i++) {
        if (getframeData[`fc:frame:button:${i}`] && getframeData[`fc:frame:button:${i}:action`] && getframeData[`fc:frame:button:${i}:target`]) {
          let context = {
            index: i + 1,
            title: getframeData[`fc:frame:button:${i}`],
            action_type: getframeData[`fc:frame:button:${i}:action`],
            target: getframeData[`fc:frame:button:${i}:target`]
          }
          frameMeta.push(context)
        }
      }
      updatedFrameData.buttons = frameMeta
      updatedFrameData.image = getframeData[`fc:frame:image`]
      if (getframeData[`fc:frame:image:aspect_ratio`]) {
        updatedFrameData.image_aspect_ratio = getframeData[`fc:frame:image:aspect_ratio`]
      }
      console.log(frameMeta)
      if (getframeData[`fc:frame:input:text`]) {
        let input = {text: getframeData[`fc:frame:input:text`]}
        updatedFrameData.input = input
      }
      console.log(getframeData)
      console.log(updatedFrameData, updatedFrameData.buttons.length, updatedFrameData.buttons)
      setFrameData(updatedFrameData)
    } else {
      console.log('error')
    }
  }

  async function onInput(event) {
    setInputText(event.target.value)
  }


  return (
    frames && (<div>
      {frames && (<div className="flex-col" style={{border: '1px solid #666', padding: '8px 8px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '0.5rem'}}>
        <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem'}}>
          <img src={frames.image} style={{width: 'auto', height: 'auto', maxWidth: textMax, minWidth: 'auto', minHeight: 'auto', borderRadius: '5px', aspectRatio: frames.image_aspect_ratio == '1:1' ? '1 / 1' : '16 / 9'}} />
        </div>
        <div className='flex-row' style={{width: '100%', justifyContent: 'space-evenly', gap: '0.5rem', flexWrap: 'wrap'}}>

          {frames?.input && (<input onChange={onInput} 
            name='frame-input' 
            placeholder={frames.input.text} 
            value={inputText} 
            className='srch-btn' 
            style={{width: '100%', backgroundColor: '#234', margin: '0', color: '#fff'}} 
          />)}
              
          {frames?.buttons && (frames.buttons.map((button, index) => (
            <FrameButton key={index} {...{frameData: frames, button, buttonAction, type: button.action_type, index}} />
          )))}
        </div>
      </div>)}
    </div>)
  );
}