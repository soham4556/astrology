import { useState, useEffect } from "react";
import AstroChartViewer from "../components/common/AstroChartViewer";
import ClassicHoroscopeChart from "../components/common/ClassicHoroscopeChart";
import ErrorMessage from "../components/common/ErrorMessage";
import IndianKundaliChart from "../components/common/IndianKundaliChart";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import TraditionalKundali from "../components/common/TraditionalKundali";
import ZodiacWheelChart from "../components/common/ZodiacWheelChart";
import { callAstrologyApi } from "../api/astrologyApi";
import { useLanguage } from "../hooks/useLanguage";

const chartTypes = [
  { label: "D1 - जन्म कुंडली", value: "D1", emoji: "🕉️" },
  { label: "D2 - होरा चक्र", value: "D2", emoji: "🌗" },
  { label: "D3 - द्रेष्काण", value: "D3", emoji: "🔺" },
  { label: "D4 - चतुर्थांश", value: "D4", emoji: "🏠" },
  { label: "D7 - सप्तांश", value: "D7", emoji: "👶" },
  { label: "D9 - नवांश", value: "D9", emoji: "💍" },
  { label: "D10 - दशांश", value: "D10", emoji: "👑" },
  { label: "D12 - द्वादशांश", value: "D12", emoji: "🧬" },
  { label: "D16 - षोडशांश", value: "D16", emoji: "🚗" },
  { label: "D20 - विंशांश", value: "D20", emoji: "🧘" },
  { label: "D24 - चतुर्विंशांश", value: "D24", emoji: "📚" },
  { label: "D27 - भांश", value: "D27", emoji: "⚔️" },
  { label: "D30 - त्रिंशांश", value: "D30", emoji: "🔥" },
  { label: "D40 - खवेदांश", value: "D40", emoji: "🪔" },
  { label: "D45 - अक्षवेदांश", value: "D45", emoji: "🪷" },
  { label: "D60 - षष्ट्यांश", value: "D60", emoji: "✨" },
  { label: "SUN - सूर्य चक्र", value: "SUN", emoji: "☀️" },
  { label: "MOON - चंद्र चक्र", value: "MOON", emoji: "🌙" },
  { label: "चलित चक्र", value: "chalit", emoji: "🧭" },
];

const chartStyles = [
  { label: "उत्तर", value: "north", desc: "उत्तर भारतीय" },
  { label: "दक्षिण", value: "south", desc: "दक्षिण भारतीय" },
  { label: "पूर्व", value: "east", desc: "पूर्व भारतीय" },
];

const imageTypes = [{ label: "PNG", value: "png" }];

const CHART_RENDER_MODES = Object.freeze([
  "north",
  "wheel",
  "box",
  "south",
  "lotus",
]);

const CHART_COLOR_THEMES = Object.freeze([
  {
    shell: "linear-gradient(135deg, #fff7e8 0%, #fffdf8 100%)",
    accent: "#c46c00",
  },
  {
    shell: "linear-gradient(135deg, #eef7ff 0%, #f8fcff 100%)",
    accent: "#1f73b7",
  },
  {
    shell: "linear-gradient(135deg, #f2f7ec 0%, #fcfff9 100%)",
    accent: "#3f7f2b",
  },
  {
    shell: "linear-gradient(135deg, #fff0f5 0%, #fff9fc 100%)",
    accent: "#b43f72",
  },
  {
    shell: "linear-gradient(135deg, #f3efff 0%, #faf8ff 100%)",
    accent: "#6640b0",
  },
  {
    shell: "linear-gradient(135deg, #fff5e9 0%, #fffdf7 100%)",
    accent: "#ad5f00",
  },
  {
    shell: "linear-gradient(135deg, #edf7f2 0%, #fbfffd 100%)",
    accent: "#1f8f6a",
  },
]);

function resolveChartPreset(chartId) {
  const selected = chartTypes.find((item) => item.value === chartId);
  const chartIndex = Math.max(
    chartTypes.findIndex((item) => item.value === chartId),
    0,
  );

  let mode = CHART_RENDER_MODES[chartIndex % CHART_RENDER_MODES.length];

  if (chartId === "SUN" || chartId === "MOON") {
    mode = "wheel";
  }

  if (chartId === "chalit") {
    mode = "south";
  }

  return {
    mode,
    displayLabel: selected?.label || chartId,
    theme: CHART_COLOR_THEMES[chartIndex % CHART_COLOR_THEMES.length],
  };
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildChartRequest(form) {
  const [yearRaw, monthRaw, dayRaw] = String(form.date || "")
    .split("-")
    .map((part) => toNumber(part));

  const [hourRaw, minRaw] = String(form.time || "")
    .split(":")
    .map((part) => toNumber(part));

  const now = new Date();

  return {
    day: dayRaw || now.getDate(),
    month: monthRaw || now.getMonth() + 1,
    year: yearRaw || now.getFullYear(),
    hour: Number.isFinite(hourRaw) ? hourRaw : 0,
    min: Number.isFinite(minRaw) ? minRaw : 0,
    lat: toNumber(form.latitude),
    lon: toNumber(form.longitude),
    tzone: toNumber(form.timezone, 5.5),
    chartType: form.chartStyle,
    image_type: form.imageType,
  };
}

function normalizeChartRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.output)) {
    return payload.output;
  }

  return [];
}

function isAscendantLabel(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return (
    normalized === "asc" ||
    normalized === "ascendant" ||
    normalized === "lagna" ||
    normalized === "as"
  );
}

function mapRowsToPlanets(rows = []) {
  const mapped = [];

  rows.forEach((row) => {
    const sign = toNumber(row?.sign, null);
    const planets = Array.isArray(row?.planet) ? row.planet : [];
    const degrees = Array.isArray(row?.planet_degree) ? row.planet_degree : [];

    if (!(sign >= 1 && sign <= 12)) {
      return;
    }

    planets.forEach((planetName, index) => {
      mapped.push({
        name: String(planetName || "").trim(),
        sign,
        normDegree: toNumber(degrees[index], 0),
      });
    });
  });

  return mapped;
}

function attachHousePositions(planets = [], ascendantSign = 1) {
  const asc = toNumber(ascendantSign, 1);
  const safeAsc = asc >= 1 && asc <= 12 ? asc : 1;

  return planets.map((planet) => {
    const sign = toNumber(planet?.sign, safeAsc);
    const safeSign = sign >= 1 && sign <= 12 ? sign : safeAsc;

    return {
      ...planet,
      sign: safeSign,
      house: ((safeSign - safeAsc + 12) % 12) + 1,
    };
  });
}

function findAscendantSign(rows = []) {
  for (const row of rows) {
    const sign = toNumber(row?.sign, null);
    const planets = Array.isArray(row?.planet) ? row.planet : [];

    if (
      sign >= 1 &&
      sign <= 12 &&
      planets.some((planetName) => isAscendantLabel(planetName))
    ) {
      return sign;
    }
  }

  return null;
}

function extractSvgMarkup(payload) {
  const textValue =
    typeof payload === "string"
      ? payload
      : typeof payload?.svg === "string"
        ? payload.svg
        : typeof payload?.output === "string"
          ? payload.output
          : "";

  const trimmed = textValue.trim();
  return trimmed.startsWith("<svg") ? trimmed : "";
}

function extractImageSource(payload) {
  const textValue =
    typeof payload === "string"
      ? payload
      : typeof payload?.image === "string"
        ? payload.image
        : typeof payload?.output === "string"
          ? payload.output
          : "";

  const trimmed = textValue.trim();
  return trimmed && !trimmed.startsWith("<svg") ? trimmed : "";
}

export default function ChartPage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    chartId: "D1",
    chartStyle: "north",
    imageType: "png",
    date: new Date().toISOString().slice(0, 10),
    time: "12:00",
    latitude: "28.6139",
    longitude: "77.2090",
    timezone: "5.5",
  });

  const [chartRows, setChartRows] = useState([]);
  const [chartSvgMarkup, setChartSvgMarkup] = useState("");
  const [chartImageSource, setChartImageSource] = useState("");
  const [chartPlanets, setChartPlanets] = useState([]);
  const [ascendantSign, setAscendantSign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [buttonHovered, setButtonHovered] = useState(false);
  const activeChartPreset = resolveChartPreset(form.chartId);

  const renderPresetChart = () => {
    if (chartPlanets.length > 0) {
      if (activeChartPreset.mode === "wheel") {
        return (
          <ZodiacWheelChart
            planets={chartPlanets}
            ascendantSign={ascendantSign || 1}
            size={760}
          />
        );
      }

      if (activeChartPreset.mode === "north") {
        return (
          <IndianKundaliChart planets={chartPlanets} styleType="north-indian" />
        );
      }

      if (activeChartPreset.mode === "south") {
        return (
          <IndianKundaliChart planets={chartPlanets} styleType="south-indian" />
        );
      }

      if (activeChartPreset.mode === "lotus") {
        return (
          <TraditionalKundali
            style="north-indian"
            planets={chartPlanets}
            ascendantSign={ascendantSign || 1}
          />
        );
      }

      return (
        <ClassicHoroscopeChart
          planets={chartPlanets}
          ascendantSign={ascendantSign || 1}
        />
      );
    }

    if (chartSvgMarkup) {
      return (
        <AstroChartViewer
          title={`${form.chartId} चक्र`}
          svgMarkup={chartSvgMarkup}
          chartMode="api-svg"
        />
      );
    }

    if (chartImageSource) {
      return (
        <div
          style={{
            border: "1px solid #e8c78e",
            borderRadius: "14px",
            background: "#fffdf8",
            padding: "14px",
          }}
        >
          <img
            src={chartImageSource}
            alt={`${form.chartId} चक्र`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      );
    }

    return (
      <p style={{ color: "#8b6f47", fontWeight: 600 }}>
        API से दृश्य चक्र उपलब्ध नहीं हुआ, नीचे राशि-वार डेटा दिखाया गया है।
      </p>
    );
  };

  // Inject global styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Crimson+Text:wght@400;600&family=Poppins:wght@400;500;600;700&display=swap");

      html, body { 
        background-color: #fef9f3 !important; 
        background: linear-gradient(135deg, #fef9f3 0%, #f5ede3 100%) !important;
      }

      * { margin: 0; padding: 0; box-sizing: border-box; }

      @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-30px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(40px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      input, select {
        font-family: "Crimson Text", serif !important;
        background-color: white !important;
        color: #1a1a1a !important;
      }

      input:hover, select:hover {
        border-color: #ff9933 !important;
        box-shadow: inset 0 1px 3px rgba(26, 58, 82, 0.05), 0 0 8px rgba(255, 153, 51, 0.2) !important;
      }

      input:focus, select:focus {
        outline: none !important;
        border-color: #1a3a52 !important;
        background-color: white !important;
        box-shadow: inset 0 1px 3px rgba(26, 58, 82, 0.08), 0 0 12px rgba(212, 175, 55, 0.3) !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setChartRows([]);
    setChartSvgMarkup("");
    setChartImageSource("");
    setChartPlanets([]);
    setAscendantSign(null);

    const params = buildChartRequest(form);

    try {
      const [chartResult, imageResult] = await Promise.allSettled([
        callAstrologyApi(`horo_chart/${form.chartId}`, params, {
          language,
        }),
        callAstrologyApi(`horo_chart_image/${form.chartId}`, params, {
          language,
        }),
      ]);

      if (chartResult.status !== "fulfilled") {
        throw chartResult.reason;
      }

      const responsePayload = chartResult.value?.data ?? chartResult.value;

      const rows = normalizeChartRows(responsePayload);
      if (!rows.length) {
        throw new Error("API response में chart data उपलब्ध नहीं है।");
      }

      const orderedRows = [...rows].sort(
        (left, right) => toNumber(left?.sign) - toNumber(right?.sign),
      );

      const planets = mapRowsToPlanets(orderedRows);
      const detectedAscendant = findAscendantSign(orderedRows) || 1;
      const planetsWithHouses = attachHousePositions(
        planets,
        detectedAscendant,
      );

      if (imageResult.status === "fulfilled") {
        const imagePayload = imageResult.value?.data ?? imageResult.value;
        const svgMarkup = extractSvgMarkup(imagePayload);
        const imageSource = extractImageSource(imagePayload);

        setChartSvgMarkup(svgMarkup);
        setChartImageSource(svgMarkup ? "" : imageSource);
      }

      setChartRows(orderedRows);
      setChartPlanets(planetsWithHouses);
      setAscendantSign(detectedAscendant);
    } catch (requestError) {
      setError(requestError.message || "इस समय चक्र डेटा प्राप्त नहीं हो सका।");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#fef9f3",
        background: "linear-gradient(135deg, #fef9f3 0%, #f5ede3 100%)",
        padding: "32px 16px",
        fontFamily: '"Crimson Text", serif',
        color: "#1a1a1a",
        position: "relative",
        zIndex: 5,
      }}
    >
      <SeoMeta
        title="Predictive Charts | jyotish web"
        description="Generate Vedic astrology charts in North Indian or South Indian styles."
        path="/chart"
      />

      {/* Background decorations */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
          backgroundColor: "#fef9f3",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            top: "-150px",
            right: "-50px",
            background:
              "radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, rgba(255, 153, 51, 0.02) 100%)",
            border: "2px solid rgba(212, 175, 55, 0.12)",
            animation: "spin-slow 25s linear infinite",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "250px",
            height: "250px",
            borderRadius: "50%",
            bottom: "50px",
            left: "20px",
            background:
              "radial-gradient(circle, rgba(196, 30, 58, 0.06) 0%, rgba(196, 30, 58, 0.01) 100%)",
            border: "2px dashed rgba(26, 58, 82, 0.12)",
            animation: "spin-slow 30s linear infinite reverse",
          }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          marginBottom: "32px",
          animation: "fadeInDown 0.8s ease-out",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "12px",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            🔯
          </div>
          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "2.8rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #1a3a52 0%, #ff9933 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "8px",
            }}
          >
            ज्योतिषीय चक्र निर्माण
          </h1>
          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "1.1rem",
              color: "#8b6f47",
              fontWeight: 500,
              marginBottom: "12px",
              letterSpacing: "1.5px",
            }}
          >
            वैदिक ज्योतिष चक्र
          </p>
          <p
            style={{
              fontSize: "1rem",
              color: "#1a1a1a",
              marginBottom: "6px",
            }}
          >
            विभिन्न चक्रों के साथ आपके ग्रहों की स्थिति देखें
          </p>
          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "0.9rem",
              color: "#8b6f47",
              fontStyle: "italic",
            }}
          >
            उच्च गुणवत्ता वाले चक्रों में ग्रहों की स्थिति देखें
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "950px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            border: "2px solid #e8c78e",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 8px 32px rgba(26, 58, 82, 0.15)",
            animation: "slideUp 0.8s ease-out 0.1s backwards",
          }}
        >
          {/* Section 1: Chart Selection */}
          <div
            style={{
              marginBottom: "32px",
              paddingBottom: "32px",
              borderBottom: "1px dashed #e8c78e",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "1.6rem",
                  color: "#1a3a52",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                🔯 चक्र चयन
              </h2>
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #e8c78e 0%, transparent 100%)",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  चक्र प्रकार <span style={{ color: "#c41e3a" }}>*</span>
                </label>
                <select
                  value={form.chartId}
                  onChange={(e) =>
                    setForm({ ...form, chartId: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                >
                  {chartTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.emoji} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  चक्र शैली <span style={{ color: "#c41e3a" }}>*</span>
                </label>
                <select
                  value={form.chartStyle}
                  onChange={(e) =>
                    setForm({ ...form, chartStyle: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                >
                  {chartStyles.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({s.desc})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  चित्र प्रकार
                </label>
                <select
                  value={form.imageType}
                  onChange={(e) =>
                    setForm({ ...form, imageType: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                >
                  {imageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  चयनित भाषा
                </label>
                <input
                  value={
                    language === "hi" ? "हिंदी (hi)" : `${language || "en"}`
                  }
                  readOnly
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    background: "#fffdf8",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Date & Time */}
          <div
            style={{
              marginBottom: "32px",
              paddingBottom: "32px",
              borderBottom: "1px dashed #e8c78e",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "1.6rem",
                  color: "#1a3a52",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                📅 तिथि और समय
              </h2>
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #e8c78e 0%, transparent 100%)",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  तिथि <span style={{ color: "#c41e3a" }}>*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  समय <span style={{ color: "#c41e3a" }}>*</span>
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  टाइमज़ोन (tzone) <span style={{ color: "#c41e3a" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.timezone}
                  onChange={(e) =>
                    setForm({ ...form, timezone: e.target.value })
                  }
                  required
                  placeholder="5.5"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Location */}
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "1.6rem",
                  color: "#1a3a52",
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                📍 स्थान
              </h2>
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background:
                    "linear-gradient(90deg, #e8c78e 0%, transparent 100%)",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  अक्षांश <span style={{ color: "#c41e3a" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                  required
                  placeholder="28.6139"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  देशांतर <span style={{ color: "#c41e3a" }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                  required
                  placeholder="77.2090"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            style={{
              width: "100%",
              padding: "14px 24px",
              marginTop: "20px",
              fontFamily: '"Poppins", sans-serif',
              fontSize: "1rem",
              fontWeight: 700,
              color: "#ffffff",
              background:
                buttonHovered && !isLoading
                  ? "linear-gradient(135deg, #2d5a7b 0%, #1a3a52 100%)"
                  : "linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%)",
              border: "2px solid #ff9933",
              borderRadius: "12px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              transition: "all 0.3s",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              transform:
                buttonHovered && !isLoading
                  ? "translateY(-2px)"
                  : "translateY(0)",
            }}
          >
            <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
              🔯
            </span>
            <span>
              {isLoading ? "चक्र निर्मित हो रहा है..." : "चक्र उत्पन्न करें"}
            </span>
          </button>
        </form>
      </div>

      {/* Error Container */}
      {error && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "950px",
            margin: "20px auto",
            padding: "0 16px",
          }}
        >
          <ErrorMessage message={error} />
        </div>
      )}

      {/* Loading Container */}
      {isLoading && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "950px",
            margin: "20px auto",
            padding: "0 16px",
          }}
        >
          <LoadingSpinner label="आपका ज्योतिषीय चक्र तैयार हो रहा है..." />
        </div>
      )}

      {/* Results Section */}
      {(chartRows.length > 0 || chartSvgMarkup || chartImageSource) && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "950px",
            margin: "28px auto",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              background: activeChartPreset.theme.shell,
              border: `2px solid ${activeChartPreset.theme.accent}`,
              borderRadius: "20px",
              padding: "18px",
              boxShadow: "0 8px 32px rgba(26, 58, 82, 0.15)",
              marginBottom: "16px",
            }}
          >
            <h3
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "1.65rem",
                color: "#1a3a52",
                marginBottom: "8px",
              }}
            >
              {activeChartPreset.displayLabel}
            </h3>
            <p
              style={{
                color: "#5d4a26",
                marginBottom: "12px",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              चयनित चक्र प्रकार के अनुसार अलग संरचना में चक्र तैयार किया गया है।
            </p>

            {renderPresetChart()}
          </div>

          <div
            style={{
              background: "#fff",
              border: "2px solid #e8c78e",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 8px 32px rgba(26, 58, 82, 0.15)",
            }}
          >
            <h3
              style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "1.8rem",
                color: "#1a3a52",
                marginBottom: "18px",
              }}
            >
              {form.chartId} चक्र डेटा (horo_chart/{form.chartId})
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
              }}
            >
              {chartRows.map((row, index) => {
                const fullPlanets = Array.isArray(row?.planet)
                  ? row.planet
                  : [];
                const shortPlanets = Array.isArray(row?.planet_small)
                  ? row.planet_small
                  : [];

                return (
                  <article
                    key={`${row?.sign || "sign"}-${index}`}
                    style={{
                      border: "1px solid #e8c78e",
                      borderRadius: "14px",
                      background: "#fffdf8",
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <strong style={{ color: "#1a3a52" }}>
                        राशि {row?.sign}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: "#8b6f47",
                          fontWeight: 600,
                        }}
                      >
                        {row?.sign_name || "-"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.9rem", color: "#4a3f35" }}>
                      <div style={{ marginBottom: "6px" }}>
                        <strong>ग्रह:</strong>{" "}
                        {fullPlanets.length
                          ? fullPlanets.join(", ")
                          : "कोई नहीं"}
                      </div>
                      <div style={{ marginBottom: "6px" }}>
                        <strong>संक्षिप्त:</strong>{" "}
                        {shortPlanets.length
                          ? shortPlanets.join(", ")
                          : "कोई नहीं"}
                      </div>
                      <div>
                        <strong>डिग्री:</strong>{" "}
                        {Array.isArray(row?.planet_degree) &&
                        row.planet_degree.length
                          ? row.planet_degree.join(", ")
                          : "कोई नहीं"}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
