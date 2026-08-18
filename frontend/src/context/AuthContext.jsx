import { useEffect, useState } from "react";
import {
  emailLogin,
  getCurrentUser,
  googleLogin,
  logoutUser,
  registerWithEmail,
} from "../api/auth";
import { ACCESS_TOKEN_KEY } from "../api/client";
import AuthContext from "./auth-context";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCurrentSession() {
    const result = await getCurrentUser();
    setUser(result.user);
    setSubscription(result.subscription || null);
    return result;
  }

  useEffect(() => {
    async function loadUser() {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        await loadCurrentSession();
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
    await loadCurrentSession();
  }

  async function signInWithEmail(email, password) {
    const result = await emailLogin(email, password);
    localStorage.setItem(ACCESS_TOKEN_KEY, result.token);
    await loadCurrentSession();
  }

  async function signUpWithEmail(name, email, password) {
    const result = await registerWithEmail(name, email, password);
    localStorage.setItem(ACCESS_TOKEN_KEY, result.token);
    await loadCurrentSession();
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
    await loadCurrentSession();
  }

  function updateAiTokens(aiTokensRemaining) {
    if (typeof aiTokensRemaining !== "number") return;

    setUser((currentUser) =>
      currentUser ? { ...currentUser, aiTokensRemaining } : currentUser,
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        isAuthenticated: Boolean(user),
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshUser,
        updateAiTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
