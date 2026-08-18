import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { PiCar, PiCheckCircle, PiSparkle } from "react-icons/pi";
import racLogo from "../assets/RAC-Logo 1.png";
import useAuth from "../context/useAuth";
import "./Login.css";

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

function Login() {
  const { isAuthenticated, isLoading, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const isMockMode = import.meta.env.VITE_USE_MOCK === "true";
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const destination = location.state?.from?.pathname || "/";

  const handleCredential = useCallback(
    async (idToken) => {
      setError("");
      setIsSigningIn(true);

      try {
        await signInWithGoogle(idToken);
        navigate(destination, { replace: true });
      } catch (requestError) {
        setError(requestError.message || "Unable to sign in with Google.");
      } finally {
        setIsSigningIn(false);
      }
    },
    [destination, navigate, signInWithGoogle],
  );

  async function handleEmailLogin(event) {
    event.preventDefault();
    setError("");
    setIsSigningIn(true);

    try {
      await signInWithEmail(credentials.email.trim(), credentials.password);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Unable to sign in with email and password.");
    } finally {
      setIsSigningIn(false);
    }
  }

  useEffect(() => {
    if (isMockMode || !googleClientId) return;

    function renderGoogleButton() {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => handleCredential(credential),
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: Math.min(320, Math.max(240, window.innerWidth - 48)),
      });
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);

    if (existingScript) {
      renderGoogleButton();
      existingScript.addEventListener("load", renderGoogleButton);
      return () => existingScript.removeEventListener("load", renderGoogleButton);
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderGoogleButton);
    document.head.appendChild(script);

    return () => script.removeEventListener("load", renderGoogleButton);
  }, [googleClientId, handleCredential, isMockMode]);

  if (isLoading) {
    return <div className="login-loading">Restoring your session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate replace to={destination} />;
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual-content">
          <p className="login-eyebrow"><PiSparkle /> RAC intelligent experience</p>
          <h1>Find the right car with smarter guidance.</h1>
          <p>Sign in once to access AI recommendations, save your wishlist, and continue your buying journey.</p>
          <ul>
            <li><PiCheckCircle /> Five free AI uses for every new buyer</li>
            <li><PiCheckCircle /> Wishlist and subscription linked to your account</li>
            <li><PiCheckCircle /> Your showroom session remains available after sign-in</li>
          </ul>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <img alt="RAC" className="login-logo" src={racLogo} />
          <span className="login-icon"><PiCar /></span>
          <h2>Welcome to RAC</h2>
          <p>Sign in with your email and password, or continue securely with Google.</p>

          <form className="login-email-form" onSubmit={handleEmailLogin}>
            <label htmlFor="login-email">Email address</label>
            <input
              autoComplete="email"
              id="login-email"
              onChange={(event) => setCredentials((current) => ({ ...current, email: event.target.value }))}
              placeholder="buyer@example.com"
              required
              type="email"
              value={credentials.email}
            />
            <label htmlFor="login-password">Password</label>
            <input
              autoComplete="current-password"
              id="login-password"
              minLength="1"
              onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
              placeholder="Enter your password"
              required
              type="password"
              value={credentials.password}
            />
            <button disabled={isSigningIn} type="submit">
              {isSigningIn ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="login-divider"><span>or</span></div>

          {isMockMode ? (
            <button className="login-demo-button" disabled={isSigningIn} onClick={() => handleCredential("mock-google-id-token")} type="button">
              {isSigningIn ? "Signing in..." : "Continue with Demo Google Account"}
            </button>
          ) : (
            <>
              <div className="login-google-button" ref={googleButtonRef} />
              {!googleClientId && <p className="login-config-error">Google Sign-In is unavailable. Add VITE_GOOGLE_CLIENT_ID to the frontend environment.</p>}
            </>
          )}

          {error && <p className="login-error" role="alert">{error}</p>}
          <p className="register-login-link">New to RAC? <Link to="/register">Create an account</Link></p>
          <small>By continuing, you agree to use RAC as a buyer account.</small>
        </div>
      </section>
    </main>
  );
}

export default Login;
