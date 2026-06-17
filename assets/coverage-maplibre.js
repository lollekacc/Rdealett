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
  const initialCamera = {
    center: [16.6, 62.2],
    zoom: 4.35,
    pitch: 14,
    bearing: -2,
  };

  const stockholmCamera = {
    center: [18.0686, 59.3293],
    zoom: 12.5,
    pitch: 34,
    bearing: -18,
  };

  const state = {
    activeOperator: 'telia',
    activeNetworks: new Set(['2G', '4G', '5G']),
    selectedMarker: null,
    locateMarker: null,
  };

  const selectedPlace = app.querySelector('#coverageSelectedPlace');
  const layerStatus = app.querySelector('#coverageLayerStatus');

  const safeSetPaint = (map, id, property, value) => {
    if (map.getLayer(id)) {
      map.setPaintProperty(id, property, value);
    }
  };

  const tuneBaseStyle = (map) => {
    safeSetPaint(map, 'background', 'background-color', '#242b31');
    safeSetPaint(map, 'water', 'fill-color', '#121a22');
    safeSetPaint(map, 'water', 'fill-opacity', 0.96);
    safeSetPaint(map, 'landcover_wood', 'fill-color', '#263139');
    safeSetPaint(map, 'landuse_park', 'fill-color', '#27363a');
    safeSetPaint(map, 'landuse_residential', 'fill-color', '#2a3036');
    safeSetPaint(map, 'landcover_glacier', 'fill-color', '#455059');
    safeSetPaint(map, 'landcover_ice_shelf', 'fill-color', '#3d4952');
    safeSetPaint(map, 'building', 'fill-color', '#252d34');
    safeSetPaint(map, 'building', 'fill-opacity', 0.2);

    map.getStyle().layers.forEach((layer) => {
      if (layer.type === 'line' && /road|highway|bridge|tunnel/i.test(layer.id)) {
        safeSetPaint(map, layer.id, 'line-color', '#75818a');
        safeSetPaint(map, layer.id, 'line-opacity', ['interpolate', ['linear'], ['zoom'], 4, 0.1, 9, 0.2, 14, 0.32]);
        safeSetPaint(map, layer.id, 'line-width', ['interpolate', ['linear'], ['zoom'], 4, 0.25, 10, 0.62, 14, 1.1]);
      }

      if (layer.type === 'symbol' && /road/i.test(layer.id)) {
        safeSetPaint(map, layer.id, 'text-color', '#8d989f');
        safeSetPaint(map, layer.id, 'text-opacity', ['interpolate', ['linear'], ['zoom'], 4, 0.05, 10, 0.14, 14, 0.22]);
        safeSetPaint(map, layer.id, 'text-halo-color', '#242b31');
        safeSetPaint(map, layer.id, 'text-halo-width', 1);
      }

      if (layer.type === 'symbol' && /place|water/i.test(layer.id)) {
        safeSetPaint(map, layer.id, 'text-color', '#c4ccd1');
        safeSetPaint(map, layer.id, 'text-opacity', ['interpolate', ['linear'], ['zoom'], 3, 0.54, 9, 0.68, 14, 0.78]);
        safeSetPaint(map, layer.id, 'text-halo-color', '#242b31');
        safeSetPaint(map, layer.id, 'text-halo-width', 1);
      }
    });

    ['place_city', 'place_city_large', 'place_country_major'].forEach((layerId) => {
      safeSetPaint(map, layerId, 'text-color', '#e1e6e9');
      safeSetPaint(map, layerId, 'text-opacity', ['interpolate', ['linear'], ['zoom'], 3, 0.72, 9, 0.84, 14, 0.9]);
    });

    ['place_other', 'place_suburb', 'place_village', 'place_town', 'water_name'].forEach((layerId) => {
      safeSetPaint(map, layerId, 'text-color', '#99a3aa');
      safeSetPaint(map, layerId, 'text-opacity', ['interpolate', ['linear'], ['zoom'], 3, 0.28, 9, 0.42, 14, 0.54]);
    });
  };

  const updateLayerStatus = () => {
    if (!layerStatus) {
      return;
    }

    const selectedNetworks = Array.from(state.activeNetworks);
    const networkText = selectedNetworks.length ? selectedNetworks.join(', ') : 'inga valda n&auml;t';
    layerStatus.innerHTML = `${operatorLabels[state.activeOperator]} valt: ${networkText}. Kartan visar inga fejkade t&auml;ckningseffekter. <a href="jamfor-tackning.html">L&auml;s mer &rarr;</a>`;
  };

  const updateCoverageFilter = () => {
    updateLayerStatus();
  };

  const addMapLayers = (map) => {
    if (!map.getLayer('dealett-building-extrusion')) {
      map.addLayer({
        id: 'dealett-building-extrusion',
        type: 'fill-extrusion',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['zoom'], 13, '#252d34', 15, '#303942', 17, '#3c454d'],
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
          'fill-extrusion-opacity': ['interpolate', ['linear'], ['zoom'], 13, 0.24, 15, 0.36, 17, 0.44],
          'fill-extrusion-vertical-gradient': true,
        },
      });
    }
  };

  const map = new maplibregl.Map({
    container: mapElement,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: initialCamera.center,
    zoom: initialCamera.zoom,
    pitch: initialCamera.pitch,
    bearing: initialCamera.bearing,
    maxBounds: [[9.2, 54.4], [25.4, 70.3]],
    minZoom: 3.65,
    maxZoom: 15.8,
    attributionControl: false,
    antialias: true,
    maxPitch: 42,
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
        pitch: 30,
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
          pitch: 30,
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
