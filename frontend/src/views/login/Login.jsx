import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { PiCar, PiCheckCircle, PiSparkle } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc"; // Google icon with brand colors
import racLogo from "../../assets/RAC-Logo 1.png";
import useAuth from "../../context/useAuth";
import "./Login.css";

const GOOGLE_SCRIPT_URL = "https://accounts.google.com/gsi/client";

function Login() {
  const { isAuthenticated, isLoading, signInWithEmail, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const isMockMode = import.meta.env.VITE_USE_MOCK === "true";
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const destination = location.state?.from?.pathname || "/";

  // Handle Google Auth Credential
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
    [destination, navigate, signInWithGoogle]
  );

  // Handle Email & Password Submit
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

  // Google Script Initializer — uses initialize only, no renderButton
  useEffect(() => {
    if (isMockMode || !googleClientId) return;

    function initGoogle() {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => handleCredential(credential),
      });
      setIsGoogleReady(true);
    }

    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);

    if (existingScript) {
      initGoogle();
      existingScript.addEventListener("load", initGoogle);
      return () => existingScript.removeEventListener("load", initGoogle);
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initGoogle);
    document.head.appendChild(script);

    return () => script.removeEventListener("load", initGoogle);
  }, [googleClientId, handleCredential, isMockMode]);

  // Trigger Google One Tap popup on custom button click
  function handleGoogleClick() {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  }

  if (isLoading) {
    return <div className="login-loading">Restoring session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate replace to={destination} />;
  }

  return (
    <main className="login-page">

      {/* Left Visual Panel */}
      <section className="login-visual">
        <div className="login-visual-glow" />
        <div className="login-visual-content">
          <div className="login-eyebrow">
            <PiSparkle className="text-blue-400 animate-pulse" />
            <span>RAC Intelligent Experience</span>
          </div>
          <h1>
            Find the right car <br />
            <span>with smarter guidance</span>
          </h1>
          <p className="login-description">
            One account to access smart recommendations, curated wishlists, and a personalized car experience
          </p>

          {/* Feature List */}
          <ul className="login-features">
            <li>
              <PiCheckCircle className="feature-icon" />
              <span>Five free AI tokens for every new user</span>
            </li>
            <li>
              <PiCheckCircle className="feature-icon" />
              <span>Wishlist and smart subscription saved to your account</span>
            </li>
            <li>
              <PiCheckCircle className="feature-icon" />
              <span>Interactive 360° showroom sessions stay synchronized</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="login-panel">
        <div className="login-card">

          {/* Logo & Header */}
          <Link to="/" className="login-logo-wrap">
            <img alt="RAC Logo" className="login-logo" src={racLogo} />
          </Link>

          <h2>Welcome Back</h2>
          <p className="login-subtext">Sign in to access AI tools, wishlists, and your personalized experience</p>

          {/* Email Sign In Form */}
          <form className="login-email-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <input
                autoComplete="email"
                id="login-email"
                onChange={(e) => setCredentials((curr) => ({ ...curr, email: e.target.value }))}
                placeholder="you@example.com"
                required
                type="email"
                value={credentials.email}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                autoComplete="current-password"
                id="login-password"
                onChange={(e) => setCredentials((curr) => ({ ...curr, password: e.target.value }))}
                placeholder="Enter your password"
                required
                type="password"
                value={credentials.password}
              />
            </div>

            {/* Submit Button */}
            <button className="login-submit-btn" disabled={isSigningIn} type="submit">
              {isSigningIn ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider">
            <span>or</span>
          </div>

          {/* Google Auth — custom styled button instead of iframe */}
          {isMockMode ? (
            <button
              className="login-google-btn"
              disabled={isSigningIn}
              onClick={() => handleCredential("mock-google-id-token")}
              type="button"
            >
              <FcGoogle className="google-btn-icon" />
              {isSigningIn ? "Signing in..." : "Continue with Google"}
            </button>
          ) : (
            <div className="google-auth-wrapper">
              <button
                className="login-google-btn"
                disabled={isSigningIn || !isGoogleReady}
                onClick={handleGoogleClick}
                type="button"
              >
                <FcGoogle className="google-btn-icon" />
                {isSigningIn ? "Signing in..." : "Continue with Google"}
              </button>
              {!googleClientId && (
                <p className="login-config-error">
                  Google Sign-In is unavailable. Add VITE_GOOGLE_CLIENT_ID to .env
                </p>
              )}
            </div>
          )}

          {/* Error Alert */}
          {error && <p className="login-error" role="alert">{error}</p>}

          {/* Footer Link */}
          <p className="register-login-link">
            New to RAC? <Link to="/register">Create an account</Link>
          </p>
          <small className="terms-text">Sign in to unlock AI recommendations, wishlists, and more</small>
        </div>
      </section>

    </main>
  );
}

export default Login;