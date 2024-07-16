import React from 'react'
import Tips from '../../tip';

export default function Ecosystem({time, curators, channels, tags, shuffle, referrer, eco, ecosystem}) {
  
  return (
    <Tips {...{time, curators, channels, tags, shuffle, referrer, eco, ecosystem}} />
  )
}


export async function getServerSideProps(context) {
  // Fetch dynamic parameters from the context object
  const { query, params } = context;
  const { time, channels, tags, shuffle, referrer } = query;
  const { ecosystem, curators, eco } = params;
  console.log(time, curators, channels, tags, shuffle, referrer, eco)
  let setTime = 'all'
  let setEco = null
  if (eco) {
    setEco = eco
  }
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
  if (shuffle || shuffle == false) {
    if (shuffle == 'true') {
      setShuffle = true
    } else if (shuffle == 'false') {
      setShuffle = false
    }
  }
  let setReferrer = referrer || null
  console.log('192:', setTime, setCurators, setShuffle, setReferrer, setEco, ecosystem)
  return {
    props: {
      time: setTime,
      curators: setCurators,
      channels: setChannels,
      tags: setTags,
      shuffle: setShuffle,
      referrer: setReferrer,
      eco: setEco,
      ecosystem: ecosystem
    },
  };
}