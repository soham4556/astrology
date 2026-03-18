import SeoMeta from "../components/common/SeoMeta";
import HomeSections from "../components/layout/HomeSections";

const schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pavitra Jyotish",
  url: "https://pavitrajyotish.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://pavitrajyotish.com/horoscope?query={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "Pavitra Jyotish",
    url: "https://pavitrajyotish.com",
  },
};

export default function HomePage() {
  return (
    <>
      <SeoMeta
        title="Pavitra Jyotish | Horoscope, Kundali, Match & Panchang"
        description="Premium Vedic astrology services with daily horoscope, kundali generation, kundali matching, and panchang insights."
        path="/"
        schema={schema}
      />
      <HomeSections />
    </>
  );
}
