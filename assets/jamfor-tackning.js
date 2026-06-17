(() => {
  const app = document.querySelector('#coverageApp');
  const mapElement = document.querySelector('#map');

  if (!app || !mapElement || !window.L) {
    return;
  }

  const usesBackdropMap = app.dataset.coverageMap === 'real';
  const defaultView = usesBackdropMap
    ? {
        center: [61.9, 16.5],
        zoom: 5,
      }
    : {
        center: [62.0, 15.0],
        zoom: 5,
      };

  const swedenBounds = [
    [55.0, 10.0],
    [69.5, 24.5],
  ];
  const nordicBounds = [
    [53.0, 3.0],
    [71.5, 33.5],
  ];
  const activeBounds = usesBackdropMap ? nordicBounds : swedenBounds;

  const operatorMeta = {
    telia: {
      label: 'Telia',
      theme: '#6E2380',
    },
    tele2: {
      label: 'Tele2',
      theme: '#003A6E',
    },
    telenor: {
      label: 'Telenor',
      theme: '#00437E',
    },
    tre: {
      label: 'Tre',
      theme: '#E65C00',
    },
    halebop: {
      label: 'Halebop',
      theme: '#C8175C',
    },
  };

  const map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    maxBounds: activeBounds,
    maxBoundsViscosity: 1.0,
    minZoom: 4,
    scrollWheelZoom: false,
  }).setView(defaultView.center, defaultView.zoom);

  mapElement.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey) {
        map.scrollWheelZoom.disable();
        return;
      }

      event.preventDefault();
      map.scrollWheelZoom.enable();

      window.clearTimeout(mapElement._dealettWheelZoomTimer);
      mapElement._dealettWheelZoomTimer = window.setTimeout(() => {
        map.scrollWheelZoom.disable();
      }, 180);
    },
    { passive: false, capture: true }
  );

  const baseLayer = L.tileLayer(
    usesBackdropMap
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 18,
      subdomains: usesBackdropMap ? 'abcd' : 'abc',
    }
  ).addTo(map);

  const overlays = {
    tele2: L.tileLayer(
      'https://mim.tele2.com/MIMCore/api/Tile/GetOverlay?x={x}&y={y}&z={z}&viewType=1&serviceThresholdIds=14,15,16,18,35,36,37,39,56,57,58,60,69,80,82,90,101,103,111,122,124&countryCode=SWE&currentServiceLayerNo=100',
      { opacity: 0.78 }
    ),
    telia: L.tileLayer.wms(
      'https://coverage.ddc.teliasonera.net/coverageportal_se/map/tile',
      {
        format: 'image/png',
        transparent: true,
        opacity: 0.78,
      }
    ),
    tre: L.tileLayer(
      'https://coverage.tre.se/MIMCore/api/Tile/GetOverlay?locale=se&countryCode=swe&z={z}&x={x}&y={y}&viewType=1&serviceThresholdIds=14,35,56,15,36,57,17,38,59,13,34,55,64,85,106,67,88,109,65,86,107&currentServiceLayerNo=100',
      { opacity: 0.78 }
    ),
    telenor: L.tileLayer.wms(
      'https://mboss.telenor.se/coverageportal/map/tile',
      {
        services: 'NR3500_DATASA,NR_DATANSA,LTE_DATA',
        qualities: '1,2,3',
        serviceGroup: 'mobile_broadband',
        format: 'image/png',
        transparent: true,
        opacity: 0.78,
      }
    ),
    halebop: L.tileLayer.wms(
      'https://coverage.ddc.teliasonera.net/coverageportal_se/map/tile',
      {
        format: 'image/png',
        transparent: true,
        opacity: 0.78,
      }
    ),
  };

  let activeOverlay = null;
  let activeOperatorKey = null;
  let searchMarker = null;
  let manualPinMode = false;

  const operatorButtons = app.querySelectorAll('.operator-card');
  const activeOperatorLabel = document.querySelector('#activeOperatorLabel');
  const heroActiveOperator = document.querySelector('#heroActiveOperator');
  const mapToolbarLabel = document.querySelector('#mapToolbarLabel');
  const zoomLabel = document.querySelector('#zoomLabel');
  const visibleZoomLabel = document.querySelector('#visibleZoomLabel');
  const coordsLabel = document.querySelector('#coordsLabel');
  const layerToggleBtn = document.querySelector('#layerToggleBtn');
  const manualPinBtn = document.querySelector('#manualPinBtn');

  const setText = (element, value) => {
    if (element) {
      element.textContent = value;
    }
  };

  const updateZoom = () => {
    const zoom = String(map.getZoom());
    setText(zoomLabel, zoom);
    setText(visibleZoomLabel, zoom);
  };

  const updateCenter = () => {
    const center = map.getCenter();
    setText(coordsLabel, `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`);
  };

  const setActiveOperatorUI = (key) => {
    operatorButtons.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.operator === key);
    });

    const label = key ? operatorMeta[key].label : 'Ingen vald';

    setText(activeOperatorLabel, label);
    setText(heroActiveOperator, label);
    setText(mapToolbarLabel, key ? `${operatorMeta[key].label} aktiv` : 'Ingen operat\u00f6r vald');

    document.body.style.setProperty('--coverage-accent', key ? operatorMeta[key].theme : 'var(--accent)');

    if (layerToggleBtn) {
      layerToggleBtn.classList.toggle('is-muted', !key);
    }
  };

  const clearActiveOverlay = () => {
    if (activeOverlay) {
      map.removeLayer(activeOverlay);
      activeOverlay = null;
    }

    activeOperatorKey = null;
    setActiveOperatorUI(null);
  };

  const activateOperator = (key) => {
    if (!overlays[key]) {
      return;
    }

    if (activeOverlay) {
      map.removeLayer(activeOverlay);
    }

    activeOverlay = overlays[key];
    activeOverlay.addTo(map);
    activeOperatorKey = key;
    setActiveOperatorUI(key);
  };

  const searchAddress = async (query) => {
    if (!query) {
      return;
    }

    try {
      const data = await window.DealettNetwork.fetchJson(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        {
          label: 'Täckningskarta adressökning',
          timeoutMs: 6000,
        }
      );

      if (!Array.isArray(data) || !data.length) {
        setText(coordsLabel, 'Ingen adress hittades');
        return;
      }

      const lat = Number(data[0].lat);
      const lon = Number(data[0].lon);

      map.setView([lat, lon], 14, { animate: true });

      if (searchMarker) {
        map.removeLayer(searchMarker);
      }

      searchMarker = L.marker([lat, lon]).addTo(map);
    } catch {
      setText(coordsLabel, 'Adressökning misslyckades');
    }
  };

  operatorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.operator;

      if (activeOperatorKey === key) {
        clearActiveOverlay();
        return;
      }

      activateOperator(key);
    });
  });

  document.querySelector('#resetViewBtn')?.addEventListener('click', () => {
    map.setView(defaultView.center, defaultView.zoom, { animate: true });
  });

  document.querySelector('#clearLayerBtn')?.addEventListener('click', () => {
    clearActiveOverlay();

    if (searchMarker) {
      map.removeLayer(searchMarker);
      searchMarker = null;
    }
  });

  ['zoomInBtn', 'zoomInBtn2'].forEach((id) => {
    document.querySelector(`#${id}`)?.addEventListener('click', () => map.zoomIn());
  });

  ['zoomOutBtn', 'zoomOutBtn2'].forEach((id) => {
    document.querySelector(`#${id}`)?.addEventListener('click', () => map.zoomOut());
  });

  const searchInput = document.querySelector('#mapSearchInput');
  const searchButton = document.querySelector('#mapSearchBtn');

  searchButton?.addEventListener('click', () => {
    searchAddress(searchInput?.value.trim());
  });

  searchInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchAddress(event.target.value.trim());
    }
  });

  document.querySelector('#currentLocationBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      map.setView([latitude, longitude], 14, { animate: true });

      if (searchMarker) {
        map.removeLayer(searchMarker);
      }

      searchMarker = L.marker([latitude, longitude]).addTo(map);
    });
  });

  manualPinBtn?.addEventListener('click', () => {
    manualPinMode = !manualPinMode;
    manualPinBtn.classList.toggle('is-active', manualPinMode);
  });

  map.on('click', (event) => {
    if (!manualPinMode) {
      return;
    }

    if (searchMarker) {
      map.removeLayer(searchMarker);
    }

    searchMarker = L.marker(event.latlng).addTo(map);
    manualPinMode = false;
    manualPinBtn?.classList.remove('is-active');
  });

  layerToggleBtn?.addEventListener('click', () => {
    if (!activeOverlay) {
      return;
    }

    if (map.hasLayer(activeOverlay)) {
      map.removeLayer(activeOverlay);
      layerToggleBtn.classList.add('is-muted');
    } else {
      activeOverlay.addTo(map);
      layerToggleBtn.classList.remove('is-muted');
    }
  });

  document.querySelector('#fullscreenMapBtn')?.addEventListener('click', () => {
    const mapCard = document.querySelector('.coverage-map-card');

    if (!mapCard) {
      return;
    }

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      document.exitFullscreen?.();
      document.webkitExitFullscreen?.();
    } else {
      mapCard.requestFullscreen?.();
      mapCard.webkitRequestFullscreen?.();
    }
  });

  ['fullscreenchange', 'webkitfullscreenchange'].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      const mapCard = document.querySelector('.coverage-map-card');

      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        mapCard?.classList.remove('is-fullscreen');
      }

      setTimeout(() => {
        map.invalidateSize();
        updateZoom();
      }, 150);
    });
  });

  map.on('drag', () => {
    map.panInsideBounds(activeBounds, { animate: false });
  });

  map.on('zoomend', updateZoom);
  map.on('moveend', updateCenter);

  if (usesBackdropMap) {
    activateOperator('telia');
  } else {
    setActiveOperatorUI(null);
  }
  updateZoom();
  updateCenter();

  setTimeout(() => {
    map.invalidateSize();
    updateZoom();
    updateCenter();
  }, 250);

  window.addEventListener('resize', () => {
    map.invalidateSize();
  });

  window.dealettCoverageMap = {
    map,
    baseLayer,
    activateOperator,
    clearActiveOverlay,
  };
})();
