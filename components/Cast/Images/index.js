import React, { useRef, useEffect, useState } from 'react';

export default function Images({ image, index, subindex, textMax, handleClick }) {

  const embed = {url: image}

  return (
    <div className="" key={`${index}-${subindex}`}>
      <div className="flex-col" style={{position: 'relative'}}>
        <img 
          loading="lazy" 
          src={image} 
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
  );
}