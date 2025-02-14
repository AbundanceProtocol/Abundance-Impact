import { createContext, useState, useEffect } from "react";
import axios from "axios";
import useStore from "./utils/store";
import { useRouter } from 'next/router';

export const AccountContext = createContext(null)

export const AccountProvider = ({ children, initialAccount, ref1 }) => {
  const store = useStore()
  const [showActions, setShowActions] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [miniApp, setMiniApp] = useState(false)
  const [autotipping, setAutotipping] = useState([])
  const [populate, setPopulate] = useState(0)
  const [userProfile, setUserProfile] = useState(null)
  const [showLogout, setShowLogout] = useState(false)
  const [userBalances, setUserBalances] = useState({impact: 0, qdau: 0})
  const [points, setPoints] = useState('$IMPACT')
  const [prevPoints, setPrevPoints] = useState(null)
  const [isLogged, setIsLogged] = useState(false)
  const [fid, setFid] = useState(null)
  const [sched, setSched] = useState({ecoData: false, login: false})
  const router = useRouter()
  const initEcosystems = [{
    channels: [],
    condition_channels: false,
    condition_curators_threshold: 1,
    condition_following_channel: false,
    condition_following_owner: false,
    condition_holding_erc20: false,
    condition_holding_nft: false,
    condition_points_threshold: 1,
    condition_powerbadge: false,
    createdAt: "2024-06-17T03:19:16.065Z",
    downvote_value: 1,
    ecosystem_moderators: [],
    ecosystem_name: 'Abundance',
    ecosystem_handle: 'abundance',
    ecosystem_points_name: '$IMPACT',
    ecosystem_rules: [`Can't do evil`],
    erc20s: [],
    fid: 3,
    nfts: [],
    owner_name: 'abundance',
    percent_tipped: 10,
    points_per_tip: 1,
    upvote_value: 1,
  }]
  const [ecoData, setEcoData] = useState(null)
  const [ecosystemsData, setEcosystemsData] = useState([])
  const initialEligibility = {
    badge: false,
    badgeReq: false,
    channelFollower: false,
    channelFollowerReq: false,
    ownerFollower: false,
    ownerFollowerReq: false,
    holdingNFT: false,
    holdingNFTReq: false,
    holdingERC20: false,
    holdingERC20Req: false,
    eligibility: false,
    hasWallet: false,
    hasWalletReq: false,
    mod: false,
    modReq: false,
  }
  const [eligibility, setEligibility] = useState(initialEligibility)

  const getUserProfile = async (fid) => {
    try {
      const response = await axios.get('/api/getUserProfile', {
        params: {
          fid: fid,
        }
      })
      if (response?.data?.userProfile[0]) {
        const user = response?.data?.userProfile[0]
        setUserProfile(user)
        store.setUserProfile(user)
        store.setUsernameFC(user.username)
        store.setSrcUrlFC(user.pfp_url)
        store.setUserDisplayNameFC(user.display_name)
        store.setUserActiveFC(user.active_status)
        store.setUserBioFC(user.profile.bio.text)
        store.setUserFollowersFC(user.follower_count)
        store.setUserFollowingFC(user.following_count)
        let verEthAddresses = []
        for (const address of user.verified_addresses.eth_addresses) 
          verEthAddresses.push(address)
        store.setUserEthVerAddresses(verEthAddresses)
        let verSolAddresses = []
        for (const address of user.verified_addresses.sol_addresses) 
          verSolAddresses.push(address)
        store.setUserSolVerAddresses(verSolAddresses)
      }
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  const getEcosystems = async (points) => {
    console.log('c1', points)
    try {
      const response = await axios.get('/api/ecosystem/getEcosystems')
      // console.log(response)
      if (response?.data?.ecosystems?.length > 0) {
        const ecosystems = response?.data?.ecosystems
        let ecoIndex = -1
        if (router.route == '/~/ecosystems/[ecosystem]') {
          ecoIndex = ecosystems.findIndex(eco => eco.ecosystem_handle == router.query?.ecosystem)
        } else {
          ecoIndex = ecosystems.findIndex(eco => eco.ecosystem_points_name == points)
        }
        
        if (ecoIndex !== -1) { 
          console.log('c2', ecosystems[ecoIndex], isLogged)
          setEcoData(ecosystems[ecoIndex])
          store.setPoints(ecosystems[ecoIndex].ecosystem_points_name)
          setPoints(ecosystems[ecoIndex].ecosystem_points_name)
        } else {
          console.log('c3', ecosystems[0])
          setEcoData(ecosystems[0])
          store.setPoints(ecosystems[0].ecosystem_points_name)
          setPoints(ecosystems[0].ecosystem_points_name)
        }
        setEcosystemsData(ecosystems)
      } else {
        console.log('c4', initEcosystems)
        setEcosystemsData(initEcosystems)
        setEcoData(initEcosystems[0])
      }
    } catch (error) {
      console.error('Error submitting data:', error)
      setEcosystemsData(initEcosystems)
      setEcoData(initEcosystems[0])
    }
  }

  useEffect(() => {
    if (
      router.route !== "/~/ecosystems/[ecosystem]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/[eco]/[curators]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-basic" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v6" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v4" &&
      router.route !== "/~/ecosystems/[ecosystem]/rank-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/rewards-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/daily-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/curation-v1" &&
      router.route !== "/~/studio/multi-tip-compose"
    ) {
      console.log("c5 triggered []");
      console.log("c6", store.points, points);
      getEcosystems(store.points || points);
      console.log("c7", router);
    }
  }, [])

  useEffect(() => {
    console.log('c8 triggered [ecoData]')
    console.log('c9', isLogged, ecoData)
    const updateEcoData = () => {
      if (isLogged && ecoData) {
        setPopulate(populate+1)
        setPoints(ecoData?.ecosystem_points_name)
        if (router.route !== '/') {
          console.log('c10 points', store.fid, points)
          getRemainingBalances(fid || store.fid, ecoData?.ecosystem_points_name, store.signer_uuid)
        }
      }
    }

    if (
      router.route !== "/~/ecosystems/[ecosystem]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/[eco]/[curators]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-basic" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v6" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v4" &&
      router.route !== "/~/ecosystems/[ecosystem]/rank-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/rewards-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/daily-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/curation-v1" &&
      router.route !== "/~/studio/multi-tip-compose"
    ) {
      if (sched.ecoData) {
        updateEcoData();
        setSched((prev) => ({ ...prev, ecoData: false }));
      } else {
        const timeoutId = setTimeout(() => {
          updateEcoData();
          setSched((prev) => ({ ...prev, ecoData: false }));
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [ecoData, isLogged, sched.ecoData])

  useEffect(() => {
    console.log('c11 triggered [store.isAuth]')

    const updateLogin = () => {
      console.log('c12 store triggered', store.isAuth, miniApp)
      if (store.isAuth) {
        setIsLogged(true);
        setFid(fid || store.fid)
        getUserProfile(fid || store.fid)
        setShowLogin(false)
      } else {
        if (router.route !== '/~/curator/[fid]') {
          console.log('c12-2', isLogged)
          setIsLogged(false);
          setFid(null)
          setUserBalances({impact: 0, qdau: 0})
          setUserProfile(null)
        }

        if (router.route !== '/' && router.route !== '/~/curator/[fid]') {
          console.log('c13-1')
          LoginPopup()
        }
      }
    }

    console.log('c13-2', router.route, router.route !== "/~/ecosystems/[ecosystem]/tip-basic")
    if (
      router.route !== "/~/ecosystems/[ecosystem]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/[eco]/[curators]/tip" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-basic" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-v6" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/tip-share-v4" &&
      router.route !== "/~/ecosystems/[ecosystem]/rank-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v2" &&
      router.route !== "/~/ecosystems/[ecosystem]/fund-v3" &&
      router.route !== "/~/ecosystems/[ecosystem]/rewards-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/daily-v1" &&
      router.route !== "/~/ecosystems/[ecosystem]/curation-v1" &&
      router.route !== "/~/studio/multi-tip-compose" &&
      !miniApp
    ) {
      if (sched.login) {
        updateLogin();
        setSched((prev) => ({ ...prev, login: false }));
      } else {
        const timeoutId = setTimeout(() => {
          updateLogin();
          setSched((prev) => ({ ...prev, login: false }));
        }, 300);
        return () => clearTimeout(timeoutId);
      }
    }

  }, [store.isAuth, sched.login]);

  const getRemainingBalances = async (fid, points, uuid, referrer) => {
    try {
      const response = await axios.get('/api/ecosystem/getBalances', {
        params: { fid, points } })
      if (response?.data?.user) {
        console.log('c13', response?.data?.user)
        const remainingImpact = response?.data?.user?.remaining_i_allowance || 0
        const remainingQuality = response?.data?.user?.remaining_q_allowance || 0
        setUserBalances(prev => ({
          ...prev,
          impact: remainingImpact,
          qdau: remainingQuality
        }))
        setEligibility(initialEligibility)
      } else {
        setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
        checkEcoEligibility(fid, points, uuid, referrer)
      }
    } catch (error) {
      console.error('Error, getRemainingBalances failed:', error)
      checkEcoEligibility(fid, points, uuid, referrer)
      setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
    }
  }

  const checkEcoEligibility = async (fid, points, uuid, referrer) => {
    console.log('c14', fid, points, prevPoints)
    if (!fid) {
      LoginPopup()
    } else if (points !== prevPoints) {
      setPrevPoints(points)
      try {
        const response = await axios.get('/api/ecosystem/checkUserEligibility', {
          params: { fid, points, uuid, referrer } })
        // console.log(response)
        if (response?.data?.eligibilityData) {
          let eligibilityData = response?.data?.eligibilityData
          setEligibility(eligibilityData)
        } else {
          setEligibility(initialEligibility)
        }
        if (response?.data?.createUser) {
          let userData = response.data?.createUser
          setUserBalances(prev => ({
            ...prev,
            impact: userData.remaining_i_allowance,
            qdau: userData.remaining_q_allowance
          }))

        } else {
          setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
        }
      } catch (error) {
        console.error('Error, checkEcoEligibility failed:', error)
        setEligibility(initialEligibility)
        setUserBalances(prev => ({ ...prev, impact: 0, qdau: 0 }))
      }
    }
  }

  const LoginPopup = async () => { setShowLogin(true) }

  const LogoutPopup = async () => { setShowLogout(true) }

  const handleEcoChange = (event) => {
    const system = ecosystemsData.find(eco => eco.ecosystem_points_name == event.target.value)
    console.log('c15', event.target.value)
    store.setEcosystemData(system)
    setEcoData(system);
    setPrevPoints(null)
    // if (router.route == '/~/ecosystems/[ecosystem]' && router.asPath !== `/~/ecosystems/${system.ecosystem_handle}`) {
      router.push(`/~/ecosystems/${system.ecosystem_handle}`)
    // }
  };

  const changeEco = (system) => {
    console.log('c16 system', system)
    store.setEcosystemData(system)
    setEcoData(system);
  };

  const contextValue = {
    ...initialAccount,
    ref1,
    handleEcoChange,
    checkEcoEligibility,
    LoginPopup,
    LogoutPopup,
    changeEco,
    getEcosystems,
    getRemainingBalances,
    miniApp, setMiniApp,
    fid, setFid,
    points, setPoints,
    ecoData, setEcoData,
    ecosystemsData, setEcosystemsData,
    autotipping, setAutotipping,
    isLogged, setIsLogged,
    userBalances, setUserBalances,
    eligibility, setEligibility,
    showLogout, setShowLogout,
    showLogin, setShowLogin,
    prevPoints, setPrevPoints,
    showActions, setShowActions,
    userProfile, setUserProfile,
    populate, setPopulate
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};