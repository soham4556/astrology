import { apiRequest } from './httpClient';

const APP_TO_API_LANGUAGE = Object.freeze({
  en: 'en',
  hi: 'hi',
  mr: 'ma',
  ma: 'ma',
  bn: 'bn',
  ta: 'ta',
  te: 'te',
  gu: 'gu',
  ml: 'ml',
  kn: 'kn',
});

function normalizeApiLanguage(language) {
  const normalized = String(language || '').trim().toLowerCase();
  return APP_TO_API_LANGUAGE[normalized] || '';
}

function getStoredAppLanguage() {
  try {
    return localStorage.getItem('astro_language') || '';
  } catch {
    return '';
  }
}

function resolveRequestLanguage(params = {}, options = {}) {
  const explicitLanguage =
    normalizeApiLanguage(options.language) || normalizeApiLanguage(params.language);

  if (explicitLanguage) {
    return explicitLanguage;
  }

  return normalizeApiLanguage(getStoredAppLanguage()) || 'en';
}

export const ASTROLOGY_API_FEATURES = Object.freeze({
  birthDetails: 'birth_details',
  astroDetails: 'astro_details',
  planets: 'planets',
  horoChart: 'horo_chart',
  horoChartD1: 'horo_chart/D1',
  horoChartImageD1: 'horo_chart_image/D1',
  currentVdasha: 'current_vdasha',
  matchAshtakootPoints: 'match_ashtakoot_points',
  basicPanchang: 'basic_panchang',
  geoDetails: 'geo_details',
  timezoneWithDst: 'timezone_with_dst',
  ghatChakra: 'ghat_chakra',
  kalsarpaDetails: 'kalsarpa_details',
  numeroTable: 'numero_table',
  generalAscendantReport: 'general_ascendant_report',
  kpBirthChart: 'kp_birth_chart',
  kpPlanets: 'kp_planets',
  panchangLagnaTable: 'panchang_lagna_table',
});

function encodeFeaturePath(feature) {
  return String(feature || '')
    .trim()
    .replace(/^\/+/, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function postAstrologyFeature(feature, params, options = {}) {
  const encodedFeature = encodeFeaturePath(feature);
  const language = resolveRequestLanguage(params, options);

  return apiRequest(`/api/astrology/${encodedFeature}`, {
    method: 'POST',
    body: {
      params,
      options: {
        ...options,
        language,
      },
    },
  });
}

export function getBirthDetails(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.birthDetails, params, options);
}

export function getAstroDetails(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.astroDetails, params, options);
}

export function getPlanets(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.planets, params, options);
}

export function getHoroChart(chartId = 'D1', params, options = {}) {
  const safeChartId = String(chartId || 'D1').trim() || 'D1';
  return postAstrologyFeature(
    `${ASTROLOGY_API_FEATURES.horoChart}/${safeChartId}`,
    params,
    options,
  );
}

export function getHoroChartD1(params, options = {}) {
  return getHoroChart('D1', params, options);
}

export function getHoroChartImageD1(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.horoChartImageD1, params, options);
}

export function getCurrentVdasha(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.currentVdasha, params, options);
}

export function getMatchAshtakootPoints(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.matchAshtakootPoints, params, options);
}

export function getBasicPanchang(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.basicPanchang, params, options);
}

export function getGeoDetails(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.geoDetails, params, options);
}

export function getTimezoneWithDst(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.timezoneWithDst, params, options);
}

export function getGhatChakra(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.ghatChakra, params, options);
}

export function getKalsarpaDetails(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.kalsarpaDetails, params, options);
}

export function getNumeroTable(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.numeroTable, params, options);
}

export function getGeneralAscendantReport(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.generalAscendantReport, params, options);
}

export function getKpBirthChart(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.kpBirthChart, params, options);
}

export function getKpPlanets(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.kpPlanets, params, options);
}

export function getHoroscope(params) {
  return getAstroDetails(params);
}

export function getKundali(params) {
  return getPlanets(params);
}

export function getMatch(params) {
  return getMatchAshtakootPoints(params);
}

export function getPanchang(params) {
  return getBasicPanchang(params);
}

export function getPanchangLagnaTable(params, options = {}) {
  return postAstrologyFeature(ASTROLOGY_API_FEATURES.panchangLagnaTable, params, options);
}

export function callAstrologyApi(feature, params, options = {}) {
  return postAstrologyFeature(feature, params, options);
}
