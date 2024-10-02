import React, { useRef } from 'react';

export default function Embed({ embed, index, subindex, textMax }) {

  return (
    <a href={embed.url} target="_blank" rel="noopener noreferrer" style={{marginTop: '10px'}} key={`${index}-${subindex}`} >
      <div className="flex-col url-meta">
        {(embed.metadata && embed.metadata.image) && (
          <img 
          loading="lazy" 
          src={embed.metadata.image} 
          alt="Link image" 
          style={{
            width: textMax, 
            maxHeight: '500px', 
            maxWidth: '500px', 
            cursor: 'pointer', 
            position: 'relative',
            border: '1px solid #888', 
            borderRadius: '8px 8px 0 0'}} />
        )}
        <div className='flex-col' style={{border: '1px solid #888', borderRadius: '0 0 8px 8px', padding: '10px'}}>
          {(embed.metadata && embed.metadata.title) && (
            <div style={{fontSize: '13px', color: '#333', fontWeight: '600'}}>{embed.metadata.title}</div>
          )}
          {(embed.metadata && embed.metadata.description) && (
            <div style={{fontSize: '11px', color: '#333', fontWeight: '500'}}>{embed.metadata.description}</div>
          )}
          {(embed.metadata && embed.metadata.domain) && (
            <div style={{fontSize: '11px', color: '#555', fontWeight: '400'}}>{embed.metadata.domain}</div>
          )}
        </div>
      </div>
    </a>
  );
}