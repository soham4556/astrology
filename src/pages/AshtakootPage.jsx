import { useMemo, useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { getMatchAshtakootPoints } from "../api/astrologyApi";
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

function normalizeAshtakootPayload(payload) {
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
  status,
) {
  const verdict = status
    ? "यह अनुकूल अष्टकूट मिलान माना जा सकता है।"
    : "यह मिलान सावधानी के साथ देखने योग्य है।";

  return `इस मिलान को ${receivedPoints} / ${totalPoints} गुण प्राप्त हुए हैं। न्यूनतम आवश्यक गुण ${minimumRequired} हैं। ${verdict}`;
}

export default function AshtakootPage() {
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

  const summary = useMemo(() => {
    if (!result) {
      return null;
    }

    const totalPoints = toNumber(result.total?.total_points, 36);
    const receivedPoints = toNumber(result.total?.received_points, 0);
    const minimumRequired = toNumber(result.total?.minimum_required, 18);
    const percent = Math.min(
      Math.max((receivedPoints / Math.max(totalPoints, 1)) * 100, 0),
      100,
    );

    return {
      totalPoints,
      receivedPoints,
      minimumRequired,
      percent,
      status: Boolean(result.conclusion?.status),
      report: isHindi
        ? buildHindiConclusion(
            receivedPoints,
            totalPoints,
            minimumRequired,
            Boolean(result.conclusion?.status),
          )
        : result.conclusion?.report || "Detailed conclusion is unavailable.",
    };
  }, [isHindi, result]);

  const kootRows = useMemo(() => {
    if (!result) {
      return [];
    }

    return KOOT_KEYS.map((key) => {
      const item = result[key] || {};
      const label = isHindi ? KOOT_LABELS[key]?.hi : KOOT_LABELS[key]?.en;

      return {
        key,
        label: label || key,
        description: isHindi
          ? KOOT_DESCRIPTIONS_HI[key] || item.description || "-"
          : item.description || "-",
        male: isHindi
          ? toHindiKootValue(item.male_koot_attribute)
          : item.male_koot_attribute || "-",
        female: isHindi
          ? toHindiKootValue(item.female_koot_attribute)
          : item.female_koot_attribute || "-",
        points: toNumber(item.received_points, 0),
        total: toNumber(item.total_points, 0),
      };
    });
  }, [isHindi, result]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setResult(null);

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
      const response = await getMatchAshtakootPoints(params, { language });
      const payload = response?.data || response;
      const normalized = normalizeAshtakootPayload(payload);

      if (!normalized) {
        throw new Error(
          isHindi
            ? "अष्टकूट डेटा का प्रारूप सही नहीं है।"
            : "Invalid ashtakoot response format.",
        );
      }

      setResult(normalized);

      await saveMatchReport({
        userId: user.id,
        partnerOneName: form.partnerOneName,
        partnerTwoName: form.partnerTwoName,
        compatibilityScore: toNumber(normalized.total?.received_points, null),
        query: params,
        result: response,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          (isHindi
            ? "अष्टकूट मिलान रिपोर्ट तैयार नहीं हो सकी।"
            : "Unable to generate ashtakoot matching report."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="ashtakoot-page-container">
      <SeoMeta
        title={isHindi ? "अष्टकूट मिलान" : "Ashtakoot Matching"}
        description="Detailed 36-point Ashtakoot compatibility analysis for two birth details."
        path="/match/ashtakoot"
      />

      <div className="sacred-header">
        <div className="sacred-icon">🤝</div>
        <h1>{isHindi ? "अष्टकूट मिलान" : "Ashtakoot Matching"}</h1>
        <p className="subtitle">
          {isHindi
            ? "36 गुण मिलान का विस्तृत विश्लेषण"
            : "Detailed 36-point compatibility analysis"}
        </p>
      </div>

      <div className="sacred-content">
        <form onSubmit={handleSubmit} className="astro-form-card">
          <div className="form-grid">
            <div className="field">
              <label>{isHindi ? "पहले साथी का नाम" : "Partner One Name"}</label>
              <input
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

            <div className="field">
              <label>
                {isHindi ? "दूसरे साथी का नाम" : "Partner Two Name"}
              </label>
              <input
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

            <div className="field">
              <label>
                {isHindi ? "पहले साथी की तिथि" : "Partner One Date"}
              </label>
              <input
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

            <div className="field">
              <label>{isHindi ? "पहले साथी का समय" : "Partner One Time"}</label>
              <input
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

            <div className="field">
              <label>
                {isHindi ? "दूसरे साथी की तिथि" : "Partner Two Date"}
              </label>
              <input
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

            <div className="field">
              <label>
                {isHindi ? "दूसरे साथी का समय" : "Partner Two Time"}
              </label>
              <input
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

            <div className="field">
              <label>{isHindi ? "अक्षांश" : "Latitude"}</label>
              <input
                type="number"
                step="0.0001"
                value={form.latitude}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, latitude: event.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <label>{isHindi ? "देशांतर" : "Longitude"}</label>
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
              />
            </div>

            <div className="field">
              <label>{isHindi ? "टाइमज़ोन" : "Timezone"}</label>
              <input
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

          <button type="submit" className="sacred-btn" disabled={isLoading}>
            {isLoading
              ? isHindi
                ? "रिपोर्ट तैयार हो रही है..."
                : "Generating report..."
              : isHindi
                ? "अष्टकूट रिपोर्ट प्राप्त करें"
                : "Get Ashtakoot Report"}
          </button>
        </form>

        <section className="results-container">
          <ErrorMessage message={error} />

          {isLoading ? (
            <LoadingSpinner
              label={
                isHindi
                  ? "36 गुण मिलान की गणना हो रही है..."
                  : "Calculating 36-point compatibility..."
              }
            />
          ) : null}

          {result && summary ? (
            <div className="data-view-wrapper">
              <div className="score-card">
                <div className="score-main">
                  <h3>{isHindi ? "कुल गुण" : "Total Score"}</h3>
                  <p>
                    {summary.receivedPoints} / {summary.totalPoints}
                  </p>
                  <span>
                    {isHindi ? "न्यूनतम आवश्यक" : "Minimum Required"}:{" "}
                    {summary.minimumRequired}
                  </span>
                </div>

                <div className="score-progress-wrap">
                  <div className="score-progress">
                    <div
                      className="score-progress-fill"
                      style={{ width: `${summary.percent}%` }}
                    />
                  </div>
                  <small>
                    {summary.status
                      ? isHindi
                        ? "अनुकूल मिलान"
                        : "Favorable match"
                      : isHindi
                        ? "सावधानी आवश्यक"
                        : "Needs caution"}
                  </small>
                </div>
              </div>

              <div className="koot-grid">
                {kootRows.map((item) => (
                  <article key={item.key} className="koot-card">
                    <div className="koot-head">
                      <h4>{item.label}</h4>
                      <span>
                        {item.points}/{item.total}
                      </span>
                    </div>
                    <p>{item.description}</p>
                    <div className="attrs">
                      <div>
                        <strong>{isHindi ? "वर" : "Male"}</strong>
                        <span>{item.male}</span>
                      </div>
                      <div>
                        <strong>{isHindi ? "वधू" : "Female"}</strong>
                        <span>{item.female}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="conclusion-card">
                <h3>{isHindi ? "निष्कर्ष" : "Conclusion"}</h3>
                <p>{summary.report}</p>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <style>{`
        .ashtakoot-page-container {
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

        .subtitle {
          font-family: 'Poppins', sans-serif;
          color: #8b6f47;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-size: 0.9rem;
        }

        .astro-form-card {
          background: white;
          padding: 35px;
          border-radius: 20px;
          border: 1px solid #f3e5ab;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-bottom: 40px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .field label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a3a52;
          font-size: 0.9rem;
        }

        .field input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e8c78e;
          border-radius: 10px;
          font-family: 'Poppins', sans-serif;
        }

        .sacred-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
        }

        .score-card {
          background: #fff;
          border: 1px solid #f3e5ab;
          border-radius: 16px;
          padding: 18px;
          margin-bottom: 16px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          align-items: center;
        }

        .score-main h3 {
          margin: 0;
          color: #3f2b04;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .score-main p {
          margin: 6px 0;
          font-size: 2rem;
          font-weight: 800;
          color: #1e3c72;
        }

        .score-main span {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .score-progress-wrap small {
          display: block;
          margin-top: 8px;
          color: #334155;
          font-weight: 600;
        }

        .score-progress {
          width: 100%;
          height: 12px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }

        .score-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b 0%, #059669 100%);
        }

        .koot-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .koot-card {
          background: #fff;
          border: 1px solid #f1e4bf;
          border-radius: 12px;
          padding: 12px;
        }

        .koot-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .koot-head h4 {
          margin: 0;
          color: #1e3c72;
        }

        .koot-head span {
          font-size: 0.85rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
          background: #e8f3ff;
          color: #1b4f92;
        }

        .koot-card p {
          margin: 0 0 10px;
          color: #4b5563;
          font-size: 0.87rem;
          min-height: 42px;
        }

        .attrs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .attrs div {
          background: #faf7ef;
          border: 1px solid #ecdba9;
          border-radius: 8px;
          padding: 6px;
        }

        .attrs strong {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #86631e;
        }

        .attrs span {
          display: block;
          margin-top: 2px;
          color: #1f2937;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .conclusion-card {
          border: 1px solid #d9ebff;
          background: #f4f9ff;
          border-radius: 12px;
          padding: 12px;
        }

        .conclusion-card h3 {
          margin: 0 0 6px;
          color: #0f3d73;
        }

        .conclusion-card p {
          margin: 0;
          color: #2d3f53;
          line-height: 1.5;
        }

        @media (max-width: 900px) {
          .score-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
