import { Link } from "react-router-dom";
import SeoMeta from "../components/common/SeoMeta";
import { useLanguage } from "../hooks/useLanguage";

export default function NotFoundPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  return (
    <section className="page-shell">
      <SeoMeta
        title="Page Not Found | jyotish web"
        description="The requested page could not be found."
        path="/404"
      />

      <div className="page-header">
        <h1>{isHindi ? "पेज नहीं मिला" : "Page Not Found"}</h1>
        <p>
          {isHindi
            ? "आप जिस पेज को खोज रहे हैं वह मौजूद नहीं है।"
            : "The page you are looking for does not exist."}
        </p>
        <Link to="/" className="btn-primary">
          {isHindi ? "होम पर लौटें" : "Return Home"}
        </Link>
      </div>
    </section>
  );
}
