// Using global fetch

async function test() {
  const url = 'http://127.0.0.1:4000/api/astrology/astro_details';
  const payload = {
    params: {
      datetime: new Date().toISOString(),
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 5.5,
    }
  };

  console.log('Fetching:', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();
