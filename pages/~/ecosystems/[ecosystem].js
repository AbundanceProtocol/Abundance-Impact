import React from 'react'
import Home from '../..';

export default function Ecosystem({time, curators, channels, tags, shuffle, referrer, ecosystem}) {
  
  return (
    <Home {...{time, curators, channels, tags, shuffle, referrer, ecosystem}} />
  )
}


export async function getServerSideProps(context) {
  // Fetch dynamic parameters from the context object
  const { query, params } = context;
  const { time, curators, channels, tags, shuffle, referrer, eco } = query;
  const { ecosystem } = params;

  let setTime = 'all'
  let setEco = eco || '$IMPACT'
  if (time) {
    setTime = time
  }
  let setCurators = []
  if (curators) {
    setCurators = Array.isArray(curators) ? curators : [curators]
  }  
  let setChannels = []
  if (channels) {
    setChannels = Array.isArray(channels) ? channels : [channels]
  }
  let setTags = []
  if (tags) {
    setTags = Array.isArray(tags) ? tags : [tags]
  }
  let setShuffle = false
  if (shuffle) {
    if (shuffle == 'true') {
      setShuffle = true
    } else if (shuffle == 'false') {
      setShuffle = false
    }
  }
  let setReferrer = referrer || null
  console.log(setTime, setCurators, setChannels, setTags, setShuffle)
  return {
    props: {
      time: setTime,
      curators: setCurators,
      channels: setChannels,
      tags: setTags,
      shuffle: setShuffle,
      referrer: setReferrer,
      ecosystem: ecosystem
    },
  };
}