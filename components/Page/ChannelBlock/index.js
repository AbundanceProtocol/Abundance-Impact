'use client'
import React, { useContext, useEffect, useState } from "react";
import { ActiveUser } from '../../assets'
import { formatNum } from "../../../utils/utils";
import { AccountContext } from "../../../context";
import { useRouter } from 'next/router';
import { FaPowerOff, FaRegStar } from "react-icons/fa";
import { BsFillPersonFill, BsShareFill, BsPiggyBank, BsPiggyBankFill, BsGiftFill, BsCurrencyExchange } from "react-icons/bs";
import useMatchBreakpoints from "../../../hooks/useMatchBreakpoints";
import axios from "axios";

const version = process.env.NEXT_PUBLIC_VERSION;

const ChannelBlock = ({ channelData, textMax, show, type, feedMax, onTipToggle, showTip }) => {
  const { points, fid, autotipping, setAutotipping, isLogged, LoginPopup, LogoutPopup, adminTest, isMiniApp } = useContext(AccountContext)
  const [sched, setSched] = useState({autotip: false})
  const [curators, setCurators] = useState(null)
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints();


  const setChannel = async () => {

    const { sdk } = await import('@farcaster/miniapp-sdk')
    const isApp = await sdk.isInMiniApp();

    let shareUrl = `https://impact.abundance.id/~/curator/${channelData?.id}`

    let shareText = `I'm signal-boosting impactful creators & builders on the /${channelData?.id} channel:`
    

    let encodedShareText = encodeURIComponent(shareText)
    let encodedShareUrl = encodeURIComponent(shareUrl); 
    let shareLink = `https://farcaster.xyz/~/compose?text=${encodedShareText}&embeds[]=${[encodedShareUrl]}`

    if (!isApp) {
      window.open(shareLink, '_blank');
    } else if (isApp) {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: [shareUrl],
        close: false
      })

      // window.parent.postMessage({
      //   type: "createCast",
      //   data: {
      //     cast: {
      //       text: shareText,
      //       embeds: [shareUrl]
      //     }
      //   }
      // }, "*");
    }



  };


  return (
    show && (

      <div style={{ padding: "0px 4px 0px 4px", width: feedMax }}>
        {((version == "1.0" && !adminTest) || version == "2.0" || adminTest) && (
          <div className="flex-col" style={{ backgroundColor: "" }}>
            <div
              className="shadow flex-col"
              style={{
                backgroundColor: "#002244",
                borderRadius: "15px",
                border: "1px solid #11447799",
                width: isMiniApp || isMobile ? "340px" : "100%",
                margin: isMiniApp || isMobile ? "0px auto 0 auto" : "0px auto 0 auto"
              }}
            >
              <div
                className="shadow flex-row"
                style={{
                  backgroundColor: "#11448888",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  borderRadius: "15px",
                  margin: "0 0 10px 0",
                  gap: "1rem"
                }}
              >
                <div
                  className="flex-row"
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    padding: "0px 0 0 4px",
                    margin: "0 0 0px 0"
                  }}
                >
                  {channelData ? (<img loading="lazy" src={channelData?.pfp?.url} className="" alt={`${channelData?.displayName} avatar`} style={{width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px', borderRadius: '24px', border: '1px solid #cdd'}} />): (<BsFillPersonFill style={{ fill: "#cde" }} size={20} />)}
                  <div>
                    <div
                      style={{
                        border: "0px solid #777",
                        padding: "2px",
                        borderRadius: "10px",
                        backgroundColor: "",
                        maxWidth: "fit-content",
                        cursor: "pointer",
                        color: "#cde"
                      }}
                    >
                      <div className="top-layer flex-row">
                        <div
                          className="flex-row"
                          style={{
                            padding: "4px 0 4px 10px",
                            marginBottom: "0px",
                            flexWrap: "wrap",
                            justifyContent: "flex-start",
                            gap: "0.00rem",
                            width: "",
                            alignItems: "center"
                          }}
                        >
                          <div
                            style={{
                              fontSize: isMobile ? "18px" : "22px",
                              fontWeight: "600",
                              color: "",
                              padding: "0px 3px"
                            }}
                          >
                            {channelData?.username ? `${'' + channelData?.username}` : 'Channel'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex-row"
                    style={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer"
                    }}
                  ></div>
                </div>


                <div style={{fontSize: isMobile ? '12px' : '12px', padding: '6px 10px', backgroundColor: '#135', borderRadius: '8px', border: '1px solid #8ac', color: '#def', fontSize: '12px'}}>CHANNEL</div>

                {/* <ToggleSwitch target={'autoFund'} /> */}
              </div>

              <div
                className="flex-col"
                style={{
                  backgroundColor: "#002244ff",
                  padding: "0px 18px 18px 18px",
                  borderRadius: "0 0 15px 15px",
                  color: "#ace",
                  fontSize: "12px",
                  gap: "0.75rem",
                  position: "relative"
                }}
              >
                <div
                  className="flex-col"
                  style={{
                    color: "#9df",
                    width: "100%",
                    fontSize: isMobile ? "15px" : "17px",
                    padding: "0",
                    justifyContent: "center",
                    alignItems: "center",
                    userSelect: "none"
                  }}
                >


                  <div className="flex-col" style={{gap: '1rem', margin: '0 0 10px 0'}}>







                  <div className="flex-col" style={{width: '100%', gap: '1rem', alignItems: 'flex-start'}}>
                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-between', height: '', alignItems: 'flex-start'}}>
                      <div className="flex-row" style={{alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap'}}>
                        <span className="">
                          <a className="fc-lnk" title="" href={`https://farcaster.xyz/~/channel/${channelData?.id}`}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font" style={{color: '#cdd', fontSize: '18px'}}>{channelData?.displayName}</span>
                              {/* <div className="" style={{margin: '0 0 0 3px'}}>
                                {(channelData?.activeOnFcNetwork) && (<ActiveUser />)}
                              </div> */}
                            </div>
                          </a>
                        </span>
                        {/* <span className="channelData-font">
                          <a className="fc-lnk" title="" href={`https://farcaster.xyz/${channelData?.username}`} style={{color: '#cdd'}}>@{channelData?.username}</a>
                        </span> */}
                        {/* <div className="">·</div> */}
                        {/* <a className="fc-lnk" title="Navigate to cast" href={`https://farcaster.xyz/~/channel/${channelData?.id}`}>
                          <div className="fid-btn" style={{backgroundColor: '#003366', color: '#cdd'}}>fid: {channelData?.fid}</div>
                        </a> */}
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: textMax, color: '#cdd'}}>{channelData?.profile?.bio?.text}</div>
                    </div>
                  </div>



















                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly', gap: '1rem'}}>
                      <div className="" style={{flex: 1}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                          <div style={{fontWeight: '700', fontSize: '13px'}} title={channelData?.followingCount}>{formatNum(channelData?.followingCount)}</div>
                          <div style={{fontWeight: '400'}}>members</div>
                        </div>
                      </div>

                      <div className="flex-row" style={{flex: 2}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                          <div style={{fontWeight: '700', fontSize: '13px'}} title={channelData?.followerCount}>{formatNum(channelData?.followerCount)}</div>
                          <div style={{fontWeight: '400'}}>followed</div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="flex-row" style={{gap: '1rem', margin: '10px 0 0 0'}}>

                    {/* <div
                      onClick={(event) => {
                        if (isLogged) {
                          if (autotipping.includes(channelData?.fid)) {
                            removeAutotip(event, channelData?.fid)
                          } else {
                            addAutotip(event, channelData?.fid)
                          }
                        } else {
                          LoginPopup()
                        }
                      }}
                      // href={"/~/rewards"}
                      className="flex-col"
                      style={{
                        // width: "100%",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="flex-row"
                        style={{
                          gap: "0.75rem",
                          margin: "0px",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div
                            className="flex-row cast-act-lt"
                            style={{
                              borderRadius: "8px",
                              padding: "8px 8px",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              height: "40px",
                              width: "80px",
                              backgroundColor: autotipping.includes(channelData?.fid) ? '#fff' : ''
                              // backgroundColor: "#aaa"
                            }}
                          >
                            {(autotipping.includes(channelData?.fid)) ? (<BsPiggyBankFill color={'#000'} size={20} style={{ width: "21px" }} />) : (<BsPiggyBankFill color={'#000'} size={20} style={{ width: "21px" }} />)}
                            <p
                              style={{
                                padding: "0px",
                                fontSize: isMobile ? "15px" : "15px",
                                fontWeight: "500",
                                textWrap: "wrap",
                                textAlign: "center",
                                color: '#000'
                              }}
                            >
                              {autotipping.includes(channelData?.fid) ? 'Funding' : 'Fund'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div> */}


                    <div
                      onClick={() => {
                        if (onTipToggle) {
                          onTipToggle();
                        }
                      }}
                      className="flex-col"
                      style={{
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <div
                        className="flex-row"
                        style={{
                          gap: "0.75rem",
                          margin: "0px",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div
                            className="flex-row cast-act-lt"
                            style={{
                              borderRadius: "8px",
                              padding: "8px 8px",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              height: "40px",
                              width: "80px",
                              backgroundColor: showTip ? '#fff' : ''
                            }}
                          >
                            <BsCurrencyExchange color={'#000'} size={20} style={{ width: "30px" }} />
                            <p
                              style={{
                                padding: "0px",
                                fontSize: isMobile ? "15px" : "15px",
                                fontWeight: "500",
                                textWrap: "wrap",
                                textAlign: "center",
                                color: '#000'
                              }}
                            >
                              Tip
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>



                    <div
                      onClick={setChannel}
                      // href={"/~/rewards"}
                      className="flex-col"
                      style={{
                        // width: "100%",
                        justifyContent: "center",
                        alignItems: "center"
                      }}
                    >
                      <div
                        className="flex-row"
                        style={{
                          gap: "0.75rem",
                          margin: "0px",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <div
                            className="flex-row cast-act-lt"
                            style={{
                              borderRadius: "8px",
                              padding: "8px 8px",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.25rem",
                              height: "40px",
                              width: "80px"
                              // backgroundColor: "#aaa"
                            }}
                          >
                            {(!isMobile || isMobile) && <BsShareFill color={'#000'} size={20} style={{ width: "30px" }} />}
                            <p
                              style={{
                                padding: "0px",
                                fontSize: isMobile ? "15px" : "15px",
                                fontWeight: "500",
                                textWrap: "wrap",
                                textAlign: "center",
                                color: '#000'
                              }}
                            >
                              Share
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>



                  </div>
                </div>



              </div>
            </div>
          </div>
        )}
      </div>

    )
  )
}

export default ChannelBlock;