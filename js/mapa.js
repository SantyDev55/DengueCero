'use strict';

(() => {
  const cfg = window.DENGUE_MAPA || {};
  const live = Boolean(cfg.url && cfg.key);
  const LOCAL_KEY = 'denguecero-mapa-demo-v1';
  const TIPOS = {
    tanque: 'Tanque o cilindro', balde: 'Balde o recipiente sin uso', llanta: 'Llanta u objeto en desuso',
    envase: 'Botella, lata o envase', maceta: 'Florero o plato de maceta', bebedero: 'Bebedero de mascota',
    otro: 'Otro recipiente con agua'
  };
  // Puntos de ejemplo: solo se muestran en modo demostración y se anuncian como tales.
  const DEMO = [
    { tipo: 'tanque', lat: -5.195, lng: -80.633, atendido: false },
    { tipo: 'llanta', lat: -8.379, lng: -74.553, atendido: true },
    { tipo: 'balde', lat: -6.489, lng: -76.373, atendido: false },
    { tipo: 'maceta', lat: -12.046, lng: -77.043, atendido: true }
  ];
  const $ = selector => document.querySelector(selector);
  const mapEl = $('#mapa-canvas');
  if (!mapEl || !window.L) return;

  const form = $('#mapa-form');
  const message = $('#mapa-mensaje');
  const place = $('#mapa-ubicacion-estado');
  const round3 = value => Math.round(value * 1000) / 1000;
  const inPeru = (lat, lng) => lat >= -18.5 && lat <= 0.1 && lng >= -81.5 && lng <= -68.5;
  const say = (text, error = false) => { message.textContent = text; message.classList.toggle('is-error', error); };

  $('#mapa-demo').hidden = live;
  const map = L.map(mapEl, { preferCanvas: true }).setView([-9.2, -75.0], 5);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  let picked = null, pin = null, lastSent = 0;

  async function api(path, options = {}) {
    const headers = { apikey: cfg.key, 'Content-Type': 'application/json', ...options.headers };
    if (!cfg.key.startsWith('sb_')) headers.Authorization = 'Bearer ' + cfg.key;
    const response = await fetch(cfg.url + '/rest/v1/' + path, { ...options, headers });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
  }

  const loadReports = () => live
    ? api('reportes?select=tipo,lat,lng,atendido,created_at&order=created_at.desc&limit=1000')
    : Promise.resolve([...DEMO, ...readLocal()]);

  function draw(reports) {
    layer.clearLayers();
    reports.filter(item => inPeru(item.lat, item.lng)).forEach(item => {
      const when = item.created_at ? ' · ' + new Date(item.created_at).toLocaleDateString('es-PE') : '';
      L.circleMarker([item.lat, item.lng], {
        radius: 9, color: '#123b35', weight: 2, fillColor: item.atendido ? '#2f8f6b' : '#ee8468', fillOpacity: 0.85
      }).bindPopup(`<strong>${TIPOS[item.tipo] || TIPOS.otro}</strong><br>${item.atendido ? 'Ya atendido' : 'Pendiente de atender'}${when}`).addTo(layer);
    });
    const done = reports.filter(item => item.atendido).length;
    $('#mapa-stats').textContent = reports.length
      ? `${reports.length} reportes · ${done} atendidos${live ? '' : ' (ejemplo)'}`
      : 'Aún no hay reportes';
  }

  async function refresh() {
    try { draw(await loadReports()); } catch { $('#mapa-stats').textContent = 'No se pudieron cargar los reportes'; }
  }

  function pick(lat, lng) {
    if (!inPeru(lat, lng)) { say('Esa ubicación está fuera del Perú. Elige un punto dentro del país.', true); return false; }
    picked = { lat: round3(lat), lng: round3(lng) };
    if (pin) pin.remove();
    pin = L.circle([picked.lat, picked.lng], { radius: 70, color: '#123b35', weight: 2, dashArray: '4', fillOpacity: 0.1 }).addTo(map);
    place.textContent = `Zona marcada (aproximada): ${picked.lat}, ${picked.lng}`;
    say('');
    return true;
  }

  map.on('click', event => pick(event.latlng.lat, event.latlng.lng));
  $('#mapa-centro').addEventListener('click', () => { const c = map.getCenter(); pick(c.lat, c.lng); });
  $('#mapa-gps').addEventListener('click', () => {
    if (!navigator.geolocation) return say('Tu navegador no permite usar la ubicación. Toca el mapa para marcar la zona.', true);
    navigator.geolocation.getCurrentPosition(
      pos => { if (pick(pos.coords.latitude, pos.coords.longitude)) map.setView([picked.lat, picked.lng], 16); },
      () => say('No pudimos obtener tu ubicación. Toca el mapa para marcar la zona.', true),
      { timeout: 10000 }
    );
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const tipo = $('#mapa-tipo').value;
    if (!TIPOS[tipo]) return say('Elige qué encontraste.', true);
    if (!picked) return say('Marca la zona en el mapa antes de enviar.', true);
    if (Date.now() - lastSent < 30000) return say('Espera unos segundos antes de enviar otro reporte.', true);
    const report = { tipo, lat: picked.lat, lng: picked.lng, atendido: $('#mapa-atendido').checked };
    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    try {
      if (live) await api('reportes', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(report) });
      else localStorage.setItem(LOCAL_KEY, JSON.stringify([...readLocal(), { ...report, created_at: new Date().toISOString() }]));
      lastSent = Date.now();
      form.reset();
      picked = null;
      if (pin) pin.remove();
      place.textContent = 'Aún no marcaste ninguna zona.';
      say('Reporte enviado. Gracias por ayudar a tu comunidad.');
      await refresh();
    } catch {
      say('No se pudo enviar el reporte. Revisa tu conexión e inténtalo de nuevo.', true);
    } finally {
      button.disabled = false;
    }
  });

  refresh();
})();
