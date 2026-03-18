import { useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import { getCurrentVdasha } from "../api/astrologyApi";
import { useLanguage } from "../hooks/useLanguage";

const DashaLevel = ({ title, dasha, level = 0 }) => {
  if (!dasha) return null;

  return (
    <div className={`dasha-level level-${level}`}>
      <div className="dasha-header">
        <span className="planet-icon">❂</span>
        <span className="planet-name">{dasha.planet}</span>
        <span className="dasha-dates">
          {dasha.start} — {dasha.end}
        </span>
      </div>
      {dasha.child && (
        <div className="dasha-children">
          <DashaLevel dasha={dasha.child} title="Next Level" level={level + 1} />
        </div>
      )}
    </div>
  );
};

const DASHA_LEVEL_MAP = {
  'major': 'महादशा',
  'minor': 'अंतर्दशा',
  'sub_minor': 'प्रत्यंतर दशा',
  'sub_sub_minor': 'सूक्ष्म दशा',
  'sub_sub_sub_minor': 'प्राण दशा'
};

const DASHA_LEVEL_MAP_EN = {
  'major': 'Mahadasha',
  'minor': 'Antardasha',
  'sub_minor': 'Pratyantar Dasha',
  'sub_sub_minor': 'Sukshma Dasha',
  'sub_sub_sub_minor': 'Pran Dasha'
};

function normalizeDashaData(payload, language = 'en') {
  if (!payload) return [];
  const data = payload?.data || payload?.output || payload;
  
  if (Array.isArray(data)) return data;

  const levelKeys = ['major', 'minor', 'sub_minor', 'sub_sub_minor', 'sub_sub_sub_minor'];
  const levels = [];
  
  levelKeys.forEach((key, index) => {
    if (data[key]) {
      const translatedName = language === 'hi' ? DASHA_LEVEL_MAP[key] : DASHA_LEVEL_MAP_EN[key];
      levels.push({
        ...data[key],
        levelName: translatedName || key.replace(/_/g, ' ').toUpperCase(),
        levelIndex: index + 1
      });
    }
  });

  return levels;
}

const DashaTable = ({ dashaData, language }) => {
  const levels = normalizeDashaData(dashaData, language);

  if (levels.length === 0) {
    return (
      <div className="no-data-msg">
        {language === 'hi' ? 'दशा जानकारी उपलब्ध नहीं है' : 'No dasha information available'}.
      </div>
    );
  }

  return (
    <div className="dasha-timeline">
      {levels.map((item, idx) => (
        <div key={idx} className="dasha-card" style={{ animationDelay: `${idx * 0.1}s` }}>
          <div className="dasha-type">{item.levelName}</div>
          <div className="dasha-main">
            <span className="planet">{item.planet}</span>
            <div className="range">
              <span className="date-chip start">{item.start}</span>
              <span className="arrow">→</span>
              <span className="date-chip end">{item.end}</span>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .dasha-timeline {
          max-width: 800px;
          margin: 40px auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: relative;
        }
        .dasha-timeline::before {
          content: '';
          position: absolute;
          left: 30px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, transparent, #f3e5ab, transparent);
        }
        .dasha-card {
          background: white;
          padding: 20px 25px 20px 60px;
          border-radius: 16px;
          border: 1px solid #f3e5ab;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
          position: relative;
          transition: transform 0.2s;
          animation: slideIn 0.5s ease forwards;
          opacity: 0;
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .dasha-card:hover { transform: translateX(10px); background: #fdfaf0; }
        .dasha-card::before {
          content: '❂';
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.5rem;
          color: #d4af37;
        }
        .dasha-type {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #8b6f47;
          margin-bottom: 8px;
          font-weight: 700;
        }
        .dasha-main {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .planet {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e3c72;
        }
        .range {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .date-chip {
          padding: 6px 15px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          min-width: 140px;
          text-align: center;
        }
        .date-chip.start { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
        .date-chip.end { background: #fff3e0; color: #ef6c00; border: 1px solid #ffe0b2; }
        .arrow { color: #8b6f47; font-weight: bold; }
        .no-data-msg { text-align: center; padding: 40px; color: #8b6f47; font-style: italic; }

        @media (max-width: 600px) {
          .dasha-card { padding: 15px 15px 15px 50px; }
          .planet { font-size: 1.2rem; }
          .date-chip { font-size: 0.8rem; padding: 4px 10px; min-width: auto; }
        }
      `}</style>
    </div>
  );
};

export default function DashaPage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    date: new Date().toISOString().split('T')[0],
    time: "12:00:00",
    latitude: "18.5204",
    longitude: "73.8567",
    timezone: "5.5",
  });

  const [dashaData, setDashaData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setDashaData(null);

    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, min, sec] = form.time.split(":").map(Number);

    const params = {
      day, month, year, hour, min,
      lat: parseFloat(form.latitude),
      lon: parseFloat(form.longitude),
      tzone: parseFloat(form.timezone),
    };

    try {
      const response = await getCurrentVdasha(params, { language });
      setDashaData(response.data || response);
    } catch (err) {
      setError(err.message || "दशा विवरण प्राप्त करने में विफल (Failed to get dasha details).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dasha-page-container">
      <SeoMeta
        title="Vimshottari Dasha | Pavitra Jyotish"
        description="Detailed Vimshottari Dasha analysis with planetary periods."
        path="/kundali/dasha"
      />

      <div className="sacred-header">
        <div className="sacred-icon">⏳</div>
        <h1>{language === 'hi' ? 'विमशोत्तरी दशा' : 'Vimshottari Dasha'}</h1>
        <p className="subtitle">{language === 'hi' ? 'वैदिक काल चक्र विश्लेषण' : 'Vedic Time Cycles Analysis'}</p>
      </div>

      <div className="sacred-content">
        <form onSubmit={handleSubmit} className="astro-form-card">
          <div className="form-grid">
            <div className="field">
              <label>{language === 'hi' ? 'नाम' : 'Name'}</label>
              <input type="text" placeholder={language === 'hi' ? 'नाम दर्ज करें' : 'Enter Name'} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'जन्म तिथि' : 'Date'}</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'समय' : 'Time'}</label>
              <input type="time" step="1" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'अक्षांश' : 'Lat'}</label>
              <input type="number" step="0.0001" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'देशांतर' : 'Lon'}</label>
              <input type="number" step="0.0001" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'टाइमज़ोन' : 'TZ'}</label>
              <input type="number" step="0.1" value={form.timezone} onChange={e => setForm({...form, timezone: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="sacred-btn" disabled={isLoading}>
            {isLoading ? (language === 'hi' ? "प्रक्रिया चल रही है..." : "Processing...") : (language === 'hi' ? "दशा प्राप्त करें" : "Get Dasha")}
          </button>
        </form>

        <section className="results-container">
          <ErrorMessage message={error} />
          {isLoading && <LoadingSpinner label="दशा अवधियों की गणना हो रही है..." />}

          {dashaData && !isLoading && (
            <div className="data-view-wrapper">
              <h3 className="section-subtitle">
                {language === 'hi' ? 'वर्तमान विमशोत्तरी दशा' : 'Current Vimshottari Dasha'}
              </h3>
              <DashaTable dashaData={dashaData} language={language} />
            </div>
          )}
        </section>
      </div>

      <style>{`
        .dasha-page-container {
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
        .subtitle { font-family: 'Poppins', sans-serif; color: #8b6f47; letter-spacing: 2px; text-transform: uppercase; font-size: 0.9rem; }
        
        .astro-form-card {
          background: white;
          padding: 35px;
          border-radius: 20px;
          border: 1px solid #f3e5ab;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          margin-bottom: 50px;
        }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .field label { display: block; font-weight: 600; margin-bottom: 8px; color: #1a3a52; font-size: 0.9rem; }
        .field input { width: 100%; padding: 12px; border: 1px solid #e8c78e; border-radius: 10px; font-family: 'Poppins', sans-serif; }
        
        .sacred-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .sacred-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(30, 60, 114, 0.3); }

        .section-subtitle { 
          font-family: 'Playfair Display', serif; 
          font-size: 1.8rem; 
          color: #1a3a52; 
          text-align: center; 
          margin-bottom: 25px; 
          border-bottom: 2px solid #f3e5ab;
          padding-bottom: 10px;
        }

        .data-view-wrapper { animation: fadeIn 1s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
