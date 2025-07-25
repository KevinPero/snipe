// Import Mapbox GL
import mapboxgl from 'https://cdn.skypack.dev/mapbox-gl';
// Import Turf.js for area calculation
import * as turf from 'https://cdn.skypack.dev/@turf/turf';

mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW5wZXJvIiwiYSI6ImNtZDdtZ2N1bzBtMXAybXBzajM2c29rczcifQ.vmxgl2K5jzw5-8P3uqaQ3Q'; // <<< PUT YOUR TOKEN HERE

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/satellite-streets-v12',
  center: [-96, 40],
  zoom: 3
});

// Add map controls
map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');
map.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

// === OPTIONAL LOOKUP TABLE FOR PRETTIER NAMES & DATES ===
// Fill this with your data. The keys must exactly match the 'name' property in your GeoJSON.
const birdInfo = {
  "April_GPS_seg1 95% est": {
    "arrival": "2024-04-05 17:01:00",
    "departure": "2024-04-18 22:48:00"
  },
  "April_GPS_seg8 95% est": {
    "arrival": "2024-04-24 07:18:00",
    "departure": "2024-05-08 22:02:00"
  },
  "Basil_GPS_seg1 95% est": {
    "arrival": "2025-03-04 17:00:48",
    "departure": "2025-04-04 02:01:00"
  },
  "Beepo_GPS_seg1 95% est": {
    "arrival": "2024-12-24 02:10:18",
    "departure": "2025-03-13 17:01:00"
  },
  "Beepo_GPS_seg6 95% est": {
    "arrival": "2025-03-25 18:02:48",
    "departure": "2025-05-01 00:40:30"
  },
  "Bonbon_GPS_seg1 95% est": {
    "arrival": "2025-03-23 08:57:48",
    "departure": "2025-04-20 14:45:48"
  },
  "Bonbon_GPS_seg10 95% est": {
    "arrival": "2025-05-08 02:30:30",
    "departure": "2025-06-26 22:19:30"
  },
  "Bret_GPS_seg1 95% est": {
    "arrival": "2024-03-02 17:00:54",
    "departure": "2024-03-24 11:30:30"
  },
  "Bret_GPS_seg4 95% est": {
    "arrival": "2024-03-25 09:30:48",
    "departure": "2024-04-21 23:27:00"
  },
  "Buzz_GPS_seg1 95% est": {
    "arrival": "2024-03-03 01:04:30",
    "departure": "2024-03-11 19:32:39"
  },
  "Buzz_GPS_seg15 95% est": {
    "arrival": "2024-04-23 20:54:00",
    "departure": "2024-04-28 05:54:54"
  },
  "Buzz_GPS_seg20 95% est": {
    "arrival": "2024-04-30 06:10:18",
    "departure": "2024-05-13 23:44:30"
  },
  "Buzz_GPS_seg29 95% est": {
    "arrival": "2024-06-12 01:47:00",
    "departure": "2024-07-03 21:37:18"
  },
  "Buzz_GPS_seg34 95% est": {
    "arrival": "2024-07-09 17:01:00",
    "departure": "2024-08-24 17:00:49"
  },
  "Buzz_GPS_seg42 95% est": {
    "arrival": "2024-10-24 17:01:18",
    "departure": "2024-11-08 17:01:00"
  },
  "Buzz_GPS_seg45 95% est": {
    "arrival": "2024-11-12 17:00:30",
    "departure": "2025-01-04 17:00:30"
  },
  "Buzz_GPS_seg46 95% est": {
    "arrival": "2025-01-07 17:00:31",
    "departure": "2025-02-17 21:15:00"
  },
  "Buzz_GPS_seg5 95% est": {
    "arrival": "2024-03-13 04:04:00",
    "departure": "2024-03-21 02:17:18"
  },
  "Buzz_GPS_seg50 95% est": {
    "arrival": "2025-02-26 17:29:48",
    "departure": "2025-03-26 19:17:30"
  },
  "Buzz_GPS_seg53 95% est": {
    "arrival": "2025-03-27 16:18:00",
    "departure": "2025-04-06 18:17:48"
  },
  "Buzz_GPS_seg64 95% est": {
    "arrival": "2025-04-20 18:38:48",
    "departure": "2025-05-05 02:24:24"
  },
  "Buzz_GPS_seg8 95% est": {
    "arrival": "2024-03-22 08:17:00",
    "departure": "2024-04-06 01:16:24"
  },
  "Buzz_GPS_seg9 95% est": {
    "arrival": "2024-04-06 09:16:24",
    "departure": "2024-04-13 01:10:30"
  },
  "Chili_GPS_seg2 95% est": {
    "arrival": "2024-03-06 06:51:00",
    "departure": "2024-03-31 22:58:54"
  },
  "Chili_GPS_seg25 95% est": {
    "arrival": "2024-05-07 15:36:24",
    "departure": "2024-08-03 05:00:54"
  },
  "Chili_GPS_seg9 95% est": {
    "arrival": "2024-04-08 05:01:30",
    "departure": "2024-04-30 19:30:00"
  },
  "Cirrus_GPS_seg1 95% est": {
    "arrival": "2025-03-02 06:19:30",
    "departure": "2025-04-08 17:01:30"
  },
  "CocoPuff_GPS_seg1 95% est": {
    "arrival": "2025-02-16 02:57:48",
    "departure": "2025-03-12 17:01:24"
  },
  "CocoPuff_GPS_seg7 95% est": {
    "arrival": "2025-04-03 17:00:55",
    "departure": "2025-04-26 23:25:24"
  },
  "Cranberry_GPS_seg1 95% est": {
    "arrival": "2025-02-24 17:01:00",
    "departure": "2025-03-17 23:32:54"
  },
  "Cranberry_GPS_seg12 95% est": {
    "arrival": "2025-05-04 07:45:30",
    "departure": "2025-05-12 00:25:24"
  },
  "Cranberry_GPS_seg2 95% est": {
    "arrival": "2025-03-18 05:32:54",
    "departure": "2025-04-14 19:41:00"
  },
  "Cranberry_GPS_seg6 95% est": {
    "arrival": "2025-04-18 07:40:30",
    "departure": "2025-04-28 13:46:24"
  },
  "Creek_GPS_seg1 95% est": {
    "arrival": "2024-12-19 04:58:30",
    "departure": "2025-01-03 05:07:24"
  },
  "Creek_GPS_seg2 95% est": {
    "arrival": "2025-01-03 11:07:24",
    "departure": "2025-04-08 22:20:48"
  },
  "Crouton_GPS_seg1 95% est": {
    "arrival": "2025-02-23 21:47:00",
    "departure": "2025-04-17 21:39:18"
  },
  "Crouton_GPS_seg4 95% est": {
    "arrival": "2025-04-18 09:39:24",
    "departure": "2025-04-28 21:39:24"
  },
  "Crouton_GPS_seg7 95% est": {
    "arrival": "2025-04-29 15:39:00",
    "departure": "2025-05-04 21:38:31"
  },
  "Cupcake_GPS_seg1 95% est": {
    "arrival": "2025-02-17 13:13:24",
    "departure": "2025-03-13 17:00:54"
  },
  "Cupcake_GPS_seg6 95% est": {
    "arrival": "2025-04-02 17:00:54",
    "departure": "2025-04-11 01:06:30"
  },
  "Cupcake_GPS_seg7 95% est": {
    "arrival": "2025-04-11 14:02:18",
    "departure": "2025-05-04 17:01:30"
  },
  "DerechoDave_GPS_seg1 95% est": {
    "arrival": "2025-01-19 10:06:00",
    "departure": "2025-04-04 02:01:30"
  },
  "DerechoDave_GPS_seg4 95% est": {
    "arrival": "2025-04-13 20:43:54",
    "departure": "2025-04-28 19:25:00"
  },
  "Dressing_GPS_seg1 95% est": {
    "arrival": "2025-02-24 21:46:30",
    "departure": "2025-04-12 23:16:00"
  },
  "Dressing_GPS_seg4 95% est": {
    "arrival": "2025-04-20 23:41:00",
    "departure": "2025-04-29 02:01:00"
  },
  "Frank_GPS_seg1 95% est": {
    "arrival": "2025-02-02 19:02:55",
    "departure": "2025-03-13 20:03:30"
  },
  "Frank_GPS_seg10 95% est": {
    "arrival": "2025-04-15 00:14:24",
    "departure": "2025-04-21 00:14:48"
  },
  "Frank_GPS_seg11 95% est": {
    "arrival": "2025-04-21 06:13:55",
    "departure": "2025-04-27 00:13:48"
  },
  "Frank_GPS_seg8 95% est": {
    "arrival": "2025-04-07 12:13:30",
    "departure": "2025-04-13 18:12:10"
  },
  "Froyo_GPS_seg1 95% est": {
    "arrival": "2025-03-24 06:42:24",
    "departure": "2025-04-17 05:53:00"
  },
  "Froyo_GPS_seg16 95% est": {
    "arrival": "2025-05-11 17:01:30",
    "departure": "2025-07-13 23:28:30"
  },
  "Froyo_GPS_seg3 95% est": {
    "arrival": "2025-04-18 11:59:00",
    "departure": "2025-04-27 18:02:56"
  },
  "Fussbucket_GPS_seg1 95% est": {
    "arrival": "2025-03-01 17:01:24",
    "departure": "2025-03-10 22:36:24"
  },
  "Fussbucket_GPS_seg17 95% est": {
    "arrival": "2025-04-16 13:11:24",
    "departure": "2025-07-14 09:40:30"
  },
  "Fussbucket_GPS_seg3 95% est": {
    "arrival": "2025-03-11 10:36:18",
    "departure": "2025-03-17 22:36:00"
  },
  "Fussbucket_GPS_seg9 95% est": {
    "arrival": "2025-03-20 04:35:54",
    "departure": "2025-04-10 19:41:24"
  },
  "Marshmallow_GPS_seg1 95% est": {
    "arrival": "2025-03-04 08:30:30",
    "departure": "2025-04-23 02:01:30"
  },
  "Misty_GPS_seg1 95% est": {
    "arrival": "2025-03-02 17:01:00",
    "departure": "2025-04-13 00:17:01"
  },
  "Misty_GPS_seg19 95% est": {
    "arrival": "2025-05-05 17:27:31",
    "departure": "2025-05-27 21:00:54"
  },
  "Misty_GPS_seg6 95% est": {
    "arrival": "2025-04-14 06:16:54",
    "departure": "2025-04-24 00:16:30"
  },
  "Mudbug_GPS_seg1 95% est": {
    "arrival": "2025-02-09 20:44:30",
    "departure": "2025-03-14 17:01:24"
  },
  "Mudbug_GPS_seg2 95% est": {
    "arrival": "2025-03-16 17:01:00",
    "departure": "2025-04-16 17:01:00"
  },
  "MuddyLegs_GPS_seg2 95% est": {
    "arrival": "2024-03-11 17:01:01",
    "departure": "2024-03-21 17:00:30"
  },
  "MuddyLegs_GPS_seg7 95% est": {
    "arrival": "2024-04-02 11:25:24",
    "departure": "2024-04-07 01:21:00"
  },
  "MuddyLegs_GPS_seg8 95% est": {
    "arrival": "2024-04-07 07:47:24",
    "departure": "2024-04-15 06:10:00"
  },
  "Nado_GPS_seg1 95% est": {
    "arrival": "2025-03-02 17:00:48",
    "departure": "2025-04-13 13:14:00"
  },
  "Nimbus_GPS_seg1 95% est": {
    "arrival": "2025-03-02 17:00:30",
    "departure": "2025-03-14 17:00:54"
  },
  "Nimbus_GPS_seg18 95% est": {
    "arrival": "2025-04-28 02:00:54",
    "departure": "2025-06-23 18:00:54"
  },
  "Oak_GPS_seg1 95% est": {
    "arrival": "2025-01-08 17:01:00",
    "departure": "2025-02-03 17:00:48"
  },
  "Oak_GPS_seg12 95% est": {
    "arrival": "2025-03-12 18:22:30",
    "departure": "2025-04-17 02:26:05"
  },
  "Oak_GPS_seg19 95% est": {
    "arrival": "2025-04-20 06:49:30",
    "departure": "2025-05-02 02:00:54"
  },
  "Oak_GPS_seg23 95% est": {
    "arrival": "2025-05-06 02:00:30",
    "departure": "2025-07-12 19:01:30"
  },
  "Oak_GPS_seg6 95% est": {
    "arrival": "2025-02-19 23:03:30",
    "departure": "2025-03-03 00:42:00"
  },
  "Peachie_GPS_seg1 95% est": {
    "arrival": "2025-02-03 02:15:30",
    "departure": "2025-03-14 22:05:18"
  },
  "Peachie_GPS_seg12 95% est": {
    "arrival": "2025-07-08 13:36:01",
    "departure": "2025-07-14 05:50:00"
  },
  "Peachie_GPS_seg4 95% est": {
    "arrival": "2025-03-17 17:01:24",
    "departure": "2025-04-18 08:07:00"
},
"Peachie_GPS_seg7 95% est": {
"arrival": "2025-05-05 00:50:24",
"departure": "2025-07-03 19:01:24"
},
"Pokey_GPS_seg12 95% est": {
"arrival": "2025-05-22 23:14:00",
"departure": "2025-07-12 19:02:00"
},
"Pokey_GPS_seg2 95% est": {
"arrival": "2025-01-17 00:28:00",
"departure": "2025-03-14 02:01:00"
},
"Thing2_GPS_seg1 95% est": {
"arrival": "2024-12-21 13:02:30",
"departure": "2025-04-01 02:00:59"
},
"Thing2_GPS_seg3 95% est": {
"arrival": "2025-04-03 02:01:24",
"departure": "2025-04-22 21:51:00"
},
"Thing2_GPS_seg7 95% est": {
"arrival": "2025-04-30 15:21:00",
"departure": "2025-07-13 21:01:02"
},
"Truffle_GPS_seg1 95% est": {
"arrival": "2025-03-23 23:34:30",
"departure": "2025-04-20 20:40:00"
},
"Truffle_GPS_seg10 95% est": {
"arrival": "2025-05-07 17:01:24",
"departure": "2025-06-10 07:23:48"
},
"Truffle_GPS_seg12 95% est": {
"arrival": "2025-06-19 17:00:31",
"departure": "2025-07-13 19:36:00"
}
};
// Function: derive display name automatically
function getPrettyName(rawName) {
  return rawName.split("_GPS_")[0];
}

// Assign distinct colors per name
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
  // === 1. LOAD HOME RANGE POLYGONS ===
  const hrData = await fetch('./All_Snipe_95_AKDEs_EstOnly.geojson').then(res => res.json());

  // Calculate area for each polygon
  hrData.features.forEach(f => {
    const m2 = turf.area(f);
    f.properties.range_km2 = (m2 / 1e6).toFixed(2);
  });

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

  // === 2. LOAD CENTROIDS ===
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

  // === 3. LOAD TRACK LINES ===
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

  // === 4. POPUP ON HOVER ===
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('mouseenter', 'home_ranges_fill', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    const props = e.features[0].properties;
    const rawName = props.name;
    const info = birdInfo[rawName] || {};
    const displayName = getPrettyName(rawName);

    const html = `
      <strong>${displayName}</strong><br>
      Arrived: ${info.arrival || "???"}<br>
      Departed: ${info.departure || "???"}<br>
      Home range size: ${props.range_km2} km²
    `;

    popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
  });

  map.on('mouseleave', 'home_ranges_fill', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  // === 5. ZOOM-BASED VISIBILITY TOGGLE ===
  map.on('zoom', () => {
    const zoom = map.getZoom();
    const visibility = zoom > 11 ? 'none' : 'visible';
    map.setLayoutProperty('centroids', 'visibility', visibility);
    map.setLayoutProperty('tracks', 'visibility', visibility);
  });
});
