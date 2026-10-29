// TypingClub: lanzar script una vez
//
// Al pulsar el icono de la extensión se abre la barra de velocidad
// (velocidad.html). Al elegir un nivel ahí:
//   1. Se guarda el nivel elegido.
//   2. Se busca, entre todos los marcos (iframes) de la pestaña activa, el
//      que contiene el teclado de la lección (el que tiene window.core y
//      los caracteres). Es el mismo marco en el que tendrías que abrir la
//      consola con clic derecho > Inspeccionar sobre el teclado.
//   3. Se ejecuta el script UNA sola vez, solo en ese marco, con el rango
//      de velocidad del nivel elegido.

// ───────────────────────────────────────────────────────────────
// Las dos funciones siguientes se copian dentro de la página
// (mundo "MAIN"), así que tienen que ser autocontenidas.
// ───────────────────────────────────────────────────────────────

// Paso 1: comprueba si este marco es el de la lección.
function sondear() {
  return {
    listo: typeof window.core?.record_keydown_time === 'function',
    tokens: document.querySelectorAll('.token span.token_unit').length,
    ocupado: Boolean(window.__typingClubRunning),
  };
}

// Paso 2: tu script, tal cual, ejecutado una vez en el marco elegido.
// minDelay/maxDelay llegan desde el nivel de velocidad elegido en la barra
// (ver NIVELES_VELOCIDAD más abajo): cada pulsación espera un tiempo
// aleatorio distinto dentro de ese rango, nunca un valor fijo.
function scriptTypingClub(minDelay, maxDelay) {
  /**
   * Script para TypingClub
   */

  const keyOverrides = {
    [String.fromCharCode(160)]: ' '
  };

  function getTargetCharacters() {
    const els = Array.from(
      document.querySelectorAll('.token span.token_unit')
    );

    return els.map(el => {
      // Detectar Enter
      if (el.firstChild?.classList?.contains('_enter')) {
        return '\n';
      }

      // Detectar Tabulador
      if (
        el.firstChild?.classList?.contains('_tab') ||
        el.classList.contains('_tab')
      ) {
        return '\t';
      }

      const text = el.textContent[0];
      return keyOverrides.hasOwnProperty(text)
        ? keyOverrides[text]
        : text;
    });
  }

  function recordKey(chr) {
    window.core.record_keydown_time(chr);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function autoPlay(finish) {
    const chrs = getTargetCharacters();

    for (let i = 0; i < chrs.length - (!finish); ++i) {
      recordKey(chrs[i]);
      await sleep(
        Math.random() * (maxDelay - minDelay) + minDelay
      );
    }
  }

  // Marca el marco como "ocupado" mientras escribe, para que un segundo clic
  // en el icono no lance otra pasada por encima.
  window.__typingClubRunning = true;
  autoPlay(true)
    .catch(err => console.error('[TypingClub]', err))
    .finally(() => { window.__typingClubRunning = false; });
}

// ───────────────────────────────────────────────────────────────
// Niveles de velocidad (barra tipo "barra de vida")
// ───────────────────────────────────────────────────────────────
//
// min/max son milisegundos de espera entre pulsación y pulsación.
// Menos ms = más rápido. Cada nivel define un RANGO, no un valor fijo,
// para que el ritmo siga siendo variable dentro de ese nivel.
//
// Basado en palabras por minuto (PPM, 1 palabra = 5 caracteres),
// con velocidades reales de un alumno de FP GS (ADI) — nada de
// extremos irreales en ningún nivel:
//   Bajo        20–29 ppm  → 420–600 ms
//   Medio       29–46 ppm  → 260–420 ms
//   Alto        46–86 ppm  → 140–260 ms
//   Sobrehumano 86–170 ppm → 70–140 ms   (170 ppm roza el récord mundial humano)
const NIVELES_VELOCIDAD = [
  { id: 'bajo',        etiqueta: 'Bajo',        min: 420, max: 600 },
  { id: 'medio',       etiqueta: 'Medio',       min: 260, max: 420 },
  { id: 'alto',        etiqueta: 'Alto',        min: 140, max: 260 },
  { id: 'sobrehumano', etiqueta: 'Sobrehumano', min: 70,  max: 140 },
];
const NIVEL_POR_DEFECTO = 'medio';

// Resuelve un id de nivel al objeto completo (con min/max), con fallback
// al nivel por defecto si llega algo desconocido.
function resolverNivel(nivelId) {
  return (
    NIVELES_VELOCIDAD.find(n => n.id === nivelId) ||
    NIVELES_VELOCIDAD.find(n => n.id === NIVEL_POR_DEFECTO)
  );
}

// ───────────────────────────────────────────────────────────────
// Mensaje desde el popup (velocidad.html): el usuario ha elegido
// un nivel en la barra, así que se guarda y se lanza el script en
// la pestaña activa con el rango de ese nivel.
// ───────────────────────────────────────────────────────────────

async function ejecutarConNivel(nivelId) {
  const nivel = resolverNivel(nivelId);
  await chrome.storage.local.set({ nivelVelocidad: nivel.id });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return { resultado: 'error' };

  const resultado = await lanzar(tab.id, nivel);
  await avisar(tab.id, resultado);
  return { resultado };
}

chrome.runtime.onMessage.addListener((mensaje, _remitente, sendResponse) => {
  if (mensaje?.accion === 'ejecutar' && mensaje.nivelId) {
    ejecutarConNivel(mensaje.nivelId).then(sendResponse);
    return true; // respuesta asíncrona: mantiene abierto el canal del mensaje
  }
});

// ───────────────────────────────────────────────────────────────
// Lógica de la extensión
// ───────────────────────────────────────────────────────────────

const AVISOS = {
  ok:      { texto: 'OK',  color: '#188038' }, // lanzado
  ocupado: { texto: '...', color: '#b06000' }, // ya está escribiendo
  nada:    { texto: 'NO',  color: '#c5221f' }, // no hay lección en pantalla
  error:   { texto: 'ERR', color: '#c5221f' }, // no se pudo inyectar
};

// Muestra un aviso breve sobre el icono, solo en esa pestaña.
async function avisar(tabId, clave) {
  const { texto, color } = AVISOS[clave];
  try {
    await chrome.action.setBadgeBackgroundColor({ tabId, color });
    await chrome.action.setBadgeText({ tabId, text: texto });
    setTimeout(() => {
      chrome.action.setBadgeText({ tabId, text: '' }).catch(() => {});
    }, 3000);
  } catch (_) {
    // La pestaña se cerró mientras tanto: no pasa nada.
  }
}

// Devuelve la clave del aviso: 'ok', 'ocupado', 'nada' o 'error'.
async function lanzar(tabId, nivel) {
  try {
    // 1) Sondeo en todos los marcos de la pestaña.
    const sondeo = await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      world: 'MAIN',
      func: sondear,
    });

    // 2) Se queda con el marco que tiene la lección (el de más caracteres).
    const candidatos = sondeo
      .filter(r => r.result?.listo && r.result.tokens > 0)
      .sort((a, b) => b.result.tokens - a.result.tokens);

    if (candidatos.length === 0) return 'nada';
    if (candidatos[0].result.ocupado) return 'ocupado';

    // 3) Ejecuta el script solo en ese marco, con el rango de velocidad
    //    del nivel elegido en la barra.
    await chrome.scripting.executeScript({
      target: { tabId, frameIds: [candidatos[0].frameId] },
      world: 'MAIN',
      func: scriptTypingClub,
      args: [nivel.min, nivel.max],
    });
    return 'ok';
  } catch (err) {
    console.error('[TypingClub]', err);
    return 'error';
  }
}

// No hace falta chrome.action.onClicked: con "default_popup" en el
// manifest, el clic en el icono abre directamente velocidad.html, y es
// esa barra la que llama a ejecutarConNivel() mediante un mensaje.
