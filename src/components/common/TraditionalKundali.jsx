import { useMemo } from "react";

/**
 * TraditionalKundaliEnhanced - Sacred Lotus Edition
 * Renders North Indian (Sacred Lotus) or South Indian style charts
 * with traditional Sanskrit abbreviations and premium aesthetics.
 */
export default function TraditionalKundaliEnhanced({
  style = "north-indian",
  planets = [],
  ascendantSign = 1,
}) {
  // Traditional Sanskrit abbreviations with '०'
  const TRADITIONAL_NAMES = {
    Su: "सू०", // Surya
    Mo: "चं०", // Chandra
    Ma: "मं०", // Mangal
    Me: "बु०", // Budh
    Ju: "वृ०", // Guru/Vrihaspati
    Ve: "शु०", // Shukra
    Sa: "श०", // Shani
    Ra: "रा०", // Rahu
    Ke: "के०", // Ketu
    As: "ल०", // Lagna
  };

  // Devanagari numerals for signs
  const DEVANAGARI_NUMS = {
    1: "१",
    2: "२",
    3: "३",
    4: "४",
    5: "५",
    6: "६",
    7: "७",
    8: "८",
    9: "९",
    10: "१०",
    11: "११",
    12: "१२",
  };

  const SIGN_NAMES_HI = {
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
  };

  const SOUTH_SIGN_POSITIONS = [
    { sign: 1, row: 0, col: 0 },
    { sign: 2, row: 0, col: 1 },
    { sign: 3, row: 0, col: 2 },
    { sign: 4, row: 0, col: 3 },
    { sign: 5, row: 1, col: 3 },
    { sign: 6, row: 2, col: 3 },
    { sign: 7, row: 3, col: 3 },
    { sign: 8, row: 3, col: 2 },
    { sign: 9, row: 3, col: 1 },
    { sign: 10, row: 3, col: 0 },
    { sign: 11, row: 2, col: 0 },
    { sign: 12, row: 1, col: 0 },
  ];

  const normalizedAscendantSign = useMemo(() => {
    const parsed = Number(ascendantSign);
    return Number.isFinite(parsed) && parsed >= 1 && parsed <= 12 ? parsed : 1;
  }, [ascendantSign]);

  const getTraditionalName = (name = "") => {
    const short = String(name).substring(0, 2);
    return TRADITIONAL_NAMES[short] || TRADITIONAL_NAMES[name] || short || name;
  };

  // Group planets by house (1-12)
  const planetsInHouses = useMemo(() => {
    const map = {};
    for (let i = 1; i <= 12; i++) map[i] = [];

    planets.forEach((p) => {
      const sName = getTraditionalName(p.name);
      if (p.house >= 1 && p.house <= 12) {
        map[p.house].push(sName);
      }
    });

    if (!map[1].includes("ल०")) {
      map[1].unshift("ल०");
    }

    return map;
  }, [planets]);

  // Sign numbers for each house based on Ascendant
  const signsInHouses = useMemo(() => {
    const map = {};
    for (let h = 1; h <= 12; h++) {
      let sign = (normalizedAscendantSign + h - 1) % 12;
      if (sign === 0) sign = 12;
      map[h] = sign;
    }
    return map;
  }, [normalizedAscendantSign]);

  const houseBySign = useMemo(() => {
    const map = {};
    for (let house = 1; house <= 12; house++) {
      map[signsInHouses[house]] = house;
    }
    return map;
  }, [signsInHouses]);

  const planetsInSigns = useMemo(() => {
    const map = {};
    for (let sign = 1; sign <= 12; sign++) {
      map[sign] = [];
    }

    planets.forEach((planet) => {
      const directSign = Number(planet?.sign);
      const fallbackSign = Number(signsInHouses[planet?.house]);
      const sign =
        Number.isFinite(directSign) && directSign >= 1 && directSign <= 12
          ? directSign
          : Number.isFinite(fallbackSign) &&
              fallbackSign >= 1 &&
              fallbackSign <= 12
            ? fallbackSign
            : null;

      if (sign) {
        map[sign].push(getTraditionalName(planet?.name));
      }
    });

    if (!map[normalizedAscendantSign].includes("ल०")) {
      map[normalizedAscendantSign].unshift("ल०");
    }

    return map;
  }, [planets, signsInHouses, normalizedAscendantSign]);

  if (style === "north-indian") {
    return (
      <svg
        viewBox="0 0 500 500"
        className="traditional-chart north-indian sacred-lotus"
      >
        <defs>
          <style>{`
            @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@700&family=Poppins:wght@600;700&display=swap");
            .num-devanagari { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 20px; font-weight: 700; fill: #ff3300; }
            .planet-devanagari { font-family: 'Noto Sans Devanagari', sans-serif; font-size: 18px; font-weight: 700; fill: #1a365d; }
            .lotus-lobe { fill: #fffef0; stroke: #ff3300; stroke-width: 2.5; }
            .outer-frame { fill: #ffcc00; }
          `}</style>
          <clipPath id="centerCircle">
            <circle cx="250" cy="250" r="90" />
          </clipPath>
        </defs>

        {/* Outer Background Frame */}
        <rect
          x="0"
          y="0"
          width="500"
          height="500"
          className="outer-frame"
          rx="15"
        />

        {/* Main Sacred Lobe Geometry */}
        {/* We use a combination of curves to create the lotus-like boundary */}
        <path
          d="M 50,50 Q 250,15 450,50 Q 485,250 450,450 Q 250,485 50,450 Q 15,250 50,50 Z"
          className="lotus-lobe"
        />

        {/* Diagonal Cross Lines (Traditional Layout) */}
        <line
          x1="50"
          y1="50"
          x2="450"
          y2="450"
          stroke="#ff3300"
          strokeWidth="2"
        />
        <line
          x1="450"
          y1="50"
          x2="50"
          y2="450"
          stroke="#ff3300"
          strokeWidth="2"
        />

        {/* Inner Diamond connections */}
        <line
          x1="250"
          y1="35"
          x2="50"
          y2="250"
          stroke="#ff3300"
          strokeWidth="2"
        />
        <line
          x1="50"
          y1="250"
          x2="250"
          y2="465"
          stroke="#ff3300"
          strokeWidth="2"
        />
        <line
          x1="250"
          y1="465"
          x2="450"
          y2="250"
          stroke="#ff3300"
          strokeWidth="2"
        />
        <line
          x1="450"
          y1="250"
          x2="250"
          y2="35"
          stroke="#ff3300"
          strokeWidth="2"
        />

        {/* Center Mandala with Ganesha */}
        <circle
          cx="250"
          cy="250"
          r="100"
          fill="#fffef0"
          stroke="#ffcc00"
          strokeWidth="15"
          opacity="0.4"
        />
        <circle
          cx="250"
          cy="250"
          r="92"
          fill="none"
          stroke="#ff3300"
          strokeWidth="2"
          strokeDasharray="5 3"
        />

        <image
          href="/assets/ganesha.png"
          x="160"
          y="160"
          width="180"
          height="180"
          clipPath="url(#centerCircle)"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />

        {/* House Sign Numbers & Planets */}

        {/* House 1: Lagna (Top Center) */}
        <text x="250" y="125" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[1]]}
        </text>
        <Planets x={250} y={155} list={planetsInHouses[1]} />

        {/* House 2: Top Left */}
        <text x="160" y="105" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[2]]}
        </text>
        <Planets x={110} y={90} list={planetsInHouses[2]} />

        {/* House 3: Left Top Corner */}
        <text x="105" y="160" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[3]]}
        </text>
        <Planets x={85} y={140} list={planetsInHouses[3]} />

        {/* House 4: Center Left */}
        <text x="125" y="250" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[4]]}
        </text>
        <Planets x={155} y={250} list={planetsInHouses[4]} vertical />

        {/* House 5: Left Bottom Corner */}
        <text x="105" y="340" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[5]]}
        </text>
        <Planets x={85} y={360} list={planetsInHouses[5]} />

        {/* House 6: Bottom Left */}
        <text x="160" y="395" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[6]]}
        </text>
        <Planets x={110} y={410} list={planetsInHouses[6]} />

        {/* House 7: Bottom Center */}
        <text x="250" y="375" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[7]]}
        </text>
        <Planets x={250} y={345} list={planetsInHouses[7]} />

        {/* House 8: Bottom Right */}
        <text x="340" y="395" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[8]]}
        </text>
        <Planets x={390} y={410} list={planetsInHouses[8]} />

        {/* House 9: Right Bottom Corner */}
        <text x="395" y="340" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[9]]}
        </text>
        <Planets x={415} y={360} list={planetsInHouses[9]} />

        {/* House 10: Center Right */}
        <text x="375" y="250" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[10]]}
        </text>
        <Planets x={345} y={250} list={planetsInHouses[10]} vertical />

        {/* House 11: Right Top Corner */}
        <text x="395" y="160" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[11]]}
        </text>
        <Planets x={415} y={140} list={planetsInHouses[11]} />

        {/* House 12: Top Right */}
        <text x="340" y="105" textAnchor="middle" className="num-devanagari">
          {DEVANAGARI_NUMS[signsInHouses[12]]}
        </text>
        <Planets x={390} y={90} list={planetsInHouses[12]} />
      </svg>
    );
  }

  // South Indian style (fixed zodiac layout)
  const start = 20;
  const cell = 115;
  const centerStart = start + cell;
  const centerSize = cell * 2;

  return (
    <svg viewBox="0 0 500 500" className="traditional-chart south-indian">
      <defs>
        <style>{`
          @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@600;700&display=swap");
          .south-sign {
            font-family: 'Noto Sans Devanagari', sans-serif;
            font-size: 14px;
            font-weight: 700;
            fill: #8b4513;
          }
          .south-num {
            font-family: 'Noto Sans Devanagari', sans-serif;
            font-size: 15px;
            font-weight: 700;
            fill: #c41e3a;
          }
          .south-house {
            font-family: 'Noto Sans Devanagari', sans-serif;
            font-size: 12px;
            font-weight: 700;
            fill: #1a365d;
          }
          .south-planet {
            font-family: 'Noto Sans Devanagari', sans-serif;
            font-size: 14px;
            font-weight: 700;
            fill: #2f4858;
          }
        `}</style>
      </defs>

      <rect
        x="10"
        y="10"
        width="480"
        height="480"
        fill="#fffdf8"
        stroke="#8b4513"
        strokeWidth="3"
      />

      {SOUTH_SIGN_POSITIONS.map(({ sign, row, col }) => {
        const x = start + col * cell;
        const y = start + row * cell;
        const house = houseBySign[sign];
        const signPlanets = planetsInSigns[sign] || [];

        return (
          <g key={`south-sign-${sign}`}>
            <rect
              x={x}
              y={y}
              width={cell}
              height={cell}
              fill="#fffaf0"
              stroke="#8b4513"
              strokeWidth="2"
            />
            <text x={x + 8} y={y + 20} className="south-sign">
              {SIGN_NAMES_HI[sign]}
            </text>
            <text
              x={x + cell - 8}
              y={y + 20}
              textAnchor="end"
              className="south-num"
            >
              {DEVANAGARI_NUMS[sign]}
            </text>
            {house ? (
              <text
                x={x + cell - 8}
                y={y + cell - 8}
                textAnchor="end"
                className="south-house"
              >
                भ{DEVANAGARI_NUMS[house]}
              </text>
            ) : null}
            {signPlanets.slice(0, 4).map((planetName, index) => (
              <text
                key={`${sign}-${index}`}
                x={x + 10}
                y={y + 44 + index * 17}
                className="south-planet"
              >
                {planetName}
              </text>
            ))}
          </g>
        );
      })}

      <rect
        x={centerStart}
        y={centerStart}
        width={centerSize}
        height={centerSize}
        fill="#fff7e6"
        stroke="#d4af37"
        strokeWidth="2"
      />
      <line
        x1={centerStart}
        y1={centerStart}
        x2={centerStart + centerSize}
        y2={centerStart + centerSize}
        stroke="#e2b14c"
        strokeWidth="1.5"
      />
      <line
        x1={centerStart + centerSize}
        y1={centerStart}
        x2={centerStart}
        y2={centerStart + centerSize}
        stroke="#e2b14c"
        strokeWidth="1.5"
      />
      <text
        x="250"
        y="238"
        textAnchor="middle"
        className="south-sign"
        style={{ fontSize: "16px" }}
      >
        दक्षिण भारतीय
      </text>
      <text
        x="250"
        y="262"
        textAnchor="middle"
        className="south-sign"
        style={{ fontSize: "16px" }}
      >
        जन्मपत्री चक्र
      </text>
    </svg>
  );
}

function Planets({ x, y, list, vertical = false }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {list.map((p, i) => (
        <text
          key={i}
          x={vertical ? 0 : i % 2 === 0 ? -12 : 12}
          y={
            vertical ? i * 20 - (list.length - 1) * 10 : Math.floor(i / 2) * 20
          }
          textAnchor="middle"
          dominantBaseline="middle"
          className="planet-devanagari"
          fill={p.includes("ल") ? "#ff3300" : "#1a365d"}
        >
          {p}
        </text>
      ))}
    </g>
  );
}
