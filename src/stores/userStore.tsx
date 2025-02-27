import { User } from "@/types";
import { create } from "zustand";

interface UserStore {
  user: User | null;
  token?: string;
  isSignedIn: boolean;
  loading: boolean,
  signIn: (user: User, token: string) => void;
  signOut: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserStore>(((set) => ({
  user: null,
  isSignedIn: false,
  loading: false,
  errors: null,
  signIn: (user, token) => {
    set({ user: user, isSignedIn: true, token: token });
  },
  signOut: () => {
    set({ user: null, isSignedIn: false, token: "" });
  },
  setLoading: (isLoading) => {
    set({loading: isLoading})
  }
})));


