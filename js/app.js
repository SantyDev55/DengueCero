'use strict';

(() => {
  const DRAFT_KEY = 'denguecero-draft-v1';
  const HISTORY_KEY = 'denguecero-history-v1';
  const BRIGADE_KEY = 'denguecero-brigada-check-v1';
  const MAX_HISTORY = 30;

  const zones = [
    {
      id: 'water', name: 'Agua almacenada', short: 'Agua', icon: '◈', intro: 'Revisa los recipientes que usas para almacenar agua y comprueba que estén limpios y bien tapados.',
      items: [
        { id: 'tank-clean', title: 'Tanques, cilindros y depósitos', description: '¿Los recipientes de almacenamiento están limpios por dentro y sus paredes pueden revisarse de forma segura?', action: 'Lava y escobilla las paredes internas y los bordes al limpiar el recipiente. Sigue las indicaciones sanitarias para el manejo del agua almacenada.' },
        { id: 'tank-cover', title: 'Tapas de los depósitos', description: '¿Los tanques, cilindros y baldes que guardan agua están bien tapados?', action: 'Coloca una tapa que cierre bien. Revisa que no queden huecos por donde pueda entrar el zancudo.' },
        { id: 'unused-buckets', title: 'Baldes y recipientes sin uso', description: '¿Hay baldes u otros recipientes guardados que puedan acumular agua?', action: 'Vacía y limpia los objetos que acumularon agua. Guarda los recipientes sin uso boca abajo y bajo techo cuando sea posible.' }
      ]
    },
    {
      id: 'outside', name: 'Patio y exteriores', short: 'Patio', icon: '⌂', intro: 'Los objetos olvidados al aire libre pueden juntar agua de lluvia o de otras actividades.',
      items: [
        { id: 'bottles-cans', title: 'Botellas, latas y envases', description: '¿Hay envases, tapas, chapas o desechos que puedan retener agua?', action: 'Retira los objetos que no se utilizan. Desecha los residuos de forma adecuada y evita dejar envases a la intemperie.' },
        { id: 'tires-toys', title: 'Llantas, juguetes y objetos en desuso', description: '¿Hay llantas, juguetes u objetos cóncavos donde pueda quedar agua?', action: 'Elimina el agua acumulada y guarda bajo techo lo que todavía se use. Lleva los residuos a un punto de disposición adecuado.' },
        { id: 'yard-puddles', title: 'Objetos y rincones con agua acumulada', description: '¿Observas recipientes u objetos que retienen agua en el patio, azotea o pasadizo?', action: 'Vacía y limpia los recipientes que puedas alcanzar con seguridad. No subas a techos ni ingreses a zonas peligrosas para revisar.' }
      ]
    },
    {
      id: 'kitchen-bath', name: 'Cocina y baño', short: 'Cocina/baño', icon: '▦', intro: 'Comprueba los recipientes y las bandejas que pueden acumular agua dentro de casa.',
      items: [
        { id: 'fridge-tray', title: 'Bandejas detrás o debajo de equipos', description: '¿Hay una bandeja o recipiente que acumule agua detrás de la refrigeradora u otro equipo?', action: 'Si es accesible y seguro, retira el agua y limpia la bandeja según el manual del equipo. Pide ayuda si necesitas mover un electrodoméstico.' },
        { id: 'bath-containers', title: 'Recipientes del baño', description: '¿Hay tinas, baldes u otros recipientes con agua que no estén cubiertos?', action: 'Vacía y limpia los recipientes cuando no se necesiten, o mantenlos bien tapados si almacenan agua.' },
        { id: 'drain-trays', title: 'Platos y bandejas que retienen agua', description: '¿Hay platos, bandejas o recipientes donde permanezca agua después de limpiar?', action: 'Retira el agua acumulada y limpia el recipiente. Mantén secos los espacios donde no sea necesario almacenar agua.' }
      ]
    },
    {
      id: 'plants', name: 'Plantas y floreros', short: 'Plantas', icon: '✿', intro: 'Revisa macetas, floreros y plantas acuáticas, sin dañar las plantas ni dejar agua estancada.',
      items: [
        { id: 'vases', title: 'Floreros y plantas en agua', description: '¿Tienes flores o plantas colocadas en recipientes con agua?', action: 'Para los floreros, el Minsa recomienda reemplazar el agua por arena húmeda o esponja floral. Lava el recipiente antes de volver a usarlo.' },
        { id: 'plant-saucers', title: 'Platos debajo de las macetas', description: '¿Los platos de macetas acumulan agua después del riego o la lluvia?', action: 'Retira el agua acumulada y limpia los platos. Ajusta el riego para evitar que quede agua innecesaria.' },
        { id: 'water-plants', title: 'Plantas acuáticas y recipientes decorativos', description: '¿Hay plantas acuáticas o adornos con agua que no se limpian con frecuencia?', action: 'Revisa y limpia el recipiente con regularidad. Considera una alternativa que no deje agua estancada, según las necesidades de la planta.' }
      ]
    },
    {
      id: 'pets-misc', name: 'Mascotas y otros objetos', short: 'Mascotas', icon: '♡', intro: 'El cuidado de las mascotas y los objetos pequeños también forma parte de la prevención.',
      items: [
        { id: 'pet-bowls', title: 'Bebederos de mascotas', description: '¿Los bebederos se renuevan y limpian con regularidad?', action: 'Cambia el agua y lava el recipiente con frecuencia. No dejes agua quieta durante periodos prolongados.' },
        { id: 'pet-toys', title: 'Juguetes y accesorios al aire libre', description: '¿Los juguetes, bebederos portátiles u otros accesorios pueden acumular agua?', action: 'Vacía y limpia los accesorios, y guárdalos en un lugar cubierto cuando no se utilicen.' },
        { id: 'small-containers', title: 'Otros recipientes pequeños', description: '¿Has revisado tapas, envases pequeños, canaletas accesibles u otros objetos que retengan agua?', action: 'Retira el agua de los objetos y elimina o guarda adecuadamente aquellos que no se utilicen. Revisa solo los lugares a los que puedas acceder de forma segura.' }
      ]
    }
  ];

const quizBank = [
    { question: "El dengue se transmite principalmente por la picadura de un mosquito infectado.", correct: true, explanation: "Verdadero. La vía habitual de transmisión es la picadura de un mosquito Aedes infectado." },
    { question: "El dengue se transmite normalmente por abrazar o compartir cubiertos con una persona enferma.", correct: false, explanation: "Falso. El dengue no se transmite por el contacto cotidiano; se transmite principalmente mediante mosquitos infectados." },
    { question: "El mosquito que transmite el dengue puede reproducirse en recipientes que acumulan agua.", correct: true, explanation: "Verdadero. Tanques, baldes, floreros y otros recipientes que retienen agua pueden convertirse en criaderos." },
    { question: "El mosquito solo se reproduce en agua sucia; el agua limpia no representa riesgo.", correct: false, explanation: "Falso. También puede reproducirse en agua almacenada limpia si el recipiente permite el desarrollo de sus larvas." },
    { question: "Una tapa, botella o recipiente pequeño que acumule agua puede convertirse en un criadero.", correct: true, explanation: "Verdadero. No solo importan los recipientes grandes: pequeños objetos que retienen agua también pueden ser criaderos." },
    { question: "Si el agua de un tanque se ve limpia, no hace falta taparlo.", correct: false, explanation: "Falso. Los depósitos de agua deben mantenerse bien tapados para evitar que los mosquitos entren y pongan huevos." },
    { question: "Los recipientes para almacenar agua deben mantenerse tapados y limpiarse con regularidad.", correct: true, explanation: "Verdadero. El Minsa recomienda lavar y escobillar los recipientes y mantenerlos bien tapados; sigue las indicaciones sanitarias vigentes." },
    { question: "Basta con revisar el patio: dentro de la casa no existen posibles criaderos.", correct: false, explanation: "Falso. También hay que revisar el interior, la cocina, el baño, los floreros y las bandejas que puedan acumular agua." },
    { question: "Para los floreros, el Minsa recomienda considerar arena húmeda o esponja floral en lugar de mantener agua.", correct: true, explanation: "Verdadero. Esta medida evita dejar agua estancada en el florero; limpia el recipiente antes de volver a usarlo." },
    { question: "Los bebederos de mascotas no necesitan limpieza si el agua parece transparente.", correct: false, explanation: "Falso. Conviene renovar el agua y limpiar el recipiente con regularidad." },
    { question: "Llantas, latas, botellas y juguetes olvidados pueden acumular agua y convertirse en criaderos.", correct: true, explanation: "Verdadero. Retira el agua acumulada y guarda, reutiliza o desecha estos objetos de forma adecuada." },
    { question: "La bandeja detrás o debajo de una refrigeradora nunca puede acumular agua.", correct: false, explanation: "Falso. El Minsa incluye bandejas detrás de refrigeradoras entre los lugares que conviene revisar, siempre de forma segura." },
    { question: "Vaciar y limpiar recipientes que acumulan agua ayuda a eliminar posibles criaderos.", correct: true, explanation: "Verdadero. Después de vaciar el agua, limpia las paredes del recipiente y evita que vuelva a acumularse." },
    { question: "Después de limpiar la vivienda una sola vez, ya no es necesario volver a revisarla.", correct: false, explanation: "Falso. La inspección debe repetirse con regularidad porque los objetos pueden volver a acumular agua." },
    { question: "Durante una revisión conviene mirar también objetos pequeños que puedan retener agua.", correct: true, explanation: "Verdadero. Tapas, envases pequeños, juguetes y otros objetos pueden acumular agua." },
    { question: "Solo los recipientes muy grandes pueden convertirse en criaderos de mosquitos.", correct: false, explanation: "Falso. También pueden servir recipientes pequeños si retienen agua y permiten que el mosquito se reproduzca." },
    { question: "Mantener bien tapados los depósitos de agua ayuda a impedir que los mosquitos accedan a ellos.", correct: true, explanation: "Verdadero. Usa una tapa que cierre bien y revisa que no queden aberturas." },
    { question: "Conviene dejar baldes y cilindros destapados aunque contengan agua almacenada.", correct: false, explanation: "Falso. Los recipientes que almacenan agua deben permanecer bien tapados." },
    { question: "Las lluvias y el almacenamiento inadecuado de agua pueden favorecer la aparición de criaderos.", correct: true, explanation: "Verdadero. El agua acumulada en recipientes y objetos facilita la reproducción del mosquito." },
    { question: "Si no ves mosquitos o el clima está más fresco, nunca hace falta revisar la casa.", correct: false, explanation: "Falso. La prevención y la eliminación de criaderos deben mantenerse; no te guíes solo por si ves mosquitos." },
    { question: "El mosquito que transmite el dengue suele estar activo durante el día.", correct: true, explanation: "Verdadero. La OMS señala que los mosquitos transmisores del dengue están activos durante el día." },
    { question: "Solo hace falta protegerse de las picaduras mientras se duerme de noche.", correct: false, explanation: "Falso. Como el mosquito está activo durante el día, conviene reducir las picaduras también durante las actividades diurnas." },
    { question: "La ropa que cubre la piel y un repelente usado según la etiqueta pueden ayudar a reducir las picaduras.", correct: true, explanation: "Verdadero. La OMS recomienda ropa que cubra la piel y repelentes adecuados usados de acuerdo con sus instrucciones." },
    { question: "Usar repelente permite descuidar la eliminación de criaderos.", correct: false, explanation: "Falso. Prevenir las picaduras es complementario a eliminar los lugares donde el mosquito puede reproducirse." },
    { question: "Las mallas o mosquiteros en ventanas pueden ayudar a evitar que entren mosquitos.", correct: true, explanation: "Verdadero. Las barreras físicas pueden reducir la entrada de mosquitos en la vivienda." },
    { question: "La fumigación por sí sola elimina para siempre todos los posibles criaderos.", correct: false, explanation: "Falso. La prevención requiere eliminar o controlar los recipientes con agua y mantener las medidas de forma continua." },
    { question: "Desechar correctamente residuos que puedan retener agua forma parte de la prevención.", correct: true, explanation: "Verdadero. Retirar residuos y objetos que acumulen agua ayuda a reducir los lugares de reproducción." },
    { question: "La prevención del dengue depende únicamente de las autoridades; las familias no pueden ayudar.", correct: false, explanation: "Falso. Las acciones domésticas y comunitarias complementan las intervenciones sanitarias." },
    { question: "Entre los síntomas frecuentes del dengue pueden estar fiebre, dolor de cabeza y dolores musculares.", correct: true, explanation: "Verdadero. También pueden aparecer dolor detrás de los ojos, náuseas o sarpullido." },
    { question: "Todas las personas que contraen dengue presentan síntomas evidentes.", correct: false, explanation: "Falso. Algunas infecciones no presentan síntomas o producen síntomas leves." },
    { question: "El dolor detrás de los ojos puede aparecer entre los síntomas del dengue.", correct: true, explanation: "Verdadero. Es uno de los síntomas descritos por la Organización Mundial de la Salud." },
    { question: "Un sarpullido nunca puede estar relacionado con el dengue.", correct: false, explanation: "Falso. El sarpullido puede aparecer en algunas personas con dengue." },
    { question: "Los síntomas pueden comenzar varios días después de la infección, no necesariamente en el momento de la picadura.", correct: true, explanation: "Verdadero. La OMS indica que, cuando aparecen, suelen comenzar entre 4 y 10 días después de la infección." },
    { question: "Si la fiebre disminuye, es imposible que aparezcan señales de alarma.", correct: false, explanation: "Falso. Algunas señales de dengue grave pueden presentarse cuando la fiebre desaparece o disminuye." },
    { question: "El dolor abdominal intenso y persistente es una señal de alarma.", correct: true, explanation: "Verdadero. Busca atención médica inmediata si aparece esta señal." },
    { question: "Los vómitos persistentes nunca son una señal de alarma.", correct: false, explanation: "Falso. Los vómitos persistentes son una señal de alarma y requieren atención médica inmediata." },
    { question: "El sangrado de encías o nariz puede ser una señal de alarma.", correct: true, explanation: "Verdadero. Cualquier señal de sangrado ante sospecha de dengue requiere valoración médica urgente." },
    { question: "Ante una señal de alarma, lo correcto es esperar hasta el día siguiente para ver qué pasa.", correct: false, explanation: "Falso. Busca atención médica inmediata; no esperes a que los síntomas empeoren." },
    { question: "La respiración acelerada, la debilidad intensa o la piel fría y pálida pueden ser señales graves.", correct: true, explanation: "Verdadero. La OMS las incluye entre las manifestaciones que requieren atención inmediata." },
    { question: "Ante la sospecha de dengue, se debe buscar orientación sanitaria y evitar la automedicación.", correct: true, explanation: "Verdadero. Consulta a un profesional de salud y no tomes medicamentos por cuenta propia." },
    { question: "La aspirina o el ibuprofeno son siempre recomendados para cualquier persona con sospecha de dengue.", correct: false, explanation: "Falso. La OMS aconseja evitar aspirina e ibuprofeno ante el dengue porque pueden aumentar el riesgo de sangrado. Sigue la indicación de un profesional de salud." },
    { question: "Existe un antiviral específico que cura todos los casos de dengue.", correct: false, explanation: "Falso. No existe un tratamiento antiviral específico para el dengue; la atención clínica y la detección de señales de alarma son importantes." },
    { question: "Descansar y beber suficientes líquidos son medidas generales de cuidado, pero no sustituyen la evaluación médica.", correct: true, explanation: "Verdadero. Si sospechas dengue, busca orientación sanitaria y solicita atención inmediata ante señales de alarma." },
    { question: "Haber tenido dengue una vez garantiza que nunca volverás a contraerlo.", correct: false, explanation: "Falso. Existen distintos tipos de virus del dengue y una infección previa no protege contra todos ellos." },
    { question: "El dengue puede ser grave, por lo que las señales de alarma requieren atención médica inmediata.", correct: true, explanation: "Verdadero. La atención oportuna ayuda a tratar las complicaciones." },
    { question: "Todos los consejos sobre dengue que circulan por redes sociales son confiables.", correct: false, explanation: "Falso. Comprueba la información en el Minsa, la OMS u otras fuentes sanitarias oficiales." },
    { question: "Una página web puede confirmar un diagnóstico de dengue solo con preguntar por los síntomas.", correct: false, explanation: "Falso. Una web educativa no puede diagnosticar; el diagnóstico y la atención corresponden a profesionales de salud." },
    { question: "Una inspección preventiva registra observaciones del hogar, pero no diagnostica la enfermedad.", correct: true, explanation: "Verdadero. La inspección ayuda a reconocer posibles criaderos; no determina si una persona tiene dengue." },
    { question: "Marcar toda la lista como revisada certifica que la vivienda está completamente libre de mosquitos.", correct: false, explanation: "Falso. El registro refleja lo que declaró el usuario y no es una certificación sanitaria ni garantiza ausencia de mosquitos." },
    { question: "Compartir recomendaciones verificadas con la familia y el colegio puede ayudar a fortalecer la prevención.", correct: true, explanation: "Verdadero. La educación y la participación comunitaria complementan las medidas domésticas y sanitarias." }
  ];
  let quizQuestions = [];
  let previousQuizRound = [];
  const QUIZ_SIZE = 5;

  const defaultAnswers = () => {
    const output = {};
    zones.forEach(zone => zone.items.forEach(item => { output[item.id] = { status: 'pending', actionDone: false }; }));
    return output;
  };
  const parseJSON = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
  };
  const safeGet = key => {
    try { return window.localStorage.getItem(key); } catch { return null; }
  };
  const safeSet = (key, value) => {
    try { window.localStorage.setItem(key, value); return true; } catch { return false; }
  };
  const safeRemove = key => { try { window.localStorage.removeItem(key); } catch { /* El navegador puede bloquear almacenamiento. */ } };
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const formatDate = value => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
    return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
  };
  const formatDateTime = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
    return new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const allItems = zones.flatMap(zone => zone.items.map(item => ({ ...item, zoneName: zone.name, zoneId: zone.id })));
  const totalItems = allItems.length;
  let answers = defaultAnswers();
  let activeZone = zones[0].id;
  let history = [];
  let selectedSnapshot = null;
  let currentResult = null;
  let toastTimer = null;

  const $ = selector => document.querySelector(selector);
  const zoneTabs = $('#zone-tabs');
  const zonePanel = $('#zone-panel');
  const resultPanel = $('#result-panel');
  const toastEl = $('#toast');

  function normalizeAnswers(input) {
    const baseline = defaultAnswers();
    if (!input || typeof input !== 'object') return baseline;
    allItems.forEach(item => {
      const raw = input[item.id];
      if (raw && ['pending', 'clear', 'risk'].includes(raw.status)) {
        baseline[item.id] = { status: raw.status, actionDone: raw.status === 'risk' && raw.actionDone === true };
      }
    });
    return baseline;
  }
  function loadHistory() {
    const parsed = parseJSON(safeGet(HISTORY_KEY), []);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(entry => entry && typeof entry.id === 'string' && entry.createdAt && entry.answers).map(entry => ({
      id: entry.id,
      createdAt: entry.createdAt,
      answers: normalizeAnswers(entry.answers),
      stats: statsFor(entry.answers)
    })).slice(0, MAX_HISTORY);
  }
  function statsFor(answerMap) {
    const normalized = normalizeAnswers(answerMap);
    const states = Object.values(normalized);
    const reviewed = states.filter(state => state.status !== 'pending').length;
    const risks = states.filter(state => state.status === 'risk').length;
    const actionsDone = states.filter(state => state.status === 'risk' && state.actionDone).length;
    const pendingActions = risks - actionsDone;
    return { total: totalItems, reviewed, notReviewed: totalItems - reviewed, risks, actionsDone, pendingActions, percent: Math.round((reviewed / totalItems) * 100) };
  }
  // Selecciona siguientes pasos a partir de lo que el usuario registró.
  // El orden es práctico para organizar tareas, no una escala sanitaria oficial de riesgo.
  const ACTION_ORDER = ['tank-cover', 'yard-puddles', 'tank-clean', 'unused-buckets', 'bottles-cans', 'tires-toys', 'bath-containers', 'drain-trays', 'fridge-tray', 'vases', 'plant-saucers', 'water-plants', 'pet-bowls', 'pet-toys', 'small-containers'];
  function getNextSteps(snapshot) {
    const answerMap = normalizeAnswers(snapshot.answers);
    const actionItems = allItems
      .filter(item => answerMap[item.id].status === 'risk' && !answerMap[item.id].actionDone)
      .sort((a, b) => ACTION_ORDER.indexOf(a.id) - ACTION_ORDER.indexOf(b.id))
      .map(item => ({ kind: 'action', item, title: item.title, detail: item.action, note: 'Marcaste un posible criadero y la acción sigue pendiente.' }));
    const reviewItems = allItems
      .filter(item => answerMap[item.id].status === 'pending')
      .map(item => ({ kind: 'review', item, title: item.title, detail: item.description, note: 'Este punto todavía no está revisado. Compruébalo solo si puedes hacerlo con seguridad.' }));
    return [...actionItems, ...reviewItems].slice(0, 3);
  }
  function renderPriorityPanel(snapshot) {
    const panel = $('#result-priority');
    const steps = getNextSteps(snapshot);
    panel.hidden = false;
    if (!steps.length) {
      panel.innerHTML = `<div class="priority-heading"><span class="brigade-kicker">SIGUIENTE PASO</span><h4 id="result-priority-title">Mantén la rutina preventiva</h4><p>No quedan acciones pendientes ni puntos sin revisar en este registro. Repite la inspección periódicamente; el resultado no certifica que la vivienda esté libre de mosquitos.</p></div>`;
      return;
    }
    const actionCount = steps.filter(step => step.kind === 'action').length;
    const heading = actionCount ? 'Empieza por estas acciones' : 'Completa los puntos que faltan';
    const description = 'Orden sugerido para organizarte según tus respuestas. No representa una clasificación oficial del riesgo sanitario.';
    panel.innerHTML = `<div class="priority-heading"><span class="brigade-kicker">TUS SIGUIENTES PASOS</span><h4 id="result-priority-title">${heading}</h4><p>${description}</p></div><ol class="priority-list">${steps.map((step, index) => `<li><span class="priority-number">${index + 1}</span><div><strong>${escapeHTML(step.title)}</strong><p>${escapeHTML(step.detail)}</p><small>${escapeHTML(step.note)}</small></div></li>`).join('')}</ol>`;
  }
  function saveDraft() { safeSet(DRAFT_KEY, JSON.stringify(answers)); }
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 3200);
  }
  function reviewedForZone(zone) {
    return zone.items.filter(item => answers[item.id].status !== 'pending').length;
  }
  function renderZoneTabs() {
    zoneTabs.innerHTML = zones.map(zone => {
      const reviewed = reviewedForZone(zone);
      const selected = zone.id === activeZone;
      return `<button class="zone-tab" type="button" role="tab" id="tab-${zone.id}" aria-controls="zone-panel" aria-selected="${selected}" tabindex="${selected ? '0' : '-1'}" data-zone="${zone.id}"><span aria-hidden="true">${zone.icon}</span>${escapeHTML(zone.short)}<span class="tab-count">${reviewed}/${zone.items.length}</span></button>`;
    }).join('');
  }
  function renderZonePanel() {
    const zone = zones.find(value => value.id === activeZone) || zones[0];
    const completed = reviewedForZone(zone);
    const zoneIndex = zones.findIndex(value => value.id === zone.id);
    zonePanel.setAttribute('role', 'tabpanel');
    zonePanel.setAttribute('aria-labelledby', `tab-${zone.id}`);
    zonePanel.innerHTML = `
      <div class="zone-panel-head"><div><h3>${escapeHTML(zone.name)}</h3><p>${escapeHTML(zone.intro)}</p></div><span class="zone-complete">${completed} de ${zone.items.length} revisados</span></div>
      <div class="checklist-items">${zone.items.map((item, itemIndex) => {
        const state = answers[item.id];
        const itemClass = state.status === 'clear' ? 'is-clear' : state.status === 'risk' ? 'is-risk' : '';
        return `<article class="check-item ${itemClass}" data-item="${item.id}">
          <div class="item-heading"><span class="item-number">${String(zoneIndex * 3 + itemIndex + 1).padStart(2, '0')}</span><div><span class="item-title">${escapeHTML(item.title)}</span><span class="item-description">${escapeHTML(item.description)}</span></div></div>
          <div class="item-status" role="group" aria-label="Estado: ${escapeHTML(item.title)}">
            <button type="button" class="status-button ${state.status === 'clear' ? 'selected-clear' : ''}" data-item-status="clear" data-item-id="${item.id}" aria-pressed="${state.status === 'clear'}"><span class="status-symbol">✓</span> Revisado, sin hallazgo</button>
            <button type="button" class="status-button ${state.status === 'risk' ? 'selected-risk' : ''}" data-item-status="risk" data-item-id="${item.id}" aria-pressed="${state.status === 'risk'}"><span class="status-symbol">!</span> Posible criadero</button>
          </div>
          ${state.status === 'risk' ? `<div class="action-recommendation"><strong>Qué puedes hacer</strong><p>${escapeHTML(item.action)}</p><label class="action-done ${state.actionDone ? 'done' : ''}"><input type="checkbox" data-action-done="${item.id}" ${state.actionDone ? 'checked' : ''}> Marcar acción como realizada</label></div>` : ''}
        </article>`;
      }).join('')}</div>`;
  }
  function updateProgress() {
    const stats = statsFor(answers);
    $('#progress-label').textContent = `${stats.reviewed} de ${stats.total} puntos revisados`;
    $('#progress-percent').textContent = `${stats.percent}%`;
    $('#progress-fill').style.width = `${stats.percent}%`;
    $('#progress-track').setAttribute('aria-valuenow', String(stats.percent));
  }
  function renderInspection() { renderZoneTabs(); renderZonePanel(); updateProgress(); }
  function handleStatus(itemId, status) {
    if (!answers[itemId] || !['clear', 'risk'].includes(status)) return;
    const prev = answers[itemId];
    answers[itemId] = { status, actionDone: status === 'risk' && prev.status === 'risk' && prev.actionDone };
    saveDraft();
    renderInspection();
  }

  function showResult(snapshot, scroll = false) {
    selectedSnapshot = snapshot;
    const stats = snapshot.stats || statsFor(snapshot.answers);
    currentResult = snapshot;
    resultPanel.hidden = false;
    const partial = stats.notReviewed > 0;
    $('#result-title').textContent = partial ? 'Tu revisión guardada (incompleta)' : 'Tu resultado preventivo';
    $('#result-date').textContent = `Guardada el ${formatDateTime(snapshot.createdAt)}`;
    $('#result-stats').innerHTML = `
      <div class="result-stat"><strong>${stats.percent}%</strong><span>de la lista revisada</span></div>
      <div class="result-stat"><strong>${stats.risks}</strong><span>posibles criaderos registrados</span></div>
      <div class="result-stat"><strong>${stats.actionsDone}</strong><span>acciones marcadas como realizadas</span></div>
      <div class="result-stat"><strong>${stats.notReviewed}</strong><span>puntos aún sin revisar</span></div>`;
    let message;
    if (partial) {
      message = `Has revisado ${stats.reviewed} de ${stats.total} puntos. Puedes continuar con los que faltan. Los puntos no revisados no deben interpretarse como lugares seguros.`;
    } else if (stats.risks === 0) {
      message = 'Marcaste todos los puntos de la lista como revisados sin hallar posibles criaderos. Mantén la limpieza y vuelve a inspeccionar periódicamente; esta lista no certifica que la vivienda esté libre de mosquitos.';
    } else if (stats.pendingActions > 0) {
      message = `Registraste ${stats.risks} posibles criaderos. Marcaste ${stats.actionsDone} acciones como realizadas y quedan ${stats.pendingActions} por atender. Sigue las recomendaciones y solicita ayuda si el lugar no es seguro.`;
    } else {
      message = `Registraste ${stats.risks} posibles criaderos y marcaste sus acciones como realizadas. Revisa nuevamente los puntos de forma periódica y recuerda que este resumen depende de tus respuestas.`;
    }
    $('#result-message').textContent = message;
    $('#result-message').classList.toggle('warning', stats.pendingActions > 0 || partial);
    renderPriorityPanel(snapshot);
    renderPrintReport(snapshot);
    if (scroll) resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function renderPrintReport(snapshot) {
    const stats = snapshot.stats || statsFor(snapshot.answers);
    const sections = zones.map(zone => {
      const li = zone.items.map(item => {
        const state = snapshot.answers[item.id] || { status: 'pending', actionDone: false };
        const statusText = state.status === 'clear' ? 'Revisado, sin hallazgo' : state.status === 'risk' ? `Posible criadero · acción ${state.actionDone ? 'marcada como realizada' : 'pendiente'}` : 'Sin revisar';
        const className = state.status === 'clear' ? 'print-ok' : state.status === 'risk' ? 'print-risk' : 'print-pending';
        return `<li class="${className}"><strong>${escapeHTML(item.title)}:</strong> ${escapeHTML(statusText)}${state.status === 'risk' ? `<br><small>Recomendación: ${escapeHTML(item.action)}</small>` : ''}</li>`;
      }).join('');
      return `<div class="print-zone"><h2>${escapeHTML(zone.name)}</h2><ul>${li}</ul></div>`;
    }).join('');
    const nextSteps = getNextSteps(snapshot);
    const nextStepsHtml = nextSteps.length ? `<div class="print-zone"><h2>Siguientes pasos sugeridos</h2><ol>${nextSteps.map(step => `<li><strong>${escapeHTML(step.title)}:</strong> ${escapeHTML(step.detail)} <em>${escapeHTML(step.note)}</em></li>`).join('')}</ol><p>El orden es una ayuda práctica, no una clasificación oficial del riesgo sanitario.</p></div>` : '';
    $('#print-content').innerHTML = `<h1>DengueCero — Resumen de inspección</h1><p><strong>Fecha:</strong> ${escapeHTML(formatDateTime(snapshot.createdAt))}</p><p>Este resumen refleja las respuestas introducidas por el usuario. No es una certificación sanitaria ni un diagnóstico.</p><div class="print-summary"><div class="print-metric"><strong>${stats.percent}%</strong>Lista revisada</div><div class="print-metric"><strong>${stats.risks}</strong>Posibles criaderos</div><div class="print-metric"><strong>${stats.actionsDone}</strong>Acciones realizadas*</div><div class="print-metric"><strong>${stats.notReviewed}</strong>Sin revisar</div></div><p>* Acciones marcadas como realizadas por el usuario.</p>${nextStepsHtml}${sections}<hr><p>Fuente de recomendaciones: Ministerio de Salud del Perú, campaña de prevención del dengue: https://www.gob.pe/institucion/minsa/campanas/8255-campana-de-prevencion-contra-el-dengue</p>`;
  }
  function saveInspection() {
    const stats = statsFor(answers);
    if (stats.reviewed === 0) {
      showToast('Marca al menos un punto como revisado antes de guardar.');
      return;
    }
    const snapshot = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString(), answers: clone(answers), stats };
    history.unshift(snapshot);
    history = history.slice(0, MAX_HISTORY);
    const stored = safeSet(HISTORY_KEY, JSON.stringify(history));
    if (!stored) {
      history.shift();
      showToast('No se pudo guardar el historial. Revisa la configuración del navegador.');
      return;
    }
    renderHistory();
    showResult(snapshot, true);
    showToast(stats.notReviewed ? 'Revisión parcial guardada en este dispositivo.' : 'Revisión guardada correctamente.');
  }
  function renderHistory() {
    const list = $('#history-list');
    const empty = $('#history-empty');
    empty.hidden = history.length > 0;
    list.innerHTML = history.map(entry => {
      const stats = entry.stats || statsFor(entry.answers);
      return `<article class="history-entry"><div><div class="history-entry-head"><span class="history-entry-icon" aria-hidden="true">✓</span><div><h3>Revisión preventiva${stats.notReviewed ? ' · parcial' : ''}</h3><time datetime="${escapeHTML(entry.createdAt)}">${escapeHTML(formatDateTime(entry.createdAt))}</time></div></div><div class="history-entry-stats"><span class="mini-stat">${stats.percent}% revisado</span><span class="mini-stat ${stats.risks ? 'risk' : ''}">${stats.risks} posibles criaderos</span><span class="mini-stat">${stats.actionsDone} acciones realizadas</span></div></div><div class="entry-actions"><button type="button" data-view-id="${escapeHTML(entry.id)}">Ver resumen</button><button type="button" data-delete-id="${escapeHTML(entry.id)}" aria-label="Eliminar revisión del ${escapeHTML(formatDate(entry.createdAt))}">Eliminar</button></div></article>`;
    }).join('');
    if (history.length) {
      $('#last-review-date').textContent = formatDate(history[0].createdAt);
      const next = new Date(history[0].createdAt);
      next.setDate(next.getDate() + 7);
      $('#next-review-date').textContent = formatDate(next);
      $('#calendar-reminder').disabled = false;
    } else {
      $('#last-review-date').textContent = 'Aún sin registros';
      $('#next-review-date').textContent = 'Guarda tu primera revisión';
      $('#calendar-reminder').disabled = true;
    }
  }
  function resetInspection() {
    if (statsFor(answers).reviewed > 0 && !window.confirm('¿Reiniciar la revisión actual? El avance sin guardar se perderá.')) return;
    answers = defaultAnswers();
    activeZone = zones[0].id;
    saveDraft();
    renderInspection();
    showToast('La revisión actual se ha reiniciado.');
  }
  function newInspection() {
    answers = defaultAnswers();
    activeZone = zones[0].id;
    safeSet(DRAFT_KEY, JSON.stringify(answers));
    resultPanel.hidden = true;
    selectedSnapshot = null;
    renderInspection();
    $('#inspeccion').scrollIntoView({ behavior: 'smooth', block: 'start' });
    showToast('Ya puedes comenzar una nueva revisión.');
  }
  function shareText(snapshot) {
    const stats = snapshot.stats || statsFor(snapshot.answers);
    const unresolved = stats.pendingActions > 0 ? ` Quedan ${stats.pendingActions} acciones por atender.` : '';
    return `Mi revisión preventiva con DengueCero (${formatDate(snapshot.createdAt)}): revisé ${stats.reviewed} de ${stats.total} puntos (${stats.percent}%), registré ${stats.risks} posibles criaderos y marqué ${stats.actionsDone} acciones como realizadas.${unresolved}\nPrevenir comienza en casa. Consulta las recomendaciones oficiales del Minsa: https://www.gob.pe/institucion/minsa/campa%C3%B1as/8255-campana-de-prevencion-contra-el-dengue\nEste resultado refleja mis respuestas y no es una certificación sanitaria.`;
  }
  async function shareResult() {
    if (!selectedSnapshot) { showToast('Guarda o abre una revisión antes de compartir.'); return; }
    const text = shareText(selectedSnapshot);
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mi revisión preventiva — DengueCero', text });
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showToast('Resumen copiado. Ya puedes compartirlo.');
      } else {
        const shareURL = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(shareURL, '_blank', 'noopener,noreferrer');
        showToast('Se abrió WhatsApp para compartir el resumen.');
      }
    } catch (error) {
      if (error && error.name === 'AbortError') return;
      const shareURL = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(shareURL, '_blank', 'noopener,noreferrer');
    }
  }
  function addCalendarReminder() {
    if (!history.length) return;
    const start = new Date(history[0].createdAt);
    start.setDate(start.getDate() + 7);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + 10 * 60 * 1000);
    const icsDate = date => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}00`;
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DengueCero//Recordatorio preventivo//ES', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:denguecero-${Date.now()}@local`, `DTSTAMP:${stamp}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, 'SUMMARY:Revisar mi hogar con DengueCero', 'DESCRIPTION:Inspecciona recipientes y posibles criaderos de zancudos. Sigue las recomendaciones sanitarias oficiales.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'recordatorio-denguecero.ics';
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    URL.revokeObjectURL(url);
    showToast('Recordatorio descargado. Ábrelo para añadirlo a tu calendario.');
  }

  // Menú móvil accesible.
  const menuToggle = $('#menu-toggle');
  const mainNav = $('#main-nav');
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Abrir menú' : 'Cerrar menú');
    mainNav.classList.toggle('is-open', !expanded);
    document.body.classList.toggle('menu-open', !expanded);
  });
  mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mainNav.classList.remove('is-open'); document.body.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menú');
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mainNav.classList.contains('is-open')) {
      mainNav.classList.remove('is-open'); document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menú'); menuToggle.focus();
    }
  });

  zoneTabs.addEventListener('click', event => {
    const button = event.target.closest('[data-zone]');
    if (!button) return;
    activeZone = button.dataset.zone;
    renderInspection();
  });
  zoneTabs.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const current = zones.findIndex(zone => zone.id === activeZone);
    let index = current;
    if (event.key === 'ArrowRight') index = (current + 1) % zones.length;
    if (event.key === 'ArrowLeft') index = (current - 1 + zones.length) % zones.length;
    if (event.key === 'Home') index = 0;
    if (event.key === 'End') index = zones.length - 1;
    activeZone = zones[index].id; renderInspection(); $(`#tab-${activeZone}`).focus(); event.preventDefault();
  });
  zonePanel.addEventListener('click', event => {
    const button = event.target.closest('[data-item-status]');
    if (!button) return;
    handleStatus(button.dataset.itemId, button.dataset.itemStatus);
  });
  zonePanel.addEventListener('change', event => {
    const checkbox = event.target.closest('[data-action-done]');
    if (!checkbox) return;
    const itemId = checkbox.dataset.actionDone;
    if (!answers[itemId] || answers[itemId].status !== 'risk') return;
    answers[itemId].actionDone = checkbox.checked;
    saveDraft();
    renderInspection();
    showToast(checkbox.checked ? 'Acción marcada como realizada.' : 'Acción marcada como pendiente.');
  });
  $('#save-inspection').addEventListener('click', saveInspection);
  $('#reset-inspection').addEventListener('click', resetInspection);
  $('#new-inspection').addEventListener('click', newInspection);
  $('#print-report').addEventListener('click', () => { if (selectedSnapshot) { renderPrintReport(selectedSnapshot); window.print(); } });
  $('#share-report').addEventListener('click', shareResult);
  $('#calendar-reminder').addEventListener('click', addCalendarReminder);
  $('#history-list').addEventListener('click', event => {
    const viewButton = event.target.closest('[data-view-id]');
    const deleteButton = event.target.closest('[data-delete-id]');
    if (viewButton) {
      const entry = history.find(item => item.id === viewButton.dataset.viewId);
      if (entry) showResult(entry, true);
    }
    if (deleteButton) {
      const entry = history.find(item => item.id === deleteButton.dataset.deleteId);
      if (!entry) return;
      if (!window.confirm(`¿Eliminar la revisión guardada del ${formatDate(entry.createdAt)}?`)) return;
      history = history.filter(item => item.id !== entry.id);
      safeSet(HISTORY_KEY, JSON.stringify(history));
      renderHistory();
      if (selectedSnapshot && selectedSnapshot.id === entry.id) { selectedSnapshot = null; resultPanel.hidden = true; }
      showToast('La revisión se eliminó del historial de este dispositivo.');
    }
  });

  // Modo Brigada Escolar: lista local, guion copiable y guía imprimible.
  const BRIGADE_CHECKS = ['source', 'examples', 'roles', 'safety'];
  let brigadeState = parseJSON(safeGet(BRIGADE_KEY), {});
  if (!brigadeState || typeof brigadeState !== 'object' || Array.isArray(brigadeState)) brigadeState = {};
  function renderBrigadeChecklist() {
    const checkboxes = document.querySelectorAll('[data-brigade-check]');
    let completed = 0;
    checkboxes.forEach(input => {
      input.checked = brigadeState[input.dataset.brigadeCheck] === true;
      if (input.checked) completed += 1;
    });
    $('#brigade-progress').textContent = `${completed} de ${BRIGADE_CHECKS.length} pasos listos`;
  }
  $('#brigade-checklist').addEventListener('change', event => {
    const input = event.target.closest('[data-brigade-check]');
    if (!input) return;
    brigadeState[input.dataset.brigadeCheck] = input.checked;
    safeSet(BRIGADE_KEY, JSON.stringify(brigadeState));
    renderBrigadeChecklist();
  });
  $('#brigade-reset').addEventListener('click', () => {
    brigadeState = {};
    safeRemove(BRIGADE_KEY);
    renderBrigadeChecklist();
    showToast('Lista de preparación reiniciada.');
  });
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed'; textarea.style.opacity = '0';
        document.body.appendChild(textarea); textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        if (!copied) throw new Error('No se pudo copiar automáticamente');
      }
      showToast('Guion copiado. Ya puedes pegarlo en tu presentación.');
    } catch {
      showToast('No se pudo copiar automáticamente. Selecciona el guion y cópialo manualmente.');
    }
  }
  $('#copy-brigade-script').addEventListener('click', () => copyText($('#brigade-script').textContent.trim()));
  $('#print-brigade-guide').addEventListener('click', () => {
    const script = $('#brigade-script').textContent.trim();
    const checklist = [
      'Revisé las recomendaciones oficiales del Minsa.',
      'Preparé ejemplos o imágenes sin datos personales.',
      'Repartí los roles: exposición, tiempo y resumen.',
      'Evitaré riesgos, manipular residuos peligrosos o subir a techos.'
    ];
    $('#print-content').innerHTML = `<h1>DengueCero — Guía para Brigada Escolar</h1><p><strong>Objetivo:</strong> practicar cómo identificar posibles criaderos y compartir medidas preventivas de forma segura.</p><h2>Guion de apertura</h2><p>${escapeHTML(script)}</p><h2>Actividad de 10 minutos</h2><ol><li><strong>0–2 min · Explica:</strong> un recipiente con agua acumulada puede convertirse en criadero.</li><li><strong>2–6 min · Demuestra:</strong> usa la lista DengueCero y analiza ejemplos o imágenes; no manipules objetos peligrosos.</li><li><strong>6–8 min · Propón:</strong> identifica una medida concreta, como vaciar, limpiar o tapar, según el caso.</li><li><strong>8–10 min · Comprométete:</strong> cada estudiante elige cuándo revisar el hogar con ayuda de su familia.</li></ol><h2>Lista de preparación</h2><ul>${checklist.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul><h2>Principios de seguridad</h2><ul><li>No subas a techos ni uses escaleras inestables.</li><li>No publiques direcciones ni fotografías personales sin consentimiento.</li><li>No presentes reportes de criaderos como casos confirmados de dengue.</li><li>Consulta las recomendaciones vigentes del Minsa: https://www.gob.pe/institucion/minsa/campa%C3%B1as/8255-campana-de-prevencion-contra-el-dengue</li></ul><hr><p>Material educativo independiente. No reemplaza las indicaciones de las autoridades sanitarias.</p>`;
    window.print();
  });

  // Reto educativo: cinco preguntas aleatorias de un banco de 50, con explicación inmediata.
  let quizIndex = 0;
  let quizScore = 0;
  let quizAnswered = false;
  let quizFinished = false;
  let quizWrongAnswers = [];
  const quizOptions = $('#quiz-options');
  const quizReview = $('#quiz-review');
  function shuffleQuizItems(items) {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  function selectQuizRound() {
    // Evita repetir las cinco preguntas de la ronda inmediatamente anterior.
    const freshPool = quizBank.filter(question => !previousQuizRound.includes(question));
    const pool = freshPool.length >= QUIZ_SIZE ? freshPool : quizBank;
    const selected = shuffleQuizItems(pool).slice(0, QUIZ_SIZE);
    previousQuizRound = selected;
    quizQuestions = selected;
  }
  function startQuizRound() {
    selectQuizRound();
    quizIndex = 0;
    quizScore = 0;
    quizAnswered = false;
    quizFinished = false;
    quizWrongAnswers = [];
    quizReview.hidden = true;
    quizReview.innerHTML = '';
    renderQuiz();
  }
  function renderQuiz() {
    const nextButton = $('#quiz-next');
    const feedback = $('#quiz-feedback');
    feedback.hidden = true; feedback.classList.remove('wrong');
    quizReview.hidden = true;
    if (quizFinished) {
      $('#quiz-step').textContent = 'RETO COMPLETADO';
      $('#quiz-score-label').textContent = `${quizScore} de ${quizQuestions.length} correctas`;
      $('#quiz-question').textContent = '¡Gracias por aprender y compartir información confiable!';
      quizOptions.hidden = true;
      feedback.hidden = false;
      feedback.textContent = quizScore === quizQuestions.length ? '¡Excelente! Respondiste todo correctamente. Mantén estos hábitos y consulta fuentes oficiales.' : `Obtuviste ${quizScore} de ${quizQuestions.length}. Revisa tus errores debajo y vuelve a intentarlo para reforzar lo aprendido.`;
      quizReview.hidden = false;
      quizReview.innerHTML = quizWrongAnswers.length
        ? `<h4 id="quiz-review-title">Repasa tus respuestas incorrectas</h4><p class="quiz-review-intro">Estas son las afirmaciones que conviene repasar antes de la siguiente ronda.</p><div class="quiz-review-list">${quizWrongAnswers.map((entry, index) => `<article class="quiz-review-item"><span class="quiz-review-number">${index + 1}</span><div><strong>${escapeHTML(entry.question)}</strong><p><span class="review-label">Tu respuesta:</span> ${entry.selected ? 'Verdadero' : 'Falso'} · <span class="review-label">Respuesta correcta:</span> ${entry.correct ? 'Verdadero' : 'Falso'}</p><small>${escapeHTML(entry.explanation)}</small></div></article>`).join('')}</div>`
        : `<h4 id="quiz-review-title">¡No hay errores que repasar!</h4><p class="quiz-review-intro">Respondiste las cinco preguntas correctamente. Reinicia para practicar con otras preguntas del banco.</p>`;
      nextButton.hidden = true;
      return;
    }
    const question = quizQuestions[quizIndex];
    $('#quiz-step').textContent = `PREGUNTA ${quizIndex + 1} DE ${quizQuestions.length}`;
    $('#quiz-score-label').textContent = `${quizScore} correctas`;
    $('#quiz-question').textContent = question.question;
    quizOptions.hidden = false;
    quizOptions.innerHTML = `<button type="button" data-answer="true" ${quizAnswered ? 'disabled' : ''}>Verdadero</button><button type="button" data-answer="false" ${quizAnswered ? 'disabled' : ''}>Falso</button>`;
    if (quizAnswered) {
      const chosen = quizOptions.querySelector(`[data-answer="${String(question.correct)}"]`);
      if (chosen) chosen.classList.add('chosen-correct');
      feedback.hidden = false; feedback.textContent = question.explanation;
    }
    nextButton.hidden = false;
    nextButton.disabled = !quizAnswered;
    nextButton.textContent = quizIndex === quizQuestions.length - 1 ? 'Ver resultado →' : 'Siguiente pregunta →';
  }
  quizOptions.addEventListener('click', event => {
    const button = event.target.closest('[data-answer]');
    if (!button || quizAnswered || quizFinished) return;
    const question = quizQuestions[quizIndex];
    const choice = button.dataset.answer === 'true';
    quizAnswered = true;
    if (choice === question.correct) quizScore += 1;
    else quizWrongAnswers.push({ question: question.question, selected: choice, correct: question.correct, explanation: question.explanation });
    quizOptions.querySelectorAll('button').forEach(option => {
      option.disabled = true;
      if ((option.dataset.answer === 'true') === question.correct) option.classList.add('chosen-correct');
      else if (option === button) option.classList.add('chosen-wrong');
    });
    const feedback = $('#quiz-feedback'); feedback.hidden = false; feedback.textContent = question.explanation; feedback.classList.toggle('wrong', choice !== question.correct);
    $('#quiz-score-label').textContent = `${quizScore} correctas`;
    $('#quiz-next').disabled = false;
  });
  $('#quiz-next').addEventListener('click', () => {
    if (!quizAnswered || quizFinished) return;
    if (quizIndex < quizQuestions.length - 1) { quizIndex += 1; quizAnswered = false; renderQuiz(); }
    else { quizFinished = true; renderQuiz(); }
  });
  $('#quiz-restart').addEventListener('click', startQuizRound);

  // Inicialización: recuperar borrador e historial si el navegador lo permite.
  answers = normalizeAnswers(parseJSON(safeGet(DRAFT_KEY), null));
  history = loadHistory();
  renderInspection();
  renderHistory();
  renderBrigadeChecklist();
  startQuizRound();
})();
