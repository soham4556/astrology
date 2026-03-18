import { useState } from "react";
import AstroChartViewer from "../components/common/AstroChartViewer";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ResultViewer from "../components/common/ResultViewer";
import SeoMeta from "../components/common/SeoMeta";
import { getHoroChartImageD1, getKundali } from "../api/astrologyApi";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { saveKundaliReport } from "../services/reportService";

const SIGN_TO_NUMBER = Object.freeze({
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12,
});

function parseSignNumber(signValue, fallback = 1) {
  const numeric = Number(signValue);
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) {
    return numeric;
  }

  const key = String(signValue || "")
    .trim()
    .toLowerCase();
  return SIGN_TO_NUMBER[key] || fallback;
}

export default function KundaliPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [form, setForm] = useState({
    fullName: "",
    date: "1995-01-15",
    time: "08:30:00",
    latitude: "28.6139",
    longitude: "77.2090",
    timezone: "5.5",
  });

  const [result, setResult] = useState(null);
  const [svgChart, setSvgChart] = useState("");
  const [planets, setPlanets] = useState([]);
  const [ascendantSign, setAscendantSign] = useState(1);
  const [chartStyle, setChartStyle] = useState("style-1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function extractChartSvg(payload) {
    if (typeof payload === "string") {
      return payload;
    }

    if (typeof payload?.svg === "string") {
      return payload.svg;
    }

    if (typeof payload?.output === "string") {
      return payload.output;
    }

    return "";
  }

  function handleChartStyleChange(nextStyle) {
    setChartStyle(nextStyle);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setSvgChart("");
    setPlanets([]);
    setAscendantSign(1);

    const params = {
      datetime: `${form.date}T${form.time}`,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      timezone: Number(form.timezone),
      ayanamsa: 1,
      coordinates: `${form.latitude},${form.longitude}`,
      name: form.fullName,
    };

    try {
      const [response, chartImageResponse] = await Promise.all([
        getKundali(params),
        getHoroChartImageD1(params),
      ]);

      const responsePayload = response.data || response;
      setResult(responsePayload);

      if (Array.isArray(responsePayload)) {
        const mappedPlanets = responsePayload
          .filter((planet) => planet && typeof planet.name === "string")
          .map((planet) => ({
            name: planet.name,
            house: Number(planet.house),
            sign: parseSignNumber(planet.sign),
            normDegree: Number(planet.normDegree),
            fullDegree: Number(planet.fullDegree),
            isRetro: planet.isRetro,
          }));

        setPlanets(mappedPlanets);

        const ascendant = responsePayload.find(
          (planet) =>
            planet &&
            typeof planet.name === "string" &&
            planet.name.toLowerCase() === "ascendant",
        );

        if (ascendant) {
          setAscendantSign(parseSignNumber(ascendant.sign, 1));
        }
      }

      const chartPayload = chartImageResponse.data || chartImageResponse;
      const chartSvg = extractChartSvg(chartPayload);
      setSvgChart(chartSvg);

      await saveKundaliReport({
        userId: user.id,
        fullName: form.fullName,
        birthDate: form.date,
        birthTime: form.time,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        timezone: Number(form.timezone),
        query: params,
        result: response,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          (isHindi
            ? "इस समय कुंडली तैयार नहीं हो सकी।"
            : "Unable to generate kundali at this moment."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <SeoMeta
        title="Kundali Generator | Pavitra Jyotish"
        description="Generate your birth chart and kundali report with precise Vedic astrology inputs."
        path="/kundali"
      />

      <div className="page-header">
        <h1>{isHindi ? "कुंडली जनरेटर" : "Kundali Generator"}</h1>
        <p>
          {isHindi
            ? "अपनी वैदिक कुंडली रिपोर्ट बनाने के लिए जन्म विवरण दर्ज करें।"
            : "Enter birth details to create your Vedic kundali report."}
        </p>
      </div>

      <form className="astro-form" onSubmit={handleSubmit}>
        <div className="astro-form-grid">
          <div className="form-group">
            <label htmlFor="k-name">{isHindi ? "पूरा नाम" : "Full Name"}</label>
            <input
              id="k-name"
              type="text"
              value={form.fullName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fullName: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="k-date">
              {isHindi ? "जन्म तिथि" : "Birth Date"}
            </label>
            <input
              id="k-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="k-time">
              {isHindi ? "जन्म समय" : "Birth Time"}
            </label>
            <input
              id="k-time"
              type="time"
              step="1"
              value={form.time}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, time: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="k-lat">{isHindi ? "अक्षांश" : "Latitude"}</label>
            <input
              id="k-lat"
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, latitude: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="k-lon">{isHindi ? "देशांतर" : "Longitude"}</label>
            <input
              id="k-lon"
              type="number"
              step="0.0001"
              value={form.longitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, longitude: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="k-timezone">
              {isHindi ? "समय क्षेत्र (UTC ऑफसेट)" : "Timezone Offset"}
            </label>
            <input
              id="k-timezone"
              type="number"
              step="0.1"
              value={form.timezone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, timezone: event.target.value }))
              }
              required
            />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading
            ? isHindi
              ? "कुंडली बन रही है..."
              : "Generating..."
            : isHindi
              ? "कुंडली बनाएं"
              : "Generate Kundali"}
        </button>
      </form>

      <ErrorMessage message={error} />
      {isLoading ? (
        <LoadingSpinner
          label={
            isHindi ? "कुंडली तैयार हो रही है..." : "Generating kundali..."
          }
        />
      ) : null}

      {svgChart && !isLoading ? (
        <AstroChartViewer
          title={isHindi ? "कुंडली चार्ट" : "Kundali Chart"}
          svgMarkup={svgChart}
          planets={planets}
          ascendantSign={ascendantSign}
          birthDetails={{
            datetime: `${form.date}T${form.time}`,
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
          }}
          chartMode="indian-kundali"
          chartStyle={chartStyle}
          onChartStyleChange={handleChartStyleChange}
        />
      ) : null}

      {!planets.length && !svgChart ? (
        <ResultViewer
          title={isHindi ? "कुंडली परिणाम" : "Kundali Result"}
          result={result}
        />
      ) : null}
    </section>
  );
}
