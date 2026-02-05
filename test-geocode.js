const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function geocode(query) {
  console.log('Geocoding query:', query);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data.length > 0) {
    const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    console.log('Geocoded coordinates:', coords);
    return coords;
  } else {
    console.log('No geocoding result');
    return null;
  }
}

async function test() {
  // Example property data
  const property = {
    title: 'Nishika Elysium',
    location: 'Mumbai',
    location_data: { name: 'Nishika Elysium' }
  };

  // Test combinations
  const queries = [
    property.location_data?.name && property.location ? `${property.location_data.name}, ${property.location}` : null,
    property.location_data?.name,
    property.location
  ].filter(Boolean);

  for (const query of queries) {
    await geocode(query);
  }
}

test(); 