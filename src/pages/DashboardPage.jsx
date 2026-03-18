import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { getRecentReports } from "../services/reportService";

const dashboardCards = [
  {
    title: "Horoscope Generator",
    titleHi: "राशिफल जनरेटर",
    description: "Generate your personalized horoscope predictions.",
    descriptionHi: "अपनी व्यक्तिगत राशिफल भविष्यवाणी तैयार करें।",
    to: "/horoscope",
  },
  {
    title: "Kundali Generator",
    titleHi: "कुंडली जनरेटर",
    description: "Create a complete birth chart from birth details.",
    descriptionHi: "जन्म विवरण के आधार पर संपूर्ण जन्मकुंडली बनाएं।",
    to: "/kundali",
  },
  {
    title: "Panchang Insights",
    titleHi: "पंचांग जानकारी",
    description: "Get daily panchang details for your location.",
    descriptionHi: "अपने स्थान के अनुसार दैनिक पंचांग विवरण प्राप्त करें।",
    to: "/panchang",
  },
  {
    title: "Kundali Matching",
    titleHi: "कुंडली मिलान",
    description: "Check compatibility between two kundalis.",
    descriptionHi: "दो कुंडलियों के बीच अनुकूलता जांचें।",
    to: "/match",
  },
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setError("");
      setIsLoading(true);
      try {
        const nextReports = await getRecentReports(user.id);
        if (mounted) {
          setReports(nextReports);
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.message ||
              (isHindi
                ? "हाल की रिपोर्ट प्राप्त नहीं हो सकीं।"
                : "Unable to fetch recent reports."),
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadReports();
    return () => {
      mounted = false;
    };
  }, [isHindi, user?.id]);

  return (
    <section className="page-shell">
      <SeoMeta
        title="Dashboard | jyotish web"
        description="Manage your astrology activity, generate reports, and review recent horoscope, kundali, panchang, and match outputs."
        path="/dashboard"
      />

      <div className="page-header">
        <h1>
          {isHindi ? "स्वागत है," : "Welcome,"}{" "}
          {user?.user_metadata?.full_name || user?.email}
        </h1>
        <p>
          {isHindi
            ? "नए रिपोर्ट बनाएं और अपनी हाल की ज्योतिष गतिविधि देखें।"
            : "Use your dashboard to generate new reports and review your latest astrology history."}
        </p>
        <button className="btn-outline" type="button" onClick={signOut}>
          {isHindi ? "लॉगआउट" : "Logout"}
        </button>
      </div>

      <div className="dashboard-grid">
        {dashboardCards.map((card) => (
          <article key={card.to} className="dashboard-card">
            <h3>{isHindi ? card.titleHi : card.title}</h3>
            <p>{isHindi ? card.descriptionHi : card.description}</p>
            <Link className="btn-primary" to={card.to}>
              {isHindi ? "खोलें" : "Open"}
            </Link>
          </article>
        ))}
      </div>

      <div className="result-section">
        <h2>{isHindi ? "हाल की गतिविधि" : "Recent Activity"}</h2>
        <ErrorMessage message={error} />
        {isLoading ? (
          <LoadingSpinner
            label={
              isHindi
                ? "आपकी रिपोर्ट लोड हो रही हैं..."
                : "Loading your reports..."
            }
          />
        ) : null}
        {!isLoading && reports.length === 0 ? (
          <p>
            {isHindi
              ? "अभी कोई रिपोर्ट नहीं है। ऊपर दिए विकल्पों से नई रिपोर्ट बनाएं।"
              : "No reports yet. Generate one from the options above."}
          </p>
        ) : null}
        {!isLoading && reports.length > 0 ? (
          <ul className="recent-list">
            {reports.map((report) => (
              <li key={`${report.type}-${report.id}`}>
                <span>{report.type}</span>
                <span>{new Date(report.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
