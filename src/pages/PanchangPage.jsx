import { useMemo, useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { callAstrologyApi } from "../api/astrologyApi";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { savePanchangReport } from "../services/reportService";

const PANCHANG_FIELD_LABELS = Object.freeze({
  day: "वार",
  tithi: "तिथि",
  nakshatra: "नक्षत्र",
  yog: "योग",
  karan: "करण",
  sunrise: "सूर्योदय",
  sunset: "सूर्यास्त",
  vedic_sunrise: "वैदिक सूर्योदय",
  vedic_sunset: "वैदिक सूर्यास्त",
});

const DISPLAY_ORDER = [
  "day",
  "tithi",
  "nakshatra",
  "yog",
  "karan",
  "sunrise",
  "sunset",
  "vedic_sunrise",
  "vedic_sunset",
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function displayValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value).trim() || "-";
}

function normalizePanchangResponse(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    payload.output &&
    typeof payload.output === "object" &&
    !Array.isArray(payload.output)
  ) {
    return payload.output;
  }

  return null;
}

function getOrderedEntries(result) {
  if (!result || typeof result !== "object") {
    return [];
  }

  const ordered = DISPLAY_ORDER.filter((key) => key in result).map((key) => [
    key,
    result[key],
  ]);
  const rest = Object.entries(result).filter(
    ([key]) => !DISPLAY_ORDER.includes(key),
  );
  return [...ordered, ...rest];
}

export default function PanchangPage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "07:45",
    latitude: "19.132",
    longitude: "72.342",
    timezone: "5.5",
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const highlightCards = useMemo(
    () =>
      result
        ? [
            { key: "day", label: "वार", value: result.day },
            { key: "tithi", label: "तिथि", value: result.tithi },
            { key: "nakshatra", label: "नक्षत्र", value: result.nakshatra },
            { key: "yog", label: "योग", value: result.yog },
            { key: "karan", label: "करण", value: result.karan },
          ]
        : [],
    [result],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setResult(null);

    const [year, month, day] = String(form.date)
      .split("-")
      .map((part) => toNumber(part));
    const [hour, min] = String(form.time)
      .split(":")
      .map((part) => toNumber(part));

    const params = {
      day,
      month,
      year,
      hour,
      min,
      lat: toNumber(form.latitude),
      lon: toNumber(form.longitude),
      tzone: toNumber(form.timezone, 5.5),
    };

    try {
      const response = await callAstrologyApi("basic_panchang", params, {
        language,
      });

      const payload = response?.data || response;
      const normalized = normalizePanchangResponse(payload);

      if (!normalized) {
        throw new Error("Panchang response format invalid.");
      }

      setResult(normalized);

      await savePanchangReport({
        userId: user.id,
        panchangDate: form.date,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        timezone: Number(form.timezone),
        query: params,
        result: response,
      });
    } catch (requestError) {
      setError(requestError.message || "इस समय पंचांग प्राप्त नहीं हो सका।");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <SeoMeta
        title="Basic Panchang | jyotish web"
        description="Generate accurate basic panchang details with day, tithi, nakshatra, yog, karan, sunrise and sunset."
        path="/panchang"
      />

      <div
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(173, 101, 21, 0.18) 0%, rgba(212, 175, 55, 0.09) 100%)",
          border: "1px solid rgba(212, 175, 55, 0.28)",
          borderRadius: "18px",
          padding: "20px",
        }}
      >
        <h1>पंचांग</h1>
        <p>
          तिथि, नक्षत्र, योग, करण, सूर्योदय और सूर्यास्त की जानकारी तुरंत
          प्राप्त करें।
        </p>
      </div>

      <form className="astro-form" onSubmit={handleSubmit}>
        <div className="astro-form-grid">
          <div className="form-group">
            <label htmlFor="p-date">तिथि</label>
            <input
              id="p-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="p-time">समय</label>
            <input
              id="p-time"
              type="time"
              value={form.time}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, time: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="p-lat">अक्षांश (lat)</label>
            <input
              id="p-lat"
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
            <label htmlFor="p-lon">देशांतर (lon)</label>
            <input
              id="p-lon"
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
            <label htmlFor="p-tzone">समय क्षेत्र (tzone)</label>
            <input
              id="p-tzone"
              type="number"
              step="0.1"
              value={form.timezone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, timezone: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label>भाषा</label>
            <input value={language === "hi" ? "हिंदी" : language} readOnly />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? "पंचांग तैयार हो रहा है..." : "पंचांग बनाएं"}
        </button>
      </form>

      <ErrorMessage message={error} />

      {isLoading ? (
        <LoadingSpinner label="पंचांग विवरण लोड हो रहा है..." />
      ) : null}

      {result ? (
        <section
          className="result-section"
          style={{
            background:
              "linear-gradient(145deg, rgba(16, 10, 36, 0.95) 0%, rgba(11, 7, 26, 0.96) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.25)",
            borderRadius: "18px",
          }}
        >
          <h2>पंचांग विवरण</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {highlightCards.map((card) => (
              <div
                key={card.key}
                style={{
                  border: "1px solid rgba(212, 175, 55, 0.32)",
                  background: "rgba(212, 175, 55, 0.13)",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#dec898",
                    fontSize: "12px",
                    fontFamily: '"Noto Sans Devanagari", sans-serif',
                  }}
                >
                  {card.label}
                </p>
                <h3
                  style={{
                    margin: "6px 0 0",
                    color: "#fff3d9",
                    fontSize: "20px",
                    fontFamily: '"Noto Sans Devanagari", sans-serif',
                  }}
                >
                  {displayValue(card.value)}
                </h3>
              </div>
            ))}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "560px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      borderBottom: "1px solid rgba(212, 175, 55, 0.35)",
                      color: "#f0dcae",
                      fontFamily: '"Noto Sans Devanagari", sans-serif',
                    }}
                  >
                    श्रेणी
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                      borderBottom: "1px solid rgba(212, 175, 55, 0.35)",
                      color: "#f0dcae",
                      fontFamily: '"Noto Sans Devanagari", sans-serif',
                    }}
                  >
                    मान
                  </th>
                </tr>
              </thead>
              <tbody>
                {getOrderedEntries(result).map(([key, value]) => (
                  <tr key={key}>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid rgba(212, 175, 55, 0.16)",
                        color: "#ecdab2",
                        width: "34%",
                        fontFamily: '"Noto Sans Devanagari", sans-serif',
                      }}
                    >
                      {PANCHANG_FIELD_LABELS[key] || key}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid rgba(212, 175, 55, 0.16)",
                        color: "#fff7e5",
                        fontFamily: '"Noto Sans Devanagari", sans-serif',
                      }}
                    >
                      {displayValue(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </section>
  );
}
