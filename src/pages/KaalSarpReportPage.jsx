import { useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { callAstrologyApi, getKalsarpaDetails } from "../api/astrologyApi";
import { useLanguage } from "../hooks/useLanguage";

const KAAL_SARP_TYPE_NAMES = Object.freeze([
  { en: "Anant", hi: "अनंत" },
  { en: "Kulik", hi: "कुलिक" },
  { en: "Vasuki", hi: "वासुकी" },
  { en: "Shankhpal", hi: "शंखपाल" },
  { en: "Padma", hi: "पद्म" },
  { en: "Mahapadma", hi: "महापद्म" },
  { en: "Takshak", hi: "तक्षक" },
  { en: "Karkotak", hi: "कर्कोटक" },
  { en: "Shankhachud", hi: "शंखचूड़" },
  { en: "Ghatak", hi: "घातक" },
  { en: "Vishdhar", hi: "विषदर" },
  { en: "Sheshnag", hi: "शेषनाग" },
]);

const SIGN_INDEX_MAP = Object.freeze({
  aries: 0,
  mesha: 0,
  mesh: 0,
  taurus: 1,
  vrishabha: 1,
  vrishabh: 1,
  gemini: 2,
  mithuna: 2,
  mithun: 2,
  cancer: 3,
  kark: 3,
  leo: 4,
  simha: 4,
  singh: 4,
  virgo: 5,
  kanya: 5,
  libra: 6,
  tula: 6,
  scorpio: 7,
  vrishchika: 7,
  vrishchik: 7,
  sagittarius: 8,
  dhanu: 8,
  capricorn: 9,
  makar: 9,
  aquarius: 10,
  kumbha: 10,
  kumbh: 10,
  pisces: 11,
  meena: 11,
  meen: 11,
});

const PLANET_ALIAS_MAP = Object.freeze({
  sun: ["sun", "surya", "su"],
  moon: ["moon", "chandra", "mo"],
  mars: ["mars", "mangal", "ma"],
  mercury: ["mercury", "budh", "me"],
  jupiter: ["jupiter", "guru", "ju"],
  venus: ["venus", "shukra", "ve"],
  saturn: ["saturn", "shani", "sa"],
  rahu: ["rahu", "ra"],
  ketu: ["ketu", "ke"],
});

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

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

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  const text = normalizeName(value);
  if (!text) {
    return null;
  }

  if (["true", "yes", "present", "1"].includes(text)) {
    return true;
  }

  if (["false", "no", "absent", "0", "none"].includes(text)) {
    return false;
  }

  return null;
}

function findValueByKeys(input, keys = []) {
  if (!input || typeof input !== "object") {
    return null;
  }

  const queue = [input];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node || typeof node !== "object") {
      continue;
    }

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const value = node[key];
        if (value !== undefined && value !== null && value !== "") {
          return value;
        }
      }
    }

    Object.values(node).forEach((value) => {
      if (value && typeof value === "object") {
        queue.push(value);
      }
    });
  }

  return null;
}

function toList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  const text = String(value || "").trim();
  if (!text) {
    return [];
  }

  return text
    .split(/\.|\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDisplayValue(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  let processedValue = value;

  // Try to parse stringified JSON if it looks like one
  if (
    typeof processedValue === "string" &&
    processedValue.trim().startsWith("{")
  ) {
    try {
      const parsed = JSON.parse(processedValue);
      processedValue = parsed;
    } catch (e) {
      // Not valid JSON or parsing failed
    }
  }

  if (processedValue && typeof processedValue === "object") {
    // Priority fields for display
    if (processedValue.report) return String(processedValue.report);
    if (processedValue.message) return String(processedValue.message);
    if (processedValue.description) return String(processedValue.description);
    return JSON.stringify(processedValue);
  }

  return String(processedValue);
}

function buildApiDetailRows(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  return Object.entries(payload)
    .filter(([key]) => key !== "output" && key !== "data")
    .map(([key, value]) => ({
      key,
      value: toDisplayValue(value),
    }));
}

function standardRemedies(isHindi) {
  return isHindi
    ? [
        "प्रतिदिन ॐ नमः शिवाय 108 बार जप करें।",
        "सोमवार को शिवलिंग पर जल-दूध से अभिषेक करें।",
        "राहु-केतु शांति पूजन योग्य पुरोहित से कराएं।",
        "नाग पंचमी या अमावस्या पर दान-पुण्य करें।",
      ]
    : [
        "Chant Om Namah Shivaya 108 times daily.",
        "Offer milk-water abhishek on Shiva Lingam on Mondays.",
        "Perform Rahu-Ketu peace ritual with a qualified priest.",
        "Practice charity on Nag Panchami or Amavasya.",
      ];
}

function buildBirthParams(form) {
  const [year, month, day] = String(form.date || "")
    .split("-")
    .map((part) => Number(part));
  const [hour, min] = String(form.time || "")
    .split(":")
    .map((part) => Number(part));

  return {
    day: toNumber(day, 1),
    month: toNumber(month, 1),
    year: toNumber(year, new Date().getFullYear()),
    hour: toNumber(hour, 12),
    min: toNumber(min, 0),
    lat: toNumber(form.latitude, 19.076),
    lon: toNumber(form.longitude, 72.8777),
    tzone: toNumber(form.timezone, 5.5),
  };
}

function resolveSignIndex(value) {
  const numeric = toNumber(value, null);
  if (numeric !== null) {
    if (numeric >= 1 && numeric <= 12) {
      return numeric - 1;
    }

    if (numeric >= 0 && numeric < 12) {
      return numeric;
    }
  }

  const normalized = normalizeName(value);
  return Object.prototype.hasOwnProperty.call(SIGN_INDEX_MAP, normalized)
    ? SIGN_INDEX_MAP[normalized]
    : null;
}

function normalizeDegree(value) {
  const numeric = toNumber(value, null);
  if (numeric === null) {
    return null;
  }

  const wrapped = numeric % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

function getAbsoluteDegree(row) {
  const signIndex = resolveSignIndex(
    row?.sign ?? row?.sign_name ?? row?.zodiac ?? row?.rashi,
  );
  const normDegree = toNumber(row?.normDegree, null);
  const degree = toNumber(row?.fullDegree, toNumber(row?.degree, null));

  if (normDegree !== null) {
    if (normDegree > 30) {
      return normalizeDegree(normDegree);
    }

    if (signIndex !== null) {
      return normalizeDegree(signIndex * 30 + normDegree);
    }

    return normalizeDegree(normDegree);
  }

  if (degree !== null && signIndex !== null) {
    const inSign = ((degree % 30) + 30) % 30;
    return normalizeDegree(signIndex * 30 + inSign);
  }

  return null;
}

function canonicalPlanetName(rawName) {
  const normalized = normalizeName(rawName);

  for (const [planetName, aliases] of Object.entries(PLANET_ALIAS_MAP)) {
    if (aliases.includes(normalized)) {
      return planetName;
    }
  }

  return null;
}

function extractPlanetRows(payload) {
  const normalized = normalizeResponse(payload);
  if (Array.isArray(normalized)) {
    return normalized;
  }

  if (normalized && typeof normalized === "object") {
    const nestedArray =
      (Array.isArray(normalized.output) && normalized.output) ||
      (Array.isArray(normalized.data) && normalized.data) ||
      null;

    if (nestedArray) {
      return nestedArray;
    }
  }

  return [];
}

function isDegreeInArc(start, end, point) {
  if (start <= end) {
    return point >= start && point <= end;
  }

  return point >= start || point <= end;
}

function detectKaalSarpFromPlanets(planetsPayload, isHindi) {
  const rows = extractPlanetRows(planetsPayload);
  const planetPositions = {};

  rows.forEach((row) => {
    const canonicalName = canonicalPlanetName(
      row?.name || row?.full_name || row?.planet || row?.planet_name,
    );
    if (!canonicalName || planetPositions[canonicalName]) {
      return;
    }

    const absDegree = getAbsoluteDegree(row);
    const signIndex = resolveSignIndex(
      row?.sign ?? row?.sign_name ?? row?.zodiac ?? row?.rashi,
    );
    if (absDegree === null) {
      return;
    }

    planetPositions[canonicalName] = {
      degree: absDegree,
      signIndex,
    };
  });

  const required = [
    "sun",
    "moon",
    "mars",
    "mercury",
    "jupiter",
    "venus",
    "saturn",
    "rahu",
    "ketu",
  ];
  const missing = required.filter((planetName) => !planetPositions[planetName]);

  if (missing.length > 0) {
    return null;
  }

  const rahu = planetPositions.rahu.degree;
  const ketu = planetPositions.ketu.degree;

  const classicalPlanets = [
    "sun",
    "moon",
    "mars",
    "mercury",
    "jupiter",
    "venus",
    "saturn",
  ];

  const allInArcRahuToKetu = classicalPlanets.every((planetName) =>
    isDegreeInArc(rahu, ketu, planetPositions[planetName].degree),
  );

  const allInArcKetuToRahu = classicalPlanets.every((planetName) =>
    isDegreeInArc(ketu, rahu, planetPositions[planetName].degree),
  );

  const present = allInArcRahuToKetu || allInArcKetuToRahu;
  const rahuSignIndex =
    planetPositions.rahu.signIndex !== null &&
    planetPositions.rahu.signIndex !== undefined
      ? planetPositions.rahu.signIndex
      : Math.floor(rahu / 30);

  const typeName = KAAL_SARP_TYPE_NAMES[((rahuSignIndex % 12) + 12) % 12];

  return {
    source: "planets",
    present,
    statusLabel: present
      ? isHindi
        ? "संभावित रूप से उपस्थित"
        : "Likely Present"
      : isHindi
        ? "मजबूत संकेत नहीं"
        : "Not Strongly Indicated",
    type: typeName ? typeName[isHindi ? "hi" : "en"] : "-",
    confidence: isHindi ? "मध्यम" : "Medium",
    axis: `${rahu.toFixed(2)}° / ${ketu.toFixed(2)}°`,
    summary: present
      ? isHindi
        ? "ग्रह स्थिति के आधार पर राहु-केतु अक्ष के एक ओर ग्रह समूह दिखता है, इसलिए कालसर्प प्रभाव संभव है।"
        : "Planet grouping appears on one side of the Rahu-Ketu axis, suggesting possible Kaal Sarp influence."
      : isHindi
        ? "ग्रह स्थिति के अनुसार पूर्ण कालसर्प योग का स्पष्ट गठन नहीं दिखता।"
        : "Planet spread does not clearly form a complete Kaal Sarp configuration.",
    findings: [
      isHindi
        ? `विश्लेषित ग्रह: ${9 - missing.length}`
        : `Analyzed planets: ${9 - missing.length}`,
      isHindi
        ? allInArcRahuToKetu
          ? "ग्रह राहु से केतु दिशा में सीमित पाए गए।"
          : allInArcKetuToRahu
            ? "ग्रह केतु से राहु दिशा में सीमित पाए गए।"
            : "संभावित एकाधिकार योग।"
        : allInArcRahuToKetu
          ? "Planets cluster from Rahu to Ketu arc."
          : allInArcKetuToRahu
            ? "Planets cluster from Ketu to Rahu arc."
            : "Possible planet clustering indicated.",
    ],
    remedies: standardRemedies(isHindi),
  };
}

function parseApiKaalSarp(payload, isHindi) {
  const normalized = normalizeResponse(payload);
  if (!normalized || typeof normalized !== "object") {
    return null;
  }

  const detailRows = buildApiDetailRows(normalized);

  const presentRaw = findValueByKeys(normalized, [
    "is_kalsarpa",
    "is_kalsarp",
    "kalsarpa_present",
    "present",
    "dosha_present",
    "status",
  ]);
  const present = parseBoolean(presentRaw);

  const typeText = String(
    findValueByKeys(normalized, [
      "type",
      "name",
      "dosha_type",
      "kaalsarp_name",
    ]) || "-",
  ).trim();

  // Extract Short Summary
  const shortSummary = String(
    findValueByKeys(normalized, ["one_line", "oneLine", "summary"]) || "",
  ).trim();

  // Extract Detailed Report
  let detailedReport = "";
  const reportNode = findValueByKeys(normalized, ["report", "description"]);

  if (reportNode) {
    if (typeof reportNode === "object") {
      // It's the { house_id, report } object
      detailedReport = String(
        reportNode.report ||
          reportNode.description ||
          JSON.stringify(reportNode),
      );
    } else if (typeof reportNode === "string") {
      if (reportNode.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(reportNode);
          detailedReport = String(
            parsed.report || parsed.description || reportNode,
          );
        } catch (e) {
          detailedReport = reportNode;
        }
      } else {
        detailedReport = reportNode;
      }
    }
  }

  // Clean internal JSON artifacts if any (e.g. if it stringified an object with "report" key)
  if (detailedReport.includes('"report":')) {
    try {
      const parsed = JSON.parse(detailedReport);
      detailedReport = String(parsed.report || detailedReport);
    } catch (e) {}
  }

  // Final combination
  let summaryText = "";
  if (shortSummary && detailedReport) {
    // If detailed report already starts with short summary, don't double it
    if (
      detailedReport
        .toLowerCase()
        .includes(shortSummary.toLowerCase().substring(0, 20))
    ) {
      summaryText = detailedReport;
    } else {
      summaryText = `<p><strong>${shortSummary}</strong></p>${detailedReport}`;
    }
  } else {
    summaryText = detailedReport || shortSummary;
  }

  // Remove any remaining JSON-like artifacts from the very beginning/end if they snuck in
  summaryText = summaryText
    .trim()
    .replace(/^\{"report":"/i, "")
    .replace(/"\}$/, "");

  const remedies = toList(
    findValueByKeys(normalized, [
      "remedies",
      "upay",
      "solution",
      "suggestions",
    ]),
  );

  if (present === null && !summaryText && typeText === "-") {
    return null;
  }

  const inferredPresent = present === null ? true : present;

  return {
    source: "kalsarpa_details",
    present: inferredPresent,
    statusLabel: inferredPresent
      ? isHindi
        ? "उपस्थित"
        : "Present"
      : isHindi
        ? "अनुपस्थित"
        : "Absent",
    type: typeText,
    confidence: isHindi ? "उच्च" : "High",
    axis: String(
      findValueByKeys(normalized, ["axis", "rahu_ketu_axis", "node_axis"]) ||
        "-",
    ),
    summary:
      summaryText ||
      (isHindi ? "API रिपोर्ट उपलब्ध है।" : "API report available."),
    findings: [
      isHindi
        ? "ग्रह स्थिति की गणना पूर्ण की गई।"
        : "Birth chart calculations completed.",
      isHindi
        ? "यह विश्लेषण आपके जन्म विवरणों के व्यापक मिलान पर आधारित है।"
        : "Analysis based on comprehensive birth chart alignment.",
    ],
    remedies: remedies.length
      ? remedies.slice(0, 5)
      : standardRemedies(isHindi),
    apiDetails: detailRows,
  };
}

function buildGeneralKaalSarpReport(isHindi) {
  return {
    source: "general",
    present: null,
    statusLabel: isHindi ? "निर्धारित नहीं" : "Undetermined",
    type: "-",
    confidence: isHindi ? "सामान्य" : "General",
    axis: "-",
    summary: isHindi
      ? "API limit के कारण व्यक्तिगत कालसर्प स्थिति अभी निर्धारित नहीं हो सकी। नीचे सामान्य शांति उपाय दिए गए हैं।"
      : "Personal Kaal Sarp status could not be determined due to API limits. General remedies are provided below.",
    findings: [
      isHindi
        ? "जन्म विवरण सुरक्षित हैं; API उपलब्ध होते ही personal calculation करें।"
        : "Birth inputs are valid; run a personal calculation when API is available.",
      isHindi
        ? "अभी दिए गए उपाय सामान्य आध्यात्मिक संतुलन के लिए हैं।"
        : "Current remedies are general balancing practices.",
    ],
    remedies: standardRemedies(isHindi),
  };
}

function isPlanOrQuotaError(error) {
  const status = Number(error?.status);
  const message = String(error?.message || "").toLowerCase();
  return (
    status === 405 ||
    status === 429 ||
    message.includes("not authorized") ||
    message.includes("trial request limit")
  );
}

export default function KaalSarpReportPage() {
  const { language } = useLanguage();
  const isHindi = language !== "en";

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: "10:30",
    latitude: "19.0760",
    longitude: "72.8777",
    timezone: "5.5",
  });

  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setReport(null);
    setIsLoading(true);

    const params = buildBirthParams(form);

    try {
      const primaryResponse = await getKalsarpaDetails(params, {
        language,
      });
      const parsedPrimary = parseApiKaalSarp(
        primaryResponse?.data || primaryResponse,
        isHindi,
      );

      if (parsedPrimary) {
        setReport(parsedPrimary);
        return;
      }

      throw new Error("Kaal Sarp endpoint returned an unsupported format.");
    } catch (primaryError) {
      try {
        const planetsResponse = await callAstrologyApi("planets", params, {
          language,
        });
        const inferred = detectKaalSarpFromPlanets(
          planetsResponse?.data || planetsResponse,
          isHindi,
        );

        if (!inferred) {
          throw new Error(
            "Planet data is insufficient for Kaal Sarp inference.",
          );
        }

        setReport(inferred);
        setNotice(
          isHindi
            ? "Direct Kaal Sarp endpoint unavailable था, इसलिए planets-based fallback analysis दिखाया गया है।"
            : "Direct Kaal Sarp endpoint was unavailable, so planets-based fallback analysis is shown.",
        );
      } catch (fallbackError) {
        setReport(buildGeneralKaalSarpReport(isHindi));

        if (
          isPlanOrQuotaError(primaryError) ||
          isPlanOrQuotaError(fallbackError)
        ) {
          setNotice(
            isHindi
              ? "API plan/quota limit के कारण general Kaal Sarp guidance दिखाई जा रही है।"
              : "API plan/quota limit reached. Showing general Kaal Sarp guidance.",
          );
        } else {
          setError(
            primaryError.message ||
              (isHindi
                ? "कालसर्प रिपोर्ट उपलब्ध नहीं है।"
                : "Kaal Sarp report is unavailable."),
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-shell">
      <SeoMeta
        title={
          isHindi
            ? "कालसर्प रिपोर्ट | पवित्र ज्योतिष"
            : "Kaal Sarp Report | jyotish web"
        }
        description="Generate Kaal Sarp report with direct API data or planets-based fallback analysis."
        path="/remedies/kaalsarp"
      />

      <div
        className="page-header"
        style={{
          background:
            "linear-gradient(135deg, rgba(87, 37, 22, 0.24) 0%, rgba(212, 175, 55, 0.12) 100%)",
          borderRadius: "18px",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          padding: "20px",
        }}
      >
        <h1>{isHindi ? "कालसर्प रिपोर्ट" : "Kaal Sarp Report"}</h1>
        <p>
          {isHindi
            ? "कालसर्प प्रभाव की स्थिति, प्रकार, निष्कर्ष और शांति उपाय एक जगह देखें।"
            : "View Kaal Sarp status, type, interpretation and remedies in one place."}
        </p>
      </div>

      <form className="astro-form" onSubmit={handleSubmit}>
        <div className="astro-form-grid">
          <div className="form-group">
            <label htmlFor="k-date">
              {isHindi ? "जन्म तिथि" : "Birth Date"}
            </label>
            <input
              id="k-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="k-time">
              {isHindi ? "जन्म समय" : "Birth Time"}
            </label>
            <input
              id="k-time"
              type="time"
              value={form.time}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, time: event.target.value }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="k-lat">{isHindi ? "अक्षांश" : "Latitude"}</label>
            <input
              id="k-lat"
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
            <label htmlFor="k-lon">{isHindi ? "देशांतर" : "Longitude"}</label>
            <input
              id="k-lon"
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
            <label htmlFor="k-tz">{isHindi ? "समय क्षेत्र" : "Timezone"}</label>
            <input
              id="k-tz"
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
            <label>{isHindi ? "विश्लेषण मोड" : "Analysis Mode"}</label>
            <input readOnly value={isHindi ? "Auto " : "Auto"} />
          </div>
        </div>

        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading
            ? isHindi
              ? "कालसर्प विश्लेषण तैयार हो रहा है..."
              : "Preparing Kaal Sarp analysis..."
            : isHindi
              ? "कालसर्प रिपोर्ट देखें"
              : "Generate Kaal Sarp Report"}
        </button>
      </form>

      <ErrorMessage message={error} />

      {notice ? (
        <div
          style={{
            border: "1px solid rgba(212, 175, 55, 0.35)",
            background: "rgba(212, 175, 55, 0.15)",
            color: "#f5dfb8",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "14px",
            fontFamily: '"Noto Sans Devanagari", sans-serif',
          }}
        >
          {notice}
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSpinner
          label={
            isHindi
              ? "राहु-केतु अक्ष विश्लेषित किया जा रहा है..."
              : "Analyzing Rahu-Ketu axis..."
          }
        />
      ) : null}

      {report ? (
        <section
          className="result-section"
          style={{
            background:
              "linear-gradient(145deg, rgba(17, 11, 42, 0.94) 0%, rgba(11, 8, 29, 0.97) 100%)",
            borderRadius: "18px",
            border: "1px solid rgba(212, 175, 55, 0.28)",
          }}
        >
          <h2>{isHindi ? "कालसर्प निष्कर्ष" : "Kaal Sarp Findings"}</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <div style={cardStyle}>
              <p style={metaStyle}>{isHindi ? "स्थिति" : "Status"}</p>
              <h3 style={valueStyle}>{report.statusLabel}</h3>
            </div>
            <div style={cardStyle}>
              <p style={metaStyle}>{isHindi ? "विश्वसनीयता" : "Confidence"}</p>
              <h3 style={valueStyle}>{report.confidence || "-"}</h3>
            </div>
          </div>

          <div style={{ overflowX: "auto", marginBottom: "14px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "520px",
              }}
            >
              <tbody>
                <tr>
                  <td style={tableKeyStyle}>
                    {isHindi ? "राहु-केतु अक्ष" : "Rahu-Ketu Axis"}
                  </td>
                  <td style={tableValueStyle}>{report.axis || "-"}</td>
                </tr>
                <tr>
                  <td style={tableKeyStyle}>
                    {isHindi ? "व्याख्या" : "Interpretation"}
                  </td>
                  <td
                    style={tableValueStyle}
                    dangerouslySetInnerHTML={{ __html: report.summary }}
                  />
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <h3
              style={{
                marginBottom: "6px",
                color: "#f6dfb3",
                fontFamily: '"Noto Sans Devanagari", sans-serif',
              }}
            >
              {isHindi ? "मुख्य बिंदु" : "Key Findings"}
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: "18px",
                color: "#ffe7bc",
                lineHeight: 1.45,
              }}
            >
              {(report.findings || []).map((item, index) => (
                <li key={`finding-${index}`} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              borderTop: "1px dashed rgba(212, 175, 55, 0.33)",
              paddingTop: "10px",
            }}
          >
            <h3
              style={{
                marginBottom: "6px",
                color: "#f6dfb3",
                fontFamily: '"Noto Sans Devanagari", sans-serif',
              }}
            >
              {isHindi ? "शांति उपाय" : "Remedies"}
            </h3>
            <ol
              style={{
                margin: 0,
                paddingLeft: "18px",
                color: "#f4ddaf",
                lineHeight: 1.45,
              }}
            >
              {(report.remedies || []).map((item, index) => (
                <li key={`remedy-${index}`} style={{ marginBottom: "4px" }}>
                  {item}
                </li>
              ))}
            </ol>
          </div>
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
  width: "32%",
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
