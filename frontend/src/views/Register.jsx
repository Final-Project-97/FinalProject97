import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { PiCheckCircle, PiSparkle } from "react-icons/pi";
import racLogo from "../assets/RAC-Logo 1.png";
import useAuth from "../context/useAuth";
import "./login/Login.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const { isAuthenticated, isLoading, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateForm(name, value) {
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  // Handle Register Submit
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpWithEmail(form.name.trim(), form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (requestError) {
      if (requestError.code === "EMAIL_TAKEN" || requestError.status === 409) {
        setError("This email is already registered. Please sign in instead.");
      } else {
        setError(requestError.message || "Unable to create your account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="login-loading">Restoring session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <main className="login-page">

      {/* Left Visual Panel */}
      <section className="login-visual">
        <div className="login-visual-glow" />
        <div className="login-visual-content">
          <div className="login-eyebrow">
            <PiSparkle className="text-blue-400 animate-pulse" />
            <span>Start Your RAC Journey</span>
          </div>
          <h1>
            Create your <br />
            <span>free account</span>
          </h1>
          <p className="login-description">
            Register once to save cars, access AI guidance, and explore the full RAC experience
          </p>

          {/* Feature List */}
          <ul className="login-features">
            <li>
              <PiCheckCircle className="feature-icon" />
              <span>Five free AI tokens for on every new account</span>
            </li>
            <li>
              <PiCheckCircle className="feature-icon" />
              <span>Save and manage your favorite cars</span>
            </li>
            <li>
              <PiCheckCircle className="feature-icon" />
              <span>Access AI recommendations and smart tools</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="login-panel register-panel">
        <div className="login-card">

          {/* Logo & Header */}
          <Link to="/" className="login-logo-wrap">
            <img alt="RAC Logo" className="login-logo register-logo" src={racLogo} />
          </Link>

          <h2>Create Account</h2>
          <p className="login-subtext">Sign up to access AI tools, wishlists, and the full RAC experience</p>

          {/* Registration Form */}
          <form className="login-email-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="register-name">Full name</label>
              <input
                autoComplete="name"
                id="register-name"
                onChange={(e) => updateForm("name", e.target.value)}
                placeholder="Your full name"
                required
                type="text"
                value={form.name}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email address</label>
              <input
                autoComplete="email"
                id="register-email"
                onChange={(e) => updateForm("email", e.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={form.email}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password</label>
              <input
                autoComplete="new-password"
                id="register-password"
                minLength="8"
                onChange={(e) => updateForm("password", e.target.value)}
                placeholder="Minimum 8 characters"
                required
                type="password"
                value={form.password}
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm-password">Confirm password</label>
              <input
                autoComplete="new-password"
                id="register-confirm-password"
                minLength="8"
                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                placeholder="Repeat your password"
                required
                type="password"
                value={form.confirmPassword}
              />
            </div>

            {/* Submit Button */}
            <button className="login-submit-btn" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Error Alert */}
          {error && <p className="login-error" role="alert">{error}</p>}

          {/* Footer Link */}
          <p className="register-login-link">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
          <small className="terms-text">our account unlocks AI recommendations, wishlists, and personalized insights</small>
        </div>
      </section>

    </main>
  );
}

export default Register;
