import React from 'react';

const ExpandImg = ({embed, closeImagePopup, show, screenWidth, screenHeight}) => {
  return (
    show && (
    <div>
      (
        <>
          <div className="overlay" onClick={closeImagePopup}></div>
          <img loading="lazy" src={embed.showPopup.url} className='popupConainer' alt="Cast image embed" style={{aspectRatio: 'auto', maxWidth: screenWidth, maxHeight: screenHeight, cursor: 'pointer', position: 'fixed', borderRadius: '12px'}} onClick={closeImagePopup} />
        </>
      )
    </div>
    )
  )
}

export default ExpandImg;