import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { Phone, Mail, MapPin, Send, MessageCircle, Clock, Globe } from 'lucide-react';

const ContactPage = () => {
  const { language } = useLanguage();
  const isHindi = language === 'hi';
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    color: '#ffffff',
    fontFamily: '"Outfit", sans-serif',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '60px',
  };

  const contactGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '60px',
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(212, 175, 55, 0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  };

  const formContainerStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '50px',
    background: 'rgba(212, 175, 55, 0.02)',
    padding: '50px',
    borderRadius: '30px',
    border: '1px solid rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 20px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '20px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #d4af37, #f6dfb3)',
    color: '#1a1a2e',
    padding: '16px 32px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    boxShadow: '0 10px 20px rgba(212, 175, 55, 0.2)',
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '10px',
          background: 'linear-gradient(45deg, #d4af37, #f6dfb3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '800'
        }}>
          {isHindi ? 'हमसे संपर्क करें' : 'Connect with the Stars'}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#b0b0cc', maxWidth: '700px', margin: '0 auto' }}>
          {isHindi 
            ? 'ब्रह्मांडीय मार्गदर्शन बस एक सन्देश दूर है। हमारे विशेषज्ञ ज्योतिषी आपकी सहायता के लिए यहाँ हैं।' 
            : 'Cosmic guidance is just a message away. Our expert astrologers are here to help you navigate your destiny.'}
        </p>
      </div>

      <div style={contactGridStyle}>
        <div style={cardStyle} className="contact-card">
          <div style={{ color: '#d4af37', marginBottom: '20px' }}><Phone size={40} /></div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{isHindi ? 'कॉल करें' : 'Call Us'}</h3>
          <p style={{ color: '#b0b0cc' }}>XXXXX XXXXX</p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>{isHindi ? 'सोम - शनि, 10am - 8pm' : 'Mon - Sat, 10am - 8pm'}</p>
        </div>

        <div style={cardStyle} className="contact-card">
          <div style={{ color: '#d4af37', marginBottom: '20px' }}><Mail size={40} /></div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{isHindi ? 'ईमेल' : 'Email Us'}</h3>
          <p style={{ color: '#b0b0cc' }}>abc@gmail.com</p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>{isHindi ? '24 घंटे में उत्तर' : 'Response within 24 hours'}</p>
        </div>

        <div style={cardStyle} className="contact-card">
          <div style={{ color: '#d4af37', marginBottom: '20px' }}><MessageCircle size={40} /></div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{isHindi ? 'व्हाट्सएप' : 'WhatsApp'}</h3>
          <p style={{ color: '#b0b0cc' }}>XXXXX XXXXX</p>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>{isHindi ? 'त्वरित सहायता' : 'Instant Support'}</p>
        </div>
      </div>

      <div style={formContainerStyle} className="form-section">
        <div style={{ paddingRight: '20px' }}>
          <img 
            src="file:///C:/Users/Administrator/.gemini/antigravity/brain/7f61f15b-262d-4d96-bdf9-7db48f9aeed5/astrology_contact_illustration_1773757265740.png" 
            alt="Astrology Contact" 
            style={{ width: '100%', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
          />
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b0b0cc' }}>
                <MapPin size={20} color="#d4af37" />
                <span>E-982, Chittaranjan Park, New Delhi, India</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b0b0cc' }}>
                <Clock size={20} color="#d4af37" />
                <span>{isHindi ? 'उपलब्धता: सुबह 10:00 से रात 8:00 तक' : 'Availability: 10:00 AM to 8:00 PM'}</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#b0b0cc' }}>
                <Globe size={20} color="#d4af37" />
                <span>www.jyotishweb.com</span>
             </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '30px' }}>{isHindi ? 'परामर्श का अनुरोध करें' : 'Request Consultation'}</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <input 
              style={inputStyle} 
              placeholder={isHindi ? 'आपका नाम' : 'Your Name'} 
              value={formState.name}
              onChange={(e) => setFormState({...formState, name: e.target.value})}
            />
            <input 
              style={inputStyle} 
              placeholder={isHindi ? 'ईमेल पता' : 'Email Address'} 
              type="email"
              value={formState.email}
              onChange={(e) => setFormState({...formState, email: e.target.value})}
            />
            <input 
              style={inputStyle} 
              placeholder={isHindi ? 'विषय' : 'Subject'} 
              value={formState.subject}
              onChange={(e) => setFormState({...formState, subject: e.target.value})}
            />
            <textarea 
              style={{ ...inputStyle, height: '150px', resize: 'none' }} 
              placeholder={isHindi ? 'आपका संदेश' : 'Your Message'}
              value={formState.message}
              onChange={(e) => setFormState({...formState, message: e.target.value})}
            />
            <button style={buttonStyle}>
              {isHindi ? 'संदेश भेजें' : 'Send Message'} <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <style>
        {`
          .contact-card:hover {
            transform: translateY(-10px);
            border-color: rgba(212, 175, 55, 0.4);
            box-shadow: 0 15px 30px rgba(212, 175, 55, 0.1);
          }
          @media (max-width: 900px) {
            .form-section {
              grid-template-columns: 1fr;
              padding: 30px;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ContactPage;
