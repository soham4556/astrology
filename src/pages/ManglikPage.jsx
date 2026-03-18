import { useMemo, useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { getPlanets } from "../api/astrologyApi";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../hooks/useLanguage";
import { saveMatchReport } from "../services/reportService";

const MANGLIK_HOUSES = Object.freeze([1, 2, 4, 7, 8, 12]);
const SEVERE_HOUSES = Object.freeze([1, 7, 8, 12]);

const SIGN_TO_HINDI = Object.freeze({
  aries: "मेष",
  taurus: "वृषभ",
  gemini: "मिथुन",
  cancer: "कर्क",
  leo: "सिंह",
  virgo: "कन्या",
  libra: "तुला",
  scorpio: "वृश्चिक",
  sagittarius: "धनु",
  capricorn: "मकर",
  aquarius: "कुंभ",
  pisces: "मीन",
});

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDegree(value, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizePlanetRows(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.output)) {
    return payload.output;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function findMarsPlanet(rows) {
  return rows.find((item) => {
    const key = String(item?.name || item?.planet || item?.planet_name || "")
      .trim()
      .toLowerCase();
    return key === "mars" || key === "mangal" || key === "मंगल";
  });
}

function formatSign(signText, isHindi) {
  const raw = String(signText || "-").trim();
  if (!isHindi) {
    return raw;
  }

  const mapped = SIGN_TO_HINDI[raw.toLowerCase()];
  return mapped || raw;
}

function getManglikProfile(payload, partnerName) {
  const rows = normalizePlanetRows(payload);
  const mars = findMarsPlanet(rows);

  if (!mars) {
    return {
      partnerName,
      isAvailable: false,
      isManglik: false,
      severity: "unknown",
      house: null,
      sign: "-",
      degree: null,
      isRetrograde: false,
      explanation: "Mars data unavailable",
    };
  }

  const house = toNumber(
    mars.house,
    toNumber(mars.house_no, toNumber(mars.bhava, null)),
  );
  const roundedHouse = Number.isFinite(house) ? Math.round(house) : null;
  const sign = mars.sign || mars.sign_name || mars.zodiac || "-";
  const degree = toDegree(
    mars.normDegree,
    toDegree(mars.degree, toDegree(mars.fullDegree, null)),
  );
  const isRetrograde =
    mars.is_retro === true ||
    mars.isRetro === true ||
    String(mars.is_retro || "")
      .trim()
      .toLowerCase() === "true" ||
    String(mars.is_retro || "").trim() === "1";

  const isManglik =
    Number.isInteger(roundedHouse) && MANGLIK_HOUSES.includes(roundedHouse);
  const severity = !isManglik
    ? "none"
    : SEVERE_HOUSES.includes(roundedHouse)
      ? "high"
      : "moderate";

  const explanation = !isManglik
    ? "Mars is not in classical Manglik houses (1,2,4,7,8,12)."
    : `Mars is placed in house ${roundedHouse}, which is treated as Manglik in classical matching.`;

  return {
    partnerName,
    isAvailable: true,
    isManglik,
    severity,
    house: roundedHouse,
    sign,
    degree,
    isRetrograde,
    explanation,
  };
}

function evaluatePair(profileOne, profileTwo, isHindi) {
  if (!profileOne.isAvailable || !profileTwo.isAvailable) {
    return {
      score: 40,
      status: isHindi ? "डेटा अधूरा" : "Incomplete Data",
      recommendation: isHindi
        ? "मंगल स्थिति पूर्ण नहीं मिली, कृपया विवरण दोबारा जांचें।"
        : "Unable to read complete Mars positions. Please verify birth details.",
      level: "caution",
    };
  }

  if (profileOne.isManglik && profileTwo.isManglik) {
    return {
      score: 82,
      status: isHindi ? "दोनों मांगलिक" : "Both Manglik",
      recommendation: isHindi
        ? "दोनों की मंगल स्थिति समान प्रकार की होने से मेल तुलनात्मक रूप से संतुलित माना जा सकता है।"
        : "Both charts are Manglik, which generally balances this factor in matching.",
      level: "good",
    };
  }

  if (profileOne.isManglik || profileTwo.isManglik) {
    return {
      score: 52,
      status: isHindi ? "आंशिक मांगलिक अंतर" : "Manglik Mismatch",
      recommendation: isHindi
        ? "एक पक्ष मांगलिक है और दूसरा नहीं, इसलिए विस्तृत गुण मिलान व ज्योतिष परामर्श लेना बेहतर रहेगा।"
        : "One partner is Manglik and the other is not. Detailed matching and remedies are advised.",
      level: "warning",
    };
  }

  return {
    score: 88,
    status: isHindi ? "मांगलिक दोष नहीं" : "Non-Manglik Pair",
    recommendation: isHindi
      ? "दोनों कुंडलियों में शास्त्रीय मांगलिक स्थिति नहीं दिख रही है।"
      : "Neither chart indicates classical Manglik placement.",
    level: "good",
  };
}

function severityLabel(severity, isHindi) {
  if (severity === "high") return isHindi ? "उच्च" : "High";
  if (severity === "moderate") return isHindi ? "मध्यम" : "Moderate";
  if (severity === "none") return isHindi ? "नहीं" : "None";
  return isHindi ? "अज्ञात" : "Unknown";
}

export default function ManglikPage() {
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

  const levelClass = useMemo(() => {
    const level = result?.evaluation?.level;
    if (level === "good") return "level-good";
    if (level === "warning") return "level-warning";
    return "level-caution";
  }, [result]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    setResult(null);

    const createParams = (dateText, timeText) => {
      const [year, month, day] = String(dateText).split("-").map(Number);
      const [hour, min] = String(timeText).split(":").map(Number);

      return {
        day,
        month,
        year,
        hour,
        min,
        lat: Number(form.latitude),
        lon: Number(form.longitude),
        tzone: Number(form.timezone),
      };
    };

    const paramsOne = createParams(form.partnerOneDate, form.partnerOneTime);
    const paramsTwo = createParams(form.partnerTwoDate, form.partnerTwoTime);

    try {
      const [partnerOneResponse, partnerTwoResponse] = await Promise.all([
        getPlanets(paramsOne, { language: "en" }),
        getPlanets(paramsTwo, { language: "en" }),
      ]);

      const payloadOne = partnerOneResponse?.data || partnerOneResponse;
      const payloadTwo = partnerTwoResponse?.data || partnerTwoResponse;

      const profileOne = getManglikProfile(
        payloadOne,
        form.partnerOneName || "Partner One",
      );
      const profileTwo = getManglikProfile(
        payloadTwo,
        form.partnerTwoName || "Partner Two",
      );
      const evaluation = evaluatePair(profileOne, profileTwo, isHindi);

      const computed = {
        partnerOne: profileOne,
        partnerTwo: profileTwo,
        evaluation,
      };

      setResult(computed);

      await saveMatchReport({
        userId: user.id,
        partnerOneName: form.partnerOneName,
        partnerTwoName: form.partnerTwoName,
        compatibilityScore: evaluation.score,
        query: {
          partnerOne: paramsOne,
          partnerTwo: paramsTwo,
          model: "classical-manglik-house-rule",
        },
        result: computed,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          (isHindi
            ? "मांगलिक रिपोर्ट तैयार नहीं हो सकी।"
            : "Unable to generate manglik report."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="manglik-page-container">
      <SeoMeta
        title={isHindi ? "मांगलिक रिपोर्ट" : "Manglik Report"}
        description="Check classical Manglik placement for both partners using Mars house positions."
        path="/match/manglik"
      />

      <div className="sacred-header">
        <div className="sacred-icon">🔥</div>
        <h1>{isHindi ? "मांगलिक रिपोर्ट" : "Manglik Report"}</h1>
        <p className="subtitle">
          {isHindi
            ? "मंगल की भाव स्थिति आधारित मिलान"
            : "Mars house based compatibility assessment"}
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
                ? "मांगलिक रिपोर्ट प्राप्त करें"
                : "Get Manglik Report"}
          </button>
        </form>

        <section className="results-container">
          <ErrorMessage message={error} />

          {isLoading ? (
            <LoadingSpinner
              label={
                isHindi
                  ? "दोनों कुंडलियों में मंगल स्थिति जांची जा रही है..."
                  : "Checking Mars placement in both charts..."
              }
            />
          ) : null}

          {result ? (
            <div className="data-view-wrapper">
              <div className={`overall-card ${levelClass}`}>
                <div>
                  <h3>{result.evaluation.status}</h3>
                  <p>{result.evaluation.recommendation}</p>
                </div>
                <div className="score-chip">{result.evaluation.score}/100</div>
              </div>

              <div className="partner-grid">
                {[result.partnerOne, result.partnerTwo].map(
                  (profile, index) => (
                    <article
                      key={`${profile.partnerName}-${index}`}
                      className="partner-card"
                    >
                      <h4>{profile.partnerName}</h4>
                      <div className="badge-row">
                        <span
                          className={
                            profile.isManglik ? "tag tag-red" : "tag tag-green"
                          }
                        >
                          {profile.isManglik
                            ? isHindi
                              ? "मांगलिक"
                              : "Manglik"
                            : isHindi
                              ? "गैर-मांगलिक"
                              : "Non-Manglik"}
                        </span>
                        <span className="tag tag-soft">
                          {isHindi ? "तीव्रता" : "Severity"}:{" "}
                          {severityLabel(profile.severity, isHindi)}
                        </span>
                      </div>

                      <div className="details-grid">
                        <div>
                          <strong>{isHindi ? "भाव" : "House"}</strong>
                          <span>{profile.house || "-"}</span>
                        </div>
                        <div>
                          <strong>{isHindi ? "राशि" : "Sign"}</strong>
                          <span>{formatSign(profile.sign, isHindi)}</span>
                        </div>
                        <div>
                          <strong>{isHindi ? "अंश" : "Degree"}</strong>
                          <span>
                            {Number.isFinite(profile.degree)
                              ? `${profile.degree.toFixed(2)}°`
                              : "-"}
                          </span>
                        </div>
                        <div>
                          <strong>{isHindi ? "स्थिति" : "Motion"}</strong>
                          <span>
                            {profile.isRetrograde
                              ? isHindi
                                ? "वक्री"
                                : "Retrograde"
                              : isHindi
                                ? "मार्गी"
                                : "Direct"}
                          </span>
                        </div>
                      </div>

                      <p className="explanation">
                        {isHindi
                          ? profile.explanation
                              .replace("Mars", "मंगल")
                              .replace("classical", "शास्त्रीय")
                              .replace("house", "भाव")
                              .replace(
                                "is treated as Manglik",
                                "को मांगलिक माना जाता है",
                              )
                          : profile.explanation}
                      </p>
                    </article>
                  ),
                )}
              </div>

              <div className="note-box">
                <p>
                  {isHindi
                    ? "नोट: यह रिपोर्ट पारंपरिक मांगलिक भाव नियम (1,2,4,7,8,12) पर आधारित एक प्रैक्टिकल स्क्रीनिंग है। अंतिम निर्णय के लिए विस्तृत कुंडली विश्लेषण करें।"
                    : "Note: This report uses a practical classical Manglik screening rule (Mars in houses 1,2,4,7,8,12). Use full chart analysis for final decision."}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <style>{`
        .manglik-page-container {
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

        .overall-card {
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 16px;
          border: 1px solid;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
        }

        .overall-card h3 {
          margin: 0 0 4px;
          font-size: 1.2rem;
        }

        .overall-card p {
          margin: 0;
          line-height: 1.45;
        }

        .level-good {
          background: #ecfdf5;
          border-color: #86efac;
          color: #14532d;
        }

        .level-warning {
          background: #fff7ed;
          border-color: #fdba74;
          color: #7c2d12;
        }

        .level-caution {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #334155;
        }

        .score-chip {
          min-width: 92px;
          text-align: center;
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 1rem;
          font-weight: 800;
          background: rgba(255,255,255,0.7);
        }

        .partner-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .partner-card {
          background: white;
          border: 1px solid #f1e4bf;
          border-radius: 12px;
          padding: 12px;
        }

        .partner-card h4 {
          margin: 0 0 8px;
          color: #1e3c72;
          font-size: 1.1rem;
        }

        .badge-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }

        .tag {
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .tag-red {
          background: #fee2e2;
          color: #991b1b;
        }

        .tag-green {
          background: #dcfce7;
          color: #166534;
        }

        .tag-soft {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }

        .details-grid div {
          border: 1px solid #efe3bf;
          background: #faf7ef;
          border-radius: 8px;
          padding: 6px;
        }

        .details-grid strong {
          display: block;
          font-size: 0.72rem;
          text-transform: uppercase;
          color: #86631e;
        }

        .details-grid span {
          font-weight: 700;
          color: #1f2937;
          font-size: 0.88rem;
        }

        .explanation {
          margin: 0;
          color: #475569;
          line-height: 1.45;
          font-size: 0.88rem;
        }

        .note-box {
          border: 1px dashed #d4b16d;
          background: #fff8ea;
          border-radius: 10px;
          padding: 10px;
        }

        .note-box p {
          margin: 0;
          color: #704f0c;
          line-height: 1.45;
          font-size: 0.87rem;
        }
      `}</style>
    </div>
  );
}
