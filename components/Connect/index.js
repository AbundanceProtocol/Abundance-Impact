'use client'

import { FaWallet } from "react-icons/fa6";

export default function Connect() {
  return <>
    {/* <w3m-network-button /> */}
    {/* <w3m-connect-button /> */}
    <w3m-button balance="hide" size="sm" label="Connect Wallet" />
    <style>
        {`
          w3m-button::part(balance), 
          w3m-button::part(address) {
            display: none !important;
          }
        `}
      </style>
  </>
}