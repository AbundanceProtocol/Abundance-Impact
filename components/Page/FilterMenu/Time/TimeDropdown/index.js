import React from "react";

const TimeDropdown = ({ handleSelect, userQuery, options, selection }) => {

  return (
    <div className='flex-col' style={{gap: '0.25rem', padding: '6px 6px', borderRadius: '10px', backgroundColor: '#1D3244dd', border: '1px solid #abc', width: 'auto', marginTop: '10px', alignItems: 'flex-start'}}>
      {options.map((option, index) => (
        <span key={index} className={`selection-btn ${userQuery[selection] == option.value ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{justifyContent: 'flex-start'}} onClick={() => {handleSelect(selection, option.value)}}>{option.text}</span>
      ))}
    </div>
  )
}

export default TimeDropdown;