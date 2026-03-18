import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 4000}/api/astrology`;
// Note: We need a valid Supabase token if verifySupabaseUser is strict. 
// For local testing of logic, we might need to temporarily bypass or use a mock.
// Assuming for this test we are checking if the service itself can be invoked.

async function testEndpoint(feature, params = {}) {
  console.log(`Testing [${feature}]...`);
  try {
    const response = await fetch(`${API_URL}/${feature}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer <MOCK_TOKEN>' // If middleware is active
      },
      body: JSON.stringify({ params }),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ [${feature}] Success!`);
      // console.log(JSON.stringify(result.data, null, 2).substring(0, 200) + '...');
    } else {
      console.log(`❌ [${feature}] Failed:`, result.message || result.error);
    }
  } catch (error) {
    console.error(`💥 [${feature}] Error:`, error.message);
  }
}

async function runTests() {
  console.log('Starting AstrologyAPI endpoint verification...\n');
  
  const commonParams = {
    datetime: new Date().toISOString(),
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 5.5,
  };

  await testEndpoint('birth_details', commonParams);
  await testEndpoint('astro_details', commonParams);
  await testEndpoint('planets', commonParams);
  await testEndpoint('horo_chart/D1', commonParams);
  await testEndpoint('horo_chart_image/D1', commonParams);
  await testEndpoint('current_vdasha', commonParams);
  await testEndpoint('match_ashtakoot_points', {
    partner1_dob: '1995-01-15T08:30:00+05:30',
    partner2_dob: '1996-04-22T10:15:00+05:30',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 5.5,
  });
  await testEndpoint('basic_panchang', commonParams);
  await testEndpoint('timezone_with_dst', commonParams);
  await testEndpoint('geo_details', {
    place_name: 'Delhi',
    max_rows: 5,
  });
  await testEndpoint('chart', {
    ...commonParams,
    chart_type: 'rasi',
    chart_style: 'north-indian',
    format: 'svg'
  });

  console.log('\nVerification Complete.');
}

// runTests();
console.log('Test script created. Note: Ensure server is running and auth is handled.');
