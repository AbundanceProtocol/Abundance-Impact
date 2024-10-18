import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

export default function Embed({ url, index, subindex, textMax }) {
  const [embed, setEmbed] = useState(null)
  const [sched, setSched] = useState({metadata: false})

  async function populateEmbeds(url) {
    try {
      const metaData = await axios.get('/api/getMetaTags', {
        params: { url } })
      if (metaData?.data) {
        setEmbed(metaData?.data)
      } else {
        setEmbed(null)
      }
    } catch (error) {
      console.error('Error, populateEmbeds failed:', error)
      setEmbed(null)
    }
  }

  useEffect(() => {

    if (sched.metadata) {
      populateEmbeds(url)
      setSched(prev => ({...prev, metadata: false }))
    } else {
      const timeoutId = setTimeout(() => {
        populateEmbeds(url)
        setSched(prev => ({...prev, metadata: false }))
      }, 1000);
      return () => clearTimeout(timeoutId);
    }

  }, [sched.metadata])


  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{marginTop: '10px'}} key={`${index}-${subindex}`} >
      <div className="flex-col url-meta">
        {(embed?.image) && (
          <img 
          loading="lazy" 
          src={embed?.image} 
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
          {(embed?.title) && (
            <div style={{fontSize: '13px', color: '#333', fontWeight: '600'}}>{embed?.title}</div>
          )}
          {(embed?.description) && (
            <div style={{fontSize: '11px', color: '#333', fontWeight: '500'}}>{embed?.description}</div>
          )}
          {(embed?.metadata && embed?.domain) && (
            <div style={{fontSize: '11px', color: '#555', fontWeight: '400'}}>{embed?.domain}</div>
          )}
        </div>
      </div>
    </a>
  );
}