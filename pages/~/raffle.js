import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export default function ProfilePage() {
  const router = useRouter();
  const [data, setData] = useState([])

  useEffect(() => {
    getCuratorData()

  }, []);



  async function getCuratorData() {
    try {
      const response = await axios.get('/api/testing/raffle')
      if (response?.data) {
        const userData = response?.data?.userData

        let username = []

        for (const user of userData) {
          for (let i = 0; i < user.total; i = i + 10) {
            username.push(user.username)
          }
        }


        setData(username)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setData([])
    }
  }



  return (
    <div className='flex-col' style={{width: 'auto', position: 'relative'}}>
      <div className="" style={{padding: '58px 0 0 0'}}>
      </div>

      {data?.length > 0 && data.map((user, index) => { return (
        <div key={index} className='' style={{gap: '1.5rem', color: '#eee'}}>@{user}</div>
      )})}
      </div>

  );
}