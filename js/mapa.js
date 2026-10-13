'use strict';
(() => {
  const cfg = window.DENGUE_MAPA || {};
  const apiUrl = String(cfg.url || '').trim().replace(/\/+$/, '');
  const apiKey = String(cfg.key || '').trim();
  const live = Boolean(apiUrl && apiKey);
  const STORAGE_KEY = 'dengueCero.mapReports.v1';
  const TYPES = {
    tanque: 'Tanque o cilindro',
    balde: 'Balde o recipiente sin uso',
    llanta: 'Llanta u objeto en desuso',
    envase: 'Botella, lata o envase',
    maceta: 'Florero o plato de maceta',
    bebedero: 'Bebedero de mascota',
    otro: 'Otro recipiente con agua'
  };
  const PERU_BOUNDS = [[-18.5, -81.5], [0.1, -68.5]];
  // Encuadre inicial pensado para probar el flujo en Lima Norte. Se puede explorar todo el Perú.
  const DEFAULT_CENTER = [-11.91, -77.07];
  const DEFAULT_ZOOM = 10.5;
  const $ = selector => document.querySelector(selector);
  const mapEl = $('#mapa-canvas');
  const form = $('#mapa-form');
  const message = $('#mapa-mensaje');
  const place = $('#mapa-ubicacion-estado');
  const stats = $('#mapa-stats');
  const demoBanner = $('#mapa-demo');

  if (!mapEl || !form) return;

  const inPeru = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -18.5 && lat <= 0.1 && lng >= -81.5 && lng <= -68.5;
  const round3 = value => Math.round(Number(value) * 1000) / 1000;
  const say = (text, error = false) => {
    if (!message) return;
    message.textContent = text;
    message.classList.toggle('is-error', error);
  };
  const dateLabel = value => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-PE');
  };
  const makeId = () => (window.crypto && typeof window.crypto.randomUUID === 'function')
    ? window.crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Ejemplos ficticios que solo sirven para enseñar a usar el mapa. Nunca cuentan como reportes.
  const demoPoints = [
    { id: 'demo-1', lat: -11.865, lng: -77.078, tipo: 'balde', atendido: false, zona: 'Lima Norte' },
    { id: 'demo-2', lat: -11.887, lng: -77.096, tipo: 'tanque', atendido: true, zona: 'Lima Norte' },
    { id: 'demo-3', lat: -11.991, lng: -77.070, tipo: 'envase', atendido: false, zona: 'Lima Norte' },
    { id: 'demo-4', lat: -11.875, lng: -77.127, tipo: 'llanta', atendido: false, zona: 'Callao' }
  ];

  if (!window.L) {
    if (stats) stats.textContent = 'No se cargó el mapa. Revisa tu conexión y recarga la página.';
    say('No se pudo cargar la biblioteca del mapa. Comprueba tu conexión a Internet.', true);
    form.querySelectorAll('button, select, input').forEach(element => { element.disabled = true; });
    return;
  }

  const map = L.map(mapEl, {
    preferCanvas: true,
    scrollWheelZoom: false,
    zoomControl: true
  }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(map);

  const reportLayer = L.layerGroup().addTo(map);
  const demoLayer = L.layerGroup().addTo(map);

  // Panel de indicadores construido aquí para reutilizar el HTML existente del mapa.
  const impactPanel = document.createElement('section');
  impactPanel.className = 'impact-panel';
  impactPanel.setAttribute('aria-labelledby', 'impacto-titulo');
  impactPanel.innerHTML = `
    <div class="impact-head">
      <h3 id="impacto-titulo">Resumen de reportes</h3>
      <a class="button button-primary" id="mapa-whatsapp" target="_blank" rel="noopener">Compartir por WhatsApp</a>
    </div>
    <dl class="impact-kpis">
      <div><dt>Reportes</dt><dd id="kpi-total">0</dd></div>
      <div><dt>Atendidos</dt><dd id="kpi-atendidos">0</dd></div>
      <div><dt>Pendientes</dt><dd id="kpi-pendientes">0</dd></div>
      <div><dt>Últimos 7 días</dt><dd id="kpi-semana">0</dd></div>
    </dl>
    <ul class="impact-bars" id="impacto-tipos"></ul>
    <p class="impact-note">Datos declarados por los usuarios; no son reportes oficiales.</p>`;
  const mapContainer = mapEl.closest('.container');
  if (mapContainer) mapContainer.appendChild(impactPanel);

  let reports = [];
  let picked = null;
  let pin = null;
  let lastSent = 0;
  let fitting = false;
  let moved = false;

  function fit(bounds, options = {}) {
    fitting = true;
    map.fitBounds(bounds, { padding: [18, 18], animate: false, ...options });
    fitting = false;
  }

  function fitData() {
    const points = reports
      .filter(item => inPeru(Number(item.lat), Number(item.lng)))
      .map(item => [Number(item.lat), Number(item.lng)]);
    if (points.length) fit(L.latLngBounds(points), { maxZoom: 12 });
    else map.setView(DEFAULT_CENTER, DEFAULT_ZOOM, { animate: false });
  }

  const PeruButton = L.Control.extend({
    onAdd() {
      const button = L.DomUtil.create('button', 'map-reset');
      button.type = 'button';
      button.textContent = 'Ver todo el Perú';
      button.setAttribute('aria-label', 'Mostrar el mapa de todo el Perú');
      L.DomEvent.disableClickPropagation(button);
      button.addEventListener('click', () => {
        fit(PERU_BOUNDS);
        moved = true;
      });
      return button;
    }
  });
  new PeruButton({ position: 'bottomleft' }).addTo(map);

  map.on('dragstart zoomstart', () => { if (!fitting) moved = true; });
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      map.invalidateSize();
      if (!moved) fitData();
    }).observe(mapEl);
  }

  function popupContent(item, isDemo = false) {
    const box = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = TYPES[item.tipo] || TYPES.otro;
    box.appendChild(title);

    const status = document.createElement('p');
    status.className = 'map-popup-status';
    status.textContent = item.atendido ? 'Declarado como atendido' : 'Pendiente de atender';
    box.appendChild(status);

    if (isDemo) {
      const demo = document.createElement('p');
      demo.className = 'map-popup-demo';
      demo.textContent = 'EJEMPLO SIMULADO · No es un reporte real ni un dato sanitario.';
      box.appendChild(demo);
    } else {
      const when = dateLabel(item.created_at);
      if (when) {
        const date = document.createElement('small');
        date.textContent = `Fecha del reporte: ${when}`;
        box.appendChild(date);
      }
      if (!live) {
        const local = document.createElement('small');
        local.className = 'map-popup-local';
        local.textContent = 'Guardado solo en este dispositivo.';
        box.appendChild(local);
      }
    }
    return box;
  }

  function addMarker(item, isDemo = false) {
    const marker = L.circleMarker([Number(item.lat), Number(item.lng)], {
      radius: isDemo ? 8 : (window.matchMedia('(pointer: coarse)').matches ? 12 : 9),
      color: isDemo ? '#6d5bd0' : '#123b35',
      weight: isDemo ? 3 : 2,
      dashArray: isDemo ? '4 3' : null,
      fillColor: item.atendido ? '#2f8f6b' : '#ee8468',
      fillOpacity: 0.88
    });
    marker.bindPopup(popupContent(item, isDemo), { maxWidth: 250 });
    marker.addTo(isDemo ? demoLayer : reportLayer);
  }

  function renderImpact() {
    const total = reports.length;
    const done = reports.filter(item => item.atendido).length;
    const pending = total - done;
    const sevenDays = reports.filter(item => {
      const created = new Date(item.created_at).getTime();
      const age = Date.now() - created;
      return Number.isFinite(created) && age >= 0 && age <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    $('#kpi-total').textContent = String(total);
    $('#kpi-atendidos').textContent = total ? `${done} (${Math.round(done / total * 100)}%)` : '0';
    $('#kpi-pendientes').textContent = String(pending);
    $('#kpi-semana').textContent = String(sevenDays);

    const typeCounts = {};
    reports.forEach(item => {
      const key = TYPES[item.tipo] ? item.tipo : 'otro';
      typeCounts[key] = (typeCounts[key] || 0) + 1;
    });
    const rows = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
    const max = rows.length ? rows[0][1] : 1;
    $('#impacto-tipos').innerHTML = rows.map(([key, count]) =>
      `<li><span>${TYPES[key]}</span><span class="bar" aria-hidden="true"><i style="width:${Math.round(count / max * 100)}%"></i></span><strong>${count}</strong></li>`
    ).join('');

    const impactTitle = $('.impact-head h3');
    const totalLabel = $('#kpi-total')?.parentElement?.querySelector('dt');
    const note = $('.impact-note');
    if (live) {
      if (impactTitle) impactTitle.textContent = 'Impacto de la comunidad';
      if (totalLabel) totalLabel.textContent = 'Reportes comunitarios';
      if (note) note.textContent = 'Reportes enviados por usuarios, sin verificación oficial. “Atendido” es una declaración del usuario; los datos no confirman casos de dengue.';
      stats.textContent = `${total} reporte${total === 1 ? '' : 's'} comunitario${total === 1 ? '' : 's'} · ${done} atendido${done === 1 ? '' : 's'}`;
    } else {
      if (impactTitle) impactTitle.textContent = 'Prueba del mapa en este dispositivo';
      if (totalLabel) totalLabel.textContent = 'Reportes locales';
      if (note) note.textContent = 'Los ejemplos con borde punteado son simulados y no se cuentan. Tus reportes de prueba solo se guardan en este navegador; no los ve la comunidad.';
      stats.textContent = `${total} reporte${total === 1 ? '' : 's'} local${total === 1 ? '' : 'es'} · ${done} atendido${done === 1 ? '' : 's'}`;
    }
  }

  function draw() {
    reportLayer.clearLayers();
    demoLayer.clearLayers();
    if (!live) demoPoints.forEach(item => addMarker(item, true));
    reports.filter(item => inPeru(Number(item.lat), Number(item.lng)))
      .forEach(item => addMarker(item, false));
    renderImpact();
  }

  function readLocalReports() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(item => item && TYPES[item.tipo] &&
        inPeru(Number(item.lat), Number(item.lng)) && typeof item.atendido === 'boolean')
        .map(item => ({
          id: String(item.id || makeId()),
          tipo: item.tipo,
          lat: round3(item.lat),
          lng: round3(item.lng),
          atendido: item.atendido,
          created_at: item.created_at || new Date().toISOString()
        }));
    } catch {
      return [];
    }
  }

  function writeLocalReports(nextReports) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextReports));
      return true;
    } catch {
      say('El navegador bloqueó el almacenamiento local. Prueba abrir la web desde HTTPS o un servidor local.', true);
      return false;
    }
  }

  async function api(path, options = {}) {
    const headers = { apikey: apiKey, 'Content-Type': 'application/json', ...options.headers };
    // Las claves publicables sb_publishable_ no son JWT. Las claves anon antiguas sí lo son.
    if (!apiKey.startsWith('sb_')) headers.Authorization = `Bearer ${apiKey}`;
    const response = await fetch(`${apiUrl}/rest/v1/${path}`, { ...options, headers });
    if (!response.ok) throw new Error(`Supabase respondió con HTTP ${response.status}`);
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function refresh() {
    if (!live) {
      reports = readLocalReports();
      draw();
      return;
    }
    try {
      const data = await api('reportes?select=tipo,lat,lng,atendido,created_at&visible=eq.true&order=created_at.desc&limit=1000');
      reports = (Array.isArray(data) ? data : []).filter(item =>
        TYPES[item.tipo] && inPeru(Number(item.lat), Number(item.lng)) && typeof item.atendido === 'boolean');
      draw();
      if (!moved) fitData();
    } catch (error) {
      stats.textContent = 'No se pudieron cargar los reportes online';
      say('No se pudo conectar con la base de datos. Revisa la URL, la clave y las políticas de Supabase.', true);
      console.error('[DengueCero mapa]', error);
    }
  }

  function pick(lat, lng) {
    if (!inPeru(Number(lat), Number(lng))) {
      say('Esa ubicación está fuera del Perú. Elige un punto dentro del país.', true);
      return false;
    }
    picked = { lat: round3(lat), lng: round3(lng) };
    if (pin) pin.remove();
    pin = L.circle([picked.lat, picked.lng], {
      radius: 70,
      color: '#123b35',
      weight: 2,
      dashArray: '4 4',
      fillColor: '#d7f36a',
      fillOpacity: 0.35
    }).addTo(map);
    place.textContent = 'Zona aproximada marcada. La ubicación se redondeará a unos 100 m para proteger la privacidad.';
    say('');
    return true;
  }

  map.on('click', event => pick(event.latlng.lat, event.latlng.lng));
  $('#mapa-centro').addEventListener('click', () => {
    const center = map.getCenter();
    pick(center.lat, center.lng);
  });
  $('#mapa-gps').addEventListener('click', () => {
    if (!navigator.geolocation) {
      say('Tu navegador no permite usar la ubicación. Toca el mapa para marcar la zona.', true);
      return;
    }
    say('Solicitando ubicación…');
    navigator.geolocation.getCurrentPosition(
      position => {
        if (pick(position.coords.latitude, position.coords.longitude)) {
          map.setView([picked.lat, picked.lng], 16);
        }
      },
      error => {
        const detail = error && error.code === 1
          ? 'No diste permiso para usar la ubicación. Puedes tocar el mapa para elegir una zona.'
          : 'No pudimos obtener tu ubicación. Comprueba el permiso y que la web esté en HTTPS o localhost.';
        say(detail, true);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const tipo = $('#mapa-tipo').value;
    if (!TYPES[tipo]) return say('Elige qué encontraste.', true);
    if (!picked) return say('Toca el mapa, usa tu ubicación o marca el centro del mapa antes de enviar.', true);
    if (live && Date.now() - lastSent < 30000) {
      return say('Por seguridad, espera 30 segundos antes de enviar otro reporte.', true);
    }

    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.textContent = live ? 'Enviando…' : 'Guardando…';
    const report = {
      id: makeId(),
      tipo,
      lat: picked.lat,
      lng: picked.lng,
      atendido: $('#mapa-atendido').checked,
      created_at: new Date().toISOString()
    };

    try {
      if (live) {
        await api('reportes', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            tipo: report.tipo,
            lat: report.lat,
            lng: report.lng,
            atendido: report.atendido
          })
        });
        lastSent = Date.now();
      } else {
        const next = [report, ...readLocalReports()].slice(0, 300);
        if (!writeLocalReports(next)) throw new Error('No se pudo guardar en el navegador');
        reports = next;
      }

      form.reset();
      picked = null;
      if (pin) pin.remove();
      pin = null;
      place.textContent = 'Aún no marcaste ninguna zona.';
      await refresh();
      say(live
        ? 'Reporte enviado a la base de datos. Gracias por ayudar a tu comunidad.'
        : 'Reporte de prueba guardado en este dispositivo. No se envió a Internet.');
    } catch (error) {
      say(live
        ? 'No se pudo enviar. Comprueba tu conexión y la configuración de Supabase.'
        : 'No se pudo guardar el reporte local. Revisa los permisos del navegador.', true);
      console.error('[DengueCero mapa]', error);
    } finally {
      button.disabled = false;
      button.textContent = 'Enviar reporte';
    }
  });

  if (demoBanner) {
    if (live) {
      demoBanner.hidden = true;
    } else {
      demoBanner.hidden = false;
      demoBanner.innerHTML = '<strong>Modo demostración local.</strong> Los pines con borde punteado son ejemplos simulados, no reportes reales. Puedes probar el formulario: tus reportes se guardan solo en este dispositivo y no se comparten con otros usuarios. Para activar el mapa comunitario, configura Supabase.';
    }
  }

  const share = $('#mapa-whatsapp');
  if (share) {
    const shareText = 'Revisa tu casa y aprende a identificar posibles criaderos con DengueCero: ' +
      `${location.href.split('#')[0]}#mapa`;
    share.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }

  refresh();
  // Recalcula el tamaño si el navegador muestra la sección del mapa después de una navegación interna.
  window.addEventListener('hashchange', () => {
    if (location.hash === '#mapa') window.setTimeout(() => map.invalidateSize(), 120);
  });
})();
