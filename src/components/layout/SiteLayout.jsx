import { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  LogIn,
  LayoutDashboard,
  Home,
  Sparkles,
  ScrollText,
  BarChart4,
  Binary,
  CalendarDays,
  Link2,
  Gem,
  BookText,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { NAV_ITEMS, TICKER_ITEMS } from "../../utils/constants";

const HINDI_TICKER_ITEMS = [
  "🌟 आज का राशिफल उपलब्ध है",
  "🔴 विशेष ऑफर: ज्योतिष परामर्श पर 30% छूट",
  "🤝 कुंडली मिलान अब उपलब्ध है",
  "🌙 चंद्र ग्रहण विशेष पूजा बुकिंग चालू है",
  "📅 दैनिक पंचांग तुरंत प्राप्त करें",
];

const ICON_MAP = {
  Home,
  Sparkles,
  ScrollText,
  BarChart4,
  Binary,
  CalendarDays,
  Link2,
  Gem,
  BookText,
  Phone,
  User,
};

function createStars() {
  return Array.from({ length: 150 }).map((_, index) => {
    const size = Math.random() * 2 + 0.5;
    return {
      id: `${index}-${Math.random().toString(16).slice(2)}`,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        "--dur": `${3 + Math.random() * 5}s`,
        "--delay": `-${Math.random() * 5}s`,
      },
    };
  });
}

const STARFIELD_STARS = createStars();

function Starfield() {
  return (
    <div id="starfield" aria-hidden="true">
      {STARFIELD_STARS.map((star) => (
        <span key={star.id} className="star" style={star.style} />
      ))}
    </div>
  );
}

function NavItem({ item, t, isMobile, closeMobileMenu }) {
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = ICON_MAP[item.icon] || Sparkles;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      className={`nav-item-wrapper ${hasChildren ? "has-dropdown" : ""} ${isOpen ? "dropdown-open" : ""}`}
      onMouseEnter={() => !isMobile && setIsOpen(true)}
      onMouseLeave={() => !isMobile && setIsOpen(false)}
    >
      <NavLink
        to={item.to}
        className="nav-item-link"
        onClick={(e) => {
          if (hasChildren && isMobile) {
            e.preventDefault();
            setIsOpen(!isOpen);
          } else if (isMobile) {
            closeMobileMenu();
          }
        }}
      >
        <IconComponent size={18} className="nav-icon" />
        <span>{t(item.key, item.key)}</span>
        {hasChildren && (
          <ChevronDown size={14} className={`chevron ${isOpen ? "up" : ""}`} />
        )}
      </NavLink>

      {hasChildren && (
        <div className="dropdown-menu">
          {item.children.map((child) => (
            <NavLink
              key={child.key}
              to={child.to}
              className="dropdown-item"
              onClick={() => isMobile && closeMobileMenu()}
            >
              {t(child.key, child.key)}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Footer({ language }) {
  const isHindi = language === "hi";
  const footerDescription = isHindi
    ? "पवित्र ज्योतिष भारत की एक विश्वसनीय ज्योतिष सेवा है। हम 2000 से लाखों लोगों को वैदिक ज्योतिष के माध्यम से जीवन मार्गदर्शन दे रहे हैं।"
    : "पवित्र ज्योतिष ही भारतातील एक विश्वसनीय ज्योतिष सेवा आहे. आम्ही २००० पासून लाखो लोकांना वैदिक ज्योतिषाच्या माध्यमातून जीवनात मार्गदर्शन करत आहोत।";

  const serviceTitle = isHindi ? "सेवाएं" : "सेवा";
  const serviceItems = isHindi
    ? [
        { label: "जन्मकुंडली", to: "/kundali/birth-chart" },
        { label: "राशिफल", to: "/horoscope" },
        { label: "कुंडली मिलान", to: "/match/kundali" },
        { label: "अष्टकूट मिलान", to: "/match/ashtakoot" },
        { label: "मांगलिक रिपोर्ट", to: "/match/manglik" },
        { label: "अंकशास्त्र", to: "/numerology" },
      ]
    : [
        { label: "जन्मकुंडली", to: "/kundali/birth-chart" },
        { label: "राशीभविष्य", to: "/horoscope" },
        { label: "कुंडली जुळवणी", to: "/match/kundali" },
        { label: "अष्टकूट जुळवणी", to: "/match/ashtakoot" },
        { label: "मांगलिक अहवाल", to: "/match/manglik" },
        { label: "अंकशास्त्र", to: "/numerology" },
      ];

  const remediesTitle = isHindi ? "उपाय" : "उपाय";
  const remediesItems = isHindi
    ? [
        { label: "साढ़ेसाती स्थिति", to: "/remedies/sadesati" },
        { label: "कालसर्प रिपोर्ट", to: "/remedies/kaalsarp" },
        { label: "आज का पंचांग", to: "/panchang/today" },
        { label: "मुहूर्त", to: "/panchang/muhurat" },
        { label: "दशा अवधि", to: "/kundali/dasha" },
        { label: "लग्न तालिका", to: "/kundali/lagna-intervals" },
      ]
    : [
        { label: "साडेसाती स्थिती", to: "/remedies/sadesati" },
        { label: "कालसर्प अहवाल", to: "/remedies/kaalsarp" },
        { label: "आजचे पंचांग", to: "/panchang/today" },
        { label: "मुहूर्त", to: "/panchang/muhurat" },
        { label: "दशा कालावधी", to: "/kundali/dasha" },
        { label: "लग्न तालिका", to: "/kundali/lagna-intervals" },
      ];

  const infoTitle = isHindi ? "जानकारी" : "माहिती";
  const infoItems = isHindi
    ? [
        { label: "होम", to: "/" },
        { label: "ब्लॉग", to: "/blog" },
        { label: "संपर्क", to: "/contact" },
        { label: "लॉगिन", to: "/login" },
        { label: "साइन अप", to: "/signup" },
        { label: "डैशबोर्ड", to: "/dashboard" },
      ]
    : [
        { label: "मुख्यपृष्ठ", to: "/" },
        { label: "ब्लॉग", to: "/blog" },
        { label: "संपर्क", to: "/contact" },
        { label: "लॉगिन", to: "/login" },
        { label: "साइन अप", to: "/signup" },
        { label: "डॅशबोर्ड", to: "/dashboard" },
      ];

  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="foot-logo">🕉 jyotish web</div>
          <p className="footer-desc">{footerDescription}</p>
          <div className="social-links">
            <a className="social-link" href="#" aria-label="Facebook">
              f
            </a>
            <a className="social-link" href="#" aria-label="LinkedIn">
              in
            </a>
            <a className="social-link" href="#" aria-label="Twitter">
              tw
            </a>
            <a className="social-link" href="#" aria-label="YouTube">
              yt
            </a>
            <a className="social-link" href="#" aria-label="Instagram">
              ig
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>{serviceTitle}</h4>
          <ul>
            {serviceItems.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>{remediesTitle}</h4>
          <ul>
            {remediesItems.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>{infoTitle}</h4>
          <ul>
            {infoItems.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © 2000–2026 <span>jyotish web</span> |{" "}
        {isHindi ? "सभी अधिकार सुरक्षित" : "सर्व हक्क राखीव"} |{" "}
        {isHindi
          ? "तारों के लिए प्रेम से निर्मित"
          : "Designed with ✦ & 🕉 for the Stars"}
      </div>
    </footer>
  );
}

export default function SiteLayout() {
  const { t, language, setLanguage, availableLanguages } = useLanguage();
  const { isAuthenticated, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHindi = language === "hi";
  const tickerItems = isHindi ? HINDI_TICKER_ITEMS : TICKER_ITEMS;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <Starfield />

      <div className="top-bar">
        <div className="lang-bar">
          {availableLanguages.map((item, index) => (
            <span
              key={item.code}
              role="button"
              tabIndex={0}
              className={language === item.code ? "active" : ""}
              onClick={() => setLanguage(item.code)}
            >
              {item.label}
              {index !== availableLanguages.length - 1 ? (
                <span className="divider"> ✦ </span>
              ) : null}
            </span>
          ))}
        </div>
        <div className="contact-bar">
          <a href="tel:XXXXXXXXXXX" className="contact-item">
            <Phone size={14} /> XXXXX XXXXX
          </a>
          <a
            href="mailto:abc@gmail.com"
            className="contact-item hide-mobile"
          >
            <Mail size={14} /> abc@gmail.com
          </a>
        </div>
      </div>

      <header className={isScrolled ? "scrolled" : ""}>
        <div className="header-main">
          <Link to="/" className="logo-wrap">
            <div className="logo-emblem">🕉</div>
            <div className="logo-text">
              <div className="name-devanagari">jyotish web</div>
              <div className="name-english">
                {isHindi ? "वैदिक ज्योतिष सेवा" : "JYOTISH WEB"}
              </div>
            </div>
          </Link>

          <div className="header-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-auth">
                <LayoutDashboard size={18} />
                <span>{isHindi ? "डैशबोर्ड" : "Dashboard"}</span>
              </Link>
            ) : (
              <Link to="/login" className="btn-auth">
                <LogIn size={18} />
                <span>{isHindi ? "लॉगिन" : "Login"}</span>
              </Link>
            )}

            <button
              className="mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isHindi ? "मेनू खोलें या बंद करें" : "Toggle menu"}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <nav className={`main-nav ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="nav-container">
            {NAV_ITEMS.map((item) => (
              <NavItem
                key={item.key}
                item={item}
                t={t}
                isMobile={isMobileMenuOpen}
                closeMobileMenu={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </div>
        </nav>
      </header>

      <div className="ticker">
        <div className="ticker-inner">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={item === "✦" ? "ticker-dot" : "ticker-item"}
            >
              {item}
              <span className="ticker-dot"> ✦ </span>
            </span>
          ))}
        </div>
      </div>

      <main>
        <Outlet />
      </main>

      <Footer language={language} />

      <a
        className="whatsapp-float"
        href="https://wa.me/XXXXXXXXXXX"
        title={isHindi ? "व्हाट्सऐप" : "WhatsApp"}
        aria-label={isHindi ? "व्हाट्सऐप संपर्क" : "WhatsApp contact"}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </>
  );
}
