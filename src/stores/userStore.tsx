import { createJSONStorage, persist } from "zustand/middleware";

import { User } from "@/api/post-login";
import { create } from "zustand";

interface UserStore {
    user: User | null;
    isSignedIn: boolean;
    signIn: (user: User) => void;
    signOut: () => void;
}

export const useUserStore = create<UserStore, [["zustand/persist", unknown]]>(
    persist(
        (set) => ({
            user: null,
            isSignedIn: false,
            loading: false,
            errors: null,
            signIn: (user: User) => {
                set({ user: user, isSignedIn: true });
            },
            signOut: () => {
                set({ user: null, isSignedIn: false });
            },
        }),
        { name: "user-data", storage: createJSONStorage(() => localStorage) }
    )
);
