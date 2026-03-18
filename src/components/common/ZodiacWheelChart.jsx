import { useMemo } from "react";

const SIGN_META = Object.freeze({
  1: {
    name: "मेष",
    symbol: "♈",
    centerDeg: 240,
    meaning: "नई शुरुआत, साहस और पहल की ऊर्जा",
  },
  2: {
    name: "वृषभ",
    symbol: "♉",
    centerDeg: 210,
    meaning: "स्थिरता, संसाधन और भौतिक सुरक्षा",
  },
  3: {
    name: "मिथुन",
    symbol: "♊",
    centerDeg: 180,
    meaning: "संवाद, सीखना और बहु-रुचियां",
  },
  4: {
    name: "कर्क",
    symbol: "♋",
    centerDeg: 150,
    meaning: "घर, भावनाएं और पोषण",
  },
  5: {
    name: "सिंह",
    symbol: "♌",
    centerDeg: 120,
    meaning: "आत्मविश्वास, रचनात्मकता और नेतृत्व",
  },
  6: {
    name: "कन्या",
    symbol: "♍",
    centerDeg: 90,
    meaning: "विश्लेषण, व्यवस्था और सूक्ष्म निरीक्षण",
  },
  7: {
    name: "तुला",
    symbol: "♎",
    centerDeg: 60,
    meaning: "संतुलन, सहयोग और संबंध",
  },
  8: {
    name: "वृश्चिक",
    symbol: "♏",
    centerDeg: 30,
    meaning: "गहराई, परिवर्तन और शक्ति",
  },
  9: {
    name: "धनु",
    symbol: "♐",
    centerDeg: 0,
    meaning: "दर्शन, विस्तार और उच्च ज्ञान",
  },
  10: {
    name: "मकर",
    symbol: "♑",
    centerDeg: 330,
    meaning: "लक्ष्य, अनुशासन और उपलब्धि",
  },
  11: {
    name: "कुंभ",
    symbol: "♒",
    centerDeg: 300,
    meaning: "नवाचार, समाज और भविष्य दृष्टि",
  },
  12: {
    name: "मीन",
    symbol: "♓",
    centerDeg: 270,
    meaning: "कल्पना, करुणा और आध्यात्मिकता",
  },
});

const SIGN_ORDER = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

const PLANET_META = Object.freeze({
  sun: {
    symbol: "☉",
    label: "सूर्य",
    color: "#f97316",
    meaning: "आत्मविश्वास, पहचान और जीवन-दिशा",
  },
  moon: {
    symbol: "☽",
    label: "चंद्र",
    color: "#7c7c9b",
    meaning: "मन, भावनाएं और मानसिक स्थिरता",
  },
  mars: {
    symbol: "♂",
    label: "मंगल",
    color: "#dc2626",
    meaning: "ऊर्जा, साहस और कार्रवाई",
  },
  mercury: {
    symbol: "☿",
    label: "बुध",
    color: "#16a34a",
    meaning: "तर्क, संचार, विचार और निर्णय क्षमता",
  },
  jupiter: {
    symbol: "♃",
    label: "गुरु",
    color: "#d97706",
    meaning: "ज्ञान, विस्तार, विश्वास और मार्गदर्शन",
  },
  venus: {
    symbol: "♀",
    label: "शुक्र",
    color: "#d946ef",
    meaning: "प्रेम, सौंदर्य, आकर्षण और सामंजस्य",
  },
  saturn: {
    symbol: "♄",
    label: "शनि",
    color: "#2563eb",
    meaning: "अनुशासन, धैर्य, जिम्मेदारी और कर्म",
  },
  rahu: {
    symbol: "☊",
    label: "राहु",
    color: "#991b1b",
    meaning: "भौतिक महत्वाकांक्षा और असामान्य अनुभव",
  },
  ketu: {
    symbol: "☋",
    label: "केतु",
    color: "#7f1d1d",
    meaning: "आंतरिक मुक्ति, वैराग्य और आध्यात्मिक सीख",
  },
  uranus: {
    symbol: "♅",
    label: "यूरेनस",
    color: "#6d28d9",
    meaning: "अचानक बदलाव और मौलिक सोच",
  },
  neptune: {
    symbol: "♆",
    label: "नेपच्यून",
    color: "#0f766e",
    meaning: "कल्पना, रहस्य और अंतर्ज्ञान",
  },
  pluto: {
    symbol: "♇",
    label: "प्लूटो",
    color: "#334155",
    meaning: "गहरा परिवर्तन और पुनर्जन्म",
  },
  ascendant: {
    symbol: "लग",
    label: "लग्न",
    color: "#111827",
    meaning: "आपकी व्यक्तित्व शैली और बाहरी अभिव्यक्ति",
  },
});

const PLANET_ALIASES = Object.freeze({
  su: "sun",
  sun: "sun",
  solar: "sun",
  mo: "moon",
  moon: "moon",
  lu: "moon",
  ma: "mars",
  mars: "mars",
  me: "mercury",
  mercury: "mercury",
  budh: "mercury",
  ju: "jupiter",
  jupiter: "jupiter",
  guru: "jupiter",
  ve: "venus",
  venus: "venus",
  shukra: "venus",
  sa: "saturn",
  saturn: "saturn",
  shani: "saturn",
  ra: "rahu",
  rahu: "rahu",
  ke: "ketu",
  ketu: "ketu",
  ur: "uranus",
  uranus: "uranus",
  ne: "neptune",
  neptune: "neptune",
  pl: "pluto",
  pluto: "pluto",
  asc: "ascendant",
  as: "ascendant",
  lagna: "ascendant",
  ascendant: "ascendant",
});

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeDegreeWithinSign(value) {
  const safe = toNumber(value, 0);
  return ((safe % 30) + 30) % 30;
}

function distributeWithinSign(planetsInSign, minSpacing = 3.8) {
  const sorted = [...planetsInSign].sort(
    (a, b) => a.degreeInSign - b.degreeInSign,
  );

  if (sorted.length <= 1) {
    return sorted.map((planet) => ({
      ...planet,
      slotDegree: planet.degreeInSign,
    }));
  }

  const maxWithSpacing = Math.floor(30 / minSpacing) + 1;
  let slotDegrees = [];

  if (sorted.length > maxWithSpacing) {
    const step = 30 / (sorted.length - 1);
    slotDegrees = sorted.map((_, index) => index * step);
  } else {
    sorted.forEach((planet, index) => {
      const desired = clamp(planet.degreeInSign, 0, 30);
      if (index === 0) {
        slotDegrees.push(desired);
        return;
      }

      const previous = slotDegrees[index - 1];
      slotDegrees.push(Math.max(desired, previous + minSpacing));
    });

    const overflow = slotDegrees[slotDegrees.length - 1] - 30;
    if (overflow > 0) {
      slotDegrees = slotDegrees.map((value) => value - overflow);
    }

    if (slotDegrees[0] < 0) {
      const shift = -slotDegrees[0];
      slotDegrees = slotDegrees.map((value) => value + shift);
    }
  }

  return sorted.map((planet, index) => ({
    ...planet,
    slotDegree: clamp(slotDegrees[index], 0, 30),
  }));
}

function toPolarPoint(center, radius, degFromTopClockwise) {
  const radians = ((degFromTopClockwise - 90) * Math.PI) / 180;
  return {
    x: center + Math.cos(radians) * radius,
    y: center + Math.sin(radians) * radius,
  };
}

function normalizePlanetKey(name) {
  const normalized = String(name || "")
    .trim()
    .toLowerCase();

  return PLANET_ALIASES[normalized] || normalized;
}

function formatDegree(degreeValue) {
  const safe = toNumber(degreeValue, 0);
  const degree = Math.floor(safe);
  const minute = Math.round((safe - degree) * 60);
  const clampedMinute = minute === 60 ? 0 : minute;
  const carry = minute === 60 ? 1 : 0;

  return `${String(degree + carry).padStart(2, "0")}°${String(clampedMinute).padStart(2, "0")}'`;
}

function signCenter(sign) {
  return SIGN_META[sign]?.centerDeg ?? 0;
}

export default function ZodiacWheelChart({
  planets = [],
  ascendantSign = null,
  size = 760,
}) {
  const center = size / 2;
  const outerRadius = size * 0.46;
  const signRingRadius = size * 0.402;
  const planetRingRadius = size * 0.322;
  const centerCircleRadius = size * 0.17;
  const innerCircleRadius = size * 0.338;
  const signGlyphRadius = size * 0.445;
  const signNameRadius = size * 0.405;

  const resolvedAscendant = useMemo(() => {
    const fromProp = toNumber(ascendantSign, null);
    if (fromProp >= 1 && fromProp <= 12) {
      return fromProp;
    }

    const ascendantFromPlanets = planets.find((planet) => {
      const key = normalizePlanetKey(planet?.name);
      return key === "ascendant";
    });

    const sign = toNumber(ascendantFromPlanets?.sign, 1);
    return sign >= 1 && sign <= 12 ? sign : 1;
  }, [ascendantSign, planets]);

  const normalizedPlanets = useMemo(
    () =>
      planets
        .map((planet, index) => {
          const sign = toNumber(planet?.sign, null);
          if (!(sign >= 1 && sign <= 12)) {
            return null;
          }

          const key = normalizePlanetKey(planet?.name);
          const fallbackLabel = String(planet?.name || "")
            .trim()
            .toUpperCase();
          const meta = PLANET_META[key] || {
            symbol: fallbackLabel.slice(0, 2) || "--",
            label: fallbackLabel || "ग्रह",
            color: "#111827",
            meaning: "इस ग्रह का प्रभाव संबंधित भाव और राशि पर सक्रिय रहता है।",
          };

          return {
            id: `${key}-${index}`,
            key,
            label: meta.label,
            symbol: meta.symbol,
            color: meta.color,
            meaning: meta.meaning,
            sign,
            degree: toNumber(
              planet?.normDegree,
              toNumber(planet?.fullDegree, toNumber(planet?.degree, 0)),
            ),
            degreeInSign: normalizeDegreeWithinSign(
              toNumber(
                planet?.normDegree,
                toNumber(planet?.fullDegree, toNumber(planet?.degree, 0)),
              ),
            ),
            isRetrograde: Boolean(planet?.isRetro),
          };
        })
        .filter(Boolean),
    [planets],
  );

  const planetLayout = useMemo(() => {
    const groupedBySign = Object.fromEntries(
      SIGN_ORDER.map((sign) => [sign, []]),
    );

    normalizedPlanets.forEach((planet) => {
      groupedBySign[planet.sign].push(planet);
    });

    const layout = [];

    SIGN_ORDER.forEach((sign) => {
      const distributed = distributeWithinSign(groupedBySign[sign] || []);
      distributed.forEach((planet, index) => {
        const angle = (255 - ((sign - 1) * 30 + planet.slotDegree) + 360) % 360;
        const lane = Math.floor(index / 4);
        const row = index % 4;
        const markerRadius = planetRingRadius - lane * (size * 0.052);
        const labelRadius =
          markerRadius + size * 0.064 + (row % 2 === 0 ? 0 : size * 0.014);
        const labelAngle = angle + (row % 2 === 0 ? -1.3 : 1.3);

        layout.push({
          ...planet,
          angle,
          markerRadius,
          labelRadius,
          labelAngle,
        });
      });
    });

    return layout;
  }, [normalizedPlanets, planetRingRadius, size]);

  const highlightedPlanet = useMemo(() => {
    return (
      normalizedPlanets.find((planet) => planet.key === "mercury") ||
      normalizedPlanets.find((planet) => planet.key === "moon") ||
      normalizedPlanets.find((planet) => planet.key === "sun") ||
      normalizedPlanets[0] ||
      null
    );
  }, [normalizedPlanets]);

  const highlightedSign = highlightedPlanet
    ? SIGN_META[highlightedPlanet.sign]
    : SIGN_META[resolvedAscendant];

  const centerDateText = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
    [],
  );

  const boundaryAngles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => (255 - index * 30 + 360) % 360),
    [],
  );

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "#f6f6f6",
          border: "1px solid #d9d9d9",
          borderRadius: "12px",
          padding: "12px",
        }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="ग्रहों की वृत्ताकार स्थिति"
          style={{
            width: "100%",
            maxWidth: "980px",
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        >
          <rect x="0" y="0" width={size} height={size} fill="#f6f6f6" />

          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="#f8f8f8"
            stroke="#111111"
            strokeWidth="2.2"
          />

          <circle
            cx={center}
            cy={center}
            r={signRingRadius}
            fill="#efefef"
            stroke="#111111"
            strokeWidth="1.4"
          />

          <circle
            cx={center}
            cy={center}
            r={innerCircleRadius}
            fill="#f8f8f8"
            stroke="#1f1f1f"
            strokeWidth="1"
          />

          {boundaryAngles.map((angle) => {
            const edge = toPolarPoint(center, outerRadius, angle);
            return (
              <line
                key={`boundary-${angle}`}
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                stroke="#111111"
                strokeWidth="1.3"
              />
            );
          })}

          {SIGN_ORDER.map((sign) => {
            const meta = SIGN_META[sign];
            const angle = signCenter(sign);
            const glyphPoint = toPolarPoint(center, signGlyphRadius, angle);
            const namePoint = toPolarPoint(center, signNameRadius, angle);

            return (
              <g key={`sign-${sign}`}>
                <text
                  x={glyphPoint.x}
                  y={glyphPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Segoe UI Symbol', 'Noto Sans Symbols 2', sans-serif"
                  fontSize={size * 0.06}
                  fill="#101010"
                >
                  {meta.symbol}
                </text>

                <text
                  x={namePoint.x}
                  y={namePoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
                  fontSize={size * 0.024}
                  fill="#111827"
                  fontWeight="700"
                >
                  {meta.name}
                </text>
              </g>
            );
          })}

          {planetLayout.map((planet) => {
            const markerPoint = toPolarPoint(
              center,
              planet.markerRadius,
              planet.angle,
            );
            const labelPoint = toPolarPoint(
              center,
              planet.labelRadius,
              planet.labelAngle,
            );

            return (
              <g key={planet.id}>
                <line
                  x1={markerPoint.x}
                  y1={markerPoint.y}
                  x2={labelPoint.x}
                  y2={labelPoint.y}
                  stroke={planet.color}
                  strokeWidth="1"
                  opacity="0.6"
                />

                <circle
                  cx={markerPoint.x}
                  cy={markerPoint.y}
                  r={size * 0.023}
                  fill="#ffffff"
                  stroke={planet.color}
                  strokeWidth="1.8"
                />

                <text
                  x={markerPoint.x}
                  y={markerPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Segoe UI Symbol', 'Noto Sans Symbols 2', sans-serif"
                  fontSize={size * 0.034}
                  fill={planet.color}
                  fontWeight="700"
                >
                  {planet.symbol}
                </text>

                {planet.isRetrograde ? (
                  <text
                    x={markerPoint.x + size * 0.02}
                    y={markerPoint.y - size * 0.016}
                    textAnchor="start"
                    dominantBaseline="middle"
                    fontFamily="'Poppins', sans-serif"
                    fontSize={size * 0.018}
                    fill="#b91c1c"
                    fontWeight="700"
                  >
                    ℞
                  </text>
                ) : null}

                <rect
                  x={labelPoint.x - size * 0.05}
                  y={labelPoint.y - size * 0.0175}
                  width={size * 0.1}
                  height={size * 0.035}
                  rx={size * 0.008}
                  fill="#ffffff"
                  stroke={planet.color}
                  strokeWidth="0.9"
                  opacity="0.95"
                />

                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Poppins', sans-serif"
                  fontSize={size * 0.02}
                  fill="#0f172a"
                  fontWeight="700"
                >
                  {formatDegree(planet.degreeInSign)}
                </text>
              </g>
            );
          })}

          <circle
            cx={center}
            cy={center}
            r={centerCircleRadius}
            fill="#f8f8f8"
            stroke="#191919"
            strokeWidth="1.5"
          />

          <text
            x={center}
            y={center - size * 0.04}
            textAnchor="middle"
            fontFamily="'Poppins', sans-serif"
            fontSize={size * 0.043}
            fill="#0f172a"
            fontWeight="700"
          >
            ग्रह विवरण
          </text>

          <text
            x={center}
            y={center + size * 0.005}
            textAnchor="middle"
            fontFamily="'Poppins', sans-serif"
            fontSize={size * 0.027}
            fill="#1f2937"
            fontWeight="600"
          >
            (Planetary Positions)
          </text>

          <text
            x={center}
            y={center + size * 0.048}
            textAnchor="middle"
            fontFamily="'Poppins', sans-serif"
            fontSize={size * 0.023}
            fill="#374151"
            fontWeight="500"
          >
            {centerDateText}
          </text>

          <text
            x={center}
            y={center + size * 0.085}
            textAnchor="middle"
            fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
            fontSize={size * 0.022}
            fill="#7f1d1d"
            fontWeight="700"
          >
            लग्न: {SIGN_META[resolvedAscendant]?.name}
          </text>
        </svg>
      </div>

      <aside
        style={{
          width: "100%",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "14px 16px",
          fontFamily: "'Poppins', sans-serif",
          color: "#111827",
          boxShadow: "0 6px 18px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h4
          style={{
            margin: "0 0 10px",
            fontSize: "1.08rem",
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          ग्रह विवरण (Planetary Positions)
        </h4>

        {highlightedPlanet ? (
          <>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: "0.95rem",
                lineHeight: 1.45,
              }}
            >
              <strong>{highlightedPlanet.label} = </strong>
              {highlightedPlanet.meaning}
            </p>
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "0.95rem",
                lineHeight: 1.45,
              }}
            >
              <strong>{highlightedSign?.name} = </strong>
              {highlightedSign?.meaning}
            </p>
          </>
        ) : (
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "0.92rem",
              lineHeight: 1.45,
            }}
          >
            ग्रहों का विवरण दिखाने के लिए डेटा का इंतजार है।
          </p>
        )}

        <div
          style={{
            borderTop: "1px dashed #d1d5db",
            paddingTop: "10px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "0.82rem",
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
            }}
          >
            Live Planet Markers
          </p>

          <ul
            style={{
              margin: 0,
              padding: "0 0 0 18px",
              display: "block",
              gap: "7px",
              columnCount: normalizedPlanets.length > 8 ? 2 : 1,
              columnGap: "18px",
            }}
          >
            {normalizedPlanets.map((planet) => (
              <li
                key={`legend-${planet.id}`}
                style={{
                  fontSize: "0.89rem",
                  lineHeight: 1.35,
                  breakInside: "avoid",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: planet.color, fontWeight: 700 }}>
                  {planet.symbol}
                </span>{" "}
                {planet.label} - {SIGN_META[planet.sign]?.name} (
                {formatDegree(planet.degreeInSign)})
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
