(() => {
  const app = document.querySelector('#coverageApp[data-map-engine="maplibre"]');
  const mapElement = document.querySelector('#coverageMapLibre');

  if (!app || !mapElement || !window.maplibregl) {
    return;
  }

  const operators = ['telia', 'tele2', 'telenor', 'tre', 'halebop'];
  const networks = ['2G', '3G', '4G', '4G+', '5G', '5G+'];
  const mapThemeStorageKey = 'dealettCoverageMapTheme';
  const operatorLabels = {
    telia: 'Telia',
    tele2: 'Tele2',
    telenor: 'Telenor',
    tre: 'Tre',
    halebop: 'Halebop',
  };
  const networkPropertyKeys = {
    '2G': 'network_2g',
    '3G': 'network_3g',
    '4G': 'network_4g',
    '4G+': 'network_4g_plus',
    '5G': 'network_5g',
    '5G+': 'network_5g_plus',
  };

  const swedenBounds = [10.4, 55.0, 24.5, 69.3];
  const swedenFitBounds = [[10.4, 55.0], [24.5, 69.3]];
  const swedenMaxBounds = [[-8.0, 48.0], [39.0, 76.5]];
  const swedenCameraBase = {
    pitch: 18,
    bearing: -6,
  };
  const mapPitch2D = 0;
  const mapPitch3D = 22;

  const localizedName = ['coalesce', ['get', 'name:latin'], ['get', 'name_en'], ['get', 'name']];
  const roadName = ['coalesce', ['get', 'name:latin'], ['get', 'name_en'], ['get', 'name'], ['get', 'ref']];
  const mapThemePaint = {
    light: {
      background: '#dfe9ec',
      rasterSaturation: 0.08,
      rasterContrast: 0.05,
      rasterBrightnessMin: 0.03,
      rasterBrightnessMax: 1,
      terrainExaggeration: 0.78,
      hillshadeShadow: 'rgba(8, 14, 18, 0.16)',
      hillshadeHighlight: 'rgba(255, 251, 235, 0.12)',
      hillshadeAccent: 'rgba(70, 96, 104, 0.08)',
      waterDepthColor: '#7f9eaa',
      waterDepthOpacity: ['interpolate', ['linear'], ['zoom'], 4, 0.16, 9, 0.1, 14, 0.04],
      roadMajor: ['interpolate', ['linear'], ['zoom'], 5, '#f1e8d0', 12, '#fff5df'],
      roadMajorOpacity: ['interpolate', ['linear'], ['zoom'], 5, 0.32, 10, 0.52, 15, 0.74],
      roadMinor: '#f1efe7',
      roadMinorOpacity: ['interpolate', ['linear'], ['zoom'], 12, 0.18, 15, 0.42, 17, 0.58],
      label: '#20262b',
      localLabel: '#42494e',
      roadLabel: '#30363b',
      halo: '#f7f4eb',
      coverageFill: '#d7edf4',
      coverageFillOpacity: 0,
      coverageLine: '#edf8fb',
      coverageLineOpacity: 0,
      coverageVeinOpacity: ['interpolate', ['linear'], ['zoom'], 3.4, 0.08, 7, 0.16, 10, 0.08, 13, 0],
      coveragePointOpacity: ['interpolate', ['linear'], ['zoom'], 3.4, 0.08, 8, 0.18, 12, 0.26, 16, 0.12],
      nightRoadLineOpacity: 0,
      nightRoadPointOpacity: 0,
      nightCarPointOpacity: 0,
      nightBuildingPointOpacity: 0,
    },
    dark: {
      background: '#071018',
      rasterSaturation: -0.18,
      rasterContrast: 0.14,
      rasterBrightnessMin: 0,
      rasterBrightnessMax: 0.58,
      terrainExaggeration: 1.22,
      hillshadeShadow: 'rgba(0, 0, 0, 0.34)',
      hillshadeHighlight: 'rgba(255, 230, 178, 0.14)',
      hillshadeAccent: 'rgba(70, 108, 120, 0.1)',
      waterDepthColor: '#061019',
      waterDepthOpacity: ['interpolate', ['linear'], ['zoom'], 4, 0.4, 9, 0.32, 14, 0.18],
      roadMajor: ['interpolate', ['linear'], ['zoom'], 5, '#9b998f', 12, '#d8d2c3'],
      roadMajorOpacity: ['interpolate', ['linear'], ['zoom'], 5, 0.24, 10, 0.38, 15, 0.56],
      roadMinor: '#a9ada7',
      roadMinorOpacity: ['interpolate', ['linear'], ['zoom'], 12, 0.1, 15, 0.26, 17, 0.38],
      label: '#f4f0e7',
      localLabel: '#d7d1c6',
      roadLabel: '#e9e3d7',
      halo: '#071018',
      coverageFill: '#d7edf4',
      coverageFillOpacity: 0,
      coverageLine: '#edf8fb',
      coverageLineOpacity: 0,
      coverageVeinOpacity: ['interpolate', ['linear'], ['zoom'], 3.4, 0.14, 7, 0.26, 10, 0.16, 13, 0],
      coveragePointOpacity: ['interpolate', ['linear'], ['zoom'], 3.4, 0.1, 8, 0.22, 12, 0.3, 16, 0.14],
      nightRoadLineOpacity: ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 0.1, 9, 0.16, 11.5, 0.08, 13.5, 0],
      nightRoadPointOpacity: ['interpolate', ['linear'], ['zoom'], 10, 0, 12, 0.12, 15, 0.18, 17, 0.1],
      nightCarPointOpacity: ['interpolate', ['linear'], ['zoom'], 12, 0, 14, 0.055, 16, 0.08],
      nightBuildingPointOpacity: ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 0.08, 16, 0.18, 18, 0.24],
    },
  };

  const satelliteHybridStyle = {
    version: 8,
    name: 'Dealett satellite hybrid',
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sprite: 'https://tiles.openfreemap.org/sprites/ofm_f384/ofm',
    sources: {
      'esri-world-imagery': {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        maxzoom: 19,
        attribution: 'Source: Esri, Vantor, Earthstar Geographics, GIS User Community',
      },
      openmaptiles: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
      },
      'dealett-terrain-dem': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 15,
        encoding: 'terrarium',
        attribution: 'Terrain: AWS Terrain Tiles',
      },
      'dealett-terrain-shade-dem': {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        tileSize: 256,
        maxzoom: 15,
        encoding: 'terrarium',
      },
    },
    layers: [
      {
        id: 'dealett-satellite-background',
        type: 'background',
        paint: {
          'background-color': '#0b1117',
        },
      },
      {
        id: 'dealett-satellite-imagery',
        type: 'raster',
        source: 'esri-world-imagery',
        paint: {
          'raster-opacity': 1,
          'raster-saturation': 0.04,
          'raster-contrast': 0.04,
          'raster-brightness-min': 0,
          'raster-brightness-max': 1,
        },
      },
      {
        id: 'dealett-water-depth',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: {
          'fill-color': '#061019',
          'fill-opacity': 0.16,
        },
      },
      {
        id: 'dealett-terrain-shade',
        type: 'hillshade',
        source: 'dealett-terrain-shade-dem',
        paint: {
          'hillshade-illumination-direction': 315,
          'hillshade-shadow-color': '#061019',
          'hillshade-highlight-color': '#f2efe4',
          'hillshade-accent-color': '#31424a',
          'hillshade-exaggeration': 0.45,
        },
      },
      {
        id: 'dealett-coverage-vein-fair',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 3,
        maxzoom: 13,
        filter: [
          'all',
          ['match', ['get', 'brunnel'], ['bridge', 'tunnel'], false, true],
          ['match', ['get', 'class'], ['tertiary', 'secondary'], true, false],
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#f2ac45',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.16, 8, 0.42, 12, 0.62, 16, 0.34],
          'line-opacity': 0.08,
          'line-blur': 0,
        },
      },
      {
        id: 'dealett-coverage-vein-good',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 3,
        maxzoom: 13,
        filter: [
          'all',
          ['match', ['get', 'brunnel'], ['bridge', 'tunnel'], false, true],
          ['match', ['get', 'class'], ['primary', 'secondary'], true, false],
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#6db8b4',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.2, 8, 0.54, 12, 0.78, 16, 0.42],
          'line-opacity': 0.08,
          'line-blur': 0,
        },
      },
      {
        id: 'dealett-coverage-vein-excellent',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 3,
        maxzoom: 13,
        filter: [
          'all',
          ['match', ['get', 'brunnel'], ['bridge', 'tunnel'], false, true],
          ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], true, false],
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#726ea1',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.22, 8, 0.62, 12, 0.9, 16, 0.46],
          'line-opacity': 0.08,
          'line-blur': 0,
        },
      },
      {
        id: 'dealett-night-road-veins',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 6,
        filter: [
          'all',
          ['match', ['get', 'brunnel'], ['bridge', 'tunnel'], false, true],
          ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], true, false],
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#ffbd70',
          'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.16, 10, 0.46, 13, 0.66, 16, 0.28],
          'line-opacity': 0,
          'line-blur': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 10, 1.1, 14, 0.35],
        },
      },
      {
        id: 'dealett-road-major',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 5,
        filter: [
          'all',
          ['match', ['get', 'brunnel'], ['bridge', 'tunnel'], false, true],
          ['match', ['get', 'class'], ['motorway', 'trunk', 'primary', 'secondary'], true, false],
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': ['interpolate', ['linear'], ['zoom'], 5, '#d4d9d7', 12, '#f1eee7'],
          'line-width': ['interpolate', ['exponential', 1.2], ['zoom'], 5, 0.3, 10, 0.95, 15, 3.6],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0.2, 10, 0.36, 15, 0.54],
        },
      },
      {
        id: 'dealett-road-minor',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 12,
        filter: [
          'all',
          ['match', ['get', 'brunnel'], ['bridge', 'tunnel'], false, true],
          ['match', ['get', 'class'], ['minor', 'service', 'track'], true, false],
        ],
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#e4e1d8',
          'line-width': ['interpolate', ['exponential', 1.2], ['zoom'], 12, 0.2, 15, 1.05, 17, 3.1],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0.14, 15, 0.34, 17, 0.48],
        },
      },
      {
        id: 'dealett-road-labels',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        minzoom: 10,
        filter: ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false],
        layout: {
          'symbol-placement': 'line',
          'text-field': roadName,
          'text-font': ['Noto Sans Regular'],
          'text-letter-spacing': 0,
          'text-max-angle': 30,
          'text-padding': 2,
          'text-size': ['interpolate', ['linear'], ['zoom'], 10, 9, 15, 12],
        },
        paint: {
          'text-color': '#f4f0e7',
          'text-halo-blur': 0.55,
          'text-halo-color': '#10151a',
          'text-halo-width': 1.4,
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.38, 14, 0.68],
        },
      },
      {
        id: 'dealett-place-country-labels',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        maxzoom: 8,
        filter: ['==', ['get', 'class'], 'country'],
        layout: {
          'text-field': localizedName,
          'text-font': ['Noto Sans Bold'],
          'text-letter-spacing': 0.1,
          'text-max-width': 7,
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 13, 7, 18],
          'text-transform': 'uppercase',
        },
        paint: {
          'text-color': '#f7f4eb',
          'text-halo-blur': 0.8,
          'text-halo-color': '#10151a',
          'text-halo-width': 1.7,
          'text-opacity': 0.86,
        },
      },
      {
        id: 'dealett-place-city-labels',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 4,
        filter: ['match', ['get', 'class'], ['city', 'town'], true, false],
        layout: {
          'text-field': localizedName,
          'text-font': ['Noto Sans Bold'],
          'text-letter-spacing': 0,
          'text-max-width': 9,
          'text-size': ['interpolate', ['exponential', 1.2], ['zoom'], 4, 11, 8, 14, 13, 19],
        },
        paint: {
          'text-color': '#f8f4ec',
          'text-halo-blur': 0.8,
          'text-halo-color': '#10151a',
          'text-halo-width': 1.7,
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.76, 12, 0.9],
        },
      },
      {
        id: 'dealett-place-local-labels',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 8,
        filter: ['match', ['get', 'class'], ['village', 'suburb', 'neighbourhood'], true, false],
        layout: {
          'text-field': localizedName,
          'text-font': ['Noto Sans Regular'],
          'text-letter-spacing': 0,
          'text-max-width': 8,
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10, 14, 13],
        },
        paint: {
          'text-color': '#e9e3d6',
          'text-halo-blur': 0.7,
          'text-halo-color': '#10151a',
          'text-halo-width': 1.4,
          'text-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0.38, 14, 0.7],
        },
      },
    ],
  };

  const placeholderCoverageZones = [
    {
      id: 'telia-central',
      operator: 'telia',
      networks: ['2G', '4G', '5G'],
      coordinates: [[[14.1, 58.0], [18.5, 58.1], [18.8, 60.5], [15.0, 60.8], [13.6, 59.4], [14.1, 58.0]]],
    },
    {
      id: 'telia-south',
      operator: 'telia',
      networks: ['3G', '4G', '5G+'],
      coordinates: [[[11.8, 55.1], [14.9, 55.1], [15.2, 57.0], [12.0, 57.5], [10.9, 56.3], [11.8, 55.1]]],
    },
    {
      id: 'telia-north',
      operator: 'telia',
      networks: ['2G', '4G'],
      coordinates: [[[16.3, 62.0], [22.2, 62.2], [22.4, 66.2], [17.1, 66.4], [15.6, 64.2], [16.3, 62.0]]],
    },
    {
      id: 'tele2-urban',
      operator: 'tele2',
      networks: ['4G', '5G'],
      coordinates: [[[11.5, 57.3], [12.6, 57.4], [12.6, 58.2], [11.3, 58.1], [11.5, 57.3]]],
    },
    {
      id: 'tele2-east',
      operator: 'tele2',
      networks: ['3G', '4G', '5G+'],
      coordinates: [[[17.2, 58.8], [19.0, 58.9], [19.1, 60.0], [17.3, 60.1], [17.2, 58.8]]],
    },
    {
      id: 'telenor-west',
      operator: 'telenor',
      networks: ['2G', '4G', '5G'],
      coordinates: [[[10.9, 56.9], [13.7, 56.9], [14.2, 59.2], [11.2, 59.6], [10.9, 56.9]]],
    },
    {
      id: 'telenor-capital',
      operator: 'telenor',
      networks: ['4G', '5G+'],
      coordinates: [[[17.4, 59.0], [18.9, 59.0], [18.9, 59.8], [17.5, 59.9], [17.4, 59.0]]],
    },
    {
      id: 'tre-city-band',
      operator: 'tre',
      networks: ['4G', '5G', '5G+'],
      coordinates: [[[11.8, 55.4], [18.9, 55.7], [18.9, 60.0], [16.2, 60.3], [12.2, 58.4], [11.8, 55.4]]],
    },
    {
      id: 'halebop-shared',
      operator: 'halebop',
      networks: ['2G', '4G', '5G'],
      coordinates: [[[13.0, 56.2], [19.2, 56.4], [19.4, 61.0], [14.1, 61.2], [12.2, 58.4], [13.0, 56.2]]],
    },
  ];

  const placeholderCoverageGeoJson = {
    type: 'FeatureCollection',
    features: placeholderCoverageZones.map((zone) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: zone.coordinates,
      },
      properties: networks.reduce((properties, network) => ({
        ...properties,
        [networkPropertyKeys[network]]: zone.networks.includes(network),
      }), {
        id: zone.id,
        operator: zone.operator,
        placeholder: true,
      }),
    })),
  };

  const getStoredMapTheme = () => {
    try {
      const storedTheme = localStorage.getItem(mapThemeStorageKey);
      return ['auto', 'light', 'dark'].includes(storedTheme) ? storedTheme : 'auto';
    } catch {
      return 'auto';
    }
  };

  const saveMapTheme = (theme) => {
    try {
      localStorage.setItem(mapThemeStorageKey, theme);
    } catch {
      // Storage can be unavailable in private contexts; the live map can still switch modes.
    }
  };

  const getStockholmTimeParts = () => {
    const parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Europe/Stockholm',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));

    return {
      year: values.year,
      month: values.month,
      day: values.day,
      hour: values.hour,
      minute: values.minute,
    };
  };

  const getDayOfYear = ({ year, month, day }) => {
    const start = Date.UTC(year, 0, 0);
    const current = Date.UTC(year, month - 1, day);
    return Math.floor((current - start) / 86400000);
  };

  const isSwedenDaylight = () => {
    const time = getStockholmTimeParts();
    const dayOfYear = getDayOfYear(time);
    const daylightHours = 12 + 6.4 * Math.cos((2 * Math.PI * (dayOfYear - 172)) / 365);
    const solarNoon = 12.75;
    const sunrise = solarNoon - daylightHours / 2;
    const sunset = solarNoon + daylightHours / 2;
    const currentHour = time.hour + time.minute / 60;

    return currentHour >= sunrise && currentHour < sunset;
  };

  const resolveMapTheme = (theme) => (theme === 'auto' ? (isSwedenDaylight() ? 'light' : 'dark') : theme);

  const state = {
    activeOperator: 'telia',
    activeNetworks: new Set(['2G', '4G', '5G']),
    mapTheme: getStoredMapTheme(),
    isPerspectiveMode: true,
    coverageSignature: '',
    nightLightSignature: '',
    selectedMarker: null,
    locateMarker: null,
  };

  const selectedPlace = app.querySelector('#coverageSelectedPlace');
  const layerStatus = app.querySelector('#coverageLayerStatus');
  const perspectiveButton = app.querySelector('#coverageMapPerspective');

  const setPaintIfLayerExists = (layerId, property, value) => {
    if (map.getLayer(layerId)) {
      map.setPaintProperty(layerId, property, value);
    }
  };

  const setTerrainForTheme = (paint) => {
    if (typeof map.setTerrain !== 'function' || !map.getSource('dealett-terrain-dem')) {
      return;
    }

    map.setTerrain({
      source: 'dealett-terrain-dem',
      exaggeration: paint.terrainExaggeration,
    });
  };

  const syncPerspectiveButton = () => {
    if (!perspectiveButton) {
      return;
    }

    state.isPerspectiveMode = map.getPitch() > 6;
    perspectiveButton.textContent = state.isPerspectiveMode ? '3D' : '2D';
    perspectiveButton.classList.toggle('is-active', state.isPerspectiveMode);
    perspectiveButton.setAttribute('aria-pressed', String(state.isPerspectiveMode));
  };

  const updateMapScaleMode = () => {
    const zoom = map.getZoom();
    const scaleMode = zoom < 8 ? 'overview' : zoom < 12.5 ? 'medium' : 'city';

    app.dataset.mapScale = scaleMode;
  };

  const updateMapThemeButtons = () => {
    app.querySelectorAll('[data-map-theme]').forEach((button) => {
      const isActive = button.dataset.mapTheme === state.mapTheme;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const applyMapTheme = () => {
    const resolvedTheme = resolveMapTheme(state.mapTheme);
    const paint = mapThemePaint[resolvedTheme];

    app.dataset.mapTheme = resolvedTheme;
    setPaintIfLayerExists('dealett-satellite-background', 'background-color', paint.background);
    setPaintIfLayerExists('dealett-satellite-imagery', 'raster-saturation', paint.rasterSaturation);
    setPaintIfLayerExists('dealett-satellite-imagery', 'raster-contrast', paint.rasterContrast);
    setPaintIfLayerExists('dealett-satellite-imagery', 'raster-brightness-min', paint.rasterBrightnessMin);
    setPaintIfLayerExists('dealett-satellite-imagery', 'raster-brightness-max', paint.rasterBrightnessMax);
    setPaintIfLayerExists('dealett-water-depth', 'fill-color', paint.waterDepthColor);
    setPaintIfLayerExists('dealett-water-depth', 'fill-opacity', paint.waterDepthOpacity);
    setPaintIfLayerExists('dealett-terrain-shade', 'hillshade-shadow-color', paint.hillshadeShadow);
    setPaintIfLayerExists('dealett-terrain-shade', 'hillshade-highlight-color', paint.hillshadeHighlight);
    setPaintIfLayerExists('dealett-terrain-shade', 'hillshade-accent-color', paint.hillshadeAccent);
    setPaintIfLayerExists('dealett-coverage-vein-fair', 'line-opacity', paint.coverageVeinOpacity);
    setPaintIfLayerExists('dealett-coverage-vein-good', 'line-opacity', paint.coverageVeinOpacity);
    setPaintIfLayerExists('dealett-coverage-vein-excellent', 'line-opacity', paint.coverageVeinOpacity);
    setPaintIfLayerExists('dealett-night-road-veins', 'line-opacity', paint.nightRoadLineOpacity);
    setPaintIfLayerExists('dealett-road-major', 'line-color', paint.roadMajor);
    setPaintIfLayerExists('dealett-road-major', 'line-opacity', paint.roadMajorOpacity);
    setPaintIfLayerExists('dealett-road-minor', 'line-color', paint.roadMinor);
    setPaintIfLayerExists('dealett-road-minor', 'line-opacity', paint.roadMinorOpacity);
    setPaintIfLayerExists('dealett-road-labels', 'text-color', paint.roadLabel);
    setPaintIfLayerExists('dealett-road-labels', 'text-halo-color', paint.halo);
    setPaintIfLayerExists('dealett-place-country-labels', 'text-color', paint.label);
    setPaintIfLayerExists('dealett-place-country-labels', 'text-halo-color', paint.halo);
    setPaintIfLayerExists('dealett-place-city-labels', 'text-color', paint.label);
    setPaintIfLayerExists('dealett-place-city-labels', 'text-halo-color', paint.halo);
    setPaintIfLayerExists('dealett-place-local-labels', 'text-color', paint.localLabel);
    setPaintIfLayerExists('dealett-place-local-labels', 'text-halo-color', paint.halo);
    setPaintIfLayerExists('dealett-coverage-placeholder-fill', 'fill-color', paint.coverageFill);
    setPaintIfLayerExists('dealett-coverage-placeholder-fill', 'fill-opacity', paint.coverageFillOpacity);
    setPaintIfLayerExists('dealett-coverage-placeholder-outline', 'line-color', paint.coverageLine);
    setPaintIfLayerExists('dealett-coverage-placeholder-outline', 'line-opacity', paint.coverageLineOpacity);
    setPaintIfLayerExists('dealett-night-road-points', 'circle-opacity', paint.nightRoadPointOpacity);
    setPaintIfLayerExists('dealett-night-car-points', 'circle-opacity', paint.nightCarPointOpacity);
    setPaintIfLayerExists('dealett-night-building-points', 'circle-opacity', paint.nightBuildingPointOpacity);
    setPaintIfLayerExists('dealett-coverage-measurement-points', 'circle-opacity', paint.coveragePointOpacity);
    setTerrainForTheme(paint);
    updateMapThemeButtons();
    window.requestAnimationFrame(updateCoverageMeasurements);
    window.requestAnimationFrame(updateNightLightPoints);
  };

  const getSwedenFitPadding = () => {
    if (window.matchMedia('(max-width: 720px)').matches) {
      return { top: 240, right: 24, bottom: 160, left: 24 };
    }

    if (window.matchMedia('(max-width: 1100px)').matches) {
      return { top: 180, right: 70, bottom: 120, left: 48 };
    }

    return { top: 90, right: 80, bottom: 100, left: 280 };
  };

  const getSwedenCamera = () => map.cameraForBounds(swedenFitBounds, {
    padding: getSwedenFitPadding(),
    bearing: swedenCameraBase.bearing,
    pitch: swedenCameraBase.pitch,
  });

  const applySwedenMinZoom = () => {
    const swedenCamera = getSwedenCamera();

    if (!swedenCamera) {
      return null;
    }

    map.setMinZoom(swedenCamera.zoom);
    return swedenCamera;
  };

  const resetToSweden = (animated = true) => {
    map.setMinZoom(0);
    const swedenCamera = applySwedenMinZoom();

    if (!swedenCamera) {
      return;
    }

    const camera = {
      ...swedenCamera,
      ...swedenCameraBase,
    };

    if (animated) {
      map.once('moveend', () => {
        map.setMinZoom(map.getZoom());
      });
      flyTo(camera);
      return;
    }

    map.jumpTo(camera);
    map.setMinZoom(map.getZoom());
  };

  const isInsideSwedenBounds = ([longitude, latitude]) => {
    const [[west, south], [east, north]] = swedenFitBounds;
    return longitude >= west && longitude <= east && latitude >= south && latitude <= north;
  };

  const buildCoverageFilter = () => {
    const networkFilters = Array.from(state.activeNetworks).map((network) => ['==', ['get', networkPropertyKeys[network]], true]);

    if (!networkFilters.length) {
      return ['==', ['get', 'operator'], '__none__'];
    }

    return ['all', ['==', ['get', 'operator'], state.activeOperator], ['any', ...networkFilters]];
  };

  const updateLayerStatus = () => {
    if (!layerStatus) {
      return;
    }

    const selectedNetworks = Array.from(state.activeNetworks);
    const networkText = selectedNetworks.length ? selectedNetworks.join(', ') : 'inga valda n&auml;t';
    layerStatus.innerHTML = `${operatorLabels[state.activeOperator]} valt: ${networkText}. T&auml;ckningsytorna &auml;r subtila platsh&aring;llare tills verklig operat&ouml;rsdata kopplas in. <a href="jamfor-tackning.html">L&auml;s mer &rarr;</a>`;
  };

  const updateCoverageFilter = () => {
    const coverageFilter = buildCoverageFilter();

    ['dealett-coverage-placeholder-fill', 'dealett-coverage-placeholder-outline'].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setFilter(layerId, coverageFilter);
      }
    });

    state.coverageSignature = '';
    window.requestAnimationFrame(updateCoverageMeasurements);
    updateLayerStatus();
  };

  const createNightLightSeed = (longitude, latitude, salt = 0) => {
    const x = Math.round((longitude + 180) * 10000);
    const y = Math.round((latitude + 90) * 10000);
    const raw = Math.sin((x * 12.9898) + (y * 78.233) + (salt * 37.719)) * 43758.5453;
    return raw - Math.floor(raw);
  };

  const createNightPointFeature = (coordinates, kind, color) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: {
      kind,
      color,
    },
  });

  const getLineStrings = (geometry) => {
    if (!geometry) {
      return [];
    }

    if (geometry.type === 'LineString') {
      return [geometry.coordinates];
    }

    if (geometry.type === 'MultiLineString') {
      return geometry.coordinates;
    }

    return [];
  };

  const getPolygonCentroid = (geometry) => {
    const rings = geometry?.type === 'Polygon'
      ? geometry.coordinates
      : geometry?.type === 'MultiPolygon'
        ? geometry.coordinates[0]
        : null;
    const ring = rings?.[0];

    if (!ring?.length) {
      return null;
    }

    const sum = ring.reduce((total, point) => [total[0] + point[0], total[1] + point[1]], [0, 0]);
    return [sum[0] / ring.length, sum[1] / ring.length];
  };

  const countNightFeatures = (features, kind) => features.reduce((count, feature) => (
    feature.properties.kind === kind ? count + 1 : count
  ), 0);

  const operatorCoverageProfiles = {
    telia: { density: 1.08, urbanBias: 0.14, northReliability: 0.94, salt: 101 },
    tele2: { density: 0.92, urbanBias: 0.36, northReliability: 0.7, salt: 203 },
    telenor: { density: 0.96, urbanBias: 0.28, northReliability: 0.76, salt: 307 },
    tre: { density: 0.8, urbanBias: 0.72, northReliability: 0.5, salt: 409 },
    halebop: { density: 1, urbanBias: 0.18, northReliability: 0.9, salt: 503 },
  };

  const networkCoverageProfiles = {
    '2G': { density: 0.72, urbanBoost: 0.04, remotePenalty: 0.08, salt: 2 },
    '3G': { density: 0.66, urbanBoost: 0.12, remotePenalty: 0.16, salt: 3 },
    '4G': { density: 0.95, urbanBoost: 0.18, remotePenalty: 0.12, salt: 4 },
    '4G+': { density: 0.86, urbanBoost: 0.32, remotePenalty: 0.22, salt: 44 },
    '5G': { density: 0.64, urbanBoost: 0.62, remotePenalty: 0.46, salt: 5 },
    '5G+': { density: 0.42, urbanBoost: 0.9, remotePenalty: 0.66, salt: 55 },
  };

  const swedenCityAnchors = [
    [18.0686, 59.3293, 1.2],
    [11.9746, 57.7089, 1],
    [13.0038, 55.605, 0.95],
    [17.6389, 59.8586, 0.82],
    [15.6214, 58.4108, 0.68],
    [16.1924, 58.5877, 0.58],
    [20.263, 63.8258, 0.62],
    [22.1567, 65.5848, 0.46],
    [14.1618, 57.7826, 0.5],
    [12.6945, 56.0465, 0.44],
    [15.2134, 59.2753, 0.5],
    [13.5115, 59.4022, 0.42],
    [18.2948, 57.6348, 0.34],
    [17.3069, 62.3908, 0.36],
  ];

  const getCoverageCityInfluence = (longitude, latitude) => swedenCityAnchors.reduce((strongest, [cityLongitude, cityLatitude, weight]) => {
    const distance = Math.hypot((longitude - cityLongitude) * 0.72, latitude - cityLatitude);
    const influence = weight * Math.exp(-distance / 0.95);
    return Math.max(strongest, influence);
  }, 0);

  const getRoadCoverageFactor = (roadClass) => ({
    motorway: 1.35,
    trunk: 1.25,
    primary: 1.08,
    secondary: 0.9,
    tertiary: 0.72,
    minor: 0.5,
    service: 0.36,
  }[roadClass] ?? 0.58);

  const getSelectedNetworkProfile = () => {
    const selectedNetworks = Array.from(state.activeNetworks);

    if (!selectedNetworks.length) {
      return null;
    }

    return selectedNetworks.reduce((profile, network) => {
      const networkProfile = networkCoverageProfiles[network];

      return {
        density: profile.density + networkProfile.density,
        urbanBoost: profile.urbanBoost + networkProfile.urbanBoost,
        remotePenalty: profile.remotePenalty + networkProfile.remotePenalty,
        salt: profile.salt + networkProfile.salt,
        count: profile.count,
      };
    }, { density: 0, urbanBoost: 0, remotePenalty: 0, salt: 0, count: selectedNetworks.length });
  };

  const getCoverageQuality = (score) => {
    if (score > 1.08) {
      return 'excellent';
    }

    if (score > 0.72) {
      return 'good';
    }

    return 'fair';
  };

  const createCoverageMeasurementFeature = (coordinates, quality) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: {
      quality,
    },
  });

  const countCoverageFeatures = (features) => features.length;

  const sampleCoverageMeasurements = (feature, features, usedKeys, zoom, operatorProfile, networkProfile) => {
    const roadClass = feature.properties?.class;
    const roadFactor = getRoadCoverageFactor(roadClass);
    const maxFeatures = zoom < 7 ? 900 : zoom < 12 ? 1500 : 950;

    if (roadFactor < 0.5 || countCoverageFeatures(features) >= maxFeatures) {
      return;
    }

    const networkCount = Math.max(1, networkProfile.count);
    const averagedNetwork = {
      density: networkProfile.density / networkCount,
      urbanBoost: networkProfile.urbanBoost / networkCount,
      remotePenalty: networkProfile.remotePenalty / networkCount,
      salt: networkProfile.salt,
    };
    const spacing = zoom < 7 ? 0.05 : zoom < 11 ? 0.032 : 0.014;

    for (const line of getLineStrings(feature.geometry)) {
      for (let index = 1; index < line.length; index += 1) {
        if (countCoverageFeatures(features) >= maxFeatures) {
          return;
        }

        const point = line[index];
        const segmentStart = line[index - 1];
        const segmentLength = Math.hypot(point[0] - segmentStart[0], point[1] - segmentStart[1]);
        const steps = Math.min(18, Math.max(1, Math.floor(segmentLength / spacing)));

        for (let step = 1; step <= steps; step += 1) {
          if (countCoverageFeatures(features) >= maxFeatures) {
            return;
          }

          const t = step / (steps + 1);
          const longitude = segmentStart[0] + (point[0] - segmentStart[0]) * t;
          const latitude = segmentStart[1] + (point[1] - segmentStart[1]) * t;

          if (!isInsideSwedenBounds([longitude, latitude])) {
            continue;
          }

          const cityInfluence = getCoverageCityInfluence(longitude, latitude);
          const northness = Math.max(0, Math.min(1, (latitude - 60.5) / 8.2));
          const remoteFactor = 1 - (northness * averagedNetwork.remotePenalty * (1 - operatorProfile.northReliability));
          const density = operatorProfile.density * averagedNetwork.density * roadFactor * remoteFactor * (0.7 + cityInfluence * (operatorProfile.urbanBias + averagedNetwork.urbanBoost + 0.35));
          const seed = createNightLightSeed(longitude, latitude, operatorProfile.salt + averagedNetwork.salt + step);
          const threshold = Math.max(0.05, Math.min(0.58, density * 0.24));

          if (seed > threshold) {
            continue;
          }

          const key = `coverage-${longitude.toFixed(4)}-${latitude.toFixed(4)}`;

          if (usedKeys.has(key)) {
            continue;
          }

          usedKeys.add(key);
          features.push(createCoverageMeasurementFeature([longitude, latitude], getCoverageQuality(density)));
        }
      }
    }
  };

  const updateCoverageMeasurements = () => {
    const source = map.getSource('dealett-coverage-measurements');

    if (!source) {
      return;
    }

    const selectedNetworks = Array.from(state.activeNetworks);
    const networkProfile = getSelectedNetworkProfile();
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const signature = [
      state.activeOperator,
      selectedNetworks.sort().join(','),
      zoom.toFixed(1),
      bounds.getWest().toFixed(2),
      bounds.getSouth().toFixed(2),
      bounds.getEast().toFixed(2),
      bounds.getNorth().toFixed(2),
    ].join('|');

    if (signature === state.coverageSignature) {
      return;
    }

    if (!networkProfile) {
      state.coverageSignature = signature;
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const roadLayers = [
      'dealett-road-major',
      'dealett-road-minor',
      'dealett-coverage-vein-fair',
      'dealett-coverage-vein-good',
      'dealett-coverage-vein-excellent',
    ].filter((layerId) => map.getLayer(layerId));
    const roadFeatures = roadLayers.length
      ? map.queryRenderedFeatures({ layers: roadLayers })
      : [];

    if (!roadFeatures.length) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features = [];
    const usedKeys = new Set();
    const operatorProfile = operatorCoverageProfiles[state.activeOperator] ?? operatorCoverageProfiles.telia;

    roadFeatures.forEach((feature) => {
      sampleCoverageMeasurements(feature, features, usedKeys, zoom, operatorProfile, networkProfile);
    });

    source.setData({
      type: 'FeatureCollection',
      features,
    });
    state.coverageSignature = signature;
  };

  const sampleNightRoadLights = (feature, features, usedKeys, zoom) => {
    const roadClass = feature.properties?.class;
    const isMajorRoad = ['motorway', 'trunk', 'primary', 'secondary'].includes(roadClass);
    const maxRoadLights = 320;

    if (!isMajorRoad || countNightFeatures(features, 'road') >= maxRoadLights) {
      return;
    }

    const spacing = zoom > 15 ? 0.026 : 0.044;

    for (const line of getLineStrings(feature.geometry)) {
      for (let index = 1; index < line.length; index += 1) {
        if (countNightFeatures(features, 'road') >= maxRoadLights) {
          return;
        }

        const point = line[index];
        const segmentStart = line[index - 1];
        const segmentLength = Math.hypot(point[0] - segmentStart[0], point[1] - segmentStart[1]);
        const steps = Math.min(14, Math.max(1, Math.floor(segmentLength / spacing)));

        for (let step = 1; step <= steps; step += 1) {
          const t = step / (steps + 1);
          const longitude = segmentStart[0] + (point[0] - segmentStart[0]) * t;
          const latitude = segmentStart[1] + (point[1] - segmentStart[1]) * t;
          const seed = createNightLightSeed(longitude, latitude, 11);

          if (seed > 0.18) {
            continue;
          }

          const key = `road-${longitude.toFixed(4)}-${latitude.toFixed(4)}`;

          if (usedKeys.has(key)) {
            continue;
          }

          usedKeys.add(key);
          features.push(createNightPointFeature([longitude, latitude], 'road', seed > 0.16 ? '#ffe2a3' : '#ffc46f'));

          if (countNightFeatures(features, 'road') >= maxRoadLights) {
            return;
          }
        }
      }
    }
  };

  const sampleNightCarLights = (feature, features, usedKeys, zoom) => {
    const roadClass = feature.properties?.class;
    const maxCarLights = 14;

    if (zoom < 13 || !['motorway', 'trunk', 'primary'].includes(roadClass) || countNightFeatures(features, 'car') >= maxCarLights) {
      return;
    }

    for (const line of getLineStrings(feature.geometry)) {
      for (let index = 1; index < line.length; index += 1) {
        if (countNightFeatures(features, 'car') >= maxCarLights) {
          return;
        }

        const point = line[index];
        const previous = line[index - 1];
        const seed = createNightLightSeed(point[0], point[1], 23);

        if (seed > 0.012) {
          continue;
        }

        const coordinates = [
          previous[0] + (point[0] - previous[0]) * seed,
          previous[1] + (point[1] - previous[1]) * seed,
        ];
        const key = `car-${coordinates[0].toFixed(4)}-${coordinates[1].toFixed(4)}`;

        if (usedKeys.has(key)) {
          continue;
        }

        usedKeys.add(key);
        features.push(createNightPointFeature(coordinates, 'car', seed > 0.006 ? '#fff1d6' : '#e24b3d'));
      }
    }
  };

  const sampleNightBuildingLights = (feature, features, usedKeys, zoom) => {
    if (zoom < 13 || countNightFeatures(features, 'building') >= 140) {
      return;
    }

    const centroid = getPolygonCentroid(feature.geometry);

    if (!centroid) {
      return;
    }

    const seed = createNightLightSeed(centroid[0], centroid[1], 41);

    if (seed > 0.055) {
      return;
    }

    const jitter = (seed - 0.5) * 0.00022;
    const coordinates = [centroid[0] + jitter, centroid[1] - jitter];
    const key = `building-${coordinates[0].toFixed(5)}-${coordinates[1].toFixed(5)}`;

    if (usedKeys.has(key)) {
      return;
    }

    usedKeys.add(key);
    features.push(createNightPointFeature(coordinates, 'building', seed > 0.09 ? '#ffdca1' : '#fff3cc'));
  };

  const updateNightLightPoints = () => {
    const source = map.getSource('dealett-night-light-points');

    if (!source) {
      return;
    }

    const resolvedTheme = resolveMapTheme(state.mapTheme);
    const zoom = map.getZoom();
    const bounds = map.getBounds();
    const signature = [
      resolvedTheme,
      zoom.toFixed(1),
      bounds.getWest().toFixed(2),
      bounds.getSouth().toFixed(2),
      bounds.getEast().toFixed(2),
      bounds.getNorth().toFixed(2),
    ].join('|');

    if (signature === state.nightLightSignature) {
      return;
    }

    if (resolvedTheme !== 'dark' || zoom < 10) {
      state.nightLightSignature = signature;
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    const features = [];
    const usedKeys = new Set();
    const roadLayers = ['dealett-road-major', 'dealett-road-minor'].filter((layerId) => map.getLayer(layerId));
    const roadFeatures = roadLayers.length
      ? map.queryRenderedFeatures({ layers: roadLayers })
      : [];
    const buildingFeatures = [];

    if (!roadFeatures.length && !buildingFeatures.length) {
      source.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    roadFeatures.forEach((feature) => {
      sampleNightRoadLights(feature, features, usedKeys, zoom);
      sampleNightCarLights(feature, features, usedKeys, zoom);
    });
    buildingFeatures.forEach((feature) => {
      sampleNightBuildingLights(feature, features, usedKeys, zoom);
    });

    source.setData({
      type: 'FeatureCollection',
      features,
    });
    state.nightLightSignature = signature;
  };

  const addMapLayers = (map) => {
    const coverageBeforeLayer = map.getLayer('dealett-road-major')
      ? 'dealett-road-major'
      : undefined;

    if (!map.getSource('dealett-coverage-measurements')) {
      map.addSource('dealett-coverage-measurements', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    }

    if (!map.getLayer('dealett-coverage-measurement-points')) {
      map.addLayer({
        id: 'dealett-coverage-measurement-points',
        type: 'circle',
        source: 'dealett-coverage-measurements',
        filter: ['match', ['get', 'quality'], ['fair', 'good', 'excellent'], true, false],
        paint: {
          'circle-color': [
            'match',
            ['get', 'quality'],
            'excellent',
            '#7471a8',
            'good',
            '#6bb8b4',
            'fair',
            '#f4ad48',
            '#f4ad48',
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 0.42, 8, 0.58, 12, 0.74, 16, 0.46],
          'circle-opacity': 0.18,
          'circle-blur': 0,
        },
      }, coverageBeforeLayer);
    }

    if (!map.getSource('dealett-night-light-points')) {
      map.addSource('dealett-night-light-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });
    }

    if (!map.getLayer('dealett-night-road-points')) {
      map.addLayer({
        id: 'dealett-night-road-points',
        type: 'circle',
        source: 'dealett-night-light-points',
        minzoom: 10,
        filter: ['==', ['get', 'kind'], 'road'],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 0.18, 13, 0.32, 16, 0.52],
          'circle-opacity': 0,
          'circle-blur': ['interpolate', ['linear'], ['zoom'], 10, 0.1, 16, 0.28],
        },
      }, coverageBeforeLayer);
    }

    if (!map.getLayer('dealett-night-car-points')) {
      map.addLayer({
        id: 'dealett-night-car-points',
        type: 'circle',
        source: 'dealett-night-light-points',
        minzoom: 12,
        filter: ['==', ['get', 'kind'], 'car'],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 0.24, 15, 0.42, 17, 0.58],
          'circle-opacity': 0,
          'circle-blur': 0.18,
        },
      }, coverageBeforeLayer);
    }

    if (!map.getLayer('dealett-night-building-points')) {
      map.addLayer({
        id: 'dealett-night-building-points',
        type: 'circle',
        source: 'dealett-night-light-points',
        minzoom: 13,
        filter: ['==', ['get', 'kind'], 'building'],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 0.16, 16, 0.34, 18, 0.48],
          'circle-opacity': 0,
          'circle-blur': 0.12,
        },
      }, coverageBeforeLayer);
    }

    if (!map.getSource('dealett-coverage-placeholder')) {
      // Replace this source with real operator coverage GeoJSON later.
      // Keep the operator and network_* properties if the existing filters should continue to work.
      map.addSource('dealett-coverage-placeholder', {
        type: 'geojson',
        data: placeholderCoverageGeoJson,
      });
    }

    if (!map.getLayer('dealett-coverage-placeholder-fill')) {
      map.addLayer({
        id: 'dealett-coverage-placeholder-fill',
        type: 'fill',
        source: 'dealett-coverage-placeholder',
        filter: buildCoverageFilter(),
        paint: {
          'fill-color': '#d7edf4',
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.025, 8, 0.04, 13, 0.055],
        },
      }, coverageBeforeLayer);
    }

    if (!map.getLayer('dealett-coverage-placeholder-outline')) {
      map.addLayer({
        id: 'dealett-coverage-placeholder-outline',
        type: 'line',
        source: 'dealett-coverage-placeholder',
        filter: buildCoverageFilter(),
        paint: {
          'line-color': '#edf8fb',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.35, 11, 0.7, 15, 1],
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 4, 0.035, 11, 0.065, 15, 0.1],
        },
      }, coverageBeforeLayer);
    }

    applyMapTheme();
  };

  const map = new maplibregl.Map({
    container: mapElement,
    style: satelliteHybridStyle,
    center: [16.6, 62.2],
    zoom: 4,
    pitch: swedenCameraBase.pitch,
    bearing: swedenCameraBase.bearing,
    maxBounds: swedenMaxBounds,
    minZoom: 3,
    maxZoom: 18,
    renderWorldCopies: false,
    attributionControl: true,
    antialias: true,
    maxPitch: 25,
    cooperativeGestures: true,
  });

  map.touchZoomRotate.enable();
  map.scrollZoom.enable();
  map.dragPan.enable();
  map.dragRotate.enable();
  map.keyboard.enable();
  map.boxZoom.enable();
  map.doubleClickZoom.enable();

  const flyTo = (camera) => {
    map.flyTo({
      ...camera,
      speed: 0.72,
      curve: 1.55,
      duration: 1800,
      essential: true,
    });
  };

  const createMarkerElement = () => {
    const markerElement = document.createElement('span');
    markerElement.className = 'coverage-maplibre-marker';
    return markerElement;
  };

  const setSelectedPlace = (placeName, coordinates) => {
    if (state.selectedMarker) {
      state.selectedMarker.remove();
    }

    state.selectedMarker = new maplibregl.Marker({ element: createMarkerElement(), anchor: 'center' })
      .setLngLat(coordinates)
      .addTo(map);

    if (selectedPlace) {
      selectedPlace.textContent = placeName ? `Vald plats: ${placeName}` : 'Vald plats markerad';
    }
  };

  const setupGeocoder = () => {
    const geocoderElement = app.querySelector('#coverageGeocoder');

    if (!geocoderElement || !window.MaplibreGeocoder) {
      return;
    }

    const getSearchResultZoom = (result) => {
      const properties = result.properties || {};
      const resultType = String(properties.addresstype || properties.type || properties.class || '').toLowerCase();

      if (['house', 'building', 'address'].includes(resultType)) {
        return 17;
      }

      if (['road', 'street', 'residential', 'pedestrian', 'service'].includes(resultType)) {
        return 16.3;
      }

      if (['suburb', 'neighbourhood', 'quarter', 'city_block'].includes(resultType)) {
        return 14.5;
      }

      if (['city', 'town', 'village', 'hamlet'].includes(resultType)) {
        return 12.8;
      }

      if (['municipality', 'administrative'].includes(resultType)) {
        return 10.5;
      }

      if (result.bbox) {
        const [west, south, east, north] = result.bbox;
        const span = Math.max(Math.abs(east - west), Math.abs(north - south));

        if (span < 0.006) {
          return 17;
        }

        if (span < 0.025) {
          return 16;
        }

        if (span < 0.08) {
          return 14.5;
        }

        if (span < 0.3) {
          return 12.5;
        }
      }

      return 13;
    };

    const selectSearchResult = (result) => {
      const center = result.center || result.geometry?.coordinates;

      if (!center) {
        return;
      }

      setSelectedPlace(result.place_name || result.text, center);
      map.flyTo({
        center,
        zoom: getSearchResultZoom(result),
        pitch: 18,
        bearing: map.getBearing(),
        duration: 1500,
        essential: true,
      });
    };

    const geocoderApi = {
      forwardGeocode: async (config) => {
        const query = config.query.trim();

        if (!query) {
          return { features: [] };
        }

        const params = new URLSearchParams({
          q: query,
          format: 'geojson',
          addressdetails: '1',
          limit: '6',
          countrycodes: 'se',
          viewbox: `${swedenBounds[0]},${swedenBounds[3]},${swedenBounds[2]},${swedenBounds[1]}`,
          bounded: '0',
          'accept-language': 'sv',
        });

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);

          if (!response.ok) {
            throw new Error(`Nominatim returned ${response.status}`);
          }

          const geojson = await response.json();
          const features = geojson.features.map((feature) => {
            const bbox = feature.bbox?.map(Number);
            const center = bbox
              ? [bbox[0] + (bbox[2] - bbox[0]) / 2, bbox[1] + (bbox[3] - bbox[1]) / 2]
              : feature.geometry.coordinates.map(Number);

            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: center,
              },
              place_name: feature.properties.display_name,
              properties: feature.properties,
              text: feature.properties.display_name,
              place_type: [feature.properties.type || 'place'],
              center,
              bbox,
            };
          });

          return { features };
        } catch (error) {
          console.error(`Failed to geocode with Nominatim: ${error.message}`);
          return { features: [] };
        }
      },
    };

    const geocoder = new MaplibreGeocoder(geocoderApi, {
      maplibregl,
      marker: false,
      flyTo: false,
      collapsed: false,
      clearAndBlurOnEsc: true,
      clearOnBlur: false,
      limit: 6,
      minLength: 2,
      placeholder: 'S\u00f6k adress eller plats',
      countries: 'se',
      bbox: swedenBounds,
    });

    geocoder.addTo(geocoderElement);
    geocoder.on('result', (event) => {
      selectSearchResult(event.result);
    });

    geocoder.on('clear', () => {
      if (state.selectedMarker) {
        state.selectedMarker.remove();
        state.selectedMarker = null;
      }

      if (selectedPlace) {
        selectedPlace.textContent = 'Ingen plats vald';
      }
    });

    const geocoderInput = geocoderElement.querySelector('input');

    geocoderInput?.addEventListener('keydown', async (event) => {
      if (event.key !== 'Enter') {
        return;
      }

      const query = geocoderInput.value.trim();

      if (!query) {
        return;
      }

      event.preventDefault();
      const results = await geocoderApi.forwardGeocode({ query });
      const firstResult = results.features[0];

      if (firstResult) {
        selectSearchResult(firstResult);
      }
    });
  };

  const locateUser = (button) => {
    if (!navigator.geolocation) {
      if (selectedPlace) {
        selectedPlace.textContent = 'Din webbl\u00e4sare st\u00f6djer inte geolokalisering';
      }
      return;
    }

    button?.classList.add('is-busy');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [position.coords.longitude, position.coords.latitude];

        if (!isInsideSwedenBounds(coordinates)) {
          if (selectedPlace) {
            selectedPlace.textContent = 'Din plats ligger utanf\u00f6r kartans Sverigeomr\u00e5de';
          }
          button?.classList.remove('is-busy');
          return;
        }

        if (state.locateMarker) {
          state.locateMarker.remove();
        }

        state.locateMarker = new maplibregl.Marker({ element: createMarkerElement(), anchor: 'center' })
          .setLngLat(coordinates)
          .addTo(map);

        if (selectedPlace) {
          selectedPlace.textContent = 'Din plats \u00e4r markerad p\u00e5 kartan';
        }

        map.flyTo({
          center: coordinates,
          zoom: 13,
          pitch: 18,
          bearing: map.getBearing(),
          duration: 1500,
          essential: true,
        });
        button?.classList.remove('is-busy');
      },
      () => {
        if (selectedPlace) {
          selectedPlace.textContent = 'Kunde inte h\u00e4mta din plats';
        }
        button?.classList.remove('is-busy');
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      },
    );
  };

  map.on('load', () => {
    addMapLayers(map);
    updateLayerStatus();
    setupGeocoder();
    map.resize();
    resetToSweden(false);
    syncPerspectiveButton();
    updateMapScaleMode();
    updateCoverageMeasurements();
    updateNightLightPoints();
  });

  app.querySelector('#coverageMapZoomIn')?.addEventListener('click', () => {
    map.easeTo({ zoom: map.getZoom() + 0.8, duration: 600, easing: (t) => 1 - Math.pow(1 - t, 3) });
  });

  app.querySelector('#coverageMapZoomOut')?.addEventListener('click', () => {
    map.easeTo({ zoom: map.getZoom() - 0.8, duration: 600, easing: (t) => 1 - Math.pow(1 - t, 3) });
  });

  app.querySelector('#coverageMapCompass')?.addEventListener('click', () => {
    map.easeTo({
      bearing: 0,
      duration: 650,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  });

  perspectiveButton?.addEventListener('click', () => {
    const shouldUse3D = map.getPitch() <= 6;

    map.easeTo({
      pitch: shouldUse3D ? mapPitch3D : mapPitch2D,
      duration: 650,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  });

  map.on('moveend', () => {
    syncPerspectiveButton();
    updateMapScaleMode();
    updateCoverageMeasurements();
    updateNightLightPoints();
  });
  map.on('idle', () => {
    updateCoverageMeasurements();
    updateNightLightPoints();
  });

  app.querySelectorAll('[data-map-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.mapAction;

      if (action === 'locate') {
        locateUser(button);
      }
    });
  });

  app.querySelectorAll('[data-map-theme]').forEach((button) => {
    button.addEventListener('click', () => {
      const theme = button.dataset.mapTheme;

      if (!['auto', 'light', 'dark'].includes(theme)) {
        return;
      }

      state.mapTheme = theme;
      saveMapTheme(theme);
      applyMapTheme();
    });
  });

  window.setInterval(() => {
    if (state.mapTheme === 'auto') {
      applyMapTheme();
    }
  }, 600000);

  app.querySelectorAll('.coverage-maplibre-operator').forEach((button) => {
    button.addEventListener('click', () => {
      const operator = button.dataset.operator;

      if (!operators.includes(operator)) {
        return;
      }

      state.activeOperator = operator;
      app.querySelectorAll('.coverage-maplibre-operator').forEach((operatorButton) => {
        const isActive = operatorButton === button;
        operatorButton.classList.toggle('is-active', isActive);
        operatorButton.setAttribute('aria-pressed', String(isActive));
      });
      updateCoverageFilter();
    });
  });

  app.querySelectorAll('.coverage-maplibre-network').forEach((button) => {
    button.addEventListener('click', () => {
      const network = button.dataset.network;

      if (!networks.includes(network)) {
        return;
      }

      if (state.activeNetworks.has(network)) {
        state.activeNetworks.delete(network);
      } else {
        state.activeNetworks.add(network);
      }

      const isActive = state.activeNetworks.has(network);
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
      updateCoverageFilter();
    });
  });

  window.addEventListener('resize', () => {
    const isAtSwedenLimit = map.getZoom() <= map.getMinZoom() + 0.05;
    map.resize();

    if (isAtSwedenLimit) {
      resetToSweden(false);
      return;
    }

    applySwedenMinZoom();
  });

  window.dealettCoverageMap = {
    map,
    resetToSweden,
    getActiveCoverageFilters: () => ({
      operator: state.activeOperator,
      networks: Array.from(state.activeNetworks),
    }),
  };
})();
