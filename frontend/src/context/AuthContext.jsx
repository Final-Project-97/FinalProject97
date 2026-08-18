import { useEffect, useState } from "react";
import { getCurrentUser, googleLogin, logoutUser } from "../api/auth";
import { ACCESS_TOKEN_KEY } from "../api/client";
import AuthContext from "./auth-context";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await getCurrentUser();
        setUser(result.user);
        setSubscription(result.subscription || null);
      } catch (error) {
        if (error.status === 401) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function signInWithGoogle(idToken) {
    const result = await googleLogin(idToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, result.token);
    setUser(result.user);
  }

  async function signOut() {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      setUser(null);
      setSubscription(null);
    }
  }

  async function refreshUser() {
    const result = await getCurrentUser();
    setUser(result.user);
    setSubscription(result.subscription || null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        isAuthenticated: Boolean(user),
        isLoading,
        signInWithGoogle,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
