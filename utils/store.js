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

        userData: null,
        castData: null,
        proposalData: null,

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

        setUserData: (userData) => set({ userData }),
        setCastData: (castData) => set({ castData }),
        setProposalData: (proposalData) => set({ proposalData }),

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
        userData: state.userData,
        castData: state.castData,
        proposalData: state.proposalData
        }),
        onRehydrate: (state) => {
          // This callback is called when the store is rehydrated
          set(state);
          console.log('Data has been loaded from local storage.');
        },
    }
);

export default useStore