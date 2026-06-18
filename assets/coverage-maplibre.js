(() => {
  const app = document.querySelector('#coverageApp[data-map-engine="maplibre"]');
  const mapElement = document.querySelector('#coverageMapLibre');

  if (!app || !mapElement || !window.maplibregl) {
    return;
  }

  const operators = ['telia', 'tele2', 'telenor', 'tre', 'halebop'];
  const networks = ['2G', '3G', '4G', '4G+', '5G', '5G+'];
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
    pitch: 35,
    bearing: -6,
  };

  const localizedName = ['coalesce', ['get', 'name:latin'], ['get', 'name_en'], ['get', 'name']];
  const roadName = ['coalesce', ['get', 'name:latin'], ['get', 'name_en'], ['get', 'name'], ['get', 'ref']];

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

  const state = {
    activeOperator: 'telia',
    activeNetworks: new Set(['2G', '4G', '5G']),
    selectedMarker: null,
    locateMarker: null,
  };

  const selectedPlace = app.querySelector('#coverageSelectedPlace');
  const layerStatus = app.querySelector('#coverageLayerStatus');

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

    updateLayerStatus();
  };

  const addMapLayers = (map) => {
    const coverageBeforeLayer = map.getLayer('dealett-road-major')
      ? 'dealett-road-major'
      : undefined;
    const buildingBeforeLayer = map.getLayer('dealett-road-labels')
      ? 'dealett-road-labels'
      : undefined;

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

    if (!map.getLayer('dealett-building-extrusion')) {
      map.addLayer({
        id: 'dealett-building-extrusion',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13,
            '#7f837d',
            14.5,
            '#aca99f',
            17,
            '#d2cec1',
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13,
            0,
            14,
            ['*', ['coalesce', ['to-number', ['get', 'render_height']], ['to-number', ['get', 'height']], 18], 0.72],
            16,
            ['coalesce', ['to-number', ['get', 'render_height']], ['to-number', ['get', 'height']], 18],
          ],
          'fill-extrusion-base': ['coalesce', ['to-number', ['get', 'render_min_height']], ['to-number', ['get', 'min_height']], 0],
          'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.18, 14, 0.48, 16, 0.68],
          'fill-extrusion-vertical-gradient': true,
        },
      }, buildingBeforeLayer);
    }
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
    maxPitch: 45,
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
      const result = event.result;
      const center = result.center || result.geometry?.coordinates;

      if (!center) {
        return;
      }

      setSelectedPlace(result.place_name || result.text, center);
      map.flyTo({
        center,
        zoom: result.bbox ? 11 : 13,
        pitch: 38,
        bearing: map.getBearing(),
        duration: 1500,
        essential: true,
      });
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
          pitch: 38,
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
  });

  app.querySelector('#coverageMapZoomIn')?.addEventListener('click', () => {
    map.easeTo({ zoom: map.getZoom() + 0.8, duration: 600, easing: (t) => 1 - Math.pow(1 - t, 3) });
  });

  app.querySelector('#coverageMapZoomOut')?.addEventListener('click', () => {
    map.easeTo({ zoom: map.getZoom() - 0.8, duration: 600, easing: (t) => 1 - Math.pow(1 - t, 3) });
  });

  app.querySelectorAll('[data-map-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.mapAction;

      if (action === 'locate') {
        locateUser(button);
      }
    });
  });

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
