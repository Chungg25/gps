import axios from 'axios';

async function testValhalla() {
  const testRoute = [
    { lat: 10.7769, lon: 106.7009, time: 0, radius: 10 },
    { lat: 10.7770, lon: 106.7010, time: 5, radius: 10 },
    { lat: 10.7775, lon: 106.7015, time: 10, radius: 10 }
  ];

  try {
    const res = await axios.post('https://my-valhalla.onrender.com/trace_route', {
      shape: testRoute,
      shape_match: 'map_snap',
      costing: 'auto'
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}

testValhalla();
