import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { PiCheckCircle, PiSparkle, PiUserPlus } from "react-icons/pi";
import racLogo from "../assets/RAC-Logo 1.png";
import useAuth from "../context/useAuth";
import "./Login.css";

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
    return <div className="login-loading">Restoring your session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-visual-content">
          <p className="login-eyebrow"><PiSparkle /> Start your RAC journey</p>
          <h1>Create your buyer account.</h1>
          <p>Register once to save cars, access AI guidance, and keep your purchasing journey connected.</p>
          <ul>
            <li><PiCheckCircle /> Five free AI uses for every new account</li>
            <li><PiCheckCircle /> Save and manage your favorite cars</li>
            <li><PiCheckCircle /> Access recommendations and financing tools</li>
          </ul>
        </div>
      </section>

      <section className="login-panel register-panel">
        <div className="login-card">
          <img alt="RAC" className="login-logo register-logo" src={racLogo} />
          <span className="login-icon"><PiUserPlus /></span>
          <h2>Create Account</h2>
          <p>Register with your email and password as a RAC buyer.</p>

          <form className="login-email-form" onSubmit={handleSubmit}>
            <label htmlFor="register-name">Full name</label>
            <input autoComplete="name" id="register-name" onChange={(event) => updateForm("name", event.target.value)} placeholder="Your full name" required type="text" value={form.name} />

            <label htmlFor="register-email">Email address</label>
            <input autoComplete="email" id="register-email" onChange={(event) => updateForm("email", event.target.value)} placeholder="buyer@example.com" required type="email" value={form.email} />

            <label htmlFor="register-password">Password</label>
            <input autoComplete="new-password" id="register-password" minLength="8" onChange={(event) => updateForm("password", event.target.value)} placeholder="Minimum 8 characters" required type="password" value={form.password} />

            <label htmlFor="register-confirm-password">Confirm password</label>
            <input autoComplete="new-password" id="register-confirm-password" minLength="8" onChange={(event) => updateForm("confirmPassword", event.target.value)} placeholder="Repeat your password" required type="password" value={form.confirmPassword} />

            <button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {error && <p className="login-error" role="alert">{error}</p>}
          <p className="register-login-link">Already registered? <Link to="/login">Sign in</Link></p>
          <small>New accounts are created with the buyer role.</small>
        </div>
      </section>
    </main>
  );
}

export default Register;
