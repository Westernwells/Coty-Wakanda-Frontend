import { User } from "@/api/post-login";
import { create } from "zustand";

interface UserStore {
  user: User | null;
  token?: string;
  isSignedIn: boolean;
  signIn: (user: User, token: string) => void;
  signOut: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
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
}));
