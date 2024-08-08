import React from "react";
import { BsClock } from "react-icons/bs";
import TimeDropdown from "./TimeDropdown";

const Time = ({ handleSelection, handleSelect, userQuery, options, selection, isSelected, isMobile, btnText }) => {

  return (
    <div style={{position: 'relative'}}>
      <div className={`flex-row ${!isMobile ? 'active-nav-link btn-hvr' : ''}`} style={{border: '1px solid #abc', padding: `2px 6px 2px 6px`, borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', borderBottom: (isSelected == selection) ? '2px solid #99ddff' : '1px solid #abc', height: '28px'}} onMouseEnter={() => {handleSelection(selection)}} onMouseLeave={() => {handleSelection('none')}}>
        <div className="flex-row" style={{alignItems: 'center', gap: isMobile ? '0' : '0.3rem', selection: 'none'}}>
          <BsClock size={15} color='#eee' />
          <span className={`${!isMobile ? 'selection-btn' : ''}`} style={{cursor: 'pointer', padding: '0'}}>{!isMobile && btnText(selection)}</span>
        </div>
      </div>
      {(isSelected == selection) && (
        <div className='top-layer' style={{position: 'absolute'}} onMouseEnter={() => {handleSelection(selection)}} onMouseLeave={() => {handleSelection('none')}}>
          <TimeDropdown handleSelect={handleSelect} userQuery={userQuery} options={options} selection={selection} />
        </div>
      )}
    </div>
  )
}

export default Time;