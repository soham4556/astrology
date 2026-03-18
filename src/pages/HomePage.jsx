import SeoMeta from "../components/common/SeoMeta";
import HomeSections from "../components/layout/HomeSections";

const schema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "jyotish web",
  url: "https://pavitrajyotish.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://pavitrajyotish.com/horoscope?query={search_term_string}",
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "jyotish web",
    url: "https://pavitrajyotish.com",
  },
};

export default function HomePage() {
  return (
    <>
      <SeoMeta
        title="jyotish web | Horoscope, Kundali, Match & Panchang"
        description="Premium Vedic astrology services with daily horoscope, kundali generation, kundali matching, and panchang insights."
        path="/"
        schema={schema}
      />
      <HomeSections />
    </>
  );
}
