import { useMemo } from "react";

const HOUSE_POINTS = Object.freeze({
  1: { x: 260, y: 96 },
  2: { x: 366, y: 120 },
  3: { x: 430, y: 184 },
  4: { x: 438, y: 260 },
  5: { x: 430, y: 338 },
  6: { x: 366, y: 402 },
  7: { x: 260, y: 426 },
  8: { x: 154, y: 402 },
  9: { x: 90, y: 338 },
  10: { x: 82, y: 260 },
  11: { x: 90, y: 184 },
  12: { x: 154, y: 120 },
});

const HOUSE_LABELS_HI = Object.freeze({
  1: "लग्न",
  2: "धन",
  3: "पराक्रम",
  4: "सुख",
  5: "पुत्र",
  6: "रोग",
  7: "जाया",
  8: "आयु",
  9: "भाग्य",
  10: "कर्म",
  11: "लाभ",
  12: "व्यय",
});

const PLANET_SHORT_HI = Object.freeze({
  sun: "सू",
  moon: "चं",
  mars: "मं",
  mercury: "बु",
  jupiter: "गु",
  venus: "शु",
  saturn: "श",
  rahu: "रा",
  ketu: "के",
  ascendant: "लग्न",
  asc: "लग्न",
});

function normalizePlanetName(name) {
  const raw = String(name || "").trim();
  const key = raw.toLowerCase();

  if (PLANET_SHORT_HI[key]) {
    return PLANET_SHORT_HI[key];
  }

  if (raw.length <= 2) {
    return raw.toUpperCase();
  }

  return raw.slice(0, 2).toUpperCase();
}

function normalizePlanetLine(planet) {
  const planetName = normalizePlanetName(planet?.name);
  const degree = Number(planet?.normDegree);

  if (!Number.isFinite(degree)) {
    return planetName;
  }

  return `${planetName} ${Math.round(degree)}°`;
}

function HouseContents({ planetsByHouse, textColor = "#1a1a1a" }) {
  return (
    <g>
      {Object.entries(HOUSE_POINTS).map(([houseKey, point]) => {
        const house = Number(houseKey);
        const rows = planetsByHouse[house] || [];

        return (
          <g key={`house-${house}`}>
            <text
              x={point.x}
              y={point.y - 14}
              textAnchor="middle"
              fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
              fontSize="14"
              fontWeight="700"
              fill="#c12525"
            >
              {house}
            </text>
            <text
              x={point.x}
              y={point.y + 2}
              textAnchor="middle"
              fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
              fontSize="11"
              fontWeight="600"
              fill="#444"
            >
              {HOUSE_LABELS_HI[house]}
            </text>
            {rows.slice(0, 3).map((line, index) => (
              <text
                key={`house-${house}-line-${index}`}
                x={point.x}
                y={point.y + 20 + index * 14}
                textAnchor="middle"
                fontFamily="'Noto Sans Devanagari', 'Mangal', sans-serif"
                fontSize="12"
                fontWeight="700"
                fill={textColor}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

function NorthIndianFrame() {
  return (
    <g>
      <rect
        x="20"
        y="20"
        width="480"
        height="480"
        fill="#fffdf8"
        stroke="#222"
        strokeWidth="2.2"
      />
      <line x1="20" y1="20" x2="500" y2="500" stroke="#222" strokeWidth="1.8" />
      <line x1="500" y1="20" x2="20" y2="500" stroke="#222" strokeWidth="1.8" />
      <line x1="260" y1="20" x2="20" y2="260" stroke="#222" strokeWidth="1.5" />
      <line
        x1="260"
        y1="20"
        x2="500"
        y2="260"
        stroke="#222"
        strokeWidth="1.5"
      />
      <line
        x1="260"
        y1="500"
        x2="20"
        y2="260"
        stroke="#222"
        strokeWidth="1.5"
      />
      <line
        x1="260"
        y1="500"
        x2="500"
        y2="260"
        stroke="#222"
        strokeWidth="1.5"
      />
    </g>
  );
}

function SouthIndianFrame() {
  return (
    <g>
      <rect
        x="20"
        y="20"
        width="480"
        height="480"
        fill="#fff9ee"
        stroke="#5d4520"
        strokeWidth="2.2"
      />

      <polygon
        points="20,20 500,20 260,260"
        fill="#f5de82"
        stroke="#5d4520"
        strokeWidth="1"
      />
      <polygon
        points="500,20 500,500 260,260"
        fill="#e3c7ef"
        stroke="#5d4520"
        strokeWidth="1"
      />
      <polygon
        points="500,500 20,500 260,260"
        fill="#f5de82"
        stroke="#5d4520"
        strokeWidth="1"
      />
      <polygon
        points="20,500 20,20 260,260"
        fill="#e3c7ef"
        stroke="#5d4520"
        strokeWidth="1"
      />

      <line
        x1="20"
        y1="20"
        x2="500"
        y2="500"
        stroke="#5d4520"
        strokeWidth="1.8"
      />
      <line
        x1="500"
        y1="20"
        x2="20"
        y2="500"
        stroke="#5d4520"
        strokeWidth="1.8"
      />
      <line
        x1="260"
        y1="20"
        x2="260"
        y2="500"
        stroke="#5d4520"
        strokeWidth="1.2"
      />
      <line
        x1="20"
        y1="260"
        x2="500"
        y2="260"
        stroke="#5d4520"
        strokeWidth="1.2"
      />
      <line
        x1="260"
        y1="20"
        x2="20"
        y2="260"
        stroke="#5d4520"
        strokeWidth="1.2"
      />
      <line
        x1="260"
        y1="20"
        x2="500"
        y2="260"
        stroke="#5d4520"
        strokeWidth="1.2"
      />
      <line
        x1="260"
        y1="500"
        x2="20"
        y2="260"
        stroke="#5d4520"
        strokeWidth="1.2"
      />
      <line
        x1="260"
        y1="500"
        x2="500"
        y2="260"
        stroke="#5d4520"
        strokeWidth="1.2"
      />
    </g>
  );
}

export default function IndianKundaliChart({
  planets = [],
  styleType = "north-indian",
}) {
  const planetsByHouse = useMemo(() => {
    const map = {};
    for (let house = 1; house <= 12; house += 1) {
      map[house] = [];
    }

    planets.forEach((planet) => {
      const house = Number(planet?.house);
      if (house >= 1 && house <= 12) {
        map[house].push(normalizePlanetLine(planet));
      }
    });

    return map;
  }, [planets]);

  const isSouth = styleType === "south-indian";

  return (
    <svg
      viewBox="0 0 520 520"
      role="img"
      aria-label="भारतीय जन्मपत्री चक्र"
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      {isSouth ? <SouthIndianFrame /> : <NorthIndianFrame />}
      <HouseContents
        planetsByHouse={planetsByHouse}
        textColor={isSouth ? "#2e5137" : "#1f1f1f"}
      />
    </svg>
  );
}
