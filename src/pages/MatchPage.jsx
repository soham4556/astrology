import { useMemo, useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { getMatch } from "../api/astrologyApi";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { saveMatchReport } from "../services/reportService";

const KOOT_KEYS = Object.freeze([
  "varna",
  "vashya",
  "tara",
  "yoni",
  "maitri",
  "gan",
  "bhakut",
  "nadi",
]);

const KOOT_LABELS = Object.freeze({
  varna: { hi: "वर्ण", en: "Varna" },
  vashya: { hi: "वश्य", en: "Vashya" },
  tara: { hi: "तारा", en: "Tara" },
  yoni: { hi: "योनि", en: "Yoni" },
  maitri: { hi: "मैत्री", en: "Maitri" },
  gan: { hi: "गण", en: "Gana" },
  bhakut: { hi: "भकूट", en: "Bhakut" },
  nadi: { hi: "नाड़ी", en: "Nadi" },
});

const KOOT_DESCRIPTIONS_HI = Object.freeze({
  varna: "प्राकृतिक स्वभाव और कर्म दृष्टिकोण",
  vashya: "पारस्परिक आकर्षण और संबंध संतुलन",
  tara: "स्वास्थ्य, सौभाग्य और समृद्धि संतुलन",
  yoni: "दाम्पत्य निकटता और शारीरिक अनुकूलता",
  maitri: "मानसिक मित्रता और ग्रह स्वामी सामंजस्य",
  gan: "स्वभाव, व्यवहार और प्रकृति मिलान",
  bhakut: "पारिवारिक-सामाजिक दिशा और भाव संतुलन",
  nadi: "स्वास्थ्य, संतति और ऊर्जा प्रवाह",
});

const KOOT_VALUE_TRANSLATIONS_HI = Object.freeze({
  brahmin: "ब्राह्मण",
  kshatriya: "क्षत्रिय",
  vaishya: "वैश्य",
  shudra: "शूद्र",
  shoodra: "शूद्र",
  maanav: "मानव",
  manav: "मानव",
  manushya: "मनुष्य",
  chatuspad: "चतुष्पद",
  swaan: "श्वान",
  sarp: "सर्प",
  ardra: "आर्द्रा",
  mrigshira: "मृगशीर्ष",
  mercury: "बुध",
  venus: "शुक्र",
  gemini: "मिथुन",
  taurus: "वृषभ",
  adi: "आदि",
  madhya: "मध्य",
  dev: "देव",
  rakshas: "राक्षस",
  rakshasa: "राक्षस",
});

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeMatchPayload(payload) {
  const levelOne =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;
  const levelTwo =
    levelOne?.output && typeof levelOne.output === "object"
      ? levelOne.output
      : levelOne;

  if (!levelTwo || typeof levelTwo !== "object") {
    return null;
  }

  if (!levelTwo.total || typeof levelTwo.total !== "object") {
    return null;
  }

  return levelTwo;
}

function toHindiKootValue(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "-";
  }

  const mapped = KOOT_VALUE_TRANSLATIONS_HI[normalized.toLowerCase()];
  return mapped || normalized;
}

function buildHindiConclusion(
  receivedPoints,
  totalPoints,
  minimumRequired,
  isFavorable,
) {
  const verdict = isFavorable
    ? "यह अनुकूल अष्टकूट मिलान माना जा सकता है।"
    : "यह मिलान सावधानी के साथ देखने योग्य है।";

  return `इस मिलान को ${receivedPoints} / ${totalPoints} गुण प्राप्त हुए हैं। न्यूनतम आवश्यक गुण ${minimumRequired} हैं। ${verdict}`;
}

export default function MatchPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [form, setForm] = useState({
    partnerOneName: "",
    partnerTwoName: "",
    partnerOneDate: "1995-01-15",
    partnerOneTime: "08:30:00",
    partnerTwoDate: "1996-04-22",
    partnerTwoTime: "10:15:00",
    latitude: "28.6139",
    longitude: "77.2090",
    timezone: "5.5",
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const parsedResult = useMemo(() => normalizeMatchPayload(result), [result]);

  const summary = useMemo(() => {
    if (!parsedResult) {
      return null;
    }

    const totalPoints = toNumber(parsedResult.total?.total_points, 36);
    const receivedPoints = toNumber(parsedResult.total?.received_points, 0);
    const minimumRequired = toNumber(parsedResult.total?.minimum_required, 18);
    const percentage = Math.min(
      Math.max((receivedPoints / Math.max(totalPoints, 1)) * 100, 0),
      100,
    );

    return {
      totalPoints,
      receivedPoints,
      minimumRequired,
      percentage,
      isFavorable: Boolean(parsedResult.conclusion?.status),
      report: isHindi
        ? buildHindiConclusion(
            receivedPoints,
            totalPoints,
            minimumRequired,
            Boolean(parsedResult.conclusion?.status),
          )
        : parsedResult.conclusion?.report || "Detailed conclusion unavailable.",
    };
  }, [isHindi, parsedResult]);

  const kootRows = useMemo(() => {
    if (!parsedResult) {
      return [];
    }

    return KOOT_KEYS.map((key) => {
      const row = parsedResult[key] || {};
      const label = isHindi ? KOOT_LABELS[key]?.hi : KOOT_LABELS[key]?.en;
      const points = toNumber(row.received_points, 0);
      const total = toNumber(row.total_points, 0);

      return {
        key,
        label: label || key,
        points,
        total,
        percent: Math.min(
          Math.max((points / Math.max(total, 1)) * 100, 0),
          100,
        ),
        male: isHindi
          ? toHindiKootValue(row.male_koot_attribute)
          : row.male_koot_attribute || "-",
        female: isHindi
          ? toHindiKootValue(row.female_koot_attribute)
          : row.female_koot_attribute || "-",
        description: isHindi
          ? KOOT_DESCRIPTIONS_HI[key] || row.description || "-"
          : row.description || "-",
      };
    });
  }, [isHindi, parsedResult]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const params = {
      partner1_dob: `${form.partnerOneDate}T${form.partnerOneTime}`,
      partner2_dob: `${form.partnerTwoDate}T${form.partnerTwoTime}`,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      timezone: Number(form.timezone),
      partner1_name: form.partnerOneName,
      partner2_name: form.partnerTwoName,
    };

    try {
      const response = await getMatch(params);
      const responsePayload = response.data || response;
      const normalized = normalizeMatchPayload(responsePayload);
      setResult(normalized || responsePayload);

      const score =
        normalized?.total?.received_points ||
        responsePayload?.data?.compatibility_score ||
        responsePayload?.compatibility_score ||
        responsePayload?.score ||
        null;

      await saveMatchReport({
        userId: user.id,
        partnerOneName: form.partnerOneName,
        partnerTwoName: form.partnerTwoName,
        compatibilityScore: score,
        query: params,
        result: response,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          (isHindi
            ? "कुंडली मिलान रिपोर्ट तैयार नहीं हो सकी।"
            : "Unable to generate kundali matching report."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <SeoMeta
        title="Kundali Matching | Pavitra Jyotish"
        description="Check kundali compatibility with astrological matching powered by AstrologyAPI."
        path="/match"
      />

      <div className="page-header">
        <h1>{isHindi ? "कुंडली मिलान" : "Kundali Matching"}</h1>
        <p>
          {isHindi
            ? "दो जन्मकुंडलियों की तुलना करके अनुकूलता रिपोर्ट प्राप्त करें।"
            : "Compare two birth charts and generate a compatibility report."}
        </p>
      </div>

      <form className="astro-form" onSubmit={handleSubmit}>
        <div className="astro-form-grid">
          <div className="form-group">
            <label htmlFor="m-name-1">
              {isHindi ? "पहले साथी का नाम" : "Partner One Name"}
            </label>
            <input
              id="m-name-1"
              type="text"
              value={form.partnerOneName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  partnerOneName: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-name-2">
              {isHindi ? "दूसरे साथी का नाम" : "Partner Two Name"}
            </label>
            <input
              id="m-name-2"
              type="text"
              value={form.partnerTwoName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  partnerTwoName: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-date-1">
              {isHindi ? "पहले साथी की जन्म तिथि" : "Partner One Date"}
            </label>
            <input
              id="m-date-1"
              type="date"
              value={form.partnerOneDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  partnerOneDate: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-time-1">
              {isHindi ? "पहले साथी का जन्म समय" : "Partner One Time"}
            </label>
            <input
              id="m-time-1"
              type="time"
              step="1"
              value={form.partnerOneTime}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  partnerOneTime: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-date-2">
              {isHindi ? "दूसरे साथी की जन्म तिथि" : "Partner Two Date"}
            </label>
            <input
              id="m-date-2"
              type="date"
              value={form.partnerTwoDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  partnerTwoDate: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-time-2">
              {isHindi ? "दूसरे साथी का जन्म समय" : "Partner Two Time"}
            </label>
            <input
              id="m-time-2"
              type="time"
              step="1"
              value={form.partnerTwoTime}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  partnerTwoTime: event.target.value,
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="m-lat">{isHindi ? "अक्षांश" : "Latitude"}</label>
            <input
              id="m-lat"
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
            <label htmlFor="m-lon">{isHindi ? "देशांतर" : "Longitude"}</label>
            <input
              id="m-lon"
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
            <label htmlFor="m-timezone">
              {isHindi ? "समय क्षेत्र (UTC ऑफसेट)" : "Timezone Offset"}
            </label>
            <input
              id="m-timezone"
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
              ? "मिलान किया जा रहा है..."
              : "Matching..."
            : isHindi
              ? "मिलान रिपोर्ट बनाएं"
              : "Generate Match Report"}
        </button>
      </form>

      <ErrorMessage message={error} />
      {isLoading ? (
        <LoadingSpinner
          label={
            isHindi
              ? "मिलान रिपोर्ट तैयार हो रही है..."
              : "Generating match report..."
          }
        />
      ) : null}

      {summary ? (
        <section className="match-result-section">
          <h2>{isHindi ? "कुंडली मिलान परिणाम" : "Kundali Match Result"}</h2>

          <div className="match-score-card">
            <div className="score-numbers">
              <p className="score-main">
                {summary.receivedPoints} / {summary.totalPoints}
              </p>
              <p className="score-sub">
                {isHindi ? "न्यूनतम आवश्यक" : "Minimum Required"}:{" "}
                {summary.minimumRequired}
              </p>
              <p
                className={`score-badge ${summary.isFavorable ? "good" : "warn"}`}
              >
                {summary.isFavorable
                  ? isHindi
                    ? "अनुकूल मिलान"
                    : "Favorable Match"
                  : isHindi
                    ? "सावधानी आवश्यक"
                    : "Needs Caution"}
              </p>
            </div>

            <div className="score-progress-wrap">
              <div className="score-progress-track">
                <div
                  className="score-progress-fill"
                  style={{ width: `${summary.percentage}%` }}
                />
              </div>
              <small>{summary.percentage.toFixed(1)}%</small>
            </div>
          </div>

          <div className="koot-chart-card">
            <h3>{isHindi ? "गुण चार्ट" : "Koot Score Chart"}</h3>
            <div className="koot-chart-list">
              {kootRows.map((row) => (
                <div key={row.key} className="koot-chart-row">
                  <span className="chart-label">{row.label}</span>
                  <div className="chart-track">
                    <div
                      className="chart-fill"
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <span className="chart-value">
                    {row.points}/{row.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="koot-table-wrap">
            <table className="koot-table">
              <thead>
                <tr>
                  <th>{isHindi ? "कूट" : "Koot"}</th>
                  <th>{isHindi ? "वर" : "Male"}</th>
                  <th>{isHindi ? "वधू" : "Female"}</th>
                  <th>{isHindi ? "अंक" : "Points"}</th>
                  <th>{isHindi ? "विवरण" : "Description"}</th>
                </tr>
              </thead>
              <tbody>
                {kootRows.map((row) => (
                  <tr key={`table-${row.key}`}>
                    <td>{row.label}</td>
                    <td>{row.male}</td>
                    <td>{row.female}</td>
                    <td>
                      {row.points}/{row.total}
                    </td>
                    <td>{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="conclusion-box">
            <h3>{isHindi ? "निष्कर्ष" : "Conclusion"}</h3>
            <p>{summary.report}</p>
          </div>
        </section>
      ) : result ? (
        <section className="match-result-section">
          <h2>{isHindi ? "कुंडली मिलान परिणाम" : "Kundali Match Result"}</h2>
          <p className="fallback-msg">
            {isHindi
              ? "रिपोर्ट डेटा संरचित रूप में उपलब्ध नहीं है।"
              : "Structured report format is unavailable for this response."}
          </p>
        </section>
      ) : null}

      <style>{`
        .match-result-section {
          margin-top: 24px;
          background: #fff;
          border: 1px solid #111;
          border-radius: 16px;
          padding: 18px;
          color: #000;
        }

        .match-result-section h2 {
          margin: 0 0 14px;
          color: #000;
          font-size: 1.4rem;
        }

        .match-score-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          border: 1px solid #111;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 14px;
          background: #fff;
        }

        .score-main {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          color: #000;
          line-height: 1;
        }

        .score-sub {
          margin: 6px 0;
          color: #000;
          font-size: 0.9rem;
        }

        .score-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          margin: 0;
        }

        .score-badge.good {
          background: #e9e9e9;
          color: #000;
        }

        .score-badge.warn {
          background: #e9e9e9;
          color: #000;
        }

        .score-progress-wrap {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
        }

        .score-progress-track {
          height: 12px;
          border-radius: 999px;
          background: #d1d5db;
          overflow: hidden;
        }

        .score-progress-fill {
          height: 100%;
          background: #111;
        }

        .koot-chart-card {
          border: 1px solid #111;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 14px;
          background: #fff;
        }

        .koot-chart-card h3 {
          margin: 0 0 10px;
          font-size: 1rem;
          color: #000;
        }

        .koot-chart-list {
          display: grid;
          gap: 8px;
        }

        .koot-chart-row {
          display: grid;
          grid-template-columns: 88px 1fr 58px;
          gap: 8px;
          align-items: center;
          font-size: 0.86rem;
        }

        .chart-label {
          color: #000;
          font-weight: 600;
        }

        .chart-track {
          height: 10px;
          background: #d1d5db;
          border-radius: 999px;
          overflow: hidden;
        }

        .chart-fill {
          height: 100%;
          background: #111;
        }

        .chart-value {
          text-align: right;
          color: #000;
          font-weight: 700;
        }

        .koot-table-wrap {
          overflow-x: auto;
          margin-bottom: 14px;
        }

        .koot-table {
          width: 100%;
          min-width: 760px;
          border-collapse: collapse;
          font-size: 0.88rem;
        }

        .koot-table th,
        .koot-table td {
          border: 1px solid #111;
          padding: 9px;
          text-align: left;
          color: #000;
          background: #fff;
        }

        .koot-table th {
          background: #efefef;
          color: #000;
          font-weight: 700;
        }

        .koot-table td:nth-child(4) {
          font-weight: 700;
          color: #000;
        }

        .conclusion-box {
          border: 1px solid #111;
          background: #fff;
          border-radius: 10px;
          padding: 10px;
        }

        .conclusion-box h3 {
          margin: 0 0 6px;
          font-size: 1rem;
          color: #000;
        }

        .conclusion-box p {
          margin: 0;
          line-height: 1.45;
          color: #000;
        }

        .fallback-msg {
          margin: 0;
          color: #000;
        }

        @media (max-width: 780px) {
          .match-score-card {
            grid-template-columns: 1fr;
          }

          .koot-chart-row {
            grid-template-columns: 70px 1fr 52px;
          }
        }
      `}</style>
    </section>
  );
}
