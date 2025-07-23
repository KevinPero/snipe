mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW5wZXJvIiwiYSI6ImNtZDdtZ2N1bzBtMXAybXBzajM2c29rczcifQ.vmxgl2K5jzw5-8P3uqaQ3Q';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  center: [-95, 40],
  zoom: 3
});

map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

const birdColors = {
  // Dark blue
  'April': '#08306b', 'Beepo': '#08306b', 'Buzz': '#08306b',
  'Buzz2': '#08306b', 'Chili': '#08306b', 'Thing #2': '#08306b',
  'Ol Muddy Legs': '#08306b', 'Little Bret': '#08306b',

  // Light blue
  'Frank': '#6baed6', 'Oak': '#6baed6', 'YIPPEE': '#6baed6',

  // Light green
  'Cirrus': '#74c476', 'Derecho Dave': '#74c476', 'Misty': '#74c476',
  'Nado': '#74c476', 'Nimbus': '#74c476', 'Peachie': '#74c476',

  // Orange
  'Bonbon': '#fd8d3c', 'Coco Puff': '#fd8d3c', 'Cupcake': '#fd8d3c',
  'Froyo': '#fd8d3c', 'Fussbucket': '#fd8d3c', 'Mudbug': '#fd8d3c',
  'Truffle': '#fd8d3c',

  // Red
  'Captain Crouton': '#e41a1c', 'Creek': '#e41a1c', 'Detective Dressing': '#e41a1c',
  'General Basil': '#e41a1c', 'Major Marshmallow': '#e41a1c',
  'Sergeant Cranberry': '#e41a1c', 'Pokey': '#e41a1c'
};

let birdGroups = {};
let allTimestamps = [];
let currentTimestampIndex = 0;
let animationFrame;

const cachedLineData = {}; // new: holds incrementally growing LineStrings per bird
let lastRenderedTimestamp = null;

fetch('snipe_points_synthetic_time.geojson')
  .then(res => res.json())
  .then(data => {
    data.features = data.features.filter(f => {
  const date = new Date(f.properties.synthetic_time);
  const month = date.getUTCMonth(); // 0 = Jan, 5 = June
  const day = date.getUTCDate();

  return (
    (month > 2 && month < 5) ||           // April, May
    (month === 2 && day >= 1) ||          // March 1+
    (month === 5 && day <= 15)            // Up to June 15
  );
});

    data.features.forEach(f => {
      const alias = f.properties.alias || f.properties.bird_name || 'unknown';
      if (!birdGroups[alias]) birdGroups[alias] = [];
      birdGroups[alias].push({
        coords: f.geometry.coordinates,
        time: new Date(f.properties.synthetic_time)
      });
    });

    Object.keys(birdGroups).forEach(alias => {
      birdGroups[alias].sort((a, b) => a.time - b.time);
    });

    const timestampSet = new Set();
    Object.values(birdGroups).forEach(points => {
      points.forEach(p => timestampSet.add(p.time.getTime()));
    });

    allTimestamps = Array.from(timestampSet).sort((a, b) => a - b).map(t => new Date(t));
    currentTimestampIndex = 0;

    map.on('load', () => {
      Object.keys(birdGroups).forEach(alias => {
        cachedLineData[alias] = {
          coords: [],
          index: 0 // pointer to next point to add
        };
        

        map.addSource(alias, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [] }
          }
        });

        map.addLayer({
          id: alias + '-line',
          type: 'line',
          source: alias,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': birdColors[alias] || '#999999',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      });

      animateLines();
    });
  });

function formatDateToLabel(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function animateLines() {
  animationFrame = requestAnimationFrame(animateLines);
  if (currentTimestampIndex >= allTimestamps.length) return;

  const currentTime = allTimestamps[currentTimestampIndex];

  if (!lastRenderedTimestamp || currentTime.getTime() !== lastRenderedTimestamp.getTime()) {
    const dateDiv = document.getElementById('date-display');
    dateDiv.textContent = formatDateToLabel(currentTime);
    lastRenderedTimestamp = currentTime;
  }

  Object.keys(birdGroups).forEach(alias => {
    const birdData = birdGroups[alias];
    const cache = cachedLineData[alias];

    while (
      cache.index < birdData.length &&
      birdData[cache.index].time <= currentTime
    ) {
      cache.coords.push(birdData[cache.index].coords);
      cache.index++;
    }

    const newGeoJSON = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: cache.coords
      }
    };

    map.getSource(alias).setData(newGeoJSON);
  });

  // Step forward every 2–3 frames for better speed (edit as needed)
  currentTimestampIndex += 3;
}
