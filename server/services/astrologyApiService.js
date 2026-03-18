import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_ASTROLOGY_API_USER_ID = '651037';
const DEFAULT_ASTROLOGY_API_KEY = '502c0b602c2aa65fcb9f133abece7b3202f0dcc7';

const BASE_URL = String(process.env.ASTROLOGY_API_BASE_URL || 'https://json.astrologyapi.com/v1').replace(/\/+$/, '');
const DEFAULT_LANGUAGE = String(process.env.ASTROLOGY_API_LANGUAGE || 'en').trim() || 'en';

const ENDPOINT_DEFINITIONS = Object.freeze({
  birth_details: {
    path: 'birth_details',
    payloadBuilder: buildBirthPayload,
  },
  astro_details: {
    path: 'astro_details',
    payloadBuilder: buildBirthPayload,
  },
  planets: {
    path: 'planets',
    payloadBuilder: buildBirthPayload,
  },
  'horo_chart/d1': {
    path: 'horo_chart/D1',
    payloadBuilder: buildChartPayload,
  },
  'horo_chart_image/d1': {
    path: 'horo_chart_image/D1',
    payloadBuilder: buildChartPayload,
  },
  current_vdasha: {
    path: 'current_vdasha',
    payloadBuilder: buildBirthPayload,
  },
  match_ashtakoot_points: {
    path: 'match_ashtakoot_points',
    payloadBuilder: buildMatchPayload,
  },
  basic_panchang: {
    path: 'basic_panchang',
    payloadBuilder: buildPanchangPayload,
  },
  geo_details: {
    path: 'geo_details',
    payloadBuilder: buildGeoPayload,
  },
  timezone_with_dst: {
    path: 'timezone_with_dst',
    payloadBuilder: buildTimezonePayload,
  },
  ghat_chakra: {
    path: 'ghat_chakra',
    payloadBuilder: buildBirthPayload,
  },
  kalsarpa_details: {
    path: 'kalsarpa_details',
    payloadBuilder: buildBirthPayload,
  },
  numero_table: {
    path: 'numero_table',
    payloadBuilder: buildNumerologyPayload,
  },
  general_ascendant_report: {
    path: 'general_ascendant_report',
    payloadBuilder: buildBirthPayload,
  },
  panchang_lagna_table: {
    path: 'panchang_lagna_table',
    payloadBuilder: buildBirthPayload,
  },
});

const ENDPOINT_ALIASES = Object.freeze({
  horoscope: 'astro_details',
  kundali: 'planets',
  match: 'match_ashtakoot_points',
  panchang: 'basic_panchang',
  'panchang-advanced': 'basic_panchang',
  'horoscope-advanced': 'astro_details',
  chart: 'horo_chart_image/d1',
  'chart-image': 'horo_chart_image/d1',
  'chart-svg': 'horo_chart/d1',
  'horo-chart-d1': 'horo_chart/d1',
  'horo-chart-image-d1': 'horo_chart_image/d1',
  'birth-details': 'birth_details',
  'astro-details': 'astro_details',
  vdasha: 'current_vdasha',
  'match-points': 'match_ashtakoot_points',
  timezone: 'timezone_with_dst',
  numerology: 'numero_table',
  'life-path-number': 'numero_table',
  'destiny-number': 'numero_table',
  'soul-urge-number': 'numero_table',
  'personality-number': 'numero_table',
  'inner-dream-number': 'numero_table',
  'birthday-number': 'numero_table',
  'expression-number': 'numero_table',
  'challenge-number': 'numero_table',
  'pinnacle-number': 'numero_table',
  'chaldean-birth-number': 'numero_table',
  'chaldean-whole-name-number': 'numero_table',
  'panchang-lagna-table': 'panchang_lagna_table',
  'lagna-table': 'panchang_lagna_table',
});

const ZODIAC_SIGNS = Object.freeze([
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]);

const SIGN_NAME_ALIASES = Object.freeze({
  aries: 'Aries',
  mesha: 'Aries',
  mesh: 'Aries',
  taurus: 'Taurus',
  vrishabha: 'Taurus',
  vrishabh: 'Taurus',
  gemini: 'Gemini',
  mithuna: 'Gemini',
  mithun: 'Gemini',
  cancer: 'Cancer',
  kark: 'Cancer',
  leo: 'Leo',
  simha: 'Leo',
  singh: 'Leo',
  virgo: 'Virgo',
  kanya: 'Virgo',
  libra: 'Libra',
  tula: 'Libra',
  scorpio: 'Scorpio',
  vrishchika: 'Scorpio',
  vrishchik: 'Scorpio',
  sagittarius: 'Sagittarius',
  dhanu: 'Sagittarius',
  capricorn: 'Capricorn',
  makar: 'Capricorn',
  aquarius: 'Aquarius',
  kumbha: 'Aquarius',
  kumbh: 'Aquarius',
  pisces: 'Pisces',
  meena: 'Pisces',
  meen: 'Pisces',
});

const SIGN_NAME_TO_HINDI = Object.freeze({
  Aries: 'मेष',
  Taurus: 'वृषभ',
  Gemini: 'मिथुन',
  Cancer: 'कर्क',
  Leo: 'सिंह',
  Virgo: 'कन्या',
  Libra: 'तुला',
  Scorpio: 'वृश्चिक',
  Sagittarius: 'धनु',
  Capricorn: 'मकर',
  Aquarius: 'कुंभ',
  Pisces: 'मीन',
});

const SIGN_INDEX_BY_NAME = Object.freeze(
  ZODIAC_SIGNS.reduce((accumulator, signName, index) => {
    accumulator[signName] = index;
    return accumulator;
  }, {}),
);

function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeEndpointKey(endpointKey) {
  return String(endpointKey || '').trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

function pickFirstValue(params, keys = [], fallback = null) {
  for (const key of keys) {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      return value;
    }
  }
  return fallback;
}

function parseCoordinates(params = {}) {
  const fromLat = toNumber(pickFirstValue(params, ['lat', 'latitude']), null);
  const fromLon = toNumber(pickFirstValue(params, ['lon', 'longitude']), null);

  if (fromLat !== null && fromLon !== null) {
    return { lat: fromLat, lon: fromLon };
  }

  const coordinateString = String(params.coordinates || '').trim();
  if (!coordinateString.includes(',')) {
    return { lat: 0, lon: 0 };
  }

  const [latString, lonString] = coordinateString.split(',').map((part) => part.trim());
  return {
    lat: toNumber(latString, 0),
    lon: toNumber(lonString, 0),
  };
}

function extractDateParts(params = {}) {
  const day = toNumber(pickFirstValue(params, ['day', 'date']), null);
  const month = toNumber(params.month, null);
  const year = toNumber(params.year, null);
  const hour = toNumber(pickFirstValue(params, ['hour', 'hours']), null);
  const min = toNumber(pickFirstValue(params, ['min', 'minute', 'minutes']), null);

  if (day !== null && month !== null && year !== null) {
    return {
      day,
      month,
      year,
      hour: hour ?? 0,
      min: min ?? 0,
    };
  }

  const dateString = params.datetime
    || (params.date && params.time ? `${params.date}T${params.time}` : null)
    || params.date
    || null;

  if (dateString) {
    const parsedDate = new Date(dateString);
    if (!Number.isNaN(parsedDate.getTime())) {
      return {
        day: parsedDate.getDate(),
        month: parsedDate.getMonth() + 1,
        year: parsedDate.getFullYear(),
        hour: parsedDate.getHours(),
        min: parsedDate.getMinutes(),
      };
    }
  }

  const now = new Date();
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    hour: now.getHours(),
    min: now.getMinutes(),
  };
}

function buildBirthPayload(params = {}) {
  const dateParts = extractDateParts(params);
  const { lat, lon } = parseCoordinates(params);
  const timezone = toNumber(pickFirstValue(params, ['tzone', 'timezone']), 5.5);

  return {
    day: dateParts.day,
    month: dateParts.month,
    year: dateParts.year,
    hour: dateParts.hour,
    min: dateParts.min,
    lat,
    lon,
    tzone: timezone,
  };
}

function normalizeChartLayout(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized.includes('north')) {
    return 'north';
  }

  if (normalized.includes('south')) {
    return 'south';
  }

  if (normalized.includes('east')) {
    return 'east';
  }

  return normalized;
}

function normalizeImageType(value) {
  const normalized = String(value || '').trim().toLowerCase();

  if (!normalized) {
    return '';
  }

  if (normalized === 'png' || normalized === 'svg') {
    return normalized;
  }

  return normalized;
}

function buildChartPayload(params = {}) {
  const payload = buildBirthPayload(params);

  const chartLayout = normalizeChartLayout(
    pickFirstValue(
      params,
      ['chartType', 'chart_type', 'chart_style', 'chartStyle'],
      '',
    ),
  );
  const imageType = normalizeImageType(
    pickFirstValue(params, ['image_type', 'imageType', 'format'], ''),
  );
  const colorTheme = String(
    pickFirstValue(params, ['color_theme', 'colorTheme'], ''),
  ).trim();

  if (chartLayout) {
    payload.chartType = chartLayout;
    payload.chart_type = chartLayout;
    payload.chart_style = chartLayout;
  }

  if (imageType) {
    payload.image_type = imageType;
  }

  if (colorTheme) {
    payload.color_theme = colorTheme;
  }

  if (params.planets_data !== undefined) {
    payload.planets_data = params.planets_data;
  }

  return payload;
}

function buildPanchangPayload(params = {}) {
  const birthPayload = buildBirthPayload(params);
  return {
    day: birthPayload.day,
    month: birthPayload.month,
    year: birthPayload.year,
    hour: birthPayload.hour,
    min: birthPayload.min,
    lat: birthPayload.lat,
    lon: birthPayload.lon,
    tzone: birthPayload.tzone,
  };
}

function buildMatchSubjectPayload(params = {}, role) {
  const prefix = role === 'male' ? 'm' : 'f';
  const nested = params[role] && typeof params[role] === 'object' ? params[role] : {};

  const roleDob = role === 'male'
    ? pickFirstValue(params, ['partner1_dob', 'partner_one_dob', 'male_dob'], null)
    : pickFirstValue(params, ['partner2_dob', 'partner_two_dob', 'female_dob'], null);

  return buildBirthPayload({
    ...params,
    ...nested,
    day: pickFirstValue(params, [`${prefix}_day`], nested.day),
    month: pickFirstValue(params, [`${prefix}_month`], nested.month),
    year: pickFirstValue(params, [`${prefix}_year`], nested.year),
    hour: pickFirstValue(params, [`${prefix}_hour`], nested.hour),
    min: pickFirstValue(params, [`${prefix}_min`], nested.min),
    lat: pickFirstValue(params, [`${prefix}_lat`], nested.lat),
    lon: pickFirstValue(params, [`${prefix}_lon`], nested.lon),
    tzone: pickFirstValue(params, [`${prefix}_tzone`], nested.tzone),
    datetime: nested.datetime || roleDob || params.datetime,
  });
}

function buildMatchPayload(params = {}) {
  const male = buildMatchSubjectPayload(params, 'male');
  const female = buildMatchSubjectPayload(params, 'female');

  return {
    m_day: male.day,
    m_month: male.month,
    m_year: male.year,
    m_hour: male.hour,
    m_min: male.min,
    m_lat: male.lat,
    m_lon: male.lon,
    m_tzone: male.tzone,
    f_day: female.day,
    f_month: female.month,
    f_year: female.year,
    f_hour: female.hour,
    f_min: female.min,
    f_lat: female.lat,
    f_lon: female.lon,
    f_tzone: female.tzone,
  };
}

function buildGeoPayload(params = {}) {
  const placeName = String(
    pickFirstValue(params, ['place_name', 'place', 'location', 'city'], ''),
  ).trim();

  return {
    place_name: placeName,
    max_rows: toNumber(params.max_rows, 5),
  };
}

function buildTimezonePayload(params = {}) {
  const payload = buildBirthPayload(params);

  return {
    day: payload.day,
    month: payload.month,
    year: payload.year,
    hour: payload.hour,
    min: payload.min,
    lat: payload.lat,
    lon: payload.lon,
    tzone: payload.tzone,
  };
}

function buildNumerologyPayload(params = {}) {
  const birthPayload = buildBirthPayload(params);
  const firstName = String(pickFirstValue(params, ['first_name', 'firstName'], '')).trim();
  const middleName = String(pickFirstValue(params, ['middle_name', 'middleName'], '')).trim();
  const lastName = String(pickFirstValue(params, ['last_name', 'lastName'], '')).trim();
  const providedName = String(pickFirstValue(params, ['name', 'full_name'], '')).trim();
  const normalizedName = providedName || [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

  return {
    day: birthPayload.day,
    month: birthPayload.month,
    year: birthPayload.year,
    hour: birthPayload.hour,
    min: birthPayload.min,
    lat: birthPayload.lat,
    lon: birthPayload.lon,
    tzone: birthPayload.tzone,
    name: normalizedName,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
  };
}

function normalizeSignName(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return SIGN_NAME_ALIASES[normalized] || null;
}

function toHindiSignName(signName, shouldTranslate) {
  if (!shouldTranslate) {
    return signName;
  }

  return SIGN_NAME_TO_HINDI[signName] || signName;
}

function formatTimeFromMinutes(totalMinutes, seconds = 0) {
  const clampedMinutes = Math.min(Math.max(Math.floor(totalMinutes), 0), 1439);
  const clampedSeconds = Math.min(Math.max(Math.floor(seconds), 0), 59);
  const hour = Math.floor(clampedMinutes / 60);
  const minute = clampedMinutes % 60;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(clampedSeconds).padStart(2, '0')}`;
}

function getAscendantFromPlanetsPayload(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.output)
      ? payload.output
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  const ascendant = rows.find((item) => {
    const key = String(item?.name || item?.planet || item?.planet_name || '')
      .trim()
      .toLowerCase();
    return key === 'ascendant' || key === 'asc' || key === 'lagna';
  });

  if (!ascendant) {
    return null;
  }

  const signName = normalizeSignName(
    ascendant.sign
      || ascendant.sign_name
      || ascendant.zodiac
      || ascendant.rashi,
  );

  const normDegree = toNumber(
    ascendant.normDegree,
    toNumber(ascendant.degree, toNumber(ascendant.fullDegree, 0)),
  );

  const degreeInSign = ((normDegree % 30) + 30) % 30;

  if (!signName) {
    return null;
  }

  return {
    sign: signName,
    degreeInSign,
  };
}

async function buildLagnaTableFallback(params = {}, options = {}) {
  const baseParams = buildBirthPayload(params);
  const translated = String(options.language || params.language || '').toLowerCase() === 'hi';

  const planetsPayload = await callAstrologyApi('planets', baseParams, {
    ...options,
    language: 'en',
  });

  const ascendant = getAscendantFromPlanetsPayload(planetsPayload);
  if (!ascendant) {
    throw new Error('Unable to derive ascendant from planets for lagna fallback');
  }

  const signDurationMinutes = 120;
  const currentMinute = Math.min(
    Math.max(baseParams.hour * 60 + baseParams.min, 0),
    1439,
  );
  const elapsedInCurrentSign = Math.round((ascendant.degreeInSign / 30) * signDurationMinutes);
  const currentSignStart = currentMinute - elapsedInCurrentSign;
  const currentSignIndex = SIGN_INDEX_BY_NAME[ascendant.sign] ?? 0;

  const intervals = [];
  for (let offset = -14; offset <= 14; offset += 1) {
    const intervalStart = currentSignStart + offset * signDurationMinutes;
    const intervalEndExclusive = intervalStart + signDurationMinutes;

    const clippedStart = Math.max(0, intervalStart);
    const clippedEnd = Math.min(1440, intervalEndExclusive);
    if (clippedEnd <= clippedStart) {
      continue;
    }

    const signIndex = ((currentSignIndex + offset) % 12 + 12) % 12;
    intervals.push({
      sign: ZODIAC_SIGNS[signIndex],
      startMinute: clippedStart,
      endMinuteExclusive: clippedEnd,
    });
  }

  intervals.sort((left, right) => left.startMinute - right.startMinute);

  const merged = [];
  for (const interval of intervals) {
    const last = merged[merged.length - 1];
    if (
      last
      && last.sign === interval.sign
      && Math.abs(last.endMinuteExclusive - interval.startMinute) < 1
    ) {
      last.endMinuteExclusive = Math.max(last.endMinuteExclusive, interval.endMinuteExclusive);
      continue;
    }

    merged.push({ ...interval });
  }

  if (!merged.length) {
    return [{
      lagna: toHindiSignName(ascendant.sign, translated),
      start: '00:00:00',
      end: '23:59:59',
    }];
  }

  const rows = merged.map((interval) => ({
    lagna: toHindiSignName(interval.sign, translated),
    start: formatTimeFromMinutes(interval.startMinute, 0),
    end: interval.endMinuteExclusive >= 1440
      ? '23:59:59'
      : formatTimeFromMinutes(interval.endMinuteExclusive, 0),
  }));

  if (rows[0].start !== '00:00:00') {
    rows[0].start = '00:00:00';
  }

  if (rows[rows.length - 1].end !== '23:59:59') {
    rows[rows.length - 1].end = '23:59:59';
  }

  return rows;
}

function isPlanAuthorizationError(status, payload, message) {
  if (status !== 405) {
    return false;
  }

  const messageBlob = [
    payload?.msg,
    payload?.message,
    message,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return messageBlob.includes('not authorized') || messageBlob.includes('subscribed plan');
}

function parseApiError(payload, fallbackMessage) {
  if (typeof payload === 'string') {
    return payload || fallbackMessage;
  }

  return (
    payload?.description
    || payload?.msg
    || payload?.message
    || payload?.error
    || payload?.errors?.[0]?.message
    || payload?.errors?.[0]?.description
    || fallbackMessage
  );
}

function resolveEndpoint(endpointKey) {
  const cleanKey = sanitizeEndpointKey(endpointKey);
  const normalizedKey = cleanKey.toLowerCase();
  const aliasedKey = ENDPOINT_ALIASES[normalizedKey] || normalizedKey;
  const definition = ENDPOINT_DEFINITIONS[aliasedKey];

  if (definition) {
    return {
      requestedKey: cleanKey,
      resolvedKey: aliasedKey,
      path: definition.path,
      payloadBuilder: definition.payloadBuilder,
    };
  }

  return {
    requestedKey: cleanKey,
    resolvedKey: normalizedKey,
    path: cleanKey,
    payloadBuilder: (params) => params,
  };
}

function getCredentials() {
  const userId = String(process.env.ASTROLOGY_API_USER_ID || DEFAULT_ASTROLOGY_API_USER_ID).trim();
  const apiKey = String(process.env.ASTROLOGY_API_KEY || DEFAULT_ASTROLOGY_API_KEY).trim();

  if (!userId || !apiKey) {
    throw new Error('Missing ASTROLOGY_API_USER_ID or ASTROLOGY_API_KEY');
  }

  return { userId, apiKey };
}

function buildAuthHeader(userId, apiKey) {
  return `Basic ${Buffer.from(`${userId}:${apiKey}`).toString('base64')}`;
}

function logResponse(endpointPath, status, payload) {
  const preview = typeof payload === 'string'
    ? payload.slice(0, 240)
    : JSON.stringify(payload).slice(0, 600);

  console.info('[AstrologyAPI] response', {
    endpoint: endpointPath,
    status,
    preview,
  });
}

export async function callAstrologyApi(endpointKey, params = {}, options = {}) {
  const endpoint = resolveEndpoint(endpointKey);
  const { userId, apiKey } = getCredentials();
  const language = String(options.language || params.language || DEFAULT_LANGUAGE).trim() || DEFAULT_LANGUAGE;
  const payload = endpoint.payloadBuilder(params);

  const response = await fetch(`${BASE_URL}/${endpoint.path}`, {
    method: 'POST',
    headers: {
      authorization: buildAuthHeader(userId, apiKey),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Language': language,
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get('content-type') || '';
  const responsePayload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '');

  logResponse(endpoint.path, response.status, responsePayload);

  if (!response.ok) {
    const message = parseApiError(
      responsePayload,
      `AstrologyAPI error for ${endpoint.requestedKey || endpoint.path}: ${response.status}`,
    );

    if (
      endpoint.resolvedKey === 'panchang_lagna_table'
      && isPlanAuthorizationError(response.status, responsePayload, message)
    ) {
      try {
        return await buildLagnaTableFallback(params, options);
      } catch (fallbackError) {
        const fallbackMessage = fallbackError instanceof Error
          ? fallbackError.message
          : String(fallbackError || 'Unknown lagna fallback failure');
        const error = new Error(`Panchang Lagna Table is unavailable on the current API plan and fallback generation failed: ${fallbackMessage}`);
        error.status = 502;
        error.endpoint = endpoint.path;
        error.provider = 'AstrologyAPI';
        error.payload = responsePayload;
        throw error;
      }
    }

    const error = new Error(message);
    error.status = response.status;
    error.endpoint = endpoint.path;
    error.provider = 'AstrologyAPI';
    error.payload = responsePayload;
    throw error;
  }

  if (typeof responsePayload === 'string') {
    return responsePayload;
  }

  return responsePayload?.output ?? responsePayload;
}

export function getBirthDetails(params = {}, options = {}) {
  return callAstrologyApi('birth_details', params, options);
}

export function getAstroDetails(params = {}, options = {}) {
  return callAstrologyApi('astro_details', params, options);
}

export function getPlanets(params = {}, options = {}) {
  return callAstrologyApi('planets', params, options);
}

export function getHoroChartD1(params = {}, options = {}) {
  return callAstrologyApi('horo_chart/D1', params, options);
}

export function getHoroChartImageD1(params = {}, options = {}) {
  return callAstrologyApi('horo_chart_image/D1', params, options);
}

export function getCurrentVdasha(params = {}, options = {}) {
  return callAstrologyApi('current_vdasha', params, options);
}

export function getMatchAshtakootPoints(params = {}, options = {}) {
  return callAstrologyApi('match_ashtakoot_points', params, options);
}

export function getBasicPanchang(params = {}, options = {}) {
  return callAstrologyApi('basic_panchang', params, options);
}

export function getGeoDetails(params = {}, options = {}) {
  return callAstrologyApi('geo_details', params, options);
}

export function getTimezoneWithDst(params = {}, options = {}) {
  return callAstrologyApi('timezone_with_dst', params, options);
}