import mapboxgl from 'https://cdn.skypack.dev/mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW5wZXJvIiwiYSI6ImNtZDdtZ2N1bzBtMXAybXBzajM2c29rczcifQ.vmxgl2K5jzw5-8P3uqaQ3Q';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [-96, 40],
  zoom: 3
});

map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');


// Create distinct colors for each bird
function getColorMap(features, property) {
  const names = [...new Set(features.map(f => f.properties[property]))];
  const colorMap = {};
  names.forEach((name, i) => {
    const hue = (i * 137.508) % 360;
    colorMap[name] = `hsl(${hue}, 70%, 60%)`;
  });
  return colorMap;
}

map.on('load', async () => {
  // Load home range polygons
  const hrData = await fetch('./All_Snipe_95_AKDEs_EstOnly.geojson').then(res => res.json());
  const colorMap = getColorMap(hrData.features, 'name');

  map.addSource('home_ranges', { type: 'geojson', data: hrData });

  map.addLayer({
    id: 'home_ranges_fill',
    type: 'fill',
    source: 'home_ranges',
    paint: {
      'fill-color': ['match', ['get', 'name'],
        ...Object.entries(colorMap).flat(), '#ccc'
      ],
      'fill-opacity': 0.4
    }
  });

  map.addLayer({
    id: 'home_ranges_outline',
    type: 'line',
    source: 'home_ranges',
    paint: {
      'line-color': ['match', ['get', 'name'],
        ...Object.entries(colorMap).flat(), '#000'
      ],
      'line-width': 1.5
    }
  });

  // Load and filter centroid points
  const centroids = await fetch('./AKDE_95_centroids.geojson').then(res => res.json());
  const seen = new Set();
  const filtered = {
    type: "FeatureCollection",
    features: centroids.features.filter(f => {
      const name = f.properties.name;
      if (!seen.has(name)) {
        seen.add(name);
        return true;
      }
      return false;
    })
  };

  map.addSource('centroids', { type: 'geojson', data: filtered });

  map.addLayer({
    id: 'centroids',
    type: 'circle',
    source: 'centroids',
    paint: {
      'circle-radius': 6,
      'circle-color': ['match', ['get', 'name'],
        ...Object.entries(colorMap).flat(), '#000'
      ],
      'circle-stroke-color': '#fff',
      'circle-stroke-width': 1
    }
  });

  // Load track lines
  const tracks = await fetch('./snipe_tracks.geojson').then(res => res.json());

  map.addSource('tracks', { type: 'geojson', data: tracks });

  map.addLayer({
    id: 'tracks',
    type: 'line',
    source: 'tracks',
    paint: {
      'line-color': '#fff',
      'line-width': 1.5,
      'line-opacity': 0.5
    }
  });

  // Zoom-based visibility toggle
  map.on('zoom', () => {
    const zoom = map.getZoom();
    const visibility = zoom > 11 ? 'none' : 'visible';
    map.setLayoutProperty('centroids', 'visibility', visibility);
    map.setLayoutProperty('tracks', 'visibility', visibility);
  });
});
