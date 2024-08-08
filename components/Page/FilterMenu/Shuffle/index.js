import React from "react"
import { IoShuffleOutline as ShuffleIcon } from "react-icons/io5";

const Shuffle = ({ handleSelect, selection, userQuery }) => {

  return (
    <div className={`flex-row ${userQuery[selection] ? 'active-nav-link btn-hvr' : 'nav-link btn-hvr'}`} style={{border: '1px solid #abc', padding: '2px 6px 2px 6px', borderRadius: '5px', justifyContent: 'flex-start', alignItems: 'flex-start'}} onClick={() => {handleSelect(selection)}}>
      <div className={`flex-row`} style={{alignItems: 'center', gap: '0.3rem'}}>
        <ShuffleIcon size={22} />
      </div>
    </div>
  )
}

export default Shuffle;