import { useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { callAstrologyApi } from "../api/astrologyApi";
import { useLanguage } from "../hooks/useLanguage";

const NUMEROLOGY_FIELD_LABELS = Object.freeze({
  name: "नाम",
  date: "जन्म तिथि",
  destiny_number: "भाग्यांक (Destiny Number)",
  radical_number: "मूलांक (Radical Number)",
  name_number: "नामांक (Name Number)",
  evil_num: "अशुभ अंक",
  fav_color: "शुभ रंग",
  fav_day: "शुभ दिन",
  fav_god: "आराध्य देव",
  fav_mantra: "शुभ मंत्र",
  fav_metal: "शुभ धातु",
  fav_stone: "शुभ रत्न",
  fav_substone: "उपरत्न",
  friendly_num: "मित्र अंक",
  neutral_num: "तटस्थ अंक",
  radical_num: "मूलांक",
  radical_ruler: "मूलांक स्वामी",
});

const FIELD_ORDER = [
  "name",
  "date",
  "destiny_number",
  "radical_number",
  "name_number",
  "radical_num",
  "radical_ruler",
  "friendly_num",
  "neutral_num",
  "evil_num",
  "fav_color",
  "fav_day",
  "fav_god",
  "fav_mantra",
  "fav_metal",
  "fav_stone",
  "fav_substone",
];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value).trim() || "-";
}

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) {
    return { first_name: "", middle_name: "", last_name: "" };
  }

  if (parts.length === 1) {
    return { first_name: parts[0], middle_name: "", last_name: "" };
  }

  if (parts.length === 2) {
    return { first_name: parts[0], middle_name: "", last_name: parts[1] };
  }

  return {
    first_name: parts[0],
    middle_name: parts.slice(1, -1).join(" "),
    last_name: parts[parts.length - 1],
  };
}

function normalizeNumerologyResponse(payload) {
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

  const ordered = FIELD_ORDER.filter((key) => key in result).map((key) => [
    key,
    result[key],
  ]);
  const remainder = Object.entries(result).filter(
    ([key]) => !FIELD_ORDER.includes(key),
  );
  return [...ordered, ...remainder];
}

export default function NumerologyPage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    date: new Date().toISOString().split("T")[0],
    time: "07:45",
    latitude: "19.132",
    longitude: "72.342",
    timezone: "5.5",
  });
  const [tableResult, setTableResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setTableResult(null);

    const [year, month, day] = String(form.date)
      .split("-")
      .map((part) => toNumber(part));
    const [hour, min] = String(form.time)
      .split(":")
      .map((part) => toNumber(part));
    const split = splitName(form.fullName);

    const params = {
      day,
      month,
      year,
      hour,
      min,
      lat: toNumber(form.latitude),
      lon: toNumber(form.longitude),
      tzone: toNumber(form.timezone, 5.5),
      name: form.fullName.trim(),
      full_name: form.fullName.trim(),
      first_name: split.first_name,
      middle_name: split.middle_name,
      last_name: split.last_name,
    };

    try {
      const response = await callAstrologyApi("numero_table", params, {
        language,
      });
      const payload = response?.data || response;
      const normalized = normalizeNumerologyResponse(payload);

      if (!normalized) {
        throw new Error("Numerology table response format is invalid.");
      }

      setTableResult(normalized);
    } catch (requestError) {
      setError(requestError.message || "अंकशास्त्र डेटा प्राप्त नहीं हो सका।");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <SeoMeta
        title="Numerology Table | jyotish web"
        description="Generate a complete numerology table using AstrologyAPI with lucky numbers, colors, mantra, and remedies."
        path="/numerology"
      />

      <div
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(137, 38, 23, 0.2) 0%, rgba(212, 175, 55, 0.12) 100%)",
          borderRadius: "18px",
          border: "1px solid rgba(212, 175, 55, 0.22)",
          padding: "20px",
        }}
      >
        <h1>अंकशास्त्र तालिका</h1>
        <p>
          नाम, जन्म-विवरण और स्थान के आधार पर पूरी अंकशास्त्र तालिका प्राप्त
          करें।
        </p>
      </div>

      <form className="astro-form" onSubmit={handleSubmit}>
        <div className="astro-form-grid">
          <div className="form-group">
            <label htmlFor="n-full-name">पूरा नाम</label>
            <input
              id="n-full-name"
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              placeholder="उदा. राहुल कुमार"
              required
            />
          </div>

          <div className="form-group">
            <label>भाषा</label>
            <input value={language === "hi" ? "हिंदी" : language} readOnly />
          </div>

          <div className="form-group">
            <label htmlFor="n-date">जन्म तिथि</label>
            <input
              id="n-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="n-time">जन्म समय</label>
            <input
              id="n-time"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="n-lat">अक्षांश (lat)</label>
            <input
              id="n-lat"
              type="number"
              step="0.0001"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="n-lon">देशांतर (lon)</label>
            <input
              id="n-lon"
              type="number"
              step="0.0001"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="n-tzone">समय क्षेत्र (tzone)</label>
            <input
              id="n-tzone"
              type="number"
              step="0.1"
              value={form.timezone}
              onChange={(e) => setForm({ ...form, timezone: e.target.value })}
              required
            />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? "तालिका तैयार हो रही है..." : "अंकशास्त्र तालिका बनाएं"}
        </button>
      </form>

      <ErrorMessage message={error} />

      {isLoading ? (
        <LoadingSpinner label="अंकशास्त्र तालिका प्राप्त की जा रही है..." />
      ) : null}

      {tableResult ? (
        <section
          className="result-section"
          style={{
            background:
              "linear-gradient(145deg, rgba(19, 13, 41, 0.92) 0%, rgba(12, 9, 28, 0.95) 100%)",
            border: "1px solid rgba(212, 175, 55, 0.26)",
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                background: "rgba(212, 175, 55, 0.14)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <p style={{ margin: 0, color: "#d9c39a", fontSize: "12px" }}>
                भाग्यांक
              </p>
              <h3
                style={{
                  margin: "6px 0 0",
                  color: "#f6e9cb",
                  fontSize: "22px",
                }}
              >
                {formatValue(tableResult.destiny_number)}
              </h3>
            </div>

            <div
              style={{
                background: "rgba(212, 175, 55, 0.14)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <p style={{ margin: 0, color: "#d9c39a", fontSize: "12px" }}>
                मूलांक
              </p>
              <h3
                style={{
                  margin: "6px 0 0",
                  color: "#f6e9cb",
                  fontSize: "22px",
                }}
              >
                {formatValue(
                  tableResult.radical_number || tableResult.radical_num,
                )}
              </h3>
            </div>

            <div
              style={{
                background: "rgba(212, 175, 55, 0.14)",
                border: "1px solid rgba(212, 175, 55, 0.35)",
                borderRadius: "12px",
                padding: "12px",
              }}
            >
              <p style={{ margin: 0, color: "#d9c39a", fontSize: "12px" }}>
                नामांक
              </p>
              <h3
                style={{
                  margin: "6px 0 0",
                  color: "#f6e9cb",
                  fontSize: "22px",
                }}
              >
                {formatValue(tableResult.name_number)}
              </h3>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "560px",
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
                {getOrderedEntries(tableResult).map(([key, value]) => (
                  <tr key={key}>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid rgba(212, 175, 55, 0.16)",
                        color: "#ecdab2",
                        width: "34%",
                        fontFamily: '"Noto Sans Devanagari", sans-serif',
                        fontSize: "13px",
                      }}
                    >
                      {NUMEROLOGY_FIELD_LABELS[key] || key}
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid rgba(212, 175, 55, 0.16)",
                        color: "#fff7e5",
                        fontFamily: '"Noto Sans Devanagari", sans-serif',
                        fontSize: "14px",
                      }}
                    >
                      {formatValue(value)}
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
