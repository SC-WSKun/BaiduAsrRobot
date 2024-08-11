import {create} from 'zustand';

interface UserState {
    emotion: string;
    updateEmotion: (newEmotion: string) => void;
}

export const useUserStore = create<UserState>()((set)=>({
    emotion: 'neutral',
    updateEmotion: (newEmotion: string) => {
        set({emotion : newEmotion});
    },
}));