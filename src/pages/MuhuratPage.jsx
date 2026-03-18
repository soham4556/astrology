import { useMemo, useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { getBasicPanchang, getPanchangLagnaTable } from "../api/astrologyApi";
import { useLanguage } from "../hooks/useLanguage";

const WEEKDAY_MAP = Object.freeze({
  sunday: "sunday",
  sun: "sunday",
  रविवार: "sunday",
  रविवासर: "sunday",
  monday: "monday",
  mon: "monday",
  सोमवार: "monday",
  tuesday: "tuesday",
  tue: "tuesday",
  tues: "tuesday",
  मंगलवार: "tuesday",
  wednesday: "wednesday",
  wed: "wednesday",
  बुधवार: "wednesday",
  thursday: "thursday",
  thu: "thursday",
  thur: "thursday",
  thurs: "thursday",
  गुरुवार: "thursday",
  friday: "friday",
  fri: "friday",
  शुक्रवार: "friday",
  saturday: "saturday",
  sat: "saturday",
  शनिवार: "saturday",
});

const RAHU_SEGMENTS = Object.freeze({
  sunday: 8,
  monday: 2,
  tuesday: 7,
  wednesday: 5,
  thursday: 6,
  friday: 4,
  saturday: 3,
});

const YAMAGAND_SEGMENTS = Object.freeze({
  sunday: 5,
  monday: 4,
  tuesday: 3,
  wednesday: 2,
  thursday: 1,
  friday: 7,
  saturday: 6,
});

const GULIKA_SEGMENTS = Object.freeze({
  sunday: 7,
  monday: 6,
  tuesday: 5,
  wednesday: 4,
  thursday: 3,
  friday: 2,
  saturday: 1,
});

const SIGN_ALIASES = Object.freeze({
  aries: "Aries",
  mesha: "Aries",
  mesh: "Aries",
  मेष: "Aries",
  taurus: "Taurus",
  vrishabh: "Taurus",
  vrishabha: "Taurus",
  वृषभ: "Taurus",
  gemini: "Gemini",
  mithun: "Gemini",
  mithuna: "Gemini",
  मिथुन: "Gemini",
  cancer: "Cancer",
  kark: "Cancer",
  कर्क: "Cancer",
  leo: "Leo",
  singh: "Leo",
  simha: "Leo",
  सिंह: "Leo",
  virgo: "Virgo",
  kanya: "Virgo",
  कन्या: "Virgo",
  libra: "Libra",
  tula: "Libra",
  तुला: "Libra",
  scorpio: "Scorpio",
  vrishchik: "Scorpio",
  vrishchika: "Scorpio",
  वृश्चिक: "Scorpio",
  sagittarius: "Sagittarius",
  dhanu: "Sagittarius",
  धनु: "Sagittarius",
  capricorn: "Capricorn",
  makar: "Capricorn",
  मकर: "Capricorn",
  aquarius: "Aquarius",
  kumbh: "Aquarius",
  kumbha: "Aquarius",
  कुंभ: "Aquarius",
  pisces: "Pisces",
  meen: "Pisces",
  meena: "Pisces",
  मीन: "Pisces",
});

const SIGN_TO_HINDI = Object.freeze({
  Aries: "मेष",
  Taurus: "वृषभ",
  Gemini: "मिथुन",
  Cancer: "कर्क",
  Leo: "सिंह",
  Virgo: "कन्या",
  Libra: "तुला",
  Scorpio: "वृश्चिक",
  Sagittarius: "धनु",
  Capricorn: "मकर",
  Aquarius: "कुंभ",
  Pisces: "मीन",
});

const MUHURAT_TYPES = Object.freeze({
  general: {
    hi: "सामान्य शुभ कार्य",
    en: "General Auspicious Work",
    preferredSigns: [
      "Taurus",
      "Gemini",
      "Virgo",
      "Libra",
      "Sagittarius",
      "Pisces",
    ],
  },
  marriage: {
    hi: "विवाह मुहूर्त",
    en: "Marriage Muhurat",
    preferredSigns: [
      "Taurus",
      "Gemini",
      "Virgo",
      "Libra",
      "Sagittarius",
      "Pisces",
    ],
  },
  griha_pravesh: {
    hi: "गृह प्रवेश",
    en: "Housewarming",
    preferredSigns: ["Taurus", "Cancer", "Virgo", "Sagittarius", "Pisces"],
  },
  business: {
    hi: "व्यापार प्रारंभ",
    en: "Business Start",
    preferredSigns: [
      "Taurus",
      "Gemini",
      "Leo",
      "Virgo",
      "Libra",
      "Capricorn",
      "Aquarius",
    ],
  },
  travel: {
    hi: "यात्रा",
    en: "Travel",
    preferredSigns: ["Aries", "Gemini", "Libra", "Sagittarius", "Aquarius"],
  },
});

const PERIOD_WINDOWS = Object.freeze({
  any: { start: 0, end: 1440 },
  morning: { start: 360, end: 720 },
  afternoon: { start: 720, end: 1020 },
  evening: { start: 1020, end: 1260 },
});

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toMinutes(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parts = String(value || "")
    .trim()
    .split(":")
    .map((part) => toNumber(part, NaN));

  if (!Number.isFinite(parts[0])) {
    return fallback;
  }

  const hour = parts[0];
  const minute = Number.isFinite(parts[1]) ? parts[1] : 0;
  const second = Number.isFinite(parts[2]) ? parts[2] : 0;
  return hour * 60 + minute + second / 60;
}

function formatMinutes(totalMinutes) {
  const value = Math.min(Math.max(Math.round(totalMinutes), 0), 1439);
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function normalizePanchangPayload(payload) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload;
  }

  if (
    payload?.output &&
    typeof payload.output === "object" &&
    !Array.isArray(payload.output)
  ) {
    return payload.output;
  }

  return null;
}

function normalizeLagnaRows(payload) {
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

function normalizeWeekday(dayText, fallbackDate) {
  const key = String(dayText || "")
    .trim()
    .toLowerCase();

  if (WEEKDAY_MAP[key]) {
    return WEEKDAY_MAP[key];
  }

  const fallback = new Date(`${fallbackDate}T12:00:00`)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  return WEEKDAY_MAP[fallback] || "monday";
}

function normalizeSignName(sign) {
  const key = String(sign || "")
    .trim()
    .toLowerCase();
  return SIGN_ALIASES[key] || String(sign || "").trim() || "Unknown";
}

function formatSign(sign, isHindi) {
  const normalized = normalizeSignName(sign);
  if (!isHindi) {
    return normalized;
  }

  return SIGN_TO_HINDI[normalized] || normalized;
}

function getDaySegmentWindow(sunrise, sunset, segmentIndex) {
  const span = Math.max(sunset - sunrise, 1);
  const segment = span / 8;
  const start = sunrise + (segmentIndex - 1) * segment;
  const end = start + segment;
  return { start, end };
}

function intersectRange(a, b) {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  if (end <= start) {
    return null;
  }

  return { start, end };
}

function subtractBlockedRanges(interval, blockedRanges) {
  let remaining = [interval];

  blockedRanges.forEach((blocked) => {
    remaining = remaining.flatMap((range) => {
      if (blocked.end <= range.start || blocked.start >= range.end) {
        return [range];
      }

      const pieces = [];
      if (blocked.start > range.start) {
        pieces.push({ start: range.start, end: blocked.start });
      }
      if (blocked.end < range.end) {
        pieces.push({ start: blocked.end, end: range.end });
      }
      return pieces;
    });
  });

  return remaining.filter((range) => range.end - range.start >= 12);
}

function clampScore(value) {
  return Math.min(Math.max(Math.round(value), 1), 99);
}

function scoreInterval(interval, typeConfig, preferredPeriod) {
  const duration = interval.end - interval.start;
  const midpoint = (interval.start + interval.end) / 2;
  const fixedSigns = ["Taurus", "Leo", "Scorpio", "Aquarius"];
  const movableSigns = ["Aries", "Cancer", "Libra", "Capricorn"];

  let score = 50;
  const reasons = [];

  if (typeConfig.preferredSigns.includes(interval.sign)) {
    score += 24;
    reasons.push("कार्य प्रकार के अनुसार अनुकूल लग्न");
  } else {
    score += 4;
    reasons.push("तटस्थ लग्न");
  }

  if (duration >= 90) {
    score += 14;
    reasons.push("लंबी समय अवधि उपलब्ध");
  } else if (duration >= 50) {
    score += 8;
    reasons.push("उपयुक्त समय अवधि");
  } else {
    score -= 8;
    reasons.push("समय अवधि कम है");
  }

  if (preferredPeriod !== "any") {
    const preferred = PERIOD_WINDOWS[preferredPeriod] || PERIOD_WINDOWS.any;
    if (midpoint >= preferred.start && midpoint <= preferred.end) {
      score += 6;
      reasons.push("आपकी पसंदीदा समय सीमा में");
    }
  }

  if (
    typeConfig === MUHURAT_TYPES.griha_pravesh &&
    fixedSigns.includes(interval.sign)
  ) {
    score += 6;
    reasons.push("स्थिर लग्न गृह प्रवेश हेतु बेहतर");
  }

  if (
    typeConfig === MUHURAT_TYPES.travel &&
    movableSigns.includes(interval.sign)
  ) {
    score += 6;
    reasons.push("चल लग्न यात्रा हेतु उपयुक्त");
  }

  return {
    score: clampScore(score),
    reasons,
  };
}

function periodLabel(period, isHindi) {
  if (period === "morning") return isHindi ? "सुबह" : "Morning";
  if (period === "afternoon") return isHindi ? "दोपहर" : "Afternoon";
  if (period === "evening") return isHindi ? "शाम" : "Evening";
  return isHindi ? "पूरा दिन" : "Anytime";
}

export default function MuhuratPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const [form, setForm] = useState({
    muhuratType: "general",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    latitude: "18.5204",
    longitude: "73.8567",
    timezone: "5.5",
    preferredPeriod: "any",
    excludeRahu: true,
    excludeYamagand: true,
    excludeGulika: true,
  });

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const muhuratTypeOptions = useMemo(
    () =>
      Object.entries(MUHURAT_TYPES).map(([value, config]) => ({
        value,
        label: isHindi ? config.hi : config.en,
      })),
    [isHindi],
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
      const [panchangResponse, lagnaResponse] = await Promise.all([
        getBasicPanchang(params, { language }),
        getPanchangLagnaTable(params, { language }),
      ]);

      const panchangPayload = panchangResponse?.data || panchangResponse;
      const lagnaPayload = lagnaResponse?.data || lagnaResponse;

      const panchang = normalizePanchangPayload(panchangPayload);
      const lagnaRows = normalizeLagnaRows(lagnaPayload);

      if (!panchang) {
        throw new Error(
          isHindi
            ? "पंचांग डेटा उपलब्ध नहीं है।"
            : "Panchang data is unavailable.",
        );
      }

      if (!lagnaRows.length) {
        throw new Error(
          isHindi
            ? "लग्न तालिका उपलब्ध नहीं है।"
            : "Lagna table data is unavailable.",
        );
      }

      const sunrise = toMinutes(
        panchang.sunrise || panchang.vedic_sunrise,
        6 * 60,
      );
      const sunset = toMinutes(
        panchang.sunset || panchang.vedic_sunset,
        18 * 60,
      );
      const safeSunset = sunset > sunrise ? sunset : sunrise + 12 * 60;

      const weekday = normalizeWeekday(panchang.day, form.date);

      const blockedRanges = [];
      if (form.excludeRahu) {
        blockedRanges.push({
          name: isHindi ? "राहुकाल" : "Rahu Kaal",
          ...getDaySegmentWindow(sunrise, safeSunset, RAHU_SEGMENTS[weekday]),
        });
      }

      if (form.excludeYamagand) {
        blockedRanges.push({
          name: isHindi ? "यमगंड" : "Yamagand",
          ...getDaySegmentWindow(
            sunrise,
            safeSunset,
            YAMAGAND_SEGMENTS[weekday],
          ),
        });
      }

      if (form.excludeGulika) {
        blockedRanges.push({
          name: isHindi ? "गुलिक काल" : "Gulika Kaal",
          ...getDaySegmentWindow(sunrise, safeSunset, GULIKA_SEGMENTS[weekday]),
        });
      }

      const preferredWindow =
        PERIOD_WINDOWS[form.preferredPeriod] || PERIOD_WINDOWS.any;
      const daytimeRange = { start: sunrise, end: safeSunset };
      const typeConfig =
        MUHURAT_TYPES[form.muhuratType] || MUHURAT_TYPES.general;

      const computed = lagnaRows
        .flatMap((row) => {
          const start = toMinutes(row.start, NaN);
          const end = toMinutes(row.end, NaN);

          if (!Number.isFinite(start) || !Number.isFinite(end)) {
            return [];
          }

          const normalizedSign = normalizeSignName(row.lagna);
          const rawRange = { start, end: end > start ? end : end + 1440 };
          const dayAdjusted = {
            start:
              rawRange.start >= 1440 ? rawRange.start - 1440 : rawRange.start,
            end: rawRange.end > 1440 ? rawRange.end - 1440 : rawRange.end,
          };

          const inDaylight = intersectRange(dayAdjusted, daytimeRange);
          if (!inDaylight) {
            return [];
          }

          const inPreferredPeriod = intersectRange(inDaylight, preferredWindow);
          if (!inPreferredPeriod) {
            return [];
          }

          const safeChunks = subtractBlockedRanges(
            inPreferredPeriod,
            blockedRanges,
          );

          return safeChunks.map((chunk) => {
            const scored = scoreInterval(
              { ...chunk, sign: normalizedSign },
              typeConfig,
              form.preferredPeriod,
            );

            return {
              start: chunk.start,
              end: chunk.end,
              sign: normalizedSign,
              score: scored.score,
              reasons: scored.reasons,
            };
          });
        })
        .filter((item) => item.end - item.start >= 15)
        .sort((left, right) => {
          if (right.score !== left.score) {
            return right.score - left.score;
          }
          return left.start - right.start;
        });

      setResult({
        panchang,
        blockedRanges,
        windows: computed,
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          (isHindi
            ? "मुहूर्त निकालने में समस्या आई।"
            : "Failed to generate muhurta windows."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="muhurat-page-container">
      <SeoMeta
        title={isHindi ? "मुहूर्त चयन" : "Muhurta Finder"}
        description="Find practical muhurta windows using panchang and lagna intervals."
        path="/panchang/muhurat"
      />

      <div className="sacred-header">
        <div className="sacred-icon">🕯️</div>
        <h1>{isHindi ? "मुहूर्त चयन" : "Muhurta Finder"}</h1>
        <p className="subtitle">
          {isHindi
            ? "पंचांग + लग्न आधारित शुभ समय सुझाव"
            : "Practical auspicious windows from Panchang + Lagna"}
        </p>
      </div>

      <div className="sacred-content">
        <form onSubmit={handleSubmit} className="astro-form-card">
          <div className="form-grid">
            <div className="field">
              <label>{isHindi ? "मुहूर्त प्रकार" : "Muhurta Type"}</label>
              <select
                value={form.muhuratType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    muhuratType: event.target.value,
                  }))
                }
                required
              >
                {muhuratTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>{isHindi ? "तिथि" : "Date"}</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, date: event.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <label>{isHindi ? "संदर्भ समय" : "Reference Time"}</label>
              <input
                type="time"
                value={form.time}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, time: event.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <label>{isHindi ? "पसंदीदा अवधि" : "Preferred Period"}</label>
              <select
                value={form.preferredPeriod}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    preferredPeriod: event.target.value,
                  }))
                }
              >
                <option value="any">{periodLabel("any", isHindi)}</option>
                <option value="morning">
                  {periodLabel("morning", isHindi)}
                </option>
                <option value="afternoon">
                  {periodLabel("afternoon", isHindi)}
                </option>
                <option value="evening">
                  {periodLabel("evening", isHindi)}
                </option>
              </select>
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

            <div className="field checkbox-group">
              <label>
                {isHindi ? "अशुभ काल हटाएं" : "Exclude Inauspicious Periods"}
              </label>
              <div className="check-row">
                <label>
                  <input
                    type="checkbox"
                    checked={form.excludeRahu}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        excludeRahu: event.target.checked,
                      }))
                    }
                  />
                  <span>{isHindi ? "राहुकाल" : "Rahu Kaal"}</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.excludeYamagand}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        excludeYamagand: event.target.checked,
                      }))
                    }
                  />
                  <span>{isHindi ? "यमगंड" : "Yamagand"}</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.excludeGulika}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        excludeGulika: event.target.checked,
                      }))
                    }
                  />
                  <span>{isHindi ? "गुलिक" : "Gulika"}</span>
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className="sacred-btn" disabled={isLoading}>
            {isLoading
              ? isHindi
                ? "मुहूर्त निकाला जा रहा है..."
                : "Calculating Muhurta..."
              : isHindi
                ? "मुहूर्त प्राप्त करें"
                : "Get Muhurta"}
          </button>
        </form>

        <section className="results-container">
          <ErrorMessage message={error} />
          {isLoading ? (
            <LoadingSpinner
              label={
                isHindi
                  ? "पंचांग और लग्न से शुभ समय निकाला जा रहा है..."
                  : "Building auspicious windows from Panchang and Lagna..."
              }
            />
          ) : null}

          {result ? (
            <div className="data-view-wrapper">
              <div className="summary-grid">
                <div className="summary-card">
                  <span>{isHindi ? "वार" : "Day"}</span>
                  <strong>{result.panchang.day || "-"}</strong>
                </div>
                <div className="summary-card">
                  <span>{isHindi ? "तिथि" : "Tithi"}</span>
                  <strong>{result.panchang.tithi || "-"}</strong>
                </div>
                <div className="summary-card">
                  <span>{isHindi ? "नक्षत्र" : "Nakshatra"}</span>
                  <strong>{result.panchang.nakshatra || "-"}</strong>
                </div>
                <div className="summary-card">
                  <span>
                    {isHindi ? "सूर्योदय - सूर्यास्त" : "Sunrise - Sunset"}
                  </span>
                  <strong>
                    {result.panchang.sunrise || "--:--"} -{" "}
                    {result.panchang.sunset || "--:--"}
                  </strong>
                </div>
              </div>

              {result.blockedRanges.length > 0 ? (
                <div className="blocked-strip">
                  <h3>
                    {isHindi
                      ? "हटाए गए अशुभ काल"
                      : "Excluded Inauspicious Periods"}
                  </h3>
                  <div className="blocked-list">
                    {result.blockedRanges.map((item) => (
                      <span key={`${item.name}-${item.start}`}>
                        {item.name}: {formatMinutes(item.start)} -{" "}
                        {formatMinutes(item.end)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <h3 className="section-subtitle">
                {isHindi
                  ? "अनुशंसित मुहूर्त समय"
                  : "Recommended Muhurta Windows"}
              </h3>

              {result.windows.length === 0 ? (
                <div className="empty-result">
                  {isHindi
                    ? "चुने गए नियमों के अनुसार आज उपयुक्त समय नहीं मिला। फ़िल्टर ढीले करके दोबारा प्रयास करें।"
                    : "No suitable windows found for the selected filters. Try a wider period."}
                </div>
              ) : (
                <div className="muhurat-grid">
                  {result.windows.slice(0, 10).map((window, index) => (
                    <article
                      key={`${window.start}-${window.end}-${index}`}
                      className="muhurat-card"
                    >
                      <div className="card-top">
                        <p>
                          {formatMinutes(window.start)} -{" "}
                          {formatMinutes(window.end)}
                        </p>
                        <span>{window.score}/100</span>
                      </div>
                      <h4>
                        {isHindi ? "लग्न" : "Lagna"}:{" "}
                        {formatSign(window.sign, isHindi)}
                      </h4>
                      <ul>
                        {window.reasons.slice(0, 3).map((reason) => (
                          <li key={`${window.start}-${reason}`}>{reason}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>

      <style>{`
        .muhurat-page-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .sacred-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .sacred-header h1 {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem;
          color: #1a3a52;
          margin-bottom: 5px;
        }

        .subtitle {
          font-family: 'Poppins', sans-serif;
          color: #8b6f47;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.85rem;
        }

        .astro-form-card {
          background: white;
          padding: 35px;
          border-radius: 20px;
          border: 1px solid #f3e5ab;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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

        .field input,
        .field select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e8c78e;
          border-radius: 10px;
          font-family: 'Poppins', sans-serif;
          background: #fff;
        }

        .checkbox-group {
          grid-column: 1 / -1;
        }

        .check-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .check-row label {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0;
          font-weight: 500;
          color: #3c4b5c;
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
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .sacred-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(30, 60, 114, 0.3);
        }

        .data-view-wrapper {
          animation: fadeIn 0.8s ease;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .summary-card {
          background: #fff;
          border: 1px solid #ead5a3;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .summary-card span {
          font-size: 0.78rem;
          color: #8b6f47;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .summary-card strong {
          color: #1e3c72;
          font-size: 1rem;
          line-height: 1.3;
        }

        .blocked-strip {
          border: 1px dashed #d7ba7f;
          background: #fff8ea;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 18px;
        }

        .blocked-strip h3 {
          margin: 0 0 8px;
          font-size: 0.95rem;
          color: #865d07;
        }

        .blocked-list {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .blocked-list span {
          font-size: 0.84rem;
          padding: 5px 8px;
          border-radius: 8px;
          background: #ffefc9;
          color: #6b4b08;
          border: 1px solid #ebcf8f;
        }

        .section-subtitle {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: #1a3a52;
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #f3e5ab;
          padding-bottom: 10px;
        }

        .muhurat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }

        .muhurat-card {
          background: #fff;
          border: 1px solid #f3e5ab;
          border-radius: 14px;
          padding: 14px;
          box-shadow: 0 6px 16px rgba(30, 60, 114, 0.08);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .card-top p {
          margin: 0;
          color: #1e3c72;
          font-weight: 700;
        }

        .card-top span {
          padding: 4px 8px;
          border-radius: 999px;
          background: #e8f3ff;
          color: #1b4f92;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .muhurat-card h4 {
          margin: 8px 0;
          color: #3a2b12;
          font-size: 1rem;
        }

        .muhurat-card ul {
          margin: 0;
          padding-left: 18px;
          color: #5f4b2c;
          display: grid;
          gap: 4px;
          font-size: 0.84rem;
        }

        .empty-result {
          background: #fff8ea;
          border: 1px solid #ecd19c;
          padding: 14px;
          border-radius: 12px;
          color: #7a5b1d;
          text-align: center;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
