import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const data = await signUp(form);
      if (data.session) {
        navigate("/dashboard");
      } else {
        setSuccess(
          isHindi
            ? "खाता बन गया है। यदि ईमेल पुष्टि चालू है तो कृपया अपना ईमेल सत्यापित करें।"
            : "Account created. Please verify your email if confirmation is enabled.",
        );
      }
    } catch (submissionError) {
      setError(
        submissionError.message ||
          (isHindi ? "खाता नहीं बन सका।" : "Unable to create account."),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-section">
      <SeoMeta
        title="Signup | Pavitra Jyotish"
        description="Create your Pavitra Jyotish account to save horoscope, kundali, panchang, and match reports."
        path="/signup"
      />

      <div className="auth-card">
        <h1>{isHindi ? "साइनअप" : "Signup"}</h1>
        <p>
          {isHindi
            ? "ज्योतिष रिपोर्ट बनाने और सेव करने के लिए अपना खाता बनाएं।"
            : "Create your account to generate and save astrology reports."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="signup-name">
            {isHindi ? "पूरा नाम" : "Full Name"}
          </label>
          <input
            id="signup-name"
            type="text"
            value={form.fullName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fullName: event.target.value }))
            }
            required
          />

          <label htmlFor="signup-email">{isHindi ? "ईमेल" : "Email"}</label>
          <input
            id="signup-email"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
            required
          />

          <label htmlFor="signup-password">
            {isHindi ? "पासवर्ड" : "Password"}
          </label>
          <input
            id="signup-password"
            type="password"
            minLength={6}
            value={form.password}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            required
          />

          <ErrorMessage message={error} />
          {success ? <div className="success-box">{success}</div> : null}

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isHindi
                ? "खाता बनाया जा रहा है..."
                : "Creating account..."
              : isHindi
                ? "साइनअप करें"
                : "Signup"}
          </button>
        </form>

        {isSubmitting ? (
          <LoadingSpinner
            label={isHindi ? "खाता बनाया जा रहा है..." : "Creating account..."}
          />
        ) : null}

        <p className="auth-switch">
          {isHindi ? "पहले से खाता है?" : "Already have an account?"}{" "}
          <Link to="/login">{isHindi ? "लॉगिन" : "Login"}</Link>
        </p>
      </div>
    </section>
  );
}
