import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../hooks/useLanguage";
import { RASHI_DATA } from "../../utils/constants";

const services = [
  {
    icon: "📜",
    titleHi: "जन्मकुंडली विश्लेषण",
    titleEn: "KUNDALI ANALYSIS",
    desc: "अपनी संपूर्ण कुंडली के आधार पर भविष्य, करियर, विवाह और स्वास्थ्य का गहन विश्लेषण प्राप्त करें।",
    price: "₹501 से शुरू",
    cta: "और जानें",
  },
  {
    icon: "💑",
    titleHi: "विवाह मिलान",
    titleEn: "KUNDALI MATCHING",
    desc: "वैदिक गुण मिलान से उपयुक्त जीवनसाथी का चयन करें। अष्टकूट पद्धति से 36 गुणों का विश्लेषण।",
    price: "₹751 से शुरू",
    cta: "और जानें",
  },
  {
    icon: "💰",
    titleHi: "आर्थिक ज्योतिष",
    titleEn: "FINANCE ASTROLOGY",
    desc: "व्यापार, निवेश और आर्थिक निर्णयों के लिए विशेषज्ञ ज्योतिषीय मार्गदर्शन प्राप्त करें।",
    price: "₹1001 से शुरू",
    cta: "और जानें",
  },
  {
    icon: "💎",
    titleHi: "रत्नशास्त्र",
    titleEn: "GEMSTONE THERAPY",
    desc: "ग्रह स्थिति के अनुसार सही रत्न धारण करें और सकारात्मक ऊर्जा का लाभ लें।",
    price: "₹501 से शुरू",
    cta: "और जानें",
  },
  {
    icon: "🪔",
    titleHi: "विशेष पूजा",
    titleEn: "SPECIAL PUJA",
    desc: "नवग्रह पूजा, कालसर्प दोष निवारण, मांगलिक दोष शांति और अन्य विशेष पूजा सेवाएं।",
    price: "₹2001 से शुरू",
    cta: "और जानें",
  },
  {
    icon: "📞",
    titleHi: "फोन पर परामर्श",
    titleEn: "PHONE CONSULTATION",
    desc: "घर बैठे अनुभवी ज्योतिषी से फोन पर बात करें और तुरंत मार्गदर्शन प्राप्त करें।",
    price: "₹300/30 मिनट",
    cta: "अभी बात करें",
  },
];

const testimonials = [
  {
    stars: "★★★★★",
    text: '"माझ्या विवाहाबाबत मला खूप चिंता होती. पवित्र ज्योतिषच्या मार्गदर्शनाने योग्य निर्णय घेता आला. आज मी आनंदी आहे!"',
    langTag: "मराठी",
    avatar: "🙏",
    name: "प्रिया देशपांडे",
    location: "पुणे, महाराष्ट्र",
  },
  {
    stars: "★★★★★",
    text: '"करियर में बहुत उलझन थी। पवित्र ज्योतिष के ज्योतिषाचार्य जी ने सटीक मार्गदर्शन दिया। अब मेरा व्यवसाय बहुत अच्छा चल रहा है।"',
    langTag: "हिंदी",
    avatar: "⭐",
    name: "राजेश शर्मा",
    location: "दिल्ली",
  },
  {
    stars: "★★★★★",
    text: '"The horoscope reading was incredibly accurate. The astrologer predicted events that came true. I recommend jyotish web to everyone!"',
    langTag: "English",
    avatar: "🌟",
    name: "Ananya Krishnan",
    location: "Bangalore",
  },
];

const langCards = [
  {
    name: "MARATHI",
    phrase: "ज्योतिष आपला मार्गदर्शक",
    translation: "Jyotish is your guide",
  },
  {
    name: "HINDI",
    phrase: "सितारे आपका भविष्य बताते हैं",
    translation: "Stars tell your future",
  },
  {
    name: "ENGLISH",
    phrase: "The Cosmos Guides You",
    translation: "Your destiny awaits",
    english: true,
  },
  {
    name: "GUJARATI",
    phrase: "જ્યોતિષ આપનો માર્ગ",
    translation: "Astrology is your path",
  },
  {
    name: "TAMIL",
    phrase: "ஜோதிடம் உங்கள் வழிகாட்டி",
    translation: "Astrology guides you",
  },
  {
    name: "BENGALI",
    phrase: "জ্যোতিষ আপনার পথপ্রদর্শক",
    translation: "Astrology shows your path",
  },
  {
    name: "TELUGU",
    phrase: "జ్యోతిష్యం మీ మార్గదర్శి",
    translation: "Astrology is your guide",
  },
  {
    name: "KANNADA",
    phrase: "ಜ್ಯೋತಿಷ ನಿಮ್ಮ ಮಾರ್ಗದರ್ಶಿ",
    translation: "Astrology guides you",
  },
];

function SectionHeader({ label, titleHi, titleEn }) {
  return (
    <div className="section-header">
      <div className="section-label">{label}</div>
      <div className="section-title-hi">{titleHi}</div>
      <div className="section-title-en">{titleEn}</div>
      <div className="section-divider" />
    </div>
  );
}

export default function HomeSections() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [selectedRashi, setSelectedRashi] = useState("");
  const isHindi = language === "hi";
  const visibleTestimonials = isHindi
    ? testimonials.filter((item) => item.langTag === "हिंदी")
    : testimonials;

  return (
    <>
      <section className="hero">
        <svg
          className="hero-mandala"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="250" cy="250" r="240" stroke="gold" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="200" stroke="gold" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="160" stroke="gold" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="120" stroke="gold" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="80" stroke="gold" strokeWidth="0.5" />
          <circle cx="250" cy="250" r="40" stroke="gold" strokeWidth="0.5" />
          <line
            x1="10"
            y1="250"
            x2="490"
            y2="250"
            stroke="gold"
            strokeWidth="0.5"
          />
          <line
            x1="250"
            y1="10"
            x2="250"
            y2="490"
            stroke="gold"
            strokeWidth="0.5"
          />
          <line
            x1="80"
            y1="80"
            x2="420"
            y2="420"
            stroke="gold"
            strokeWidth="0.5"
          />
          <line
            x1="420"
            y1="80"
            x2="80"
            y2="420"
            stroke="gold"
            strokeWidth="0.5"
          />
          <polygon
            points="250,30 470,370 30,370"
            stroke="gold"
            strokeWidth="0.5"
            fill="none"
          />
          <polygon
            points="250,470 30,130 470,130"
            stroke="gold"
            strokeWidth="0.5"
            fill="none"
          />
          <text
            x="250"
            y="265"
            textAnchor="middle"
            fontSize="60"
            fill="gold"
            fontFamily="serif"
          >
            ॐ
          </text>
        </svg>

        <div className="hero-content">
          <div
            className="hero-badge"
            id="hero-badge"
            dangerouslySetInnerHTML={{ __html: t("hero-badge") }}
          />
          <div
            className="hero-title-devanagari"
            id="hero-title"
            dangerouslySetInnerHTML={{ __html: t("hero-title") }}
          />
          <div className="hero-title-english">
            {isHindi
              ? "अपनी नियति को प्रकाशित करें"
              : "ILLUMINATE YOUR DESTINY"}
          </div>
          <div
            className="hero-subtitle"
            id="hero-subtitle"
            dangerouslySetInnerHTML={{ __html: t("hero-subtitle") }}
          />
          {isHindi ? (
            <div className="hero-multilang">
              <div className="lang-phrase">
                ज्योतिष आपका सच्चा मार्गदर्शक है
              </div>
            </div>
          ) : (
            <div className="hero-multilang">
              <div className="lang-phrase">ज्योतिष आपका मार्गदर्शक है</div>
              <div className="lang-phrase">Stars Guide Your Path</div>
              <div className="lang-phrase">జ్యోతిష్యం మీ మార్గదర్శి</div>
            </div>
          )}
          <div className="hero-ctas">
            <Link className="btn-primary" to="/dashboard">
              {t("hero-btn1")}
            </Link>
            <Link className="btn-outline" to="/kundali">
              {t("hero-btn2")}
            </Link>
          </div>
        </div>
      </section>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">25+</span>
          <span className="stat-label">{t("stat1")}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">5L+</span>
          <span className="stat-label">{t("stat2")}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">50+</span>
          <span className="stat-label">{t("stat3")}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">12</span>
          <span className="stat-label">{t("stat4")}</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">4.9★</span>
          <span className="stat-label">{t("stat5")}</span>
        </div>
      </div>

      <section className="rashi-section">
        <SectionHeader
          label={isHindi ? "राशियां" : "ZODIAC SIGNS · राशी"}
          titleHi={t("rashi-title")}
          titleEn={isHindi ? "आपका दैनिक राशिफल" : "YOUR DAILY HOROSCOPE"}
        />
        <div className="rashi-grid">
          {RASHI_DATA.map((rashi) => (
            <button
              key={rashi.key}
              className="rashi-card"
              type="button"
              onClick={() => {
                setSelectedRashi(rashi.key);
                navigate(`/horoscope?sign=${encodeURIComponent(rashi.key)}`);
              }}
            >
              <span className="rashi-symbol">{rashi.symbol}</span>
              <span className="rashi-name-hi">{rashi.hi}</span>
              {!isHindi ? (
                <span className="rashi-name-en">{rashi.en}</span>
              ) : null}
              {!isHindi ? (
                <div className="rashi-dates">{rashi.dates}</div>
              ) : null}
            </button>
          ))}
        </div>
        {selectedRashi ? (
          <p className="selection-hint">
            {isHindi ? "आपकी राशि:" : "आपली राशी:"} {selectedRashi}
          </p>
        ) : null}
      </section>

      <section className="services-section" id="services">
        <SectionHeader
          label={isHindi ? "हमारी सेवाएं" : "OUR SERVICES · आमच्या सेवा"}
          titleHi={t("services-title")}
          titleEn={
            isHindi
              ? "विश्वसनीय ज्योतिषीय मार्गदर्शन"
              : "TRUSTED ASTROLOGICAL GUIDANCE"
          }
        />
        <div className="services-grid">
          {services.map((service) => (
            <article key={service.titleEn} className="service-card">
              <span className="service-icon">{service.icon}</span>
              <div className="service-title-hi">{service.titleHi}</div>
              {!isHindi ? (
                <div className="service-title-en">{service.titleEn}</div>
              ) : null}
              <div className="service-desc">{service.desc}</div>
              <div className="service-price">
                <span className="price-tag">{service.price}</span>
                <button
                  className="service-btn"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  {service.cta}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="multilang-banner">
        <SectionHeader
          label={isHindi ? "बहुभाषी सहायता" : "MULTILINGUAL · बहुभाषिक"}
          titleHi={isHindi ? "12 भाषाओं में सेवा" : "१२ भाषांमध्ये सेवा"}
          titleEn={
            isHindi ? "आपकी भाषा में ज्योतिष सेवाएं" : "WE SPEAK YOUR LANGUAGE"
          }
        />
        {isHindi ? (
          <div className="multilang-grid">
            <article className="lang-card">
              <div className="lang-name">हिंदी</div>
              <div className="lang-phrase-big">
                सितारे आपका भविष्य बताते हैं
              </div>
              <div className="lang-translation">
                हमारी सेवाएं आपकी चुनी हुई भाषा के अनुसार उपलब्ध हैं।
              </div>
            </article>
          </div>
        ) : (
          <div className="multilang-grid">
            {langCards.map((card) => (
              <article className="lang-card" key={card.name}>
                <div className="lang-name">{card.name}</div>
                <div
                  className="lang-phrase-big"
                  style={
                    card.english
                      ? {
                          fontFamily: "Cinzel Decorative, serif",
                          fontSize: "16px",
                        }
                      : {}
                  }
                >
                  {card.phrase}
                </div>
                <div className="lang-translation">{card.translation}</div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="testimonials">
        <SectionHeader
          label={isHindi ? "ग्राहक अनुभव" : "TESTIMONIALS · अभिप्राय"}
          titleHi={t("reviews-title")}
          titleEn={isHindi ? "हमारे ग्राहकों की राय" : "WHAT OUR CLIENTS SAY"}
        />
        <div className="testimonials-grid">
          {visibleTestimonials.map((testimonial) => (
            <article className="testimonial-card" key={testimonial.name}>
              <div className="stars">{testimonial.stars}</div>
              <p className="testimonial-text">{testimonial.text}</p>
              <span className="testimonial-lang-tag">
                {testimonial.langTag}
              </span>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div>
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-location">{testimonial.location}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <SectionHeader
          label={isHindi ? "संपर्क करें" : "CONTACT US · संपर्क"}
          titleHi={t("contact-title")}
          titleEn={isHindi ? "हमसे जुड़ें" : "GET IN TOUCH"}
        />
        <div className="contact-grid">
          <div className="contact-info">
            <h3>{t("contact-info-title")}</h3>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <div className="contact-detail-hi">
                  XXXXX XXXXX
                </div>
                <div className="contact-detail-en">
                  सोम–शनि: सुबह 10:00 से रात 8:00
                </div>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉</span>
              <div>
                <div className="contact-detail-hi">
                  abc@gmail.com
                </div>
                <div className="contact-detail-en">
                  24 घंटे में उत्तर मिलेगा
                </div>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <div className="contact-detail-hi">
                  शाहपुर जट, नई दिल्ली – 110049
                </div>
                <div className="contact-detail-en">भारत कार्यालय</div>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🌍</span>
              <div>
                <div className="contact-detail-hi">
                  भारत, अमेरिका, यूके, यूएई, न्यूजीलैंड
                </div>
                <div className="contact-detail-en">
                  विश्वभर में परामर्श उपलब्ध
                </div>
              </div>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={(event) => {
              event.preventDefault();
              navigate("/signup");
            }}
          >
            <div className="form-title">{t("form-title")}</div>
            <div className="form-group">
              <label htmlFor="contact-name">{t("form-name-label")}</label>
              <input
                id="contact-name"
                type="text"
                placeholder="अपना पूरा नाम लिखें"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-phone">{t("form-phone-label")}</label>
              <input
                id="contact-phone"
                type="tel"
                placeholder="+91 9XXXXXXXXX"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-service">{t("form-service-label")}</label>
              <select id="contact-service" defaultValue="जन्मकुंडली विश्लेषण">
                <option>जन्मकुंडली विश्लेषण</option>
                <option>कुंडली मिलान</option>
                <option>आर्थिक सलाह</option>
                <option>रत्नशास्त्र</option>
                <option>विशेष पूजा</option>
                <option>फोन परामर्श</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="contact-message">{t("form-msg-label")}</label>
              <textarea
                id="contact-message"
                placeholder="अपना प्रश्न या समस्या लिखें..."
              />
            </div>
            <button
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              type="submit"
            >
              {t("form-btn")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
