(() => {
  const app = document.querySelector('#coverageApp[data-map-engine="maplibre"]');
  const mapElement = document.querySelector('#coverageMapLibre');

  if (!app || !mapElement || !window.maplibregl) {
    return;
  }

  const swedenPolygon = {
    type: 'Feature',
    properties: { name: 'Sweden' },
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [10.7, 55.3],
        [12.7, 55.0],
        [14.7, 55.4],
        [18.7, 57.0],
        [19.5, 59.1],
        [18.7, 61.0],
        [21.2, 64.4],
        [24.1, 66.2],
        [23.7, 68.4],
        [21.4, 69.2],
        [18.1, 68.6],
        [16.6, 66.4],
        [14.2, 64.2],
        [12.2, 62.2],
        [11.1, 59.8],
        [11.4, 57.6],
        [10.7, 55.3],
      ]],
    },
  };

  const coveragePoints = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { weight: 1 }, geometry: { type: 'Point', coordinates: [18.07, 59.33] } },
      { type: 'Feature', properties: { weight: 0.8 }, geometry: { type: 'Point', coordinates: [11.97, 57.71] } },
      { type: 'Feature', properties: { weight: 0.7 }, geometry: { type: 'Point', coordinates: [13.0, 55.6] } },
      { type: 'Feature', properties: { weight: 0.6 }, geometry: { type: 'Point', coordinates: [17.64, 59.86] } },
      { type: 'Feature', properties: { weight: 0.5 }, geometry: { type: 'Point', coordinates: [20.26, 63.83] } },
    ],
  };

  const initialCamera = {
    center: [16.6, 62.2],
    zoom: 4.15,
    pitch: 34,
    bearing: -8,
  };

  const stockholmCamera = {
    center: [18.0686, 59.3293],
    zoom: 13.35,
    pitch: 42,
    bearing: -14,
  };

  const firstSymbolLayerId = (map) => map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id;

  const safeSetPaint = (map, id, property, value) => {
    if (map.getLayer(id)) {
      map.setPaintProperty(id, property, value);
    }
  };

  const tuneBaseStyle = (map) => {
    safeSetPaint(map, 'background', 'background-color', '#101c27');
    safeSetPaint(map, 'water', 'fill-color', '#0b1722');
    safeSetPaint(map, 'water', 'fill-opacity', 0.92);
    safeSetPaint(map, 'landcover_wood', 'fill-color', '#1b2c32');
    safeSetPaint(map, 'landuse_park', 'fill-color', '#1b2f32');
    safeSetPaint(map, 'landuse_residential', 'fill-color', '#1a2830');
    safeSetPaint(map, 'landcover_glacier', 'fill-color', '#34434a');
    safeSetPaint(map, 'landcover_ice_shelf', 'fill-color', '#2d3d45');
    safeSetPaint(map, 'building', 'fill-color', '#24333b');
    safeSetPaint(map, 'building', 'fill-opacity', 0.2);

    map.getStyle().layers.forEach((layer) => {
      if (layer.type === 'line' && /road|highway|bridge|tunnel/i.test(layer.id)) {
        safeSetPaint(map, layer.id, 'line-color', '#9aa4aa');
        safeSetPaint(map, layer.id, 'line-opacity', ['interpolate', ['linear'], ['zoom'], 4, 0.12, 9, 0.2, 14, 0.3]);
      }

      if (layer.type === 'symbol' && /road|place|water/i.test(layer.id)) {
        safeSetPaint(map, layer.id, 'text-color', '#aab4bb');
        safeSetPaint(map, layer.id, 'text-halo-color', '#101c27');
        safeSetPaint(map, layer.id, 'text-halo-width', 1);
      }
    });
  };

  const addVisualMockLayers = (map) => {
    if (!map.getSource('dealett-sweden')) {
      map.addSource('dealett-sweden', {
        type: 'geojson',
        data: swedenPolygon,
      });
    }

    if (!map.getLayer('dealett-sweden-fill')) {
      map.addLayer({
        id: 'dealett-sweden-fill',
        type: 'fill',
        source: 'dealett-sweden',
        paint: {
          'fill-color': '#ef8214',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.06, 6, 0.09, 12, 0.025],
        },
      }, firstSymbolLayerId(map));
    }

    if (!map.getLayer('dealett-sweden-line')) {
      map.addLayer({
        id: 'dealett-sweden-line',
        type: 'line',
        source: 'dealett-sweden',
        paint: {
          'line-color': '#ef8214',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.2, 7, 2.2, 12, 1],
          'line-opacity': 0.5,
          'line-blur': 0.4,
        },
      }, firstSymbolLayerId(map));
    }

    if (!map.getSource('dealett-coverage-glow')) {
      map.addSource('dealett-coverage-glow', {
        type: 'geojson',
        data: coveragePoints,
      });
    }

    if (!map.getLayer('dealett-coverage-glow')) {
      map.addLayer({
        id: 'dealett-coverage-glow',
        type: 'circle',
        source: 'dealett-coverage-glow',
        paint: {
          'circle-color': '#ef8214',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 8, 7, 24, 13, 52],
          'circle-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.11, 9, 0.08, 13, 0.035],
          'circle-blur': 1,
        },
      }, firstSymbolLayerId(map));
    }

    if (!map.getLayer('dealett-building-extrusion')) {
      map.addLayer({
        id: 'dealett-building-extrusion',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#2a3a42',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13,
            0,
            15,
            ['coalesce', ['to-number', ['get', 'render_height']], ['to-number', ['get', 'height']], 18],
          ],
          'fill-extrusion-base': ['coalesce', ['to-number', ['get', 'render_min_height']], ['to-number', ['get', 'min_height']], 0],
          'fill-extrusion-opacity': 0.34,
        },
      }, firstSymbolLayerId(map));
    }
  };

  const map = new maplibregl.Map({
    container: mapElement,
    style: 'https://tiles.openfreemap.org/styles/dark',
    center: initialCamera.center,
    zoom: initialCamera.zoom,
    pitch: initialCamera.pitch,
    bearing: initialCamera.bearing,
    attributionControl: false,
    antialias: true,
    maxPitch: 68,
  });

  map.touchZoomRotate.enable();
  map.scrollZoom.enable();
  map.dragRotate.enable();

  const flyTo = (camera) => {
    map.flyTo({
      ...camera,
      speed: 0.72,
      curve: 1.55,
      duration: 2200,
      essential: true,
    });
  };

  map.on('load', () => {
    tuneBaseStyle(map);
    addVisualMockLayers(map);
    map.resize();
  });

  app.querySelector('#coverageMapZoomIn')?.addEventListener('click', () => {
    map.easeTo({ zoom: map.getZoom() + 0.8, duration: 600, easing: (t) => 1 - Math.pow(1 - t, 3) });
  });

  app.querySelector('#coverageMapZoomOut')?.addEventListener('click', () => {
    map.easeTo({ zoom: map.getZoom() - 0.8, duration: 600, easing: (t) => 1 - Math.pow(1 - t, 3) });
  });

  app.querySelector('[data-map-action="stockholm"]')?.addEventListener('click', () => {
    flyTo(stockholmCamera);
  });

  const searchForm = app.querySelector('.coverage-maplibre-search');
  const searchInput = app.querySelector('#coverageMapSearch');

  searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const query = searchInput?.value.trim().toLowerCase();
    if (!query || query.includes('stockholm')) {
      flyTo(stockholmCamera);
      return;
    }

    flyTo(initialCamera);
  });

  app.querySelectorAll('.coverage-maplibre-operator').forEach((button) => {
    button.addEventListener('click', () => {
      app.querySelectorAll('.coverage-maplibre-operator').forEach((operator) => {
        operator.classList.toggle('is-active', operator === button);
      });
    });
  });

  app.querySelectorAll('.coverage-maplibre-network').forEach((button) => {
    button.addEventListener('click', () => {
      app.querySelectorAll('.coverage-maplibre-network').forEach((network) => {
        network.classList.toggle('is-active', network === button);
      });
    });
  });

  window.addEventListener('resize', () => {
    map.resize();
  });

  window.dealettCoverageMap = { map, flyToStockholm: () => flyTo(stockholmCamera) };
})();
