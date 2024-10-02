import React, { useContext, useState } from 'react';
import { AccountContext } from '../../../context';
import { FaLock } from 'react-icons/fa';
import useStore from '../../../utils/store';
import axios from 'axios';

const TipScheduler = ({ initHour, setInitHour, initMinute, setInitMinute, userQuery, tokenData, initValue, setLoading, type, setModal }) => {
  const { LoginPopup, isLogged, fid, ecoData, points } = useContext(AccountContext)
  const [hour, setHour] = useState(initHour);
  const [minute, setMinute] = useState(initMinute);
  const store = useStore()

  // Generate options for hours (0-23)
  const hoursOptions = [
    { value: 'Hr', label: 'Hr' },
    ...Array.from({ length: 24 }, (_, i) => ({
        value: i.toString().padStart(2, '0'),
        label: i.toString().padStart(2, '0'),
    })),
  ];

  // Generate options for minutes (00, 30)
  const minutesOptions = [
    { value: '0', label: 'Min' },
    { value: '00', label: '00' },
    { value: '30', label: '30' },
  ];

  const handleHourChange = (event) => {
    setHour(event.target.value);
    setInitHour(event.target.value);
  };

  const handleMinuteChange = (event) => {
    setMinute(event.target.value);
    setInitMinute(event.target.value);
  };

  const handleSubmit = async (fid, uuid, percent) => {
    // Schedule the task with the selected hour and minute
    let minutes = minute
    if (minute == '0') {
      minutes = '00'
    }
    const schedTime = `${minutes} ${hour} * * *`;
    const { shuffle, time, tags, channels, curators } = userQuery
    console.log(schedTime)
    let currencies = []
    console.log(tokenData)
    for (const token of tokenData) {
      if (token.set) {
        currencies.push(token.token)
      }
    }

    async function postSchedule(shuffle, time, tags, channels, curators, schedTime, fid, uuid, percent, currencies, points, ecosystem) {
      console.log(currencies)
      try {
        setLoading(true)
        setInitHour('Hr')
        setInitMinute('0')
        const response = await axios.post('/api/curation/postTipSchedule', { fid, uuid, shuffle, time, tags, channels, curators, percent, schedTime, currencies, points, ecosystem })
        let schedData = []

        if (response?.status !== 200) {
          setLoading(false)
          // console.log(response)
          setModal({on: true, success: false, text: 'Tip scheduling failed'});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);
        } else {
          setLoading(false)
          // console.log(response)

          setModal({on: true, success: true, text: response?.data?.message});
          setTimeout(() => {
            setModal({on: false, success: false, text: ''});
          }, 2500);
        }  
        return schedData
      } catch (error) {
        console.error('Error submitting data:', error)
        return null
      }
    }

    if (points && fid && ecoData?.ecosystem_name) {
      const schedData = await postSchedule(shuffle, time, tags, channels, curators, schedTime, fid, uuid, percent, currencies, points, ecoData?.ecosystem_name)
    }
  };

  return (
    <>
      <div className={`flex-col ${(hour !== 'Hr' && isLogged) ? 'follow-select' : 'follow-locked'}`} style={{width: '150px', gap: '0.25rem', alignItems: 'center', justifyContent: 'center', padding: type == 'schedule' ? '6px 8px 6px 8px' : '0px 8px', height: type == 'schedule' ? '60px': '48px', margin: '2px 0 2px 10px', cursor: 'default', maxWidth: '150px'}}>
        <div className='flex-row' style={{gap: '0.5rem'}}>
          <select id="hourSelect" value={hour} onChange={handleHourChange} style={{backgroundColor: '#adf', borderRadius: '4px'}}>
            {hoursOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select id="minuteSelect" value={minute} onChange={handleMinuteChange} style={{backgroundColor: '#adf', borderRadius: '4px'}}>
            {minutesOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => {
          if (!isLogged) { 
            LoginPopup() 
          } else if (hour !== 'Hr') {
            handleSubmit(fid, store.signer_uuid, initValue) 
          }}} style={{backgroundColor: 'transparent', fontWeight: '600', color: '#fff', cursor: (hour !== 'Hr' || !isLogged) ? 'pointer' : 'default', fontSize: '12px', padding: '0'}}>{type == 'schedule' ? 'MODIFY SCHEDULE' : 'SCHEDULE TIP'}</button>
      </div>
      {!isLogged && (<div style={{position: 'relative', fontSize: '0', width: '0', height: '100%'}}>
        <div className='top-layer' style={{position: 'absolute', top: 0, left: 0, transform: 'translate(-170%, -10%)' }}>
          <FaLock size={8} color='#eee' />
        </div>
      </div>)}
    </>
  );
}

export default TipScheduler;