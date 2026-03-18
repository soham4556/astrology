import { supabase } from './supabaseClient';

function isMissingTableError(error, tableName) {
  if (!error) {
    return false;
  }

  const message = String(error.message || '').toLowerCase();
  const code = String(error.code || '').toUpperCase();
  const tableReference = `public.${tableName}`.toLowerCase();

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes("could not find the table") ||
    message.includes('schema cache') ||
    message.includes('relation') ||
    message.includes(tableReference)
  );
}

function handleReportInsertError(error, tableName) {
  if (isMissingTableError(error, tableName)) {
    return;
  }

  throw error;
}

export async function saveHoroscopeReport({ userId, sign, query, result }) {
  const { error } = await supabase.from('horoscope_reports').insert({
    user_id: userId,
    sign,
    query_payload: query,
    response_payload: result,
  });

  if (error) {
    handleReportInsertError(error, 'horoscope_reports');
  }
}

export async function saveKundaliReport({
  userId,
  fullName,
  birthDate,
  birthTime,
  latitude,
  longitude,
  timezone,
  query,
  result,
}) {
  const { error } = await supabase.from('kundali_reports').insert({
    user_id: userId,
    full_name: fullName,
    birth_date: birthDate,
    birth_time: birthTime,
    latitude,
    longitude,
    timezone,
    query_payload: query,
    response_payload: result,
  });

  if (error) {
    handleReportInsertError(error, 'kundali_reports');
  }
}

export async function savePanchangReport({ userId, panchangDate, latitude, longitude, timezone, query, result }) {
  const { error } = await supabase.from('panchang_history').insert({
    user_id: userId,
    panchang_date: panchangDate,
    latitude,
    longitude,
    timezone,
    query_payload: query,
    response_payload: result,
  });

  if (error) {
    handleReportInsertError(error, 'panchang_history');
  }
}

export async function saveMatchReport({
  userId,
  partnerOneName,
  partnerTwoName,
  compatibilityScore,
  query,
  result,
}) {
  const { error } = await supabase.from('match_results').insert({
    user_id: userId,
    partner_one_name: partnerOneName,
    partner_two_name: partnerTwoName,
    compatibility_score: compatibilityScore,
    query_payload: query,
    response_payload: result,
  });

  if (error) {
    handleReportInsertError(error, 'match_results');
  }
}

export async function getRecentReports(userId) {
  const tables = [
    { table: 'horoscope_reports', label: 'Horoscope' },
    { table: 'kundali_reports', label: 'Kundali' },
    { table: 'panchang_history', label: 'Panchang' },
    { table: 'match_results', label: 'Match' },
  ];

  const results = await Promise.all(
    tables.map(async ({ table, label }) => {
      const { data, error } = await supabase
        .from(table)
        .select('id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        if (isMissingTableError(error, table)) {
          return [];
        }
        throw error;
      }

      return (data || []).map((row) => ({
        id: row.id,
        type: label,
        createdAt: row.created_at,
      }));
    }),
  );

  return results
    .flat()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);
}
