import React, { useRef, useEffect, useState } from 'react';

export default function Images({ embed, index, subindex, textMax, handleClick }) {
  const [isImage, setIsImage] = useState(true)


  async function checkImage(embed) {
    if (embed && embed.url && (embed.type == 'other')) {
      let img = new Image()
      img.src = embed.url
      setIsImage(img.complete && img.naturalWidth !== 0)
    } else {
      setIsImage(false)
    }
  }

  useEffect(() => {
    checkImage(embed)
  }, [])

  return (
    <>
      {(embed && embed.type && (embed.type == 'image' || (embed.type == 'other' && isImage))) && (
        <div className="" key={`${index}-${subindex}`}>
          <div className="flex-col" style={{position: 'relative'}}>
            <img 
              loading="lazy" 
              src={embed.url} 
              alt="Cast image embed" 
              style={{
                maxWidth: textMax, 
                maxHeight: '500px', 
                marginTop: '10px', 
                cursor: 'pointer', 
                position: 'relative',
                borderRadius: '8px'}} 
                onClick={() => {handleClick(embed)}} />
          </div>
        </div>
      )}
    </>
  );
}