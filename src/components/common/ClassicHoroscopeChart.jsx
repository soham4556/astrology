import { useMemo } from "react";

const SIGN_NAMES = Object.freeze({
  1: "मेष",
  2: "वृषभ",
  3: "मिथुन",
  4: "कर्क",
  5: "सिंह",
  6: "कन्या",
  7: "तुला",
  8: "वृश्चिक",
  9: "धनु",
  10: "मकर",
  11: "कुंभ",
  12: "मीन",
});

const PLANET_CODES = Object.freeze({
  sun: "सू",
  moon: "चं",
  mars: "मं",
  mercury: "बु",
  jupiter: "गु",
  venus: "शु",
  saturn: "श",
  rahu: "रा",
  ketu: "के",
  ascendant: "ल",
  asc: "ल",
});

const DEVANAGARI_DIGITS = Object.freeze({
  0: "०",
  1: "१",
  2: "२",
  3: "३",
  4: "४",
  5: "५",
  6: "६",
  7: "७",
  8: "८",
  9: "९",
});

const HOUSE_LAYOUT = Object.freeze({
  12: { x: 0, y: 0, w: 250, h: 180 },
  1: { x: 250, y: 0, w: 250, h: 180 },
  2: { x: 500, y: 0, w: 250, h: 180 },
  3: { x: 750, y: 0, w: 250, h: 180 },
  4: { x: 750, y: 180, w: 250, h: 180 },
  5: { x: 750, y: 360, w: 250, h: 180 },
  6: { x: 750, y: 540, w: 250, h: 180 },
  7: { x: 500, y: 540, w: 250, h: 180 },
  8: { x: 250, y: 540, w: 250, h: 180 },
  9: { x: 0, y: 540, w: 250, h: 180 },
  10: { x: 0, y: 360, w: 250, h: 180 },
  11: { x: 0, y: 180, w: 250, h: 180 },
});

function normalizePlanetCode(name) {
  const raw = String(name || "").trim();
  const key = raw.toLowerCase();
  if (PLANET_CODES[key]) {
    return PLANET_CODES[key];
  }

  if (raw.length <= 2) {
    return raw.toUpperCase();
  }

  return raw.slice(0, 2);
}

function toRoundedDegree(planet) {
  const value =
    Number(planet?.normDegree) ||
    Number(planet?.degree) ||
    Number(planet?.fullDegree) ||
    0;

  return Math.round(value);
}

function toDevanagariNumber(value) {
  return String(value)
    .split("")
    .map((char) => DEVANAGARI_DIGITS[char] || char)
    .join("");
}

function toPlanetLine(planet) {
  const code = normalizePlanetCode(planet?.name);
  const degree = toDevanagariNumber(toRoundedDegree(planet));
  const isRetrograde = String(planet?.isRetro || "").toLowerCase() === "true";
  return `${code} - ${degree} अंश${isRetrograde ? " व" : ""}`;
}

export default function ClassicHoroscopeChart({
  planets = [],
  ascendantSign = null,
}) {
  const signPlanets = useMemo(() => {
    const map = {};
    for (let sign = 1; sign <= 12; sign += 1) {
      map[sign] = [];
    }

    planets.forEach((planet) => {
      const sign = Number(planet?.sign);
      if (sign >= 1 && sign <= 12) {
        map[sign].push(planet);
      }
    });

    return map;
  }, [planets]);

  const houseBySign = useMemo(() => {
    const map = {};

    const asc = Number(ascendantSign);
    if (!(asc >= 1 && asc <= 12)) {
      return map;
    }

    for (let sign = 1; sign <= 12; sign += 1) {
      map[sign] = ((sign - asc + 12) % 12) + 1;
    }

    return map;
  }, [ascendantSign]);

  return (
    <svg
      viewBox="0 0 1000 720"
      role="img"
      aria-label="पारंपरिक कुंडली चार्ट"
      style={{
        width: "100%",
        height: "auto",
        display: "block",
        background: "#f7f5f2",
      }}
    >
      <rect
        x="0"
        y="0"
        width="1000"
        height="720"
        fill="#f7f5f2"
        stroke="#111"
        strokeWidth="4"
      />

      {Object.entries(HOUSE_LAYOUT).map(([signKey, box]) => {
        const sign = Number(signKey);
        const house = houseBySign[sign];
        const signName = SIGN_NAMES[sign] || "";
        const items = signPlanets[sign] || [];

        return (
          <g key={sign}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill="#f9f8f5"
              stroke="#111"
              strokeWidth="3"
            />

            <text
              x={box.x + 10}
              y={box.y + 28}
              fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
              fontSize="34"
              fill="#111"
              fontWeight="700"
            >
              {signName}
            </text>

            <text
              x={box.x + box.w - 18}
              y={box.y + 42}
              textAnchor="end"
              fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
              fontSize="54"
              fill="#111"
            >
              {house ? toDevanagariNumber(house) : "-"}
            </text>

            {items.slice(0, 3).map((planet, index) => (
              <text
                key={`${sign}-${index}`}
                x={box.x + 16}
                y={box.y + 84 + index * 34}
                fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
                fontSize="35"
                fill="#111"
                fontWeight="700"
              >
                {toPlanetLine(planet)}
              </text>
            ))}
          </g>
        );
      })}

      <rect
        x="250"
        y="180"
        width="500"
        height="360"
        fill="#f7f5f2"
        stroke="#111"
        strokeWidth="3"
      />

      <rect
        x="345"
        y="305"
        width="310"
        height="110"
        fill="#fbfaf7"
        stroke="#111"
        strokeWidth="2"
      />
      <text
        x="365"
        y="334"
        fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
        fontSize="24"
        fontWeight="700"
        fill="#111"
      >
        ग्रह संकेत
      </text>
      <text
        x="365"
        y="364"
        fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
        fontSize="20"
        fill="#111"
      >
        सू सूर्य चं चंद्र मं मंगल बु बुध
      </text>
      <text
        x="365"
        y="388"
        fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
        fontSize="20"
        fill="#111"
      >
        गु गुरु शु शुक्र श शनि
      </text>
      <text
        x="365"
        y="412"
        fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
        fontSize="20"
        fill="#111"
      >
        रा राहु के केतु ल लग्न
      </text>
    </svg>
  );
}
