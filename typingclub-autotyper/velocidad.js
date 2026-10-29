// Debe coincidir exactamente con NIVELES_VELOCIDAD de background.js
const NIVELES_VELOCIDAD = [
  {
    id: 'bajo',
    etiqueta: 'Bajo',
    min: 420,
    max: 600,
    ppm: '20–29 palabras/min',
    desc: 'Alumno con ritmo tranquilo, pero fluido. Oscila dentro del nivel bajo.',
  },
  {
    id: 'medio',
    etiqueta: 'Medio',
    min: 260,
    max: 420,
    ppm: '29–46 palabras/min',
    desc: 'Ritmo medio de alguien que usa el teclado a diario. Oscila entre bajo y medio.',
  },
  {
    id: 'alto',
    etiqueta: 'Alto',
    min: 140,
    max: 260,
    ppm: '46–86 palabras/min',
    desc: 'Alumno con buena mecanografía, rápido y preciso. Oscila entre medio y alto.',
  },
  {
    id: 'sobrehumano',
    etiqueta: 'Sobrehumano',
    min: 70,
    max: 140,
    ppm: '86–170 palabras/min',
    desc: 'Nivel récord / bot: roza el récord mundial humano. Oscila entre alto y sobrehumano.',
  },
];
const NIVEL_POR_DEFECTO = 'medio';

const barra = document.getElementById('barra');
const fichaTitulo = document.getElementById('ficha-titulo');
const fichaRango = document.getElementById('ficha-rango');
const fichaDesc = document.getElementById('ficha-desc');

// Nivel realmente activo (el último ejecutado/guardado). El hover solo
// previsualiza la ficha; al salir del ratón se vuelve a este.
let nivelActivo = NIVEL_POR_DEFECTO;

function marcarSegmento(nivelId) {
  barra.querySelectorAll('.segmento').forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.nivel === nivelId);
  });
}

function pintarFicha(nivelId) {
  const nivel = NIVELES_VELOCIDAD.find(n => n.id === nivelId);
  if (!nivel) return;

  fichaTitulo.textContent = nivel.etiqueta;
  fichaRango.textContent = `${nivel.min}–${nivel.max} ms entre pulsaciones · ${nivel.ppm}`;
  // nota: "ppm" aquí es Palabras Por Minuto, no pulsaciones por minuto
  fichaDesc.textContent = nivel.desc;
}

async function cargarNivelGuardado() {
  const { nivelVelocidad } = await chrome.storage.local.get('nivelVelocidad');
  nivelActivo = nivelVelocidad || NIVEL_POR_DEFECTO;
  marcarSegmento(nivelActivo);
  pintarFicha(nivelActivo);
}

// Pasar el ratón (o el foco, con teclado) solo previsualiza la info.
barra.addEventListener('mouseover', e => {
  const btn = e.target.closest('.segmento');
  if (!btn) return;
  marcarSegmento(btn.dataset.nivel);
  pintarFicha(btn.dataset.nivel);
});
barra.addEventListener('focusin', e => {
  const btn = e.target.closest('.segmento');
  if (!btn) return;
  marcarSegmento(btn.dataset.nivel);
  pintarFicha(btn.dataset.nivel);
});

barra.addEventListener('mouseleave', () => {
  marcarSegmento(nivelActivo);
  pintarFicha(nivelActivo);
});

// Al hacer clic: se fija el nivel, se pide a background.js que ejecute
// el script en la pestaña activa, y se cierra la barra.
barra.addEventListener('click', async e => {
  const btn = e.target.closest('.segmento');
  if (!btn) return;

  const nivelId = btn.dataset.nivel;
  nivelActivo = nivelId;
  btn.classList.add('pulsando');

  try {
    await chrome.runtime.sendMessage({ accion: 'ejecutar', nivelId });
  } catch (_) {
    // El service worker puede tardar un instante en despertar la
    // primera vez; el badge del icono mostrará el resultado igualmente.
  }
  window.close();
});

cargarNivelGuardado();
