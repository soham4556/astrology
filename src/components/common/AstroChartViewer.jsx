import { useMemo, useState } from "react";
import ClassicHoroscopeChart from "./ClassicHoroscopeChart";
import IndianKundaliChart from "./IndianKundaliChart";
import TraditionalKundali from "./TraditionalKundali";
import { apiRequest } from "../../api/httpClient";

/**
 * AstroChartViewer - Sacred Edition
 * Displays the Sacred Lotus chart and provides professional Gemini AI analysis.
 */
export default function AstroChartViewer({
  title = "Horoscope Chart",
  svgMarkup = "",
  planets = [],
  ascendantSign = null,
  birthDetails = {},
  chartMode = "api-svg",
  chartStyle = "north-indian",
  onChartStyleChange,
  chartStyleLoading = false,
  allowAiAnalysis = false,
}) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState("");
  const hasPlanetData = Array.isArray(planets) && planets.length > 0;
  const safeSvgMarkup = useMemo(() => {
    if (typeof svgMarkup !== "string") {
      return "";
    }

    const trimmed = svgMarkup.trim();
    return trimmed.startsWith("<svg") ? trimmed : "";
  }, [svgMarkup]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError("");
    try {
      const response = await apiRequest("/api/astrology/analysis", {
        method: "POST",
        body: {
          planets,
          birthDetails: {
            datetime: birthDetails.datetime || "Unknown",
            latitude: birthDetails.latitude || 0,
            longitude: birthDetails.longitude || 0,
          },
        },
      });
      if (response && response.success) {
        setAnalysis(response.data);
      } else {
        throw new Error(response?.message || "Analysis failed");
      }
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="astro-viewer-sacred-container">
      <style>{`
        .astro-viewer-sacred-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          padding: 30px;
          background: #fffdf5;
          border-radius: 30px;
          box-shadow: 0 15px 50px rgba(139, 69, 19, 0.1);
          border: 1px solid #f3e5ab;
        }

        .chart-stage {
          position: relative;
          width: 100%;
          max-width: 1040px;
          background: #fff;
          padding: 20px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          overflow-x: auto;
          border: 4px double #ffcc00;
        }

        .provider-chart {
          width: 100%;
          display: flex;
          justify-content: center;
          min-width: 320px;
        }

        .provider-chart svg {
          width: 100%;
          max-width: 900px;
          height: auto;
          display: block;
        }

        .btn-ai-sacred {
          background: linear-gradient(135deg, #ff9933 0%, #ff3300 100%);
          color: white;
          border: none;
          padding: 15px 35px;
          border-radius: 50px;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 8px 20px rgba(255, 51, 0, 0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-ai-sacred:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(255, 51, 0, 0.4);
        }

        .btn-ai-sacred:disabled {
          background: #cbd5e1;
          box-shadow: none;
          cursor: not-allowed;
        }

        .analysis-card {
          width: 100%;
          max-width: 800px;
          background: white;
          border-radius: 24px;
          padding: 30px;
          border: 2px solid #ffcc00;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          animation: slideUp 0.6s ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .analysis-section { margin-bottom: 25px; }
        .analysis-section h4 { 
          font-family: 'Playfair Display', serif; 
          color: #ff3300; 
          font-size: 1.4rem; 
          margin-bottom: 12px;
          border-bottom: 2px solid #f3e5ab;
          display: inline-block;
          padding-bottom: 4px;
        }
        .analysis-content { 
          font-family: 'Crimson Text', serif; 
          font-size: 1.15rem; 
          line-height: 1.7; 
          color: #3e2723;
        }

        .lang-toggle { font-size: 0.8rem; color: #8b4513; margin-left: 10px; cursor: pointer; text-decoration: underline; }
      `}</style>

      <div className="flex flex-col items-center text-center gap-2">
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.2rem",
            color: "#ff3300",
            fontWeight: 900,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "0.9rem",
            color: "#8b4513",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          ✨ पवित्र ज्योतिषीय चक्र ✨
        </p>
      </div>

      <div className="chart-stage">
        {chartMode === "indian-kundali" && hasPlanetData ? (
          chartStyle === "style-2" ? (
            <TraditionalKundali
              style="north-indian"
              planets={planets}
              ascendantSign={ascendantSign || 1}
            />
          ) : (
            <IndianKundaliChart planets={planets} styleType="north-indian" />
          )
        ) : chartMode === "api-box" && hasPlanetData ? (
          <ClassicHoroscopeChart
            planets={planets}
            ascendantSign={ascendantSign}
          />
        ) : safeSvgMarkup ? (
          <div
            className="provider-chart"
            dangerouslySetInnerHTML={{ __html: safeSvgMarkup }}
          />
        ) : (
          <p style={{ textAlign: "center", color: "#8b4513", fontWeight: 600 }}>
            API से चार्ट प्राप्त नहीं हुआ।
          </p>
        )}
      </div>

      {chartMode === "indian-kundali" &&
      typeof onChartStyleChange === "function" ? (
        <div className="flex gap-4">
          <button
            style={{
              background: chartStyle === "style-1" ? "#ffcc00" : "white",
              border: "2px solid #ffcc00",
              padding: "8px 20px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: chartStyleLoading ? "not-allowed" : "pointer",
              opacity: chartStyleLoading ? 0.7 : 1,
            }}
            onClick={() => onChartStyleChange("style-1")}
            disabled={chartStyleLoading}
            type="button"
          >
            Style 1
          </button>
          <button
            style={{
              background: chartStyle === "style-2" ? "#ffcc00" : "white",
              border: "2px solid #ffcc00",
              padding: "8px 20px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: chartStyleLoading ? "not-allowed" : "pointer",
              opacity: chartStyleLoading ? 0.7 : 1,
            }}
            onClick={() => onChartStyleChange("style-2")}
            disabled={chartStyleLoading}
            type="button"
          >
            Style 2
          </button>
        </div>
      ) : chartMode === "api-svg" &&
        typeof onChartStyleChange === "function" ? (
        <div className="flex gap-4">
          <button
            style={{
              background: chartStyle === "north-indian" ? "#ffcc00" : "white",
              border: "2px solid #ffcc00",
              padding: "8px 20px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: chartStyleLoading ? "not-allowed" : "pointer",
              opacity: chartStyleLoading ? 0.7 : 1,
            }}
            onClick={() => onChartStyleChange("north-indian")}
            disabled={chartStyleLoading}
            type="button"
          >
            उत्तर भारतीय
          </button>
          <button
            style={{
              background: chartStyle === "south-indian" ? "#ffcc00" : "white",
              border: "2px solid #ffcc00",
              padding: "8px 20px",
              borderRadius: "10px",
              fontWeight: 700,
              cursor: chartStyleLoading ? "not-allowed" : "pointer",
              opacity: chartStyleLoading ? 0.7 : 1,
            }}
            onClick={() => onChartStyleChange("south-indian")}
            disabled={chartStyleLoading}
            type="button"
          >
            दक्षिण भारतीय
          </button>
        </div>
      ) : null}

      {allowAiAnalysis ? (
        <button
          className="btn-ai-sacred"
          onClick={handleRunAnalysis}
          disabled={isAnalyzing || !hasPlanetData}
        >
          {isAnalyzing ? (
            <>✨ विश्लेषण चल रहा है... ✨</>
          ) : (
            <>🕉️ पेशेवर एआई भविष्यवाणी प्राप्त करें</>
          )}
        </button>
      ) : null}

      {allowAiAnalysis && analysisError && (
        <p className="text-red-600 font-medium">⚠️ {analysisError}</p>
      )}

      {allowAiAnalysis && analysis && (
        <div className="analysis-card">
          <div className="analysis-section">
            <h4>स्वभाव आणि व्यक्तिमत्व (Personality)</h4>
            <p className="analysis-content">{analysis.personality.mr}</p>
          </div>

          <div className="analysis-section">
            <h4>करिअर आणि संपत्ती (Career & Wealth)</h4>
            <p className="analysis-content">{analysis.career.mr}</p>
          </div>

          <div className="analysis-section">
            <h4>आरोग्य विशेष (Health Insights)</h4>
            <p className="analysis-content">{analysis.health.mr}</p>
          </div>

          <div className="analysis-section">
            <h4>नातेसंबंध (Relationships)</h4>
            <p className="analysis-content">{analysis.relationships.mr}</p>
          </div>

          <div className="analysis-section">
            <h4>महत्वाचे उपाय (Sacred Remedies)</h4>
            <p
              className="analysis-content"
              style={{ color: "#8b4513", fontWeight: "bold" }}
            >
              {analysis.remedies.mr}
            </p>
          </div>

          <div className="mt-8 p-6 bg-orange-50 rounded-xl border-l-4 border-orange-500 italic text-slate-700">
            {analysis.summary.mr}
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-slate-400">
              Powered by Gemini AI Spiritual Intelligence
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
