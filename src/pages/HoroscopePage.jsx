import { useState, useEffect } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import AstroChartViewer from "../components/common/AstroChartViewer";
import ZodiacWheelChart from "../components/common/ZodiacWheelChart";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ResultViewer from "../components/common/ResultViewer";
import SeoMeta from "../components/common/SeoMeta";
import {
  getHoroscope,
  getKundali,
  getHoroChartImageD1,
} from "../api/astrologyApi";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { saveHoroscopeReport } from "../services/reportService";

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

export default function HoroscopePage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "06:00:00",
    latitude: "28.6139",
    longitude: "77.2090",
    timezone: "5.5",
    observationPoint: "topocentric",
    ayanamsha: "lahiri",
  });

  const [result, setResult] = useState(null);
  const [svgChart, setSvgChart] = useState("");
  const [planets, setPlanets] = useState([]); // New state for custom rendering
  const [ascendantSign, setAscendantSign] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [buttonHovered, setButtonHovered] = useState(false);

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

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setSvgChart("");
    setPlanets([]);
    setAscendantSign(null);

    const [year, month, date] = form.date
      .split("-")
      .map((value) => Number(value));
    const [hours, minutes, seconds = "0"] = form.time
      .split(":")
      .map((value) => Number(value));

    const queryPayload = {
      year,
      month,
      date,
      hours,
      minutes,
      seconds,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      timezone: Number(form.timezone),
      config: {
        observation_point: form.observationPoint,
        ayanamsha: form.ayanamsha,
      },
    };

    try {
      const [horoscopeResponse, kundaliResponse, chartImageResponse] =
        await Promise.all([
          getHoroscope(queryPayload),
          getKundali({
            datetime: `${form.date}T${form.time}`,
            latitude: Number(form.latitude),
            longitude: Number(form.longitude),
            timezone: Number(form.timezone),
            ayanamsa: 1,
          }),
          getHoroChartImageD1(queryPayload),
        ]);

      const responsePayload = horoscopeResponse.data || horoscopeResponse;
      const chartPayload = chartImageResponse.data || chartImageResponse;
      const svg = extractChartSvg(chartPayload);

      setSvgChart(svg);
      setResult(responsePayload);
      setAscendantSign(parseSignNumber(responsePayload?.ascendant, null));

      // Extract planet data for TraditionalKundali
      if (
        kundaliResponse &&
        (kundaliResponse.data || Array.isArray(kundaliResponse))
      ) {
        const kData = Array.isArray(kundaliResponse)
          ? kundaliResponse
          : kundaliResponse.data || [];

        if (Array.isArray(kData)) {
          const mappedPlanets = kData
            .filter((p) => p && typeof p.name === "string")
            .map((p) => ({
              name: p.name,
              house: Number(p.house),
              sign: parseSignNumber(p.sign),
              normDegree: Number(p.normDegree),
              fullDegree: Number(p.fullDegree),
              isRetro: p.isRetro,
            }));
          setPlanets(mappedPlanets);
        }
      }

      await saveHoroscopeReport({
        userId: user.id,
        sign: "horoscope-chart",
        query: queryPayload,
        result: horoscopeResponse,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          (isHindi
            ? "इस समय राशिफल चक्र प्राप्त नहीं हो सका।"
            : "Unable to fetch horoscope chart right now."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Inject global styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Crimson+Text:wght@400;600&family=Poppins:wght@400;500;600;700&display=swap");

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translateY(-30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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

      @keyframes twinkle {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.8; }
      }

      body, html {
        background-color: #fef9f3 !important;
      }

      input, select {
        font-family: "Crimson Text", serif;
      }

      input:hover, select:hover {
        border-color: #ff9933 !important;
        box-shadow: inset 0 1px 3px rgba(26, 58, 82, 0.05), 0 0 8px rgba(255, 153, 51, 0.2) !important;
      }

      input:focus, select:focus {
        outline: none !important;
        border-color: #1a3a52 !important;
        box-shadow: inset 0 1px 3px rgba(26, 58, 82, 0.08), 0 0 12px rgba(212, 175, 55, 0.3) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        padding: "32px 16px",
        background: "linear-gradient(135deg, #fef9f3 0%, #f5ede3 100%)",
        fontFamily: '"Crimson Text", serif',
        color: "#1a1a1a",
      }}
    >
      <SeoMeta
        title="Horoscope Chart Generator | Pavitra Jyotish"
        description="Generate horoscope chart insights using AstrologyAPI integration."
        path="/horoscope"
      />

      {/* Background decorative elements */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
          overflow: "hidden",
        }}
      >
        {/* Large mandala */}
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
            boxShadow: "0 0 60px rgba(212, 175, 55, 0.1)",
            animation: "spin-slow 25s linear infinite",
          }}
        />

        {/* Small mandala */}
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

        {/* Stars */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "radial-gradient(1px 1px at 20px 30px, rgba(212, 175, 55, 0.6), transparent), radial-gradient(1px 1px at 60px 70px, rgba(212, 175, 55, 0.5), transparent), radial-gradient(1px 1px at 50px 50px, rgba(212, 175, 55, 0.4), transparent)",
            backgroundRepeat: "repeat",
            backgroundSize: "200px 200px",
            opacity: 0.3,
            animation: "twinkle 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Header Section */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          padding: "24px 16px 32px",
          marginBottom: "32px",
          animation: "fadeInDown 0.8s ease-out",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              marginBottom: "12px",
              animation: "float 3s ease-in-out infinite",
              display: "block",
            }}
          >
            🔮
          </div>

          <h1
            style={{
              fontFamily: '"Playfair Display", serif',
              fontSize: "2.8rem",
              fontWeight: 900,
              background: "linear-gradient(135deg, #1a3a52 0%, #ff9933 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "8px",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}
          >
            ज्योतिष चक्र निर्माणकर्ता
          </h1>

          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "1.1rem",
              color: "#8b6f47",
              fontWeight: 500,
              marginBottom: "16px",
              letterSpacing: "1.5px",
            }}
          >
            {isHindi
              ? "ज्योतिष चक्र निर्माणकर्ता"
              : "Jyotish Chakra Nirmankarta"}
          </p>

          <p
            style={{
              fontSize: "1rem",
              color: "#1a1a1a",
              marginBottom: "6px",
              fontWeight: 500,
            }}
          >
            आपके जन्म विवरण के साथ अपना जन्मपत्री चक्र उत्पन्न करें
          </p>

          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontSize: "0.9rem",
              color: "#8b6f47",
              fontStyle: "italic",
            }}
          >
            {isHindi
              ? "सटीक गणना के साथ अपना जन्मपत्री चक्र प्राप्त करें"
              : "Generate your natal horoscope chart with precision"}
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "850px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.98) 100%)",
            border: "2px solid #e8c78e",
            borderRadius: "20px",
            padding: "28px",
            boxShadow:
              "0 8px 32px rgba(26, 58, 82, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            animation: "slideUp 0.8s ease-out 0.1s backwards",
          }}
        >
          {/* Section 1: Birth Details */}
          <div
            style={{
              marginBottom: "28px",
              paddingBottom: "28px",
              borderBottom: "1px dashed #e8c78e",
              animation: "fadeIn 0.8s ease-out backwards",
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
                📅 जन्म विवरण
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  जन्म तिथि{" "}
                  <span style={{ color: "#c41e3a", fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 249, 243, 0.9) 100%)",
                    color: "#1a1a1a",
                    transition: "all 0.3s",
                    boxShadow: "inset 0 1px 3px rgba(26, 58, 82, 0.04)",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  जन्म समय{" "}
                  <span style={{ color: "#c41e3a", fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="time"
                  step="1"
                  value={form.time}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, time: event.target.value }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 249, 243, 0.9) 100%)",
                    color: "#1a1a1a",
                    transition: "all 0.3s",
                    boxShadow: "inset 0 1px 3px rgba(26, 58, 82, 0.04)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Location */}
          <div
            style={{
              marginBottom: "28px",
              paddingBottom: "28px",
              borderBottom: "1px dashed #e8c78e",
              animation: "fadeIn 0.8s ease-out 0.1s backwards",
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
                📍 जन्म स्थान
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  अक्षांश{" "}
                  <span style={{ color: "#c41e3a", fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      latitude: event.target.value,
                    }))
                  }
                  required
                  placeholder="28.6139"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 249, 243, 0.9) 100%)",
                    color: "#1a1a1a",
                    transition: "all 0.3s",
                    boxShadow: "inset 0 1px 3px rgba(26, 58, 82, 0.04)",
                    marginBottom: "6px",
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.75rem",
                    color: "#8b6f47",
                    fontStyle: "italic",
                  }}
                >
                  उत्तर/दक्षिण
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  देशांतर{" "}
                  <span style={{ color: "#c41e3a", fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      longitude: event.target.value,
                    }))
                  }
                  required
                  placeholder="77.2090"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 249, 243, 0.9) 100%)",
                    color: "#1a1a1a",
                    transition: "all 0.3s",
                    boxShadow: "inset 0 1px 3px rgba(26, 58, 82, 0.04)",
                    marginBottom: "6px",
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.75rem",
                    color: "#8b6f47",
                    fontStyle: "italic",
                  }}
                >
                  पूर्व/पश्चिम
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                    display: "flex",
                    gap: "6px",
                  }}
                >
                  समय क्षेत्र{" "}
                  <span style={{ color: "#c41e3a", fontWeight: 700 }}>*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.timezone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      timezone: event.target.value,
                    }))
                  }
                  required
                  placeholder="5.5"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 249, 243, 0.9) 100%)",
                    color: "#1a1a1a",
                    transition: "all 0.3s",
                    boxShadow: "inset 0 1px 3px rgba(26, 58, 82, 0.04)",
                    marginBottom: "6px",
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.75rem",
                    color: "#8b6f47",
                    fontStyle: "italic",
                  }}
                >
                  UTC ऑफसेट
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Advanced Settings */}
          <div
            style={{
              marginBottom: "20px",
              animation: "fadeIn 0.8s ease-out 0.2s backwards",
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
                ⚙️ उन्नत सेटिंग्स
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                  }}
                >
                  अवलोकन बिंदु
                </label>
                <select
                  value={form.observationPoint}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      observationPoint: event.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 249, 243, 0.9) 100%)",
                    color: "#1a1a1a",
                    transition: "all 0.3s",
                    boxShadow: "inset 0 1px 3px rgba(26, 58, 82, 0.04)",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a3a52' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "18px",
                    paddingRight: "36px",
                  }}
                >
                  <option value="topocentric">
                    स्थान विशेष (टोपोसेंट्रिक)
                  </option>
                  <option value="geocentric">भू-केंद्रित (जियोसेंट्रिक)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "#1a3a52",
                    marginBottom: "8px",
                  }}
                >
                  अयनांश
                </label>
                <select
                  value={form.ayanamsha}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      ayanamsha: event.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid #e8c78e",
                    borderRadius: "10px",
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(254, 249, 243, 0.9) 100%)",
                    color: "#1a1a1a",
                    transition: "all 0.3s",
                    boxShadow: "inset 0 1px 3px rgba(26, 58, 82, 0.04)",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a3a52' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    backgroundSize: "18px",
                    paddingRight: "36px",
                  }}
                >
                  <option value="lahiri">लहिड़ी</option>
                  <option value="raman">रमन</option>
                  <option value="krishnamurti">कृष्णमूर्ति</option>
                </select>
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
                  : `linear-gradient(135deg, #1a3a52 0%, #2d5a7b 100%)`,
              border: `2px solid #ff9933`,
              borderRadius: "12px",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              boxShadow:
                buttonHovered && !isLoading
                  ? `0 8px 24px rgba(26, 58, 82, 0.2), 0 4px 0 #ff9933`
                  : `0 4px 12px rgba(212, 175, 55, 0.15), 0 2px 0 #ff9933`,
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
              ✨
            </span>
            <span>
              {isLoading
                ? "चक्र निर्मित हो रहा है..."
                : "जन्मपत्री चक्र उत्पन्न करें"}
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
            maxWidth: "850px",
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
            maxWidth: "850px",
            margin: "20px auto",
            padding: "0 16px",
          }}
        >
          <LoadingSpinner label="आपका जन्मपत्री चक्र तैयार हो रहा है..." />
        </div>
      )}

      {/* Results Section */}
      {(svgChart || planets.length > 0) && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "850px",
            margin: "28px auto",
            padding: "0 16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "2px solid #e8c78e",
              borderRadius: "22px",
              padding: "18px",
              boxShadow: "0 8px 28px rgba(26, 58, 82, 0.14)",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px",
                fontFamily: '"Playfair Display", serif',
                fontSize: "1.8rem",
                color: "#1a3a52",
              }}
            >
              राशिफल चक्र
            </h2>

            <p
              style={{
                margin: "0 0 14px",
                color: "#8b6f47",
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.92rem",
              }}
            >
              आपके संदर्भ के अनुसार राशिफल चक्र को वृत्ताकार शैली में दिखाया गया
              है।
            </p>

            {planets.length > 0 ? (
              <ZodiacWheelChart
                planets={planets}
                ascendantSign={ascendantSign}
                size={760}
              />
            ) : (
              <AstroChartViewer
                title="आपका जन्मपत्री चक्र"
                svgMarkup={svgChart}
                planets={planets}
                ascendantSign={ascendantSign}
                birthDetails={{
                  datetime: `${form.date}T${form.time}`,
                  latitude: Number(form.latitude),
                  longitude: Number(form.longitude),
                }}
                chartMode="api-svg"
                allowAiAnalysis={false}
              />
            )}
          </div>
        </div>
      )}

      {!svgChart && result && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "850px",
            margin: "28px auto",
            padding: "0 16px",
          }}
        >
          <ResultViewer title="ज्योतिष परिणाम" result={result} />
        </div>
      )}
    </div>
  );
}
