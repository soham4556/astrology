import { useLanguage } from "../../hooks/useLanguage";

export default function ResultViewer({ title, result }) {
  const { language } = useLanguage();

  if (!result) {
    return null;
  }

  const resolvedTitle = title || (language === "hi" ? "परिणाम" : "Response");

  return (
    <section className="result-section">
      <h2>{resolvedTitle}</h2>
      <pre className="result-box">{JSON.stringify(result, null, 2)}</pre>
    </section>
  );
}
