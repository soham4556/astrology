import { useLanguage } from "../../hooks/useLanguage";

export default function LoadingSpinner({ label }) {
  const { language } = useLanguage();
  const resolvedLabel =
    label || (language === "hi" ? "लोड हो रहा है..." : "Loading...");

  return (
    <div className="loading-wrap" role="status" aria-live="polite">
      <div className="loading-spinner" aria-hidden="true" />
      <span>{resolvedLabel}</span>
    </div>
  );
}
