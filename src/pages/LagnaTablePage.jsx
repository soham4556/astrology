import { useState } from "react";
import ErrorMessage from "../components/common/ErrorMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SeoMeta from "../components/common/SeoMeta";
import AstroChartViewer from "../components/common/AstroChartViewer";
import { getPanchangLagnaTable, getHoroChartImageD1 } from "../api/astrologyApi";
import { useLanguage } from "../hooks/useLanguage";

const LagnaIntervalTable = ({ data, onSelectTime, selectedIndex, language }) => {
  if (!data || !Array.isArray(data)) return null;

  return (
    <div className="lagna-table-wrapper">
      <table className="sacred-lagna-table">
        <thead>
          <tr>
            <th>{language === 'hi' ? 'लग्न' : 'Lagna'}</th>
            <th>{language === 'hi' ? 'प्रारंभ समय' : 'Start Time'}</th>
            <th>{language === 'hi' ? 'समाप्ति समय' : 'End Time'}</th>
            <th>{language === 'hi' ? 'चुनें' : 'Select'}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx} className={selectedIndex === idx ? "selected-row" : ""}>
              <td className="lagna-name">
                <span className="bullet">✦</span> {item.lagna}
              </td>
              <td className="time-cell">{item.start}</td>
              <td className="time-cell">{item.end}</td>
              <td>
                <button 
                  className={`select-btn ${selectedIndex === idx ? "active" : ""}`}
                  onClick={() => onSelectTime(item.start, idx)}
                >
                  {language === 'hi' ? 'देखें' : 'View'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .lagna-table-wrapper {
          overflow-x: auto;
          margin-top: 30px;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border: 1px solid #f3e5ab;
        }
        .sacred-lagna-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          font-family: 'Poppins', sans-serif;
        }
        .sacred-lagna-table th {
          background: linear-gradient(to bottom, #1e3c72, #2a5298);
          color: white;
          padding: 18px 15px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .sacred-lagna-table td {
          padding: 15px;
          border-bottom: 1px solid #f0f2f5;
          color: #2c3e50;
          font-size: 0.85rem;
        }
        .sacred-lagna-table tr:hover { background: #fdfaf0; }
        .selected-row { background: #fff9e6 !important; }
        .lagna-name { font-weight: 700; color: #1e3c72; }
        .bullet { color: #ffcc00; margin-right: 8px; }
        .time-cell { font-family: 'Courier New', monospace; font-weight: 600; color: #d4af37; }
        
        .select-btn {
          padding: 6px 15px;
          border-radius: 20px;
          border: 1px solid #1e3c72;
          background: transparent;
          color: #1e3c72;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .select-btn:hover, .select-btn.active {
          background: #1e3c72;
          color: white;
        }

        @media (max-width: 768px) {
          .sacred-lagna-table th, .sacred-lagna-table td { padding: 12px 8px; font-size: 0.75rem; }
        }
      `}</style>
    </div>
  );
};

export default function LagnaTablePage() {
  const { language } = useLanguage();
  const [form, setForm] = useState({
    fullName: "",
    date: new Date().toISOString().split('T')[0],
    time: "12:00:00",
    latitude: "18.5204",
    longitude: "73.8567",
    timezone: "5.5",
  });

  const [lagnaData, setLagnaData] = useState([]);
  const [svgChart, setSvgChart] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setLagnaData([]);
    setSvgChart("");
    setSelectedIndex(-1);

    const [year, month, day] = form.date.split("-").map(Number);
    const [hour, min] = form.time.split(":").map(Number);

    const params = {
      day, month, year, hour, min,
      lat: parseFloat(form.latitude),
      lon: parseFloat(form.longitude),
      tzone: parseFloat(form.timezone),
    };

    try {
      // Documentation says English only for this endpoint, but we'll try to get Hindi labels elsewhere
      const response = await getPanchangLagnaTable(params, { language: 'en' });
      const data = response.data || response;
      setLagnaData(Array.isArray(data) ? data : []);
      
      // Auto-load chart for the first lagna or the search time
      if (Array.isArray(data) && data.length > 0) {
        handleSelectTime(form.time, 0);
      }
    } catch (err) {
      setError(err.message || (language === 'hi' ? "लग्न तालिका प्राप्त करने में विफल" : "Failed to get lagna table."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTime = async (timeStr, index) => {
    setSelectedIndex(index);
    setIsChartLoading(true);
    setSvgChart("");

    const [year, month, day] = form.date.split("-").map(Number);
    // timeStr might be "HH:mm:ss" or "HH:mm"
    const timeParts = timeStr.split(":").map(Number);
    const hour = timeParts[0] || 12;
    const min = timeParts[1] || 0;

    const chartParams = {
      day, month, year, hour, min,
      lat: parseFloat(form.latitude),
      lon: parseFloat(form.longitude),
      tzone: parseFloat(form.timezone),
    };

    try {
      const response = await getHoroChartImageD1(chartParams, { language });
      const payload = response.data || response;
      const svg = payload?.svg || payload?.output || response?.svg || "";
      setSvgChart(svg);
    } catch (err) {
      console.error("Failed to load chart for time:", timeStr, err);
    } finally {
      setIsChartLoading(false);
    }
  };

  return (
    <div className="lagna-page-container">
      <SeoMeta
        title={language === 'hi' ? 'लग्न तालिका और कुंडली' : 'Lagna Table & Chart'}
        description="Detailed Panchang Lagna intervals and rising sign charts."
        path="/kundali/lagna-intervals"
      />

      <div className="sacred-header">
        <div className="sacred-icon">✨</div>
        <h1>{language === 'hi' ? 'लग्न तालिका (Lagna Table)' : 'Panchang Lagna Table'}</h1>
        <p className="subtitle">{language === 'hi' ? 'दैनिक लग्न उदय समय विश्लेषण' : 'Daily Ascendant Rising Times'}</p>
      </div>

      <div className="sacred-content">
        <form onSubmit={handleSubmit} className="astro-form-card">
          <div className="form-grid">
            <div className="field">
              <label>{language === 'hi' ? 'नाम' : 'Name'}</label>
              <input type="text" placeholder={language === 'hi' ? 'नाम दर्ज करें' : 'Enter Name'} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'दिनांक' : 'Date'}</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'समय' : 'Time'}</label>
              <input type="time" step="1" value={form.time} onChange={e => setForm({...form, time: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'अक्षांश (Lat)' : 'Lat'}</label>
              <input type="number" step="0.0001" value={form.latitude} onChange={e => setForm({...form, latitude: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'देशांतर (Lon)' : 'Lon'}</label>
              <input type="number" step="0.0001" value={form.longitude} onChange={e => setForm({...form, longitude: e.target.value})} required />
            </div>
            <div className="field">
              <label>{language === 'hi' ? 'टाइमज़ोन' : 'TZ'}</label>
              <input type="number" step="0.1" value={form.timezone} onChange={e => setForm({...form, timezone: e.target.value})} required />
            </div>
          </div>
          <button type="submit" className="sacred-btn" disabled={isLoading}>
            {isLoading ? (language === 'hi' ? "गणना हो रही है..." : "Calculating...") : (language === 'hi' ? "तालिका प्राप्त करें" : "Get Lagna Table")}
          </button>
        </form>

        <section className="results-container">
          <ErrorMessage message={error} />
          {isLoading && <LoadingSpinner label={language === 'hi' ? "लग्नों की गणना हो रही है..." : "Calculating rising signs..."} />}

          {(lagnaData.length > 0 || svgChart) && !isLoading && (
            <div className="data-view-wrapper">
              <div className="layout-grid">
                <div className="table-side">
                  <h3 className="section-subtitle">
                    {language === 'hi' ? 'दैनिक लग्न समय' : 'Rising Sign Intervals'}
                  </h3>
                  <LagnaIntervalTable 
                    data={lagnaData} 
                    onSelectTime={handleSelectTime} 
                    selectedIndex={selectedIndex}
                    language={language}
                  />
                </div>
                
                <div className="chart-side">
                  <h3 className="section-subtitle">
                    {language === 'hi' ? 'लग्न कुंडली (Diamond Chart)' : 'Lagna Kundali Chart'}
                  </h3>
                  {isChartLoading ? (
                    <div className="chart-loading-placeholder">
                      <LoadingSpinner />
                    </div>
                  ) : svgChart ? (
                    <div className="chart-frame">
                      <AstroChartViewer
                        title={language === 'hi' ? 'लग्न कुंडली' : 'Lagna Chart'}
                        svgMarkup={svgChart}
                        chartMode="api-svg"
                      />
                    </div>
                  ) : (
                    <div className="no-chart-placeholder">
                      {language === 'hi' ? 'चार्ट देखने के लिए तालिका से समय चुनें' : 'Select a time from table to view chart'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .lagna-page-container {
          max-width: 1400px;
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
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin-bottom: 25px; }
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
          transition: transform 0.2s;
        }
        .sacred-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(30,60,114,0.3); }

        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: start;
        }
        
        @media (max-width: 1100px) {
          .layout-grid { grid-template-columns: 1fr; }
        }

        .section-subtitle { 
          font-family: 'Playfair Display', serif; 
          font-size: 1.8rem; 
          color: #1a3a52; 
          margin-bottom: 20px; 
          border-bottom: 2px solid #f3e5ab;
          padding-bottom: 10px;
        }

        .chart-frame {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #f3e5ab;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          justify-content: center;
        }
        
        .chart-loading-placeholder, .no-chart-placeholder {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fdfaf0;
          border: 1px dashed #e8c78e;
          border-radius: 16px;
          color: #8b6f47;
          font-style: italic;
        }

        .data-view-wrapper { animation: fadeIn 1s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
