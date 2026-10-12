'use strict';

(() => {
  const cfg = window.DENGUE_MAPA || {};
  const live = Boolean(cfg.url && cfg.key);
  const TIPOS = {
    tanque: 'Tanque o cilindro', balde: 'Balde o recipiente sin uso', llanta: 'Llanta u objeto en desuso',
    envase: 'Botella, lata o envase', maceta: 'Florero o plato de maceta', bebedero: 'Bebedero de mascota',
    otro: 'Otro recipiente con agua'
  };
  const PERU = [[-18.4, -81.4], [-0.04, -68.6]];
  const $ = selector => document.querySelector(selector);
  const mapEl = $('#mapa-canvas');
  if (!mapEl || !window.L) return;
  if ($('#mapa-demo')) $('#mapa-demo').remove();

  const form = $('#mapa-form');
  const message = $('#mapa-mensaje');
  const place = $('#mapa-ubicacion-estado');
  const stats = $('#mapa-stats');
  const coarse = window.matchMedia('(pointer: coarse)');
  const round3 = value => Math.round(value * 1000) / 1000;
  const inPeru = (lat, lng) => lat >= -18.5 && lat <= 0.1 && lng >= -81.5 && lng <= -68.5;
  const say = (text, error = false) => { message.textContent = text; message.classList.toggle('is-error', error); };

  const map = L.map(mapEl, { preferCanvas: true, scrollWheelZoom: false });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  let reports = [], picked = null, pin = null, lastSent = 0, fitting = false, moved = false;

  // El encuadre se calcula según el tamaño de pantalla: en cada dispositivo se ve el país o los reportes completos.
  function fit(bounds, options = {}) {
    fitting = true;
    map.fitBounds(bounds, { padding: [16, 16], animate: false, ...options });
    fitting = false;
  }
  function fitData() {
    const points = reports.filter(item => inPeru(item.lat, item.lng)).map(item => [item.lat, item.lng]);
    if (points.length) fit(L.latLngBounds(points), { maxZoom: 14 }); else fit(PERU);
  }
  const PeruButton = L.Control.extend({
    onAdd() {
      const button = L.DomUtil.create('button', 'map-reset');
      button.type = 'button';
      button.textContent = 'Ver todo el Perú';
      L.DomEvent.disableClickPropagation(button);
      button.addEventListener('click', () => { fit(PERU); moved = true; });
      return button;
    }
  });
  new PeruButton({ position: 'bottomleft' }).addTo(map);
  map.on('dragstart zoomstart', () => { if (!fitting) moved = true; });
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());
  if ('ResizeObserver' in window) new ResizeObserver(() => { map.invalidateSize(); if (!moved) fitData(); }).observe(mapEl);
  fitData();

  const panel = document.createElement('section');
  panel.className = 'impact-panel';
  panel.setAttribute('aria-labelledby', 'impacto-titulo');
  panel.innerHTML = `
    <div class="impact-head"><h3 id="impacto-titulo">Impacto de la comunidad</h3>
    <a class="button button-primary" id="mapa-whatsapp" target="_blank" rel="noopener">Compartir por WhatsApp</a></div>
    <dl class="impact-kpis">
      <div><dt>Reportes</dt><dd id="kpi-total">0</dd></div><div><dt>Atendidos</dt><dd id="kpi-atendidos">0</dd></div>
      <div><dt>Pendientes</dt><dd id="kpi-pendientes">0</dd></div><div><dt>Últimos 7 días</dt><dd id="kpi-semana">0</dd></div>
    </dl>
    <ul class="impact-bars" id="impacto-tipos"></ul>
    <p class="impact-note">Datos declarados por la comunidad y sin verificar. No confirman casos de dengue.</p>`;
  mapEl.closest('.container').appendChild(panel);
  const shareText = 'Revisa tu casa y reporta posibles criaderos de zancudos en el mapa comunitario de DengueCero: ' + location.href.split('#')[0] + '#mapa';
  $('#mapa-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(shareText);

  function renderImpact() {
    const total = reports.length;
    const done = reports.filter(item => item.atendido).length;
    $('#kpi-total').textContent = total;
    $('#kpi-atendidos').textContent = total ? `${done} (${Math.round(done / total * 100)}%)` : '0';
    $('#kpi-pendientes').textContent = total - done;
    $('#kpi-semana').textContent = reports.filter(item => Date.now() - new Date(item.created_at) < 6048e5).length;
    const counts = {};
    reports.forEach(item => { const key = TIPOS[item.tipo] ? item.tipo : 'otro'; counts[key] = (counts[key] || 0) + 1; });
    const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = rows.length ? rows[0][1] : 1;
    $('#impacto-tipos').innerHTML = rows.map(([key, n]) =>
      `<li><span>${TIPOS[key]}</span><span class="bar"><i style="width:${Math.round(n / top * 100)}%"></i></span><strong>${n}</strong></li>`).join('');
  }

  function draw() {
    layer.clearLayers();
    const radius = coarse.matches ? 12 : 9;
    const maxWidth = Math.max(160, Math.min(240, mapEl.clientWidth - 60));
    reports.filter(item => inPeru(item.lat, item.lng)).forEach(item => {
      const when = item.created_at ? ' · ' + new Date(item.created_at).toLocaleDateString('es-PE') : '';
      L.circleMarker([item.lat, item.lng], {
        radius, color: '#123b35', weight: 2, fillColor: item.atendido ? '#2f8f6b' : '#ee8468', fillOpacity: 0.85
      }).bindPopup(`<strong>${TIPOS[item.tipo] || TIPOS.otro}</strong><br>${item.atendido ? 'Ya atendido' : 'Pendiente de atender'}${when}`, { maxWidth }).addTo(layer);
    });
    const done = reports.filter(item => item.atendido).length;
    stats.textContent = reports.length ? `${reports.length} reportes · ${done} atendidos` : 'Aún no hay reportes';
    renderImpact();
  }

  async function api(path, options = {}) {
    const headers = { apikey: cfg.key, 'Content-Type': 'application/json', ...options.headers };
    if (!cfg.key.startsWith('sb_')) headers.Authorization = 'Bearer ' + cfg.key;
    const response = await fetch(cfg.url + '/rest/v1/' + path, { ...options, headers });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function refresh() {
    try {
      reports = await api('reportes?select=tipo,lat,lng,atendido,created_at&order=created_at.desc&limit=1000') || [];
    } catch { stats.textContent = 'No se pudieron cargar los reportes'; return; }
    draw();
    if (!moved) fitData();
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
    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    try {
      await api('reportes', { method: 'POST', headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ tipo, lat: picked.lat, lng: picked.lng, atendido: $('#mapa-atendido').checked }) });
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

  renderImpact();
  if (live) refresh();
  else {
    stats.textContent = 'Mapa sin conectar: falta configurar js/mapa-config.js';
    form.querySelectorAll('select,input,button').forEach(el => { el.disabled = true; });
  }
})();
