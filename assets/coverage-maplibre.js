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

  const swedenBounds = [10.4, 55.0, 24.5, 69.3];
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

  const state = {
    activeOperator: 'telia',
    activeNetworks: new Set(['2G', '4G', '5G']),
    selectedMarker: null,
    locateMarker: null,
  };

  const selectedPlace = app.querySelector('#coverageSelectedPlace');
  const layerStatus = app.querySelector('#coverageLayerStatus');

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

  const createCirclePolygon = (center, radiusKm, points = 72) => {
    const [longitude, latitude] = center;
    const coordinates = [];
    const latRadians = latitude * Math.PI / 180;
    const latStep = radiusKm / 111.32;
    const lngStep = radiusKm / (111.32 * Math.cos(latRadians));

    for (let index = 0; index <= points; index += 1) {
      const angle = (index / points) * Math.PI * 2;
      coordinates.push([
        longitude + Math.cos(angle) * lngStep,
        latitude + Math.sin(angle) * latStep,
      ]);
    }

    return {
      type: 'Polygon',
      coordinates: [coordinates],
    };
  };

  const buildMockCoverageData = () => {
    const cities = [
      { name: 'Stockholm', center: [18.0686, 59.3293], weight: 1 },
      { name: 'Goteborg', center: [11.9746, 57.7089], weight: 0.86 },
      { name: 'Malmo', center: [13.0038, 55.6049], weight: 0.78 },
      { name: 'Uppsala', center: [17.6389, 59.8586], weight: 0.68 },
      { name: 'Umea', center: [20.263, 63.8258], weight: 0.58 },
      { name: 'Lulea', center: [22.1547, 65.5848], weight: 0.48 },
    ];

    const networkRadius = {
      '2G': 82,
      '3G': 68,
      '4G': 54,
      '4G+': 44,
      '5G': 30,
      '5G+': 18,
    };

    const operatorOffset = {
      telia: [0, 0],
      tele2: [0.1, -0.05],
      telenor: [-0.08, 0.04],
      tre: [0.05, 0.08],
      halebop: [-0.04, -0.08],
    };

    const features = [];

    operators.forEach((operator) => {
      networks.forEach((network) => {
        cities.forEach((city) => {
          const offset = operatorOffset[operator];
          const radius = networkRadius[network] * city.weight;
          const center = [city.center[0] + offset[0], city.center[1] + offset[1]];

          features.push({
            type: 'Feature',
            properties: {
              operator,
              operatorLabel: operatorLabels[operator],
              network,
              city: city.name,
              label: `${operatorLabels[operator]} ${network} mock`,
              isMockCoverage: true,
            },
            geometry: createCirclePolygon(center, radius),
          });
        });
      });
    });

    return {
      type: 'FeatureCollection',
      features,
    };
  };

  const buildCoverageFilter = () => {
    const selectedNetworks = Array.from(state.activeNetworks);

    if (!selectedNetworks.length) {
      return ['==', ['get', 'operator'], '__none__'];
    }

    return [
      'all',
      ['==', ['get', 'operator'], state.activeOperator],
      ['match', ['get', 'network'], selectedNetworks, true, false],
    ];
  };

  const updateLayerStatus = () => {
    if (!layerStatus) {
      return;
    }

    const selectedNetworks = Array.from(state.activeNetworks);
    const networkText = selectedNetworks.length ? selectedNetworks.join(', ') : 'inga valda n&auml;t';
    layerStatus.innerHTML = `Visar mocklager f&ouml;r ${operatorLabels[state.activeOperator]}: ${networkText}. Detta &auml;r inte verklig operat&ouml;rst&auml;ckning. <a href="jamfor-tackning.html">L&auml;s mer &rarr;</a>`;
  };

  const updateCoverageFilter = (map) => {
    const filter = buildCoverageFilter();
    ['dealett-coverage-fill', 'dealett-coverage-line', 'dealett-coverage-labels'].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setFilter(layerId, filter);
      }
    });
    updateLayerStatus();
  };

  const addMapLayers = (map) => {
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

    if (!map.getSource('dealett-coverage-placeholder')) {
      map.addSource('dealett-coverage-placeholder', {
        type: 'geojson',
        data: buildMockCoverageData(),
        // Later: replace this generated mock FeatureCollection with real per-operator
        // coverage GeoJSON that includes properties: operator, network, and isMockCoverage.
      });
    }

    if (!map.getLayer('dealett-coverage-fill')) {
      map.addLayer({
        id: 'dealett-coverage-fill',
        type: 'fill',
        source: 'dealett-coverage-placeholder',
        paint: {
          'fill-color': [
            'match',
            ['get', 'network'],
            '2G', '#f0a036',
            '3G', '#ef9430',
            '4G', '#ef8214',
            '4G+', '#f49b1f',
            '5G', '#ffd166',
            '5G+', '#ffe08a',
            '#ef8214',
          ],
          'fill-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.12, 8, 0.18, 13, 0.11],
        },
        filter: buildCoverageFilter(),
      }, firstSymbolLayerId(map));
    }

    if (!map.getLayer('dealett-coverage-line')) {
      map.addLayer({
        id: 'dealett-coverage-line',
        type: 'line',
        source: 'dealett-coverage-placeholder',
        paint: {
          'line-color': '#ffc45f',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.8, 8, 1.7, 13, 2.4],
          'line-opacity': 0.42,
          'line-blur': 0.3,
        },
        filter: buildCoverageFilter(),
      }, firstSymbolLayerId(map));
    }

    if (!map.getLayer('dealett-coverage-labels')) {
      map.addLayer({
        id: 'dealett-coverage-labels',
        type: 'symbol',
        source: 'dealett-coverage-placeholder',
        minzoom: 6,
        layout: {
          'text-field': ['concat', ['get', 'operatorLabel'], ' ', ['get', 'network'], ' mock'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 6, 10, 12, 12],
          'text-font': ['Noto Sans Regular'],
          'text-allow-overlap': false,
          'symbol-placement': 'point',
        },
        paint: {
          'text-color': '#ffd166',
          'text-halo-color': '#101c27',
          'text-halo-width': 1.4,
          'text-opacity': 0.86,
        },
        filter: buildCoverageFilter(),
      });
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
        pitch: 42,
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
          pitch: 42,
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
    tuneBaseStyle(map);
    addMapLayers(map);
    updateLayerStatus();
    setupGeocoder();
    map.resize();
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

      if (action === 'stockholm') {
        flyTo(stockholmCamera);
      }

      if (action === 'reset') {
        flyTo(initialCamera);
      }

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
      updateCoverageFilter(map);
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
      updateCoverageFilter(map);
    });
  });

  window.addEventListener('resize', () => {
    map.resize();
  });

  window.dealettCoverageMap = {
    map,
    flyToStockholm: () => flyTo(stockholmCamera),
    resetToSweden: () => flyTo(initialCamera),
    getActiveCoverageFilters: () => ({
      operator: state.activeOperator,
      networks: Array.from(state.activeNetworks),
    }),
  };
})();
