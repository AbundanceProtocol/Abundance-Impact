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
        fid: null,
        isAuth: false,
        signer_uuid: null,
        // set: (fn) => set(produce(fn)),
        setAccount: (account) => set({ account: get().account = account }), 
        setUsername: (username) => set({ username: get().username = username }), 
        setIsMobile: (isMobile) => set({ isMobile }),
        setRef: (ref) => set({ ref }),
        setFid: (fid) => set({ fid: get().fid = fid }), 
        setIsAuth: (isAuth) => set({ isAuth }), 
        setSigner: (signer_uuid) => set({ signer_uuid: get().signer_uuid = signer_uuid }), 
    }
}));

export default useStore