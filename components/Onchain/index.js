import { useRef, useContext, useEffect, useState } from 'react';
import { useAccount, useReadContract, useContractWrite, usePrepareContractWrite, useWaitForTransactionReceipt, useReadContracts } from "wagmi";
import contractABI from '../../contracts/bulksender.json'

export default function Onchain() {
  const { address, isConnected } = useAccount()
  const [sched, setSched] = useState({read: false})
  const [onchainData, setOnchainData] = useState('none')

  const result = useReadContracts({
    contracts: [
      {
        address: '0x95BDA90196c4e737933360F4639c46Ace657AAb7',
        abi: contractABI.abi,
        functionName: 'owner',
        chainId: 8453
      },
    ],
  })

  useEffect(() => {

    if (sched.read) {
      if (result?.data?.length > 0) {
        console.log('address', result?.data[0])
        setOnchainData(result?.data[0]?.result)
      }
      setSched(prev => ({...prev, read: false }))
    } else {
      const timeoutId = setTimeout(() => {
        if (result?.data?.length > 0) {
          // console.log('address', result?.data[0]?.result)
          setOnchainData(result?.data[0]?.result)
        }
        setSched(prev => ({...prev, read: false }))
      }, 4000);
      return () => clearTimeout(timeoutId);
    }

  }, [result, sched.read]);

  return (
    <div style={{fontSize: '14px'}}>{onchainData}</div>
  )
}
