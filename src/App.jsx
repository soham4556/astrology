import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import SiteLayout from "./components/layout/SiteLayout";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import HoroscopePage from "./pages/HoroscopePage";
import KundaliPage from "./pages/KundaliPage";
import LoginPage from "./pages/LoginPage";
import MatchPage from "./pages/MatchPage";
import AshtakootPage from "./pages/AshtakootPage";
import ManglikPage from "./pages/ManglikPage";
import NotFoundPage from "./pages/NotFoundPage";
import PanchangPage from "./pages/PanchangPage";
import MuhuratPage from "./pages/MuhuratPage";
import NumerologyPage from "./pages/NumerologyPage";
import DashaPage from "./pages/DashaPage";
import LagnaTablePage from "./pages/LagnaTablePage";
import SadesatiPage from "./pages/SadesatiPage";
import KaalSarpReportPage from "./pages/KaalSarpReportPage";
import SignupPage from "./pages/SignupPage";
import BirthChartPage from "./pages/BirthChartPage";
import PlanetDetailsPage from "./pages/PlanetDetailsPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="horoscope"
          element={
            <ProtectedRoute>
              <HoroscopePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="kundali"
          element={
            <ProtectedRoute>
              <KundaliPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="kundali/generate"
          element={
            <ProtectedRoute>
              <KundaliPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="kundali/birth-chart"
          element={
            <ProtectedRoute>
              <BirthChartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="kundali/planets"
          element={
            <ProtectedRoute>
              <PlanetDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="kundali/dasha"
          element={
            <ProtectedRoute>
              <DashaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="kundali/lagna-intervals"
          element={
            <ProtectedRoute>
              <LagnaTablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="match"
          element={
            <ProtectedRoute>
              <MatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="match/kundali"
          element={
            <ProtectedRoute>
              <MatchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="match/ashtakoot"
          element={
            <ProtectedRoute>
              <AshtakootPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="match/manglik"
          element={
            <ProtectedRoute>
              <ManglikPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="panchang"
          element={
            <ProtectedRoute>
              <PanchangPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="panchang/today"
          element={
            <ProtectedRoute>
              <PanchangPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="panchang/muhurat"
          element={
            <ProtectedRoute>
              <MuhuratPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="remedies/sadesati"
          element={
            <ProtectedRoute>
              <SadesatiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="remedies/kaalsarp"
          element={
            <ProtectedRoute>
              <KaalSarpReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="numerology"
          element={
            <ProtectedRoute>
              <NumerologyPage />
            </ProtectedRoute>
          }
        />
        <Route path="blog" element={<BlogPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
