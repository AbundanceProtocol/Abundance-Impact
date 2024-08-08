import React from 'react';

const Modal = ({modal}) => {
  return (
    <div>
      {modal.on && (
        <>
          <div className="modalConainer" style={{borderRadius: '10px', backgroundColor: modal.success ? '#9e9' : '#e99'}}>
            <div className='flex-col' id="notificationContent" style={{alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontSize: '20px', width: '380px', maxWidth: '380px', fontWeight: '400', height: 'auto', padding: '6px', fontSize: '16px'}}>{modal.text}</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Modal;