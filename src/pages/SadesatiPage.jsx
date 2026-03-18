import { useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { callAstrologyApi } from "../api/astrologyApi";
import { useLanguage } from "../hooks/useLanguage";

function pickText(language, en, hi, mr) {
  if (language === "hi") {
    return hi;
  }

  if (language === "mr" || language === "ma") {
    return mr;
  }

  return en;
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeResponse(payload) {
  if (payload && typeof payload === "object" && payload.data) {
    return payload.data;
  }

  if (payload && typeof payload === "object" && payload.output) {
    return payload.output;
  }

  return payload;
}

function normalizeParagraph(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = String(value || "")
    .trim()
    .toLowerCase();
  if (!text) {
    return null;
  }

  if (
    text.includes("yes") ||
    text.includes("true") ||
    text.includes("currently you are undergoing") ||
    text.includes("हां") ||
    text.includes("हाँ") ||
    text.includes("होय")
  ) {
    return true;
  }

  if (
    text.includes("no") ||
    text.includes("false") ||
    text.includes("not undergoing") ||
    text.includes("नहीं") ||
    text.includes("नाही")
  ) {
    return false;
  }

  return null;
}

function buildRequestParams(form) {
  const [year, month, day] = String(form.date || "")
    .split("-")
    .map((part) => toNumber(part));
  const [hour, min] = String(form.time || "")
    .split(":")
    .map((part) => toNumber(part));

  return {
    day,
    month,
    year,
    hour,
    min,
    lat: toNumber(form.latitude),
    lon: toNumber(form.longitude),
    tzone: toNumber(form.timezone, 5.5),
  };
}

function formatSadesatiResult(payload, language) {
  const normalized = normalizeResponse(payload);

  if (
    !normalized ||
    typeof normalized !== "object" ||
    Array.isArray(normalized)
  ) {
    return null;
  }

  const statusText = normalizeParagraph(normalized.is_undergoing_sadhesati);
  const statusBool = parseBoolean(
    normalized.sadhesati_status !== undefined
      ? normalized.sadhesati_status
      : normalized.is_undergoing_sadhesati,
  );

  return {
    considerationDate:
      String(normalized.consideration_date || "-").trim() || "-",
    moonSign: String(normalized.moon_sign || "-").trim() || "-",
    saturnSign: String(normalized.saturn_sign || "-").trim() || "-",
    saturnRetrograde: parseBoolean(normalized.is_saturn_retrograde),
    statusText,
    statusBool,
    explanation: normalizeParagraph(normalized.what_is_sadhesati),
    details: Object.entries(normalized)
      .filter(
        ([key]) =>
          ![
            "consideration_date",
            "moon_sign",
            "saturn_sign",
            "is_saturn_retrograde",
            "is_undergoing_sadhesati",
            "sadhesati_status",
            "what_is_sadhesati",
          ].includes(key),
      )
      .map(([key, value]) => ({
        key,
        value: normalizeParagraph(value) || String(value),
      })),
    apiLanguageLabel: pickText(language, "English", "हिंदी", "मराठी"),
  };
}

export default function SadesatiPage() {
  const { language } = useLanguage();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "10:30",
    latitude: "19.0760",
    longitude: "72.8777",
    timezone: "5.5",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setIsLoading(true);

    const params = buildRequestParams(form);

    try {
      const response = await callAstrologyApi(
        "sadhesati_current_status",
        params,
        {
          language,
        },
      );

      const parsed = formatSadesatiResult(response?.data || response, language);
      if (!parsed) {
        throw new Error(
          pickText(
            language,
            "Invalid response format from sadhesati_current_status API.",
            "sadhesati_current_status API से सही response format नहीं मिला।",
            "sadhesati_current_status API कडून योग्य response format मिळाला नाही.",
          ),
        );
      }

      setResult(parsed);
    } catch (requestError) {
      setError(
        requestError.message ||
          pickText(
            language,
            "Unable to fetch Sade Sati status.",
            "साढ़ेसाती की स्थिति प्राप्त नहीं हो सकी।",
            "साडेसातीची स्थिती मिळू शकली नाही.",
          ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  const statusBadge = (() => {
    if (!result) {
      return null;
    }

    if (result.statusBool === true) {
      return {
        label: pickText(
          language,
          "Under Sade Sati",
          "साढ़ेसाती चालू है",
          "साडेसाती सुरू आहे",
        ),
        color: "#ffb26b",
      };
    }

    if (result.statusBool === false) {
      return {
        label: pickText(
          language,
          "Not Under Sade Sati",
          "साढ़ेसाती नहीं है",
          "साडेसाती नाही",
        ),
        color: "#8ee6a8",
      };
    }

    return {
      label: pickText(
        language,
        "Status Unclear",
        "स्थिति स्पष्ट नहीं",
        "स्थिती स्पष्ट नाही",
      ),
      color: "#f6dfb3",
    };
  })();

  return (
    <section className="page-shell">
      <SeoMeta
        title={pickText(
          language,
          "Sade Sati Status | Pavitra Jyotish",
          "साढ़ेसाती स्थिति | पवित्र ज्योतिष",
          "साडेसाती स्थिती | पवित्र ज्योतिष",
        )}
        description="Check current Sade Sati status using birth details and transit context."
        path="/remedies/sadesati"
      />

      <div
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(102, 53, 15, 0.26) 0%, rgba(201, 152, 47, 0.14) 100%)",
          borderRadius: "18px",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          padding: "20px",
        }}
      >
        <h1>
          {pickText(
            language,
            "Sade Sati Current Status",
            "साढ़ेसाती वर्तमान स्थिति",
            "साडेसाती वर्तमान स्थिती",
          )}
        </h1>
        <p>
          {pickText(
            language,
            "Check whether you are currently undergoing Sade Sati based on your birth details.",
            "जन्म विवरण के आधार पर देखें कि वर्तमान में साढ़ेसाती चल रही है या नहीं।",
            "जन्म तपशीलावर आधारित सध्या साडेसाती सुरू आहे का ते तपासा.",
          )}
        </p>
      </div>

      <form className="astro-form" onSubmit={handleSubmit}>
        <div className="astro-form-grid">
          <div className="form-group">
            <label htmlFor="s-date">
              {pickText(language, "Birth Date", "जन्म तिथि", "जन्म तारीख")}
            </label>
            <input
              id="s-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="s-time">
              {pickText(language, "Birth Time", "जन्म समय", "जन्म वेळ")}
            </label>
            <input
              id="s-time"
              type="time"
              value={form.time}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, time: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="s-lat">
              {pickText(language, "Latitude", "अक्षांश", "अक्षांश")}
            </label>
            <input
              id="s-lat"
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
            <label htmlFor="s-lon">
              {pickText(language, "Longitude", "देशांतर", "रेखांश")}
            </label>
            <input
              id="s-lon"
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
            <label htmlFor="s-tz">
              {pickText(language, "Timezone", "समय क्षेत्र", "टाईमझोन")}
            </label>
            <input
              id="s-tz"
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
            <label>
              {pickText(language, "API Language", "एपीआई भाषा", "एपीआई भाषा")}
            </label>
            <input
              readOnly
              value={
                result?.apiLanguageLabel ||
                pickText(language, "Auto", "ऑटो", "ऑटो")
              }
            />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading
            ? pickText(
                language,
                "Checking status...",
                "स्थिति जांची जा रही है...",
                "स्थिती तपासली जात आहे...",
              )
            : pickText(
                language,
                "Check Sade Sati",
                "साढ़ेसाती जांचें",
                "साडेसाती तपासा",
              )}
        </button>
      </form>

      <ErrorMessage message={error} />

      {isLoading ? (
        <LoadingSpinner
          label={pickText(
            language,
            "Loading Sade Sati status...",
            "साढ़ेसाती स्थिति लोड हो रही है...",
            "साडेसाती स्थिती लोड होत आहे...",
          )}
        />
      ) : null}

      {result ? (
        <section
          className="result-section"
          style={{
            background:
              "linear-gradient(145deg, rgba(21, 14, 43, 0.94) 0%, rgba(11, 8, 29, 0.96) 100%)",
            borderRadius: "18px",
            border: "1px solid rgba(212, 175, 55, 0.28)",
          }}
        >
          <h2>
            {pickText(
              language,
              "Sade Sati Report",
              "साढ़ेसाती रिपोर्ट",
              "साडेसाती अहवाल",
            )}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div style={cardStyle}>
              <p style={metaStyle}>
                {pickText(
                  language,
                  "Current Status",
                  "वर्तमान स्थिति",
                  "सध्याची स्थिती",
                )}
              </p>
              <h3
                style={{
                  ...valueStyle,
                  color: statusBadge?.color || "#fff1d5",
                }}
              >
                {statusBadge?.label}
              </h3>
            </div>
            <div style={cardStyle}>
              <p style={metaStyle}>
                {pickText(language, "Moon Sign", "चंद्र राशि", "चंद्र रास")}
              </p>
              <h3 style={valueStyle}>{result.moonSign}</h3>
            </div>
            <div style={cardStyle}>
              <p style={metaStyle}>
                {pickText(language, "Saturn Sign", "शनि राशि", "शनीची रास")}
              </p>
              <h3 style={valueStyle}>{result.saturnSign}</h3>
            </div>
            <div style={cardStyle}>
              <p style={metaStyle}>
                {pickText(
                  language,
                  "Consideration Date",
                  "विचार तिथि",
                  "विचार दिनांक",
                )}
              </p>
              <h3 style={valueStyle}>{result.considerationDate}</h3>
            </div>
          </div>

          <div style={{ overflowX: "auto", marginBottom: "14px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "560px",
              }}
            >
              <tbody>
                <tr>
                  <td style={tableKeyStyle}>
                    {pickText(
                      language,
                      "Saturn Retrograde",
                      "शनि वक्री",
                      "शनी वक्री",
                    )}
                  </td>
                  <td style={tableValueStyle}>
                    {result.saturnRetrograde === true
                      ? pickText(language, "Yes", "हाँ", "होय")
                      : result.saturnRetrograde === false
                        ? pickText(language, "No", "नहीं", "नाही")
                        : "-"}
                  </td>
                </tr>
                <tr>
                  <td style={tableKeyStyle}>
                    {pickText(
                      language,
                      "Status Message",
                      "स्थिति संदेश",
                      "स्थिती संदेश",
                    )}
                  </td>
                  <td style={tableValueStyle}>{result.statusText || "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            style={{
              border: "1px solid rgba(212, 175, 55, 0.28)",
              borderRadius: "12px",
              background: "rgba(212, 175, 55, 0.1)",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                marginBottom: "8px",
                color: "#f7e7c7",
                fontFamily: '"Noto Sans Devanagari", sans-serif',
              }}
            >
              {pickText(
                language,
                "What Is Sade Sati?",
                "साढ़ेसाती क्या है?",
                "साडेसाती म्हणजे काय?",
              )}
            </h3>
            <p style={{ margin: 0, color: "#f4e2bd", lineHeight: 1.55 }}>
              {result.explanation || "-"}
            </p>
          </div>

          {result.details.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "520px",
                }}
              >
                <tbody>
                  {result.details.map((item) => (
                    <tr key={item.key}>
                      <td style={tableKeyStyle}>{item.key}</td>
                      <td style={tableValueStyle}>{item.value || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      ) : null}
    </section>
  );
}

const cardStyle = {
  background: "rgba(212, 175, 55, 0.12)",
  border: "1px solid rgba(212, 175, 55, 0.32)",
  borderRadius: "12px",
  padding: "12px",
};

const metaStyle = {
  margin: 0,
  color: "#d8bf91",
  fontSize: "12px",
  fontFamily: '"Noto Sans Devanagari", sans-serif',
};

const valueStyle = {
  margin: "6px 0 0",
  color: "#fff1d5",
  fontSize: "20px",
  fontFamily: '"Noto Sans Devanagari", sans-serif',
};

const tableKeyStyle = {
  width: "34%",
  padding: "10px",
  border: "1px solid rgba(212, 175, 55, 0.22)",
  color: "#d7bf93",
  fontFamily: '"Noto Sans Devanagari", sans-serif',
};

const tableValueStyle = {
  padding: "10px",
  border: "1px solid rgba(212, 175, 55, 0.22)",
  color: "#fff1d5",
  fontFamily: '"Noto Sans Devanagari", sans-serif',
};
