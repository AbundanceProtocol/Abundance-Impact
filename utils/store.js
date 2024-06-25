import create from 'zustand'
import { persist } from 'zustand/middleware';
// import produce from 'immer';

const useStore = create(persist((set, get) => {
    return {
        router: null,
        deviceSize: {
            width: null,
            height: null
        },
        isMobile: false,
        account: null,
        username: null,
        ref: null,

        // Properties intended for persistence
        fid: null,
        isAuth: false,
        signer_uuid: null,

        usernameFC: null,
        srcUrlFC: null,
        userDisplayNameFC: null,
        userActiveFC: false,
        userBioFC: null,
        userFollowersFC: null,
        userFollowingFC: null,
        userEthVerAddresses: [],
        userSolVerAddresses: [],
        userProfile: null,

        userData: null,
        castData: null,
        proposalData: null,

        userTipsReceived: [],
        userTotalImpact: null,
        userTotalQuality: null,
        userRemainingImpact: null,
        userRemainingQuality: null,
        userRemainingTips: [],
        userUpdateTime: null,

        userTipPercent: 50,

        resetStore: () => {set({
            router: null,
            deviceSize: {
                width: null,
                height: null
            },
            isMobile: false,
            account: null,
            username: null,
            ref: null,
    
            fid: null,
            isAuth: false,
            signer_uuid: null,
    
            usernameFC: null,
            srcUrlFC: null,
            userDisplayNameFC: null,
            userActiveFC: false,
            userBioFC: null,
            userFollowersFC: null,
            userFollowingFC: null,
            userEthVerAddresses: [],
            userSolVerAddresses: [],
            userProfile: null,
    
            userData: null,
            castData: null,
            ecosystemData: null,
            proposalData: null,
    
            userTipsReceived: [],
            userTotalImpact: null,
            userTotalQuality: null,
            userRemainingImpact: null,
            userRemainingQuality: null,
            userRemainingTips: [],
            userUpdateTime: null,
    
            userTipPercent: 50,
        })},

        // Setters
        setAccount: (account) => set({ account }),
        setUsername: (username) => set({ username }),
        setIsMobile: (isMobile) => set({ isMobile }),
        setRef: (ref) => set({ ref }),
        setFid: (fid) => set({ fid }),
        setIsAuth: (isAuth) => set({ isAuth }),
        setSignerUuid: (signerUuid) => set({ signer_uuid: signerUuid }),
      
        setUsernameFC: (usernameFC) => set({ usernameFC }),
        setSrcUrlFC: (srcUrlFC) => set({ srcUrlFC }),
        setUserDisplayNameFC: (userDisplayNameFC) => set({ userDisplayNameFC }),
        setUserActiveFC: (userActiveFC) => set({ userActiveFC }),
        setUserBioFC: (userBioFC) => set({ userBioFC }),
        setUserFollowersFC: (userFollowersFC) => set({ userFollowersFC }),
        setUserFollowingFC: (userFollowingFC) => set({ userFollowingFC }),
        setUserEthVerAddresses: (userEthVerAddresses) => set({ userEthVerAddresses }),
        setUserSolVerAddresses: (userSolVerAddresses) => set({ userSolVerAddresses }),
        setUserProfile: (userProfile) => set({ userProfile }),

        setUserData: (userData) => set({ userData: userData }),
        setCastData: (castData) => set({ castData: castData }),
        setEcosystemData: (ecosystemData) => set({ ecosystemData: ecosystemData }),
        setProposalData: (proposalData) => set({ proposalData: proposalData }),

        setUserTipsReceived: (userTipsReceived) => set({ userTipsReceived }),
        setUserTotalImpact: (userTotalImpact) => set({ userTotalImpact }),
        setUserTotalQuality: (userTotalQuality) => set({ userTotalQuality }),
        setUserRemainingImpact: (userRemainingImpact) => set({ userRemainingImpact }),
        setUserRemainingQuality: (userRemainingQuality) => set({ userRemainingQuality }),
        setUserRemainingTips: (userRemainingTips) => set({ userRemainingTips }),
        setUserUpdateTime: (userUpdateTime) => set({ userUpdateTime }),

        setUserTipPercent: (userTipPercent) => set({ userTipPercent }),

        // Getters
        getFid: () => get().fid,
        getIsAuth: () => get().isAuth,
        getSignerUuid: () => get().signer_uuid,
    }
    }), {
        name: 'impact-app-persisted-store',
        getStorage: () => localStorage,
        partialize: (state) => ({

        // Poperties to persist
        fid: state.fid,
        isAuth: state.isAuth,
        signer_uuid: state.signer_uuid,
        usernameFC: state.usernameFC,
        srcUrlFC: state.srcUrlFC,
        userDisplayNameFC: state.userDisplayNameFC,
        userActiveFC: state.userActiveFC,
        userBioFC: state.userBioFC,
        userFollowersFC: state.userFollowersFC,
        userFollowingFC: state.userFollowingFC,
        userEthVerAddresses: state.userEthVerAddresses,
        userSolVerAddresses: state.userSolVerAddresses,
        userProfile: state.userProfile,
        }),
        onRehydrate: (state) => {
          // This callback is called when the store is rehydrated
          set(state);
          console.log('Data has been loaded from local storage.');
        },
    }
);

export default useStore