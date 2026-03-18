import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isLoading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";

  if (isLoading) {
    return (
      <LoadingSpinner
        label={isHindi ? "सेशन जांचा जा रहा है..." : "Checking session..."}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
