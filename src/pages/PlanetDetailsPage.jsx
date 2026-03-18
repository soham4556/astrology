import { useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import ZodiacWheelChart from "../components/common/ZodiacWheelChart";
import { getKpPlanets, getPlanets } from "../api/astrologyApi";

const PLANET_LORDS = {
  Sun: { signLord: "Sun", nakshatraLord: "Sun" }, // Simplification for demo
  Moon: { signLord: "Moon", nakshatraLord: "Moon" },
  Mars: { signLord: "Mars", nakshatraLord: "Mars" },
  Mercury: { signLord: "Mercury", nakshatraLord: "Mercury" },
  Jupiter: { signLord: "Jupiter", nakshatraLord: "Jupiter" },
  Venus: { signLord: "Venus", nakshatraLord: "Venus" },
  Saturn: { signLord: "Saturn", nakshatraLord: "Saturn" },
  Rahu: { signLord: "Saturn", nakshatraLord: "Rahu" },
  Ketu: { signLord: "Mars", nakshatraLord: "Ketu" },
};

const SIGN_NAME_TO_NUMBER = {
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
  mesh: 1,
  vrishabh: 2,
  mithun: 3,
  kark: 4,
  singh: 5,
  kanya: 6,
  tula: 7,
  vrishchik: 8,
  dhanu: 9,
  makar: 10,
  kumbh: 11,
  meen: 12,
};

function toFiniteNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSignNumber(value, fallback = 1) {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 12
  ) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const numeric = Number.parseInt(trimmed, 10);
    if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12)
      return numeric;

    const mapped = SIGN_NAME_TO_NUMBER[trimmed.toLowerCase()];
    if (mapped) return mapped;
  }

  return fallback;
}

function isAscendantName(name) {
  const key = String(name || "")
    .trim()
    .toLowerCase();
  return key === "ascendant" || key === "lagna" || key === "लग्न";
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.output)) return payload.output;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeKpPlanets(payload) {
  const rows = extractRows(payload);
  return rows
    .map((item, index) => {
      const sign = parseSignNumber(
        item?.sign ??
          item?.sign_no ??
          item?.sign_num ??
          item?.zodiac_no ??
          item?.zodiac ??
          item?.sign_name,
        1,
      );
      const houseValue = toFiniteNumber(
        item?.house ?? item?.house_no ?? item?.bhava,
        null,
      );
      const retroValue = item?.is_retro ?? item?.isRetro ?? item?.retrograde;

      return {
        name:
          item?.name ||
          item?.planet_name ||
          item?.planet ||
          `Planet ${index + 1}`,
        sign,
        house:
          houseValue === null
            ? null
            : Math.max(1, Math.min(12, Math.round(houseValue))),
        normDegree: toFiniteNumber(
          item?.normDegree ??
            item?.fullDegree ??
            item?.degree ??
            item?.longitude,
          0,
        ),
        isRetro:
          retroValue === true ||
          String(retroValue).trim().toLowerCase() === "true" ||
          String(retroValue).trim() === "1",
      };
    })
    .filter((item) => Boolean(item.name));
}

const PlanetDetailsTable = ({ planets }) => {
  if (!planets || !Array.isArray(planets)) return null;

  return (
    <div className="planet-details-wrapper">
      <table className="sacred-kp-table">
        <thead>
          <tr>
            <th>ग्रह (Planet)</th>
            <th>राशी (Sign)</th>
            <th>राशी स्वामी (Sign Lord)</th>
            <th>स्थान (House)</th>
            <th>अंश (Degree)</th>
          </tr>
        </thead>
        <tbody>
          {planets.map((p, idx) => {
            const lords = PLANET_LORDS[p.name] || {
              signLord: "Unknown",
              nakshatraLord: "Unknown",
            };
            const degreeValue = toFiniteNumber(
              p.degree ?? p.normDegree ?? p.fullDegree ?? p.longitude,
              null,
            );
            const houseValue = p.house ?? p.house_no ?? p.bhava ?? "-";
            const signValue = p.sign_name || p.zodiac || p.sign || "-";
            const isRetro =
              p.is_retro === "true" ||
              p.isRetro === true ||
              String(p.is_retro).trim() === "1";
            return (
              <tr key={idx} className={isRetro ? "retrograde-row" : ""}>
                <td className="planet-name-cell">
                  <span className="bullet">✦</span> {p.name}{" "}
                  {isRetro && <span className="retro">(R)</span>}
                </td>
                <td>{signValue}</td>
                <td>{lords.signLord}</td>
                <td className="sub-lord-cell">{houseValue}</td>
                <td>
                  {degreeValue === null ? "-" : `${degreeValue.toFixed(2)}°`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style>{`
        .planet-details-wrapper {
          overflow-x: auto;
          margin-top: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: 1px solid #f3e5ab;
        }
        .sacred-kp-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-family: 'Poppins', sans-serif;
        }
        .sacred-kp-table th {
          background: linear-gradient(to bottom, #1e3c72, #2a5298);
          color: white;
          padding: 18px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
        }
        .sacred-kp-table td {
          padding: 15px;
          border-bottom: 1px solid #f0f2f5;
          color: #2c3e50;
          font-size: 0.85rem;
        }
        .sacred-kp-table tr:hover { background: #fdfaf0; }
        .planet-name-cell { font-weight: 700; color: #1e3c72; }
        .bullet { color: #ffcc00; margin-right: 8px; }
        .retro { color: #e74c3c; font-size: 0.7rem; margin-left: 4px; font-weight: bold; }
        .retrograde-row { background: #fff9f9; }
        .sub-lord-cell { font-weight: 700; color: #d4af37; }

        @media (max-width: 768px) {
          .sacred-kp-table th, .sacred-kp-table td { padding: 12px 8px; font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default function PlanetDetailsPage() {
  const [form, setForm] = useState({
    fullName: "",
    date: new Date().toISOString().split("T")[0],
    time: "12:00:00",
    latitude: "18.5204",
    longitude: "73.8567",
    timezone: "5.5",
  });

  const [planetData, setPlanetData] = useState([]);
  const [wheelPlanets, setWheelPlanets] = useState([]);
  const [ascendantSign, setAscendantSign] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setPlanetData([]);
    setWheelPlanets([]);

    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, min, sec] = form.time.split(":").map(Number);

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

    try {
      let response;
      try {
        response = await getKpPlanets(params, { language: "hi" });
      } catch {
        response = await getPlanets(params, { language: "hi" });
      }

      const payload = response?.data ?? response;
      const rows = extractRows(payload);
      const normalized = normalizeKpPlanets(payload);
      const ascendantPlanet = normalized.find((planet) =>
        isAscendantName(planet.name),
      );

      setPlanetData(rows);
      setWheelPlanets(normalized);
      setAscendantSign(ascendantPlanet?.sign || normalized[0]?.sign || 1);
    } catch (err) {
      setError(
        err.message ||
          "ग्रह विवरण प्राप्त करने में विफल (Failed to get planet details).",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="planet-details-container">
      <SeoMeta
        title="Planet Details | jyotish web"
        description="Detailed planetary positions and KP sub-lords in Hindi."
        path="/kundali/planets"
      />

      <div className="sacred-header">
        <div className="sacred-icon">🪐</div>
        <h1>ग्रह विवरण (Planet Details)</h1>
        <p className="subtitle">KP Planetary Analysis</p>
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
              : "विवरण प्राप्त करें (Get Details)"}
          </button>
        </form>

        <section className="results-container">
          <ErrorMessage message={error} />
          {isLoading && (
            <LoadingSpinner label="ग्रहों की स्थिति की गणना हो रही है..." />
          )}

          {(planetData.length > 0 || wheelPlanets.length > 0) && !isLoading && (
            <div className="data-view-wrapper">
              <h3 className="section-subtitle">
                KP ग्रह स्पष्ट विवरण (KP Planetary Positions)
              </h3>

              {wheelPlanets.length > 0 ? (
                <div className="kp-wheel-wrapper">
                  <ZodiacWheelChart
                    planets={wheelPlanets}
                    ascendantSign={ascendantSign}
                    size={720}
                  />
                </div>
              ) : null}

              {planetData.length > 0 ? (
                <PlanetDetailsTable planets={planetData} />
              ) : null}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .planet-details-container {
          max-width: 1200px;
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

        .section-subtitle { 
          font-family: 'Playfair Display', serif; 
          font-size: 1.8rem; 
          color: #1a3a52; 
          text-align: center; 
          margin-bottom: 25px; 
          border-bottom: 2px solid #f3e5ab;
          padding-bottom: 10px;
        }

        .data-view-wrapper { animation: fadeIn 1s; }
        .kp-wheel-wrapper {
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #f3e5ab;
          border-radius: 16px;
          padding: 16px;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
