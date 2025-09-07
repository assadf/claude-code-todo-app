import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Session } from 'next-auth';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
}

interface AuthActions {
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clearSession: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    set => ({
      // State
      session: null,
      isLoading: true,

      // Actions
      setSession: session =>
        set({ session, isLoading: false }, false, 'setSession'),

      setLoading: loading => set({ isLoading: loading }, false, 'setLoading'),

      clearSession: () =>
        set({ session: null, isLoading: false }, false, 'clearSession'),
    }),
    { name: 'auth-store' }
  )
);
