import React from "react"

const TopPicks = ({ handleSelection, selection }) => {

  return (
    <div className="flex-row" style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'center', marginLeft: '4px'}} onClick={() => {handleSelection(selection)}}>
      <div className="flex-row" style={{alignItems: 'center', gap: '0.3rem'}}>
        <span className="channel-font" style={{color: '#eee'}}>Top Picks</span>
    </div>
    </div>
  )
}

export default TopPicks;