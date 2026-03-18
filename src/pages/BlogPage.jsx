import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BLOG_POSTS = [
  {
    id: 1,
    title: {
      en: "Understanding Your Sun Sign: A Beginner's Guide",
      hi: "अपनी सूर्य राशि को समझना: एक शुरुआती मार्गदर्शिका"
    },
    excerpt: {
      en: "Learn how your Sun sign influences your core personality and life's purpose in Vedic Astrology.",
      hi: "जानें कि वैदिक ज्योतिष में आपकी सूर्य राशि आपके मूल व्यक्तित्व और जीवन के उद्देश्य को कैसे प्रभावित करती है।"
    },
    date: "March 15, 2026",
    author: "Acharya Sharma",
    image: "file:///C:/Users/Administrator/.gemini/antigravity/brain/7f61f15b-262d-4d96-bdf9-7db48f9aeed5/astrology_blog_post_1_1773757054398.png", // Fallback to hero for now
    category: "Basics"
  },
  {
    id: 2,
    title: {
      en: "The Power of Moon Signs in Emotional Balance",
      hi: "भावनात्मक संतुलन में चंद्र राशियों की शक्ति"
    },
    excerpt: {
      en: "Discover why your Moon sign might be more important than your Sun sign for inner peace.",
      hi: "डिस्कवर करें कि आंतरिक शांति के लिए आपकी चंद्र राशि आपकी सूर्य राशि से अधिक महत्वपूर्ण क्यों हो सकती है।"
    },
    date: "March 12, 2026",
    author: "Dr. Jyoti",
    image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&q=80&w=800",
    category: "Spiritual"
  },
  {
    id: 3,
    title: {
      en: "Mercury Retrograde: Survival Tips for 2026",
      hi: "बुध वक्री: 2026 के लिए बचाव के टिप्स"
    },
    excerpt: {
      en: "Don't let communication breakdowns ruin your plans. Master the art of Mercury retrograde.",
      hi: "संचार की गड़बड़ी को अपनी योजनाओं को बर्बाद न करने दें। बुध वक्री की कला में महारत हासिल करें।"
    },
    date: "March 10, 2026",
    author: "Expert Rahul",
    image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bcc0?auto=format&fit=crop&q=80&w=800",
    category: "Planetary"
  },
  {
    id: 4,
    title: {
      en: "Kundali Matching: More Than Just Guna Milan",
      hi: "कुंडली मिलान: केवल गुण मिलान से कहीं अधिक"
    },
    excerpt: {
      en: "Explore the deep psychological aspects of compatibility beyond the 36 points of Guna Milan.",
      hi: "गुण मिलान के 36 अंकों से परे अनुकूलता के गहरे मनोवैज्ञानिक पहलुओं का पता लगाएं।"
    },
    date: "March 08, 2026",
    author: "Shastri Ji",
    image: "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&q=80&w=800",
    category: "Marriage"
  },
  {
    id: 5,
    title: {
      en: "Saturn Transit 2026: Effects on All Zodiacs",
      hi: "शनि गोचर 2026: सभी राशियों पर प्रभाव"
    },
    excerpt: {
      en: "Karma's teacher is moving. Find out how Shani's transition will bring discipline to your life.",
      hi: "कर्म के शिक्षक आगे बढ़ रहे हैं। जानें कि शनि का गोचर आपके जीवन में अनुशासन कैसे लाएगा।"
    },
    date: "March 05, 2026",
    author: "Acharya Sharma",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800",
    category: "Transits"
  },
  {
    id: 6,
    title: {
      en: "Vastu Tips for Your Home Office Prosperity",
      hi: "आपके होम ऑफिस की समृद्धि के लिए वास्तु टिप्स"
    },
    excerpt: {
      en: "Simple changes in your workspace alignment can boost your productivity and career growth.",
      hi: "आपके कार्यक्षेत्र के संरेखण में साधारण बदलाव आपकी उत्पादकता और करियर के विकास को बढ़ावा दे सकते हैं।"
    },
    date: "March 02, 2026",
    author: "Vastu Expert Neha",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
    category: "Vastu"
  },
  {
    id: 7,
    title: {
      en: "Gemstones: Science or Superstition?",
      hi: "रत्न: विज्ञान या अंधविश्वास?"
    },
    excerpt: {
      en: "How planetary vibrations interact with crystalline structures to influence human energy.",
      hi: "ग्रहीय कंपन मानवीय ऊर्जा को प्रभावित करने के लिए क्रिस्टलीय संरचनाओं के साथ कैसे बातचीत करते हैं।"
    },
    date: "Feb 28, 2026",
    author: "Dr. Jyoti",
    image: "https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=800",
    category: "Remedies"
  },
  {
    id: 8,
    title: {
      en: "Meditation by Zodiac Element: Air, Water, Fire, Earth",
      hi: "राशि तत्व द्वारा ध्यान: वायु, जल, अग्नि, पृथ्वी"
    },
    excerpt: {
      en: "Tailor your spiritual practice to your zodiac element for maximum spiritual resonance.",
      hi: "अधिकतम आध्यात्मिक प्रतिध्वनि के लिए अपने आध्यात्मिक अभ्यास को अपनी राशि के तत्व के अनुसार ढालें।"
    },
    date: "Feb 25, 2026",
    author: "Yoga Acharya",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800",
    category: "Wellness"
  },
  {
    id: 9,
    title: {
      en: "Secret of the 8th House: Transformation & Wealth",
      hi: "आठवें घर का रहस्य: परिवर्तन और धन"
    },
    excerpt: {
      en: "Unlocking the mysteries of the most misunderstood house in your birth chart.",
      hi: "आपकी जन्म कुंडली में सबसे गलत समझे जाने वाले घर के रहस्यों को अनलॉक करना।"
    },
    date: "Feb 20, 2026",
    author: "Shastri Ji",
    image: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800",
    category: "Astrology"
  },
  {
    id: 10,
    title: {
      en: "Career Success: Finding Your 10th House Lord",
      hi: "करियर में सफलता: अपने दसवें घर के स्वामी को खोजना"
    },
    excerpt: {
      en: "Why your career path is written in the stars and how to follow your cosmic calling.",
      hi: "आपका करियर पथ तारों में क्यों लिखा है और अपने ब्रह्मांडीय आह्वान का पालन कैसे करें।"
    },
    date: "Feb 15, 2026",
    author: "Expert Rahul",
    image: "https://images.unsplash.com/photo-1454165833767-027ff33026b6?auto=format&fit=crop&q=80&w=800",
    category: "Career"
  }
];

const BlogPage = () => {
  const { language } = useLanguage();
  const isHindi = language === 'hi';

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    color: '#ffffff',
    fontFamily: '"Outfit", sans-serif',
  };

  const heroStyle = {
    position: 'relative',
    height: '400px',
    borderRadius: '24px',
    overflow: 'hidden',
    marginBottom: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
  };

  const blogGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '30px',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(10px)',
  };

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'url("file:///C:/Users/Administrator/.gemini/antigravity/brain/7f61f15b-262d-4d96-bdf9-7db48f9aeed5/astrology_blog_hero_1773757054398.png") center/cover no-repeat',
          opacity: 0.6
        }} />
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            marginBottom: '10px',
            background: 'linear-gradient(45deg, #d4af37, #f6dfb3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '800'
          }}>
            {isHindi ? 'ज्योतिष ब्लॉग' : 'Astrology Insights'}
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#b0b0cc' }}>
            {isHindi ? 'ब्रह्मांडीय रहस्यों और दैनिक मार्गदर्शन की आपकी यात्रा' : 'Your journey through cosmic mysteries and daily guidance'}
          </p>
        </div>
      </div>

      <div style={blogGridStyle}>
        {BLOG_POSTS.map(post => (
          <div 
            key={post.id} 
            style={cardStyle}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(212, 175, 55, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <div style={{ height: '200px', overflow: 'hidden' }}>
              <img 
                src={post.image} 
                alt={post.title[language] || post.title.en} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
              />
            </div>
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ 
                  background: 'rgba(212, 175, 55, 0.1)', 
                  color: '#d4af37', 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  {post.category}
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '12px', lineHeight: '1.3', fontWeight: '700' }}>
                {post.title[language] || post.title.en}
              </h2>
              <p style={{ color: '#b0b0cc', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
                {post.excerpt[language] || post.excerpt.en}
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#888' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <Calendar size={14} />
                  <span>{post.date}</span>
                </div>
                <div style={{ color: '#d4af37', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', fontSize: '0.9rem' }}>
                  {isHindi ? 'और पढ़ें' : 'Read More'} <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '80px', textAlign: 'center', padding: '60px', borderRadius: '30px', background: 'rgba(212, 175, 55, 0.03)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '15px' }}>{isHindi ? 'परामर्श के लिए तैयार हैं?' : 'Ready for a Consultation?'}</h2>
        <p style={{ color: '#b0b0cc', marginBottom: '30px' }}>{isHindi ? 'हमारे विशेषज्ञ ज्योतिषियों से बात करें और अपने भविष्य की स्पष्टता प्राप्त करें।' : 'Speak with our expert astrologers and gain clarity on your future path.'}</p>
        <button style={{
          background: 'linear-gradient(45deg, #d4af37, #f6dfb3)',
          color: '#1a1a2e',
          padding: '14px 40px',
          borderRadius: '30px',
          border: 'none',
          fontWeight: '700',
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)'
        }}>
          {isHindi ? 'अभी परामर्श लें' : 'Consult Now'}
        </button>
      </div>
    </div>
  );
};

export default BlogPage;
