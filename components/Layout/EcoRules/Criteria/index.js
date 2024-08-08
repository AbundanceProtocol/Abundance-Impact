import React from 'react';
import { getTokenAddress, shortenAddress } from '../../../../utils/utils';
import Link from 'next/link';
import Criterion from './Criterion';

const Criteria = ({ecoData, eligibility, isMobile}) => {

  return (
    <div className='flex-col' style={{gap: isMobile ? '0.25rem' : '0.25rem', margin: isMobile ? '10px 20px' : '10px 0 0 0'}}>
      <Criterion show={eligibility?.modReq && eligibility?.mod && ecoData} condition={eligibility?.badge}>
        Moderator
      </Criterion>

      <Criterion show={eligibility?.hasWalletReq} condition={eligibility?.hasWallet}>
        Has verified wallet
      </Criterion>

      <Criterion show={eligibility?.badgeReq && !eligibility?.mod && ecoData} condition={eligibility.badge}>
        Has Powerbadge
      </Criterion>

      <Criterion show={eligibility?.channelFollowerReq && !eligibility?.mod && ecoData} condition={eligibility?.channelFollower}>
        Follows channel
      </Criterion>

      {(ecoData?.erc20s.map((erc20, index) => (
        <Criterion show={eligibility?.holdingERC20Req && !eligibility?.mod && ecoData?.erc20s?.length > 0} key={index} condition={eligibility?.holdingERC20}>
          Holds a min. of {erc20.min} <a href={getTokenAddress(erc20.erc20_chain, erc20.erc20_address, 'token')} className="fc-lnk" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline'}}>{shortenAddress(erc20.erc20_address)}</a>
        </Criterion>)))}

      {(ecoData.nfts.map((nft, index) => (
        <Criterion show={eligibility?.holdingNFTReq && !eligibility?.mod && ecoData?.nfts?.length > 0} key={index} condition={eligibility?.holdingNFT}>
          Holds <a href={getTokenAddress(nft.nft_chain, nft.nft_address, 'token')} className="fc-lnk" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline'}}>{shortenAddress(nft.nft_address)}</a> NFT
        </Criterion>)))}

      <Criterion show={eligibility?.ownerFollowerReq && !eligibility?.mod && ecoData?.owner_name} condition={eligibility?.ownerFollower}>
        Follows <Link href={`/${ecoData?.owner_name}`}>@{ecoData?.owner_name}</Link>
      </Criterion>
      
    </div>
  )
}

export default Criteria;