import { useEffect, useMemo, useState } from "react";
import {
  getCurrentSession,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "../services/authService";
import { supabase } from "../services/supabaseClient";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const currentSession = await getCurrentSession();
        if (!isMounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signUp: signUpWithEmail,
      signIn: signInWithEmail,
      signOut: signOutUser,
    }),
    [isLoading, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
