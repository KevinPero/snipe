mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW5wZXJvIiwiYSI6ImNtZDdtZ2N1bzBtMXAybXBzajM2c29rczcifQ.vmxgl2K5jzw5-8P3uqaQ3Q';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [-96, 40],
    zoom: 3
});

// Generate a color for each unique bird name
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
    // Load home ranges
    const hrResponse = await fetch('All_Snipe_95_AKDEs_EstOnly.geojson');
    const hrData = await hrResponse.json();
    const colorMap = getColorMap(hrData.features, "name");

    map.addSource('home_ranges', {
        type: 'geojson',
        data: hrData
    });

    map.addLayer({
        id: 'home_ranges_fill',
        type: 'fill',
        source: 'home_ranges',
        paint: {
            'fill-color': ['get', ['to-string', ['get', 'name']], ['literal', colorMap]],
            'fill-opacity': 0.4
        }
    });

    map.addLayer({
        id: 'home_ranges_outline',
        type: 'line',
        source: 'home_ranges',
        paint: {
            'line-color': ['get', ['to-string', ['get', 'name']], ['literal', colorMap]],
            'line-width': 1.5
        }
    });

    // Load centroid points and filter to one per unique 'name'
    const centroidResponse = await fetch('AKDE_95_centroids.geojson');
    const centroidData = await centroidResponse.json();

    const seenNames = new Set();
    const filteredCentroids = {
        type: "FeatureCollection",
        features: centroidData.features.filter(f => {
            const name = f.properties.name;
            if (!seenNames.has(name)) {
                seenNames.add(name);
                return true;
            }
            return false;
        })
    };

    map.addSource('centroids', {
        type: 'geojson',
        data: filteredCentroids
    });

    map.addLayer({
        id: 'centroids',
        type: 'circle',
        source: 'centroids',
        paint: {
            'circle-radius': 6,
            'circle-color': [
                'get', ['to-string', ['get', 'name']], ['literal', colorMap]
            ],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 1
        }
    });

    // Load tracks
    const tracksResponse = await fetch('snipe_tracks.geojson');
    const tracksData = await tracksResponse.json();

    map.addSource('tracks', {
        type: 'geojson',
        data: tracksData
    });

    map.addLayer({
        id: 'tracks',
        type: 'line',
        source: 'tracks',
        paint: {
            'line-color': '#ffffff',
            'line-width': 1.5,
            'line-opacity': 0.5
        }
    });

    // Zoom logic — hide centroids and tracks only when zoomed in too far
    map.on('zoom', () => {
        const zoom = map.getZoom();
        const visibility = zoom > 11 ? 'none' : 'visible';
        map.setLayoutProperty('centroids', 'visibility', visibility);
        map.setLayoutProperty('tracks', 'visibility', visibility);
    });
});
