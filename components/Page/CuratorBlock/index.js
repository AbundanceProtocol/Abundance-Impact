import React, { useContext, useEffect, useState } from "react";
import { ActiveUser } from '../../../pages/assets'
import { formatNum } from "../../../utils/utils";
import { AccountContext } from "../../../context";
import { useRouter } from 'next/router';
import { FaPowerOff, FaRegStar } from "react-icons/fa";
import { BsFillPersonFill, BsShareFill, BsPiggyBank, BsPiggyBankFill } from "react-icons/bs";
import useMatchBreakpoints from "../../../hooks/useMatchBreakpoints";
import axios from "axios";

const version = process.env.NEXT_PUBLIC_VERSION;

const CuratorBlock = ({ user, textMax, show, type, feedMax }) => {
  const { points, fid, autotipping, setAutotipping, isLogged, LoginPopup, LogoutPopup, adminTest, isMiniApp } = useContext(AccountContext)
  const [sched, setSched] = useState({autotip: false})
  const [curators, setCurators] = useState(null)
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints();

  useEffect(() => {
    console.log('user', user)
    if (sched.autotip) {
      if (fid) {
        getUserAutotips(fid)
      }
      setSched(prev => ({...prev, autotip: false }))
    } else {
      const timeoutId = setTimeout(() => {
        if (fid) {
          getUserAutotips(fid)
        }
        setSched(prev => ({...prev, autotip: false }))
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [router.query, sched.autotip]);

  async function getUserAutotips(fid) {
    console.log('trigger getAutotipCurators', fid)
    try {
      const response = await axios.get('/api/curation/getAutotipCurators', {
        params: { fid } })
      if (response?.data?.curators?.length > 0 || curators) {
        const userAutotips = response?.data?.curators
        console.log('userAutotips', userAutotips)
        setAutotipping(userAutotips)
      } else {
        setAutotipping([])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setAutotipping([])
    }
  }

  async function removeAutotip(event, curatorFid) {
    event.preventDefault();
    console.log('remove', curatorFid)
    if (!isLogged) {
      LoginPopup()
      return
    } else {
      try {
        const response = await axios.post('/api/curation/removeAutotip', { fid, curators: curatorFid, points });
        console.log(response)
        if (response?.data) {
          let schedCurators = response?.data?.schedule?.search_curators || []
          if (!schedCurators.includes(curatorFid)) {
            setAutotipping(schedCurators);
            console.log(`Added ${curatorFid} to autotipping list`);
          }
        } else {
          console.log('Failed to add curator to autotipping list');
        }
      } catch (error) {
        console.error('Error adding autotip curator:', error);
      }
    }
  }

  async function addAutotip(event, curatorFid) {
    event.preventDefault();
    console.log('add', fid, curatorFid, points)
    if (!isLogged) {
      LoginPopup()
      return
    } else {
      try {
        const response = await axios.post('/api/curation/addAutotip', { fid, curators: curatorFid, points });
        console.log(response)
        if (response?.data) {
          let schedCurators = response?.data?.schedule?.search_curators || []
          if (schedCurators.includes(curatorFid)) {
            setAutotipping(prevAutotipping => [...prevAutotipping, curatorFid]);
            console.log(`Added ${curatorFid} to autotipping list`);
          }
        } else {
          console.log('Failed to add curator to autotipping list');
        }
      } catch (error) {
        console.error('Error adding autotip curator:', error);
      }
    }
  }

  const setCurator = async () => {
    // router.push({
    //   pathname: `/~/ecosystems/abundance/curators/${user?.username}/multi-tip`,
    //   query: { userFid: user?.fid, name: user?.username }
    // });
    if (typeof window === 'undefined') return;
    const { sdk } = await import("@farcaster/miniapp-sdk");
    const isApp = await sdk.isInMiniApp();

    let shareUrl = `https://impact.abundance.id/~/curator/${user?.fid}`

    let shareText = `I'm signal-boosting impactful creators & builders thru /impact\n\nCheck my curation:`


    if (fid && user?.fid && (Number(fid) !== Number(user?.fid))) {
      shareText = `Loving @${user?.username}'s curation of impactful builders & creators on /impact\n\nCheck @${user?.username}'s latest picks:`
    }

    

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
                  {user ? (<img loading="lazy" src={user?.pfp?.url} className="" alt={`${user?.displayName} avatar`} style={{width: '28px', height: '28px', maxWidth: '28px', maxHeight: '28px', borderRadius: '24px', border: '1px solid #cdd'}} />): (<BsFillPersonFill style={{ fill: "#cde" }} size={20} />)}
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
                            {user?.username ? `${'@' + user.username}` : 'Curator'}
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


                <div style={{fontSize: isMobile ? '12px' : '12px', padding: '6px 10px', backgroundColor: '#135', borderRadius: '8px', border: '1px solid #8ac', color: '#def', fontSize: '12px'}}>CURATOR</div>

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
                          <a className="fc-lnk" title="" href={`https://farcaster.xyz/${user?.username}`}>
                            <div className="flex-row" style={{alignItems: 'center'}}>
                              <span className="name-font" style={{color: '#cdd', fontSize: '18px'}}>{user?.displayName}</span>
                              {/* <div className="" style={{margin: '0 0 0 3px'}}>
                                {(user?.activeOnFcNetwork) && (<ActiveUser />)}
                              </div> */}
                            </div>
                          </a>
                        </span>
                        {/* <span className="user-font">
                          <a className="fc-lnk" title="" href={`https://farcaster.xyz/${user?.username}`} style={{color: '#cdd'}}>@{user?.username}</a>
                        </span> */}
                        <div className="">·</div>
                        <a className="fc-lnk" title="Navigate to cast" href={`https://farcaster.xyz/${user?.username}`}>
                          <div className="fid-btn" style={{backgroundColor: '#003366', color: '#cdd'}}>fid: {user?.fid}</div>
                        </a>
                      </div>
                    </div>
                    <div className="">
                      <div style={{wordWrap: 'break-word', maxWidth: textMax, color: '#cdd'}}>{user?.profile?.bio?.text}</div>
                    </div>
                  </div>



















                    <div className="flex-row" style={{width: '100%', justifyContent: 'space-evenly', gap: '1rem'}}>
                      <div className="" style={{flex: 1}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                          <div style={{fontWeight: '700', fontSize: '13px'}} title={user?.followingCount}>{formatNum(user?.followingCount)}</div>
                          <div style={{fontWeight: '400'}}>following</div>
                        </div>
                      </div>

                      <div className="flex-row" style={{flex: 2}}>
                        <div className="flex-row" style={{padding: '0 0 0 5px', fontSize: '12px', color: '#cdd', gap: '0.25rem', alignItems: 'center', cursor: 'default'}}>
                          <div style={{fontWeight: '700', fontSize: '13px'}} title={user?.followerCount}>{formatNum(user?.followerCount)}</div>
                          <div style={{fontWeight: '400'}}>followed</div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div className="flex-row" style={{gap: '1rem', margin: '10px 0 0 0'}}>

                    <div
                      onClick={(event) => {
                        if (isLogged) {
                          if (autotipping.includes(user?.fid)) {
                            removeAutotip(event, user?.fid)
                          } else {
                            addAutotip(event, user?.fid)
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
                              height: "50px",
                              width: "110px",
                              backgroundColor: autotipping.includes(user?.fid) ? '#fff' : ''
                              // backgroundColor: "#aaa"
                            }}
                          >
                            {(autotipping.includes(user?.fid)) ? (<BsPiggyBankFill color={'#000'} size={20} style={{ width: "21px" }} />) : (<BsPiggyBankFill color={'#000'} size={20} style={{ width: "21px" }} />)}
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
                              {autotipping.includes(user?.fid) ? 'Funding' : 'Fund'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>



                    <div
                      onClick={setCurator}
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
                              height: "50px",
                              width: "110px"
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
                              Share Curation
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

export default CuratorBlock;