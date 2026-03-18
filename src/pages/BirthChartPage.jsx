import { useState, useEffect } from "react";
import AstroChartViewer from "../components/common/AstroChartViewer";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import ZodiacWheelChart from "../components/common/ZodiacWheelChart";
import { getHoroChartImageD1, getPlanets } from "../api/astrologyApi";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";

const SIGN_NAMES = Object.freeze({
  1: "मेष",
  2: "वृषभ",
  3: "मिथुन",
  4: "कर्क",
  5: "सिंह",
  6: "कन्या",
  7: "तुला",
  8: "वृश्चिक",
  9: "धनु",
  10: "मकर",
  11: "कुंभ",
  12: "मीन",
});

const SIGN_ALIASES = Object.freeze({
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

const PLANET_NAME_MAP = Object.freeze({
  sun: "सूर्य",
  moon: "चंद्र",
  mars: "मंगल",
  mercury: "बुध",
  jupiter: "गुरु",
  venus: "शुक्र",
  saturn: "शनि",
  rahu: "राहु",
  ketu: "केतु",
  ascendant: "लग्न",
  asc: "लग्न",
  lagna: "लग्न",
});

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  const looseParsed = parseFloat(String(value || "").replace(/[^0-9.+-]/g, ""));
  return Number.isFinite(looseParsed) ? looseParsed : fallback;
}

function parseSignNumber(value, fallback = 1) {
  const numeric = toNumber(value, null);
  if (numeric >= 1 && numeric <= 12) {
    return numeric;
  }

  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return SIGN_ALIASES[normalized] || fallback;
}

function toHindiPlanetName(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  return PLANET_NAME_MAP[normalized] || String(name || "ग्रह");
}

function isAscendantPlanet(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();
  return (
    normalized === "asc" || normalized === "ascendant" || normalized === "lagna"
  );
}

function normalizePlanetRows(payload) {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.output)
      ? payload.output
      : [];

  if (!source.length) {
    return { rows: [], ascendantSign: 1 };
  }

  const ascPlanet = source.find((planet) => isAscendantPlanet(planet?.name));
  const derivedAscendant = parseSignNumber(
    ascPlanet?.sign ?? ascPlanet?.sign_name ?? ascPlanet?.zodiac,
    1,
  );

  const rows = source
    .filter((planet) => planet && typeof planet.name === "string")
    .map((planet, index) => {
      const sign = parseSignNumber(
        planet.sign ?? planet.sign_name ?? planet.zodiac,
        derivedAscendant,
      );
      const degree = toNumber(
        planet.normDegree,
        toNumber(planet.fullDegree, toNumber(planet.degree, null)),
      );
      const rawHouse = toNumber(planet.house, null);
      const house =
        rawHouse >= 1 && rawHouse <= 12
          ? rawHouse
          : ((sign - derivedAscendant + 12) % 12) + 1;

      return {
        id: `${planet.name}-${index}`,
        rawName: planet.name,
        name: toHindiPlanetName(planet.name),
        sign,
        sign_name:
          SIGN_NAMES[sign] || String(planet.sign_name || planet.zodiac || "-"),
        degree,
        house,
        isRetro:
          Boolean(planet.isRetro) ||
          planet.is_retro === true ||
          String(planet.is_retro || "").toLowerCase() === "true",
      };
    });

  return { rows, ascendantSign: derivedAscendant };
}

const PlanetDataTable = ({ planets }) => {
  if (!planets || !Array.isArray(planets)) return null;

  const formatDegree = (decimalDegree) => {
    if (!Number.isFinite(decimalDegree)) {
      return "--";
    }

    const d = Math.floor(decimalDegree);
    const m = Math.floor((decimalDegree - d) * 60);
    const s = Math.round(((decimalDegree - d) * 60 - m) * 60);
    return `${d}° ${m}' ${s}"`;
  };

  return (
    <div className="planet-table-wrapper">
      <table className="sacred-table">
        <thead>
          <tr>
            <th>ग्रह (Planet)</th>
            <th>राशी (Sign)</th>
            <th>अंश (Degree)</th>
            <th>स्थान (House)</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((p, idx) => (
            <tr key={p.id || idx} className={p.isRetro ? "retrograde-row" : ""}>
              <td className="planet-name">
                <span className="symbol">✦</span> {p.name}{" "}
                {p.isRetro && <span className="retro-tag">(R)</span>}
              </td>
              <td>{p.sign_name || p.zodiac}</td>
              <td className="degree-cell">{formatDegree(p.degree)}</td>
              <td className="house-cell">{p.house}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .planet-table-wrapper {
          overflow-x: auto;
          margin-top: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .sacred-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-family: 'Poppins', sans-serif;
        }
        .sacred-table th {
          background: #1e3c72;
          color: white;
          padding: 15px;
          text-align: left;
          font-weight: 600;
          font-size: 0.95rem;
        }
        .sacred-table td {
          padding: 12px 15px;
          border-bottom: 1px solid #f0f0f0;
          color: #2c3e50;
          font-size: 0.9rem;
        }
        .sacred-table tr:hover { background: #f8faff; }
        .planet-name { font-weight: 700; color: #1e3c72; }
        .symbol { color: #ffcc00; margin-right: 8px; }
        .retro-tag { color: #e74c3c; font-size: 0.75rem; margin-left: 5px; font-weight: bold; }
        .retrograde-row { background: #fff5f5; }
        .degree-cell { font-family: 'monospace'; font-weight: 600; color: #34495e; }
        .house-cell { font-weight: 800; color: #2980b9; }

        @media (max-width: 600px) {
          .sacred-table th, .sacred-table td { padding: 10px; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
};

export default function BirthChartPage() {
  useAuth();
  const { language } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    date: new Date().toISOString().split("T")[0],
    time: "12:00:00",
    latitude: "18.5204",
    longitude: "73.8567",
    timezone: "5.5",
  });

  const [planetData, setPlanetData] = useState(null);
  const [wheelPlanets, setWheelPlanets] = useState([]);
  const [ascendantSign, setAscendantSign] = useState(1);
  const [svgChart, setSvgChart] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setSvgChart("");
    setPlanetData(null);
    setWheelPlanets([]);
    setAscendantSign(1);

    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, min] = form.time.split(":").map(Number);

    const params = {
      day,
      month,
      year,
      hour,
      min,
      lat: parseFloat(form.latitude),
      lon: parseFloat(form.longitude),
      tzone: parseFloat(form.timezone),
    };

    // For the SVG image, we use the standard format which supports D1/Hindi
    const imageParams = {
      datetime: `${form.date}T${form.time}`,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      timezone: parseFloat(form.timezone),
    };

    try {
      const [planetResponse, imageResponse] = await Promise.allSettled([
        getPlanets(params, { language }),
        getHoroChartImageD1(imageParams, { language }),
      ]);

      if (planetResponse.status !== "fulfilled") {
        throw planetResponse.reason;
      }

      const payload = planetResponse.value?.data || planetResponse.value;
      const normalized = normalizePlanetRows(payload);
      setPlanetData(normalized.rows);
      setAscendantSign(normalized.ascendantSign);
      setWheelPlanets(
        normalized.rows.map((planet) => ({
          name: planet.rawName,
          sign: planet.sign,
          house: planet.house,
          normDegree: Number.isFinite(planet.degree) ? planet.degree : 0,
          isRetro: planet.isRetro,
        })),
      );

      if (imageResponse.status === "fulfilled") {
        const imagePayload = imageResponse.value?.data || imageResponse.value;
        const svg =
          imagePayload?.svg ||
          imagePayload?.output ||
          imageResponse.value?.svg ||
          imageResponse.value?.output;
        setSvgChart(svg || "");
      }
    } catch (err) {
      setError(
        err.message ||
          "जन्म कुंडली प्राप्त करने में विफल (Failed to get birth chart).",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="birth-chart-container">
      <SeoMeta
        title="Birth Chart | jyotish web"
        description="Generate your Janma Kundali with precise Hindi labels and North Indian layout."
        path="/kundali/birth-chart"
      />

      <div className="sacred-header">
        <div className="sacred-icon">📜</div>
        <h1>जन्म कुंडली (Birth Chart)</h1>
        <p className="subtitle">Astrological Birth Analysis</p>
      </div>

      <div className="sacred-content">
        <form onSubmit={handleSubmit} className="astro-form-card">
          <div className="form-grid">
            <div className="field">
              <label>नाम (Name)</label>
              <input
                type="text"
                placeholder="Enter Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>जन्म तिथि (Date)</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>समय (Time)</label>
              <input
                type="time"
                step="1"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>अक्षांश (Lat)</label>
              <input
                type="number"
                step="0.0001"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>देशांतर (Lon)</label>
              <input
                type="number"
                step="0.0001"
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                required
              />
            </div>
            <div className="field">
              <label>टाइमज़ोन (TZ)</label>
              <input
                type="number"
                step="0.1"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="sacred-btn" disabled={isLoading}>
            {isLoading
              ? "प्रक्रिया चल रही है..."
              : "कुंडली बनाएं (Generate Birth Chart)"}
          </button>
        </form>

        <section className="results-container">
          <ErrorMessage message={error} />
          {isLoading && <LoadingSpinner label="ग्रहों की गणना हो रही है..." />}

          {(wheelPlanets.length > 0 || svgChart) && !isLoading && (
            <div className="chart-view-wrapper">
              {svgChart ? (
                <div className="chart-block">
                  <h3 className="section-subtitle">जन्म कुंडली (मूळ शैली)</h3>
                  <AstroChartViewer
                    title="जन्म कुंडली (Janma Chart)"
                    svgMarkup={svgChart}
                    chartMode="api-svg"
                  />
                </div>
              ) : null}

              {wheelPlanets.length > 0 ? (
                <div className="chart-block">
                  <h3 className="section-subtitle">
                    जन्म कुंडली (वृत्ताकार शैली)
                  </h3>
                  <ZodiacWheelChart
                    planets={wheelPlanets}
                    ascendantSign={ascendantSign}
                    size={760}
                  />
                </div>
              ) : null}
            </div>
          )}

          {planetData && !isLoading && (
            <div className="kp-data-wrapper">
              <h3 className="section-subtitle">
                ग्रह विवरण (Planetary Positions):{" "}
                {new Date(form.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <PlanetDataTable planets={planetData} />
            </div>
          )}
        </section>
      </div>

      <style>{`
        .birth-chart-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .sacred-header { text-align: center; margin-bottom: 40px; }
        .sacred-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem;
          color: #1a3a52;
          margin-bottom: 5px;
        }
        .subtitle { font-family: 'Poppins', sans-serif; color: #8b6f47; letter-spacing: 2px; text-transform: uppercase; font-size: 0.9rem; }
        
        .astro-form-card {
          background: white;
          padding: 35px;
          border-radius: 20px;
          border: 1px solid #f3e5ab;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-bottom: 50px;
        }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .field label { display: block; font-weight: 600; margin-bottom: 8px; color: #1a3a52; font-size: 0.9rem; }
        .field input { width: 100%; padding: 12px; border: 1px solid #e8c78e; border-radius: 10px; font-family: 'Poppins', sans-serif; }
        
        .sacred-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sacred-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(30, 60, 114, 0.3); }

        .chart-view-wrapper {
          margin-bottom: 50px;
          animation: fadeIn 1s;
          display: grid;
          gap: 28px;
        }
        .chart-block {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #f3e5ab;
          border-radius: 16px;
          padding: 16px;
        }
        .section-subtitle { 
          font-family: 'Playfair Display', serif; 
          font-size: 1.8rem; 
          color: #1a3a52; 
          text-align: center; 
          margin-bottom: 25px; 
          border-bottom: 2px solid #f3e5ab;
          padding-bottom: 10px;
        }
        .data-card {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.03);
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
