import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = location.state?.from || "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await signIn(form);
      navigate(redirectTo, { replace: true });
    } catch (submissionError) {
      setError(
        submissionError.message ||
          (isHindi
            ? "लॉगिन नहीं हो पाया। कृपया अपनी जानकारी जांचें।"
            : "Unable to login. Please verify your credentials."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-section">
      <SeoMeta
        title="Login | jyotish web"
        description="Login to your jyotish web account to access astrology dashboard and reports."
        path="/login"
      />

      <div className="auth-card">
        <h1>{isHindi ? "लॉगिन" : "Login"}</h1>
        <p>
          {isHindi
            ? "अपना ज्योतिष डैशबोर्ड और सेव की गई रिपोर्ट देखने के लिए लॉगिन करें।"
            : "Access your astrology dashboard and saved reports."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">{isHindi ? "ईमेल" : "Email"}</label>
          <input
            id="login-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />

          <label htmlFor="login-password">
            {isHindi ? "पासवर्ड" : "Password"}
          </label>
          <input
            id="login-password"
            type="password"
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />

          <ErrorMessage message={error} />

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isHindi
                ? "लॉगिन हो रहा है..."
                : "Logging in..."
              : isHindi
                ? "लॉगिन करें"
                : "Login"}
          </button>
        </form>

        {isSubmitting ? (
          <LoadingSpinner
            label={isHindi ? "प्रमाणीकरण हो रहा है..." : "Authenticating..."}
          />
        ) : null}

        <p className="auth-switch">
          {isHindi ? "नए उपयोगकर्ता हैं?" : "New user?"}{" "}
          <Link to="/signup">
            {isHindi ? "नया खाता बनाएं" : "Create an account"}
          </Link>
        </p>
      </div>
    </section>
  );
}
